import {
    View,
    Text,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    Dimensions,
    PanResponder,
} from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { distanceFromUser, getOpeningHoursForToday } from "@/services/apiDetailsForUI";
import { useEffect, useRef, useState, useCallback } from "react";
import { checkIfFriendLiked } from "@/services/checkIfFriendLiked";
import { dummyEateries } from '@/data/dummyEateries';
import {completeSwiping, getWaitingStatus, updateSwipingSessionStatus} from "@/services/groupSwiping";
import { supabase } from '@/SupabaseConfig';
import {addVote} from "@/services/votingService";
import {useSession} from "@/context/SessionContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;

export default function Swiping() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [eateries, setEateries] = useState(dummyEateries);
    const [lastSwipeWasRight, setLastSwipeWasRight] = useState(false);
    const router = useRouter();
    const currentUser = useSession()?.user;

    // Animation values for custom swiper
    const pan = useRef(new Animated.ValueXY()).current;
    const scale = useRef(new Animated.Value(1)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const nextCardScale = useRef(new Animated.Value(0.9)).current;
    const nextCardOpacity = useRef(new Animated.Value(0.8)).current;

    if (!currentUser) {
        return null;
    }

    const { swipingMode, latitude, longitude, eateries: eateriesParam, useDummyData, groupID} = useLocalSearchParams();

    const userLocation = latitude && longitude ? {
        coordinates: {
            latitude: parseFloat(latitude as string),
            longitude: parseFloat(longitude as string)
        }
    } : null;

    // Initialize eateries data with group settings support
    const initializeEateries = useCallback(async () => {
        // For group mode, check the group setting first
        if (swipingMode === 'group' && groupID) {
            try {
                const { data: groupSession } = await supabase
                    .from('group_sessions')
                    .select('useDummyData')
                    .eq('group_id', groupID)
                    .single();

                if (groupSession?.useDummyData) {
                    return dummyEateries; // Everyone uses dummy data
                }
                // If not using dummy data, fall through to parse eateriesParam
            } catch (error) {
                console.error('Failed to fetch group settings:', error);
            }
        }

        // Original logic for parsing actual eateries (solo mode or group mode with real data)
        let sourceEateries = dummyEateries;
        if (useDummyData !== 'true' && eateriesParam) {
            try {
                sourceEateries = JSON.parse(eateriesParam as string);
            } catch (error) {
                console.error('Failed to parse eateries:', error);
                sourceEateries = dummyEateries;
            }
        }
        return sourceEateries;
    }, [eateriesParam, useDummyData, swipingMode, groupID]);

    useEffect(() => {
        const loadEateries = async () => {
            const initializedEateries = await initializeEateries();
            setEateries(initializedEateries);
        };

        loadEateries();
    }, [initializeEateries]);

    const handleSwipeLeft = useCallback((index?: number) => {
        const swipeIndex = index ?? currentIndex;
        setLastSwipeWasRight(false);
        console.log('Disliked:', eateries[swipeIndex]?.displayName); // For testing and debugging
    }, [eateries, currentIndex]);

    const handleSwipeRight = useCallback(async (index?: number) => {
        const swipeIndex = index ?? currentIndex;
        setLastSwipeWasRight(true);
        const likedEatery = eateries[swipeIndex];
        console.log('Liked:', likedEatery.displayName); // For testing and debugging

        // --- Check if eatery exists in Eatery table, insert if not ---
        if (likedEatery?.placeId) {
            const { data: existing, error: checkError } = await supabase
                .from('Eatery')
                .select('placeId')
                .eq('placeId', likedEatery.placeId)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                // Only log error if not "no rows found"
                console.error('Error checking Eatery table:', checkError.message);
            } else if (!existing) {
                const { error: insertError } = await supabase
                    .from('Eatery')
                    .insert([{
                        placeId: likedEatery.placeId ?? null,
                        displayName: likedEatery.displayName ?? null,
                        formattedAddress: likedEatery.formattedAddress ?? null,
                        location: likedEatery.location ?? null,
                        websiteUri: likedEatery.websiteUri ?? null,
                        googleMapsUri: likedEatery.googleMapsUri ?? null,
                        currentOpeningHours: likedEatery.currentOpeningHours ?? null,
                        types: likedEatery.types ?? null,
                        primaryTypeDisplayName: likedEatery.primaryTypeDisplayName ?? null,
                        rating: likedEatery.rating ?? null,
                        userRatingCount: likedEatery.userRatingCount ?? null,
                        priceLevel: likedEatery.priceLevel ?? null,
                        photo: likedEatery.photo ?? null,
                        editorialSummary: likedEatery.editorialSummary ?? null,
                        generativeSummary: likedEatery.generativeSummary ?? null,
                        internationalPhoneNumber: likedEatery.internationalPhoneNumber ?? null,
                    }]);
                if (insertError) {
                    console.error('Error inserting Eatery:', insertError.message);
                }
            }

            // --- Insert reviews into Review table ---
            if (Array.isArray(likedEatery.reviews)) {
                for (const review of likedEatery.reviews) {
                    // Ensure author is JSON (object), not string
                    let authorObj = review.author;
                    if (typeof authorObj !== 'object' || authorObj === null) {
                        // If only author_name is present as string, wrap it in an object
                        authorObj = {
                            displayName: typeof review.author === 'string' ? review.author : '',
                            uri: '',
                            photoUri: ''
                        };
                    }
                    console.log('Review to insert:', {
                        author: authorObj,
                        rating: review.rating ?? null,
                        text: review.text ?? null,
                        relativePublishTimeDescription: review.relativePublishTimeDescription ?? null,
                        placeId: likedEatery.placeId,
                    });
                    const { error: reviewInsertError } = await supabase
                        .from('review')
                        .insert([{
                            author: authorObj,
                            rating: review.rating ?? null,
                            text: review.text ?? null,
                            relativePublishTimeDescription: review.relativePublishTimeDescription ?? null,
                            placeId: likedEatery.placeId,
                        }]);
                    if (reviewInsertError) {
                        // Improved error logging
                        console.error('Error inserting review:', reviewInsertError);
                    }
                }
            }

            // --- Update liked_eateries in profiles table ---
            // Get current user id
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user?.id) {
                console.error('Could not get current user:', userError?.message);
            } else {
                const userId = userData.user.id;
                // 1. Fetch current liked_eateries
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('liked_eateries')
                    .eq('id', userId)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile:', profileError.message);
                } else {
                    let likedEateriesArr = Array.isArray(profileData?.liked_eateries)
                        ? profileData.liked_eateries
                        : [];
                    // 2. Add placeId if not already present
                    if (!likedEateriesArr.includes(likedEatery.placeId)) {
                        likedEateriesArr = [...likedEateriesArr, likedEatery.placeId];
                        // 3. Update the profile
                        const { error: updateError } = await supabase
                            .from('profiles')
                            .update({ liked_eateries: likedEateriesArr })
                            .eq('id', userId);
                        if (updateError) {
                            console.error('Error updating liked_eateries:', updateError.message);
                        }
                    }
                }
            }
        }

        if (swipingMode === 'solo') {
            const friendsData = await checkIfFriendLiked(likedEatery.placeId, currentUser.id)
            if (friendsData.length > 0) {
                router.push({
                    pathname: '/soloSwiping/MatchedWithFriends',
                    params: {
                        eatery: JSON.stringify(likedEatery),
                        friends: JSON.stringify(friendsData),
                    },
                });
            } else {
                router.push({
                    pathname: '/soloSwiping/LikedConfirmation',
                    params: {
                        eatery: JSON.stringify(likedEatery),
                    }
                })
            }
        }
        else if (swipingMode === 'group') {
            await addVote(groupID as string, currentUser.id, likedEatery.placeId);
        }
    }, [eateries, router, swipingMode, groupID, currentUser.id, currentIndex]);

    const handleSwipeBack = useCallback(() => {
        if (currentIndex === 0) {
            router.back(); // Returns to Discover if at the first card
        }
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            // Reset animations
            pan.setValue({ x: 0, y: 0 });
            rotate.setValue(0);
            scale.setValue(1);
            nextCardScale.setValue(0.9);
            nextCardOpacity.setValue(0.8);
        }
    }, [currentIndex, pan, scale, nextCardScale, nextCardOpacity]);

    const handleMenuPress = useCallback(() => {
        const currentEatery = eateries[currentIndex];
        if (!currentEatery) return;
        router.push({
            pathname: "/RestaurantDetails",
            params: {
                placeId: currentEatery.placeId,
                eatery: JSON.stringify(currentEatery),
            },
        });
    }, [eateries, currentIndex, router]);

    const handleSwipedAll = useCallback(async () => {
        try {
            if (swipingMode === 'solo') {
                if (!lastSwipeWasRight) {
                    router.replace('/(modals)/NoMatches');
                } else {
                    router.replace('/(modals)/NoMatches');
                    await handleSwipeRight(eateries.length - 1);
                }
            } else if (swipingMode === 'group') {
                if (!groupID) {
                    console.error('No group ID available');
                    return;
                }

                // Mark current user's swiping as completed
                await completeSwiping(groupID as string, currentUser.id);

                // Check if all participants have completed swiping
                const waitingStatus = await getWaitingStatus(groupID as string);

                if (waitingStatus.everyoneReady) {
                    // Update session status before navigation
                    await updateSwipingSessionStatus(groupID as string, 'completed');

                    // Navigate to results immediately
                    router.replace({
                        pathname: '/groupSwiping/GroupResults',
                        params: {groupID: groupID as string},
                    });
                } else {
                    // Still waiting for others, go to waiting screen
                    router.replace({
                        pathname: '/groupSwiping/Waiting',
                        params: { groupID: groupID as string }
                    });
                }
            }
        } catch (error) {
            console.error('Error handling swipe completion:', error);
            // Fallback navigation
            if (swipingMode === 'group') {
                router.replace({
                    pathname: '/groupSwiping/Waiting',
                    params: { groupID: groupID as string }
                });
            }
        }
    }, [lastSwipeWasRight, router, swipingMode, groupID, currentUser.id, eateries.length, handleSwipeRight]);

    // End session handler
    const handleEndSession = useCallback(() => {
        handleSwipedAll();
    }, [handleSwipedAll]);

    // PanResponder for handling gestures
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value,
                });
            },
            onPanResponderMove: (evt, gestureState) => {
                // Update pan position
                pan.setValue({ x: gestureState.dx, y: gestureState.dy });

                // Add rotation based on horizontal movement
                const rotation = gestureState.dx * 0.1; // Adjust multiplier for more/less rotation
                rotate.setValue(rotation);
            },
            onPanResponderRelease: (evt, gestureState) => {
                pan.flattenOffset();

                const { dx, dy } = gestureState;
                const swipeThreshold = SWIPE_THRESHOLD;

                if (Math.abs(dx) > swipeThreshold) {
                    // Swipe animation with rotation
                    const direction = dx > 0 ? screenWidth : -screenWidth;
                    const finalRotation = dx > 0 ? 30 : -30; // Degrees

                    Animated.parallel([
                        Animated.timing(pan, {
                            toValue: { x: direction, y: dy },
                            duration: 200,
                            useNativeDriver: false,
                        }),
                        Animated.timing(rotate, {
                            toValue: finalRotation,
                            duration: 200,
                            useNativeDriver: false,
                        })
                    ]).start(() => {
                        // Handle swipe logic
                        if (dx > 0) {
                            handleSwipeRight();
                        } else {
                            handleSwipeLeft();
                        }

                        // Move to next card
                        const nextIndex = currentIndex + 1;
                        if (nextIndex >= eateries.length) {
                            handleSwipedAll();
                        } else {
                            setCurrentIndex(nextIndex);
                            // Reset animations
                            pan.setValue({ x: 0, y: 0 });
                            rotate.setValue(0);
                            scale.setValue(1);
                            nextCardScale.setValue(0.9);
                            nextCardOpacity.setValue(0.8);
                        }
                    });
                } else {
                    // Spring back to center with rotation reset
                    Animated.parallel([
                        Animated.spring(pan, {
                            toValue: { x: 0, y: 0 },
                            useNativeDriver: false,
                        }),
                        Animated.spring(rotate, {
                            toValue: 0,
                            useNativeDriver: false,
                        })
                    ]).start();
                }
            },
        })
    ).current;

    // Programmatic swipe functions
    const swipeLeft = useCallback(() => {
        Animated.parallel([
            Animated.timing(pan, {
                toValue: { x: -screenWidth, y: 0 },
                duration: 250,
                useNativeDriver: false,
            }),
            Animated.timing(rotate, {
                toValue: -30,
                duration: 250,
                useNativeDriver: false,
            })
        ]).start(() => {
            handleSwipeLeft();
            const nextIndex = currentIndex + 1;
            if (nextIndex >= eateries.length) {
                handleSwipedAll();
            } else {
                setCurrentIndex(nextIndex);
                pan.setValue({ x: 0, y: 0 });
                rotate.setValue(0);
                scale.setValue(1);
                nextCardScale.setValue(0.9);
                nextCardOpacity.setValue(0.8);
            }
        });
    }, [pan, rotate, handleSwipeLeft, currentIndex, eateries.length, handleSwipedAll, scale, nextCardScale, nextCardOpacity]);

    const swipeRight = useCallback(() => {
        Animated.parallel([
            Animated.timing(pan, {
                toValue: { x: screenWidth, y: 0 },
                duration: 250,
                useNativeDriver: false,
            }),
            Animated.timing(rotate, {
                toValue: 30,
                duration: 250,
                useNativeDriver: false,
            })
        ]).start(() => {
            handleSwipeRight();
            const nextIndex = currentIndex + 1;
            if (nextIndex >= eateries.length) {
                handleSwipedAll();
            } else {
                setCurrentIndex(nextIndex);
                pan.setValue({ x: 0, y: 0 });
                rotate.setValue(0);
                scale.setValue(1);
                nextCardScale.setValue(0.9);
                nextCardOpacity.setValue(0.8);
            }
        });
    }, [pan, rotate, handleSwipeRight, currentIndex, eateries.length, handleSwipedAll, scale, nextCardScale, nextCardOpacity]);

    // Function for creating the cards
    const renderCard = useCallback((eatery: any, index: number, isActive: boolean = false) => {
        if (!eatery) return null;

        const animatedStyle = isActive ? {
            transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { rotate: rotate.interpolate({
                        inputRange: [-100, 0, 100],
                        outputRange: ['-30deg', '0deg', '30deg'],
                        extrapolate: 'clamp'
                    })},
                { scale: scale },
            ],
        } : {
            transform: [
                { scale: nextCardScale },
            ],
            opacity: nextCardOpacity,
        };

        return (
            <Animated.View
                key={`${eatery.placeId}-${index}`}
                style={[
                    animatedStyle,
                    {
                        position: 'absolute',
                        width: screenWidth - 40,
                        height: 500,
                        marginTop: -100,
                        alignSelf: 'center',
                        zIndex: isActive ? 100 : 50 - index, // Higher zIndex for active card
                    }
                ]}
                className="flex-col items-start rounded-[20px] border-4 border-accent bg-white shadow-lg"
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(102,51,25,0.8)']}
                    locations={[0, 0.6, 1]}
                    style={{zIndex: 0}}
                />
                <Image
                    source={{ uri: eatery.photo }}
                    className="size-full rounded-[16px]"
                    style={{ zIndex: -3 }}
                    resizeMode="cover"
                />
                <View className="absolute bottom-2 p-5 z-10">
                    <Text className="font-lexend-bold text-2xl text-white">
                        {eatery.displayName}
                    </Text>
                    <Text className="font-lexend-regular text-sm text-white">
                        {distanceFromUser(userLocation, eatery.location)}  •  {eatery.primaryTypeDisplayName}  •  {getOpeningHoursForToday(eatery)}
                    </Text>
                    <Text className="font-lexend-regular text-sm text-white/80 mt-2">
                        ★ {eatery.rating?.toFixed?.(1) ?? 'N/A'}  •  {'$'.repeat(eatery.priceLevel ?? 0)}
                    </Text>
                    <View className="flex-row mt-2 items-center">
                        <Text className="bg-white/20 font-lexend-regular px-3 py-1 rounded-full text-white text-xs">
                            {eatery.currentOpeningHours?.openNow ? 'Open now' : 'Closed'}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        );
    }, [userLocation, pan, scale, rotate, nextCardScale, nextCardOpacity]);

    return (
        <SafeAreaView className="flex-1 bg-offwhite">
            {/* Counter */}
            <View className="flex-row justify-between items-center px-5 py-3">
                <Text className="font-lexend-regular text-lg text-accent">
                    {currentIndex + 1}/{eateries.length} restaurants
                </Text>
                <TouchableOpacity
                    className="bg-accent px-4 py-2 rounded-full"
                    onPress={handleEndSession}
                >
                    <Text className="font-baloo-regular text-white text-sm">
                        End Session
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="flex-1 justify-center items-center">
                {/* Render stack of cards */}
                {eateries.slice(currentIndex, currentIndex + 3).map((eatery, index) => {
                    const cardIndex = currentIndex + index;
                    const isActive = index === 0;

                    if (isActive) {
                        return (
                            <Animated.View
                                key={cardIndex}
                                {...panResponder.panHandlers}
                                style={[
                                    {
                                        transform: [
                                            { translateX: pan.x },
                                            { translateY: pan.y },
                                            { rotate: rotate.interpolate({
                                                    inputRange: [-100, 0, 100],
                                                    outputRange: ['-30deg', '0deg', '30deg'],
                                                    extrapolate: 'clamp'
                                                })},
                                            { scale: scale },
                                        ],
                                    },
                                    {
                                        position: 'absolute',
                                        width: screenWidth - 40,
                                        height: 500,
                                        marginTop: -100,
                                        alignSelf: 'center',
                                        zIndex: 100, // Highest zIndex for active card
                                    }
                                ]}
                                className="flex-col items-start rounded-[20px] border-4 border-accent bg-white shadow-lg"
                            >
                                <Image
                                    source={{ uri: eatery.photo }}
                                    className="size-full rounded-[16px]"
                                    style={{ zIndex: -3 }}
                                    resizeMode="cover"
                                />
                                <View className="absolute bottom-2 p-5 z-10">
                                    <Text className="font-lexend-bold text-2xl text-white">
                                        {eatery.displayName}
                                    </Text>
                                    <Text className="font-lexend-regular text-sm text-white">
                                        {distanceFromUser(userLocation, eatery.location)}  •  {eatery.primaryTypeDisplayName}  •  {getOpeningHoursForToday(eatery)}
                                    </Text>
                                    <Text className="font-lexend-regular text-sm text-white/80 mt-2">
                                        ★ {eatery.rating?.toFixed?.(1) ?? 'N/A'}  •  {'$'.repeat(eatery.priceLevel ?? 0)}
                                    </Text>
                                    <View className="flex-row mt-2 items-center">
                                        <Text className="bg-white/20 font-lexend-regular px-3 py-1 rounded-full text-white text-xs">
                                            {eatery.currentOpeningHours?.openNow ? 'Open now' : 'Closed'}
                                        </Text>
                                    </View>
                                </View>
                            </Animated.View>
                        );
                    } else {
                        return renderCard(eatery, cardIndex, false);
                    }
                })}
            </View>

            <View className="absolute bottom-10 w-full flex-row justify-evenly px-5">
                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-white justify-center items-center shadow-md"
                    onPress={handleSwipeBack}
                >
                    <Ionicons name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-accent justify-center items-center shadow-md"
                    onPress={swipeLeft}
                >
                    <MaterialCommunityIcons name="thumb-down-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-accent justify-center items-center shadow-md"
                    onPress={swipeRight}
                >
                    <MaterialCommunityIcons name="thumb-up-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-white justify-center items-center shadow-md border-2 border-white"
                    onPress={handleMenuPress}
                >
                    <Entypo name="menu" size={28} color="#000" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}