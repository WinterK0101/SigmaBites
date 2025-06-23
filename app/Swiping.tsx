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
import { supabase } from '@/SupabaseConfig';
import {addVote, removeVote} from "@/services/votingService";
import { useSession } from "@/context/SessionContext";
import {
    handleEateryLikedService,
    handleSwipeCompletionService,
    handleEndSessionService
} from "@/services/swipingService";
import {removeFromLikedEateries} from "@/services/eateryService";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;

export default function Swiping() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [eateries, setEateries] = useState(dummyEateries);
    const [lastSwipeWasRight, setLastSwipeWasRight] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const router = useRouter();
    const {session} = useSession();
    const currentUser = session?.user;

    // Animation values for custom swiper
    const pan = useRef(new Animated.ValueXY()).current;
    const scale = useRef(new Animated.Value(1)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const nextCardScale = useRef(new Animated.Value(0.9)).current;
    const nextCardOpacity = useRef(new Animated.Value(0.8)).current;

    // Add ref to track current index for PanResponder
    const currentIndexRef = useRef(currentIndex);
    const eateriesRef = useRef(eateries);

    // Update refs whenever state changes
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        eateriesRef.current = eateries;
    }, [eateries]);

    if (!currentUser) {
        return null;
    }

    const { swipingMode, latitude, longitude, eateries: eateriesParam, useDummyData, groupID } = useLocalSearchParams();

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

        // Parsing actual eateries (solo mode or group mode with real data)
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

    const handleSwipeLeft = useCallback((swipeIndex?: number) => {
        // Use the passed index or fall back to current index
        const actualIndex = swipeIndex ?? currentIndexRef.current;
        const dislikedEatery = eateriesRef.current[actualIndex];

        console.log(`Swipe Left - Index: ${actualIndex}, Eatery: ${dislikedEatery?.displayName}`);

        if (!dislikedEatery) {
            console.warn('No eatery found at index:', actualIndex);
            return;
        }

        setLastSwipeWasRight(false);
        console.log('Disliked:', dislikedEatery.displayName);
    }, []);

    const handleSwipeRight = useCallback(async (swipeIndex?: number) => {
        // Use the passed index or fall back to current index
        const actualIndex = swipeIndex ?? currentIndexRef.current;
        const likedEatery = eateriesRef.current[actualIndex];

        console.log(`Swipe Right - Index: ${actualIndex}, Eatery: ${likedEatery?.displayName}`);

        if (!likedEatery) {
            console.warn('No eatery found at index:', actualIndex);
            return;
        }

        setLastSwipeWasRight(true);

        // Handle database operations using service
        await handleEateryLikedService(likedEatery, currentUser.id);

        if (swipingMode === 'group') {
            await addVote(groupID as string, currentUser.id, likedEatery.placeId);
        }
    }, [swipingMode, groupID, currentUser.id]);

    // Handle navigation after swipe for solo mode
    const handleSoloModeNavigation = useCallback(async (likedEatery: any) => {
        if (swipingMode !== 'solo') return;

        const friendsData = await checkIfFriendLiked(likedEatery.placeId, currentUser.id);
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
            });
        }
    }, [swipingMode, currentUser.id, router]);

    const handleSwipeBack = useCallback(() => {
        if (isAnimating || currentIndex === 0) {
            if (currentIndex === 0) {
                router.back();
            }
            return;
        }
        removeFromLikedEateries(currentUser.id, eateries[currentIndex].placeId); // NOT SURE IF IT WORKS
        if (swipingMode === 'group') {
            removeVote(groupID as string, currentUser.id, eateries[currentIndex].placeId); // NOT SURE IF IT WORKS
        }
        setIsAnimating(true);
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);

        // Reset animations immediately
        pan.setValue({ x: 0, y: 0 });
        rotate.setValue(0);
        scale.setValue(1);

        // Smoothly animate the next card scaling
        Animated.parallel([
            Animated.timing(nextCardScale, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(nextCardOpacity, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: false,
            })
        ]).start(() => {
            setIsAnimating(false);
        });
    }, [currentIndex, pan, scale, rotate, nextCardScale, nextCardOpacity, isAnimating, router]);

    const handleMenuPress = useCallback(() => {
        if (isAnimating) return;

        const currentEatery = eateries[currentIndex];
        if (!currentEatery) return;
        router.push({
            pathname: "/RestaurantDetails",
            params: {
                placeId: currentEatery.placeId,
                eatery: JSON.stringify(currentEatery),
            },
        });
    }, [eateries, currentIndex, router, isAnimating]);

    const handleSwipedAll = useCallback(async () => {
        try {
            await handleSwipeCompletionService({
                swipingMode: swipingMode as string,
                lastSwipeWasRight,
                groupID: groupID as string,
                currentUserId: currentUser.id,
                eateries,
                router,
                handleSoloModeNavigation
            });
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
    }, [lastSwipeWasRight, router, swipingMode, groupID, currentUser.id, eateries, handleSoloModeNavigation]);

    // End session handler
    const handleEndSession = useCallback(async () => {
        try {
            await handleEndSessionService({
                swipingMode: swipingMode as string,
                groupID: groupID as string,
                currentUserId: currentUser.id,
                router
            });
        } catch (error) {
            console.error('Error handling end session:', error);
            if (swipingMode === 'group') {
                router.replace({
                    pathname: '/groupSwiping/Waiting',
                    params: { groupID: groupID as string }
                });
            } else {
                router.back();
            }
        }
    }, [swipingMode, groupID, currentUser.id, router]);

    // Reset animations helper
    const resetAnimations = useCallback(() => {
        pan.setValue({ x: 0, y: 0 });
        rotate.setValue(0);
        scale.setValue(1);

        // Smoothly animate the next card scaling
        Animated.parallel([
            Animated.timing(nextCardScale, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(nextCardOpacity, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: false,
            })
        ]).start();
    }, [pan, rotate, scale, nextCardScale, nextCardOpacity]);

    // Complete swipe action and move to next card
    const completeSwipe = useCallback((direction: 'left' | 'right') => {
        // Use the ref to get the actual current index at the time of swipe
        const swipeIndex = currentIndexRef.current;
        const currentEatery = eateriesRef.current[swipeIndex];
        const nextIndex = swipeIndex + 1;
        const isLastCard = nextIndex >= eateriesRef.current.length;

        console.log(`Complete Swipe ${direction} - Index: ${swipeIndex}, Eatery: ${currentEatery?.displayName}`);

        // Process swipe logic FIRST with the correct index
        if (direction === 'right') {
            handleSwipeRight(swipeIndex).then(() => {
                // Navigate on every right swipe in solo mode, not just the last card
                if (swipingMode === 'solo') {
                    handleSoloModeNavigation(currentEatery);
                }
            }).catch(error => {
                console.error('Error handling right swipe:', error);
            });
        } else {
            handleSwipeLeft(swipeIndex);
        }

        // THEN move to next card for UI
        if (!isLastCard) {
            setCurrentIndex(nextIndex);
            resetAnimations();
        }

        // Handle completion if last card
        if (isLastCard) {
            handleSwipedAll().catch(error => {
                console.error('Error handling swipe completion:', error);
            });
        }
    }, [handleSwipeRight, handleSwipeLeft, handleSwipedAll, resetAnimations, swipingMode, handleSoloModeNavigation]);

    // PanResponder for handling gestures
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return !isAnimating && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
            },
            onPanResponderGrant: () => {
                if (isAnimating) return;
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value,
                });
            },
            onPanResponderMove: (evt, gestureState) => {
                if (isAnimating) return;
                pan.setValue({ x: gestureState.dx, y: gestureState.dy });
                const rotation = gestureState.dx * 0.1;
                rotate.setValue(rotation);
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (isAnimating) return;

                setIsAnimating(true);
                pan.flattenOffset();

                const { dx, dy } = gestureState;
                const swipeThreshold = SWIPE_THRESHOLD;

                console.log(`Pan release - Current index from ref: ${currentIndexRef.current}`);

                if (Math.abs(dx) > swipeThreshold) {
                    // Swipe animation
                    const direction = dx > 0 ? screenWidth : -screenWidth;
                    const finalRotation = dx > 0 ? 30 : -30;

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
                        completeSwipe(dx > 0 ? 'right' : 'left');
                        setIsAnimating(false);
                    });
                } else {
                    // Spring back to center
                    Animated.parallel([
                        Animated.spring(pan, {
                            toValue: { x: 0, y: 0 },
                            useNativeDriver: false,
                        }),
                        Animated.spring(rotate, {
                            toValue: 0,
                            useNativeDriver: false,
                        })
                    ]).start(() => {
                        setIsAnimating(false);
                    });
                }
            },
        })
    ).current;

    // Programmatic swipe functions
    const swipeLeft = useCallback(async () => {
        if (isAnimating) return;

        setIsAnimating(true);
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
            completeSwipe('left');
            setIsAnimating(false);
        });
    }, [isAnimating, pan, rotate, completeSwipe]);

    const swipeRight = useCallback(async () => {
        if (isAnimating) return;

        setIsAnimating(true);
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
            completeSwipe('right');
            setIsAnimating(false);
        });
    }, [isAnimating, pan, rotate, completeSwipe]);

    // Render a single card
    const renderCard = useCallback((eatery: any, index: number, isActive: boolean = false) => {
        if (!eatery) return null;

        const cardStyle = isActive ? {
            transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                {
                    rotate: rotate.interpolate({
                        inputRange: [-100, 0, 100],
                        outputRange: ['-30deg', '0deg', '30deg'],
                        extrapolate: 'clamp'
                    })
                },
                { scale: scale },
            ],
            zIndex: 100,
        } : {
            transform: [{ scale: nextCardScale }],
            opacity: nextCardOpacity,
            zIndex: 50 - (index - currentIndex),
        };

        const cardProps = isActive ? panResponder.panHandlers : {};

        return (
            <Animated.View
                key={`${eatery.placeId}-${index}`}
                {...cardProps}
                style={[
                    cardStyle,
                    {
                        position: 'absolute',
                        width: screenWidth - 40,
                        height: 500,
                        marginTop: -100,
                        alignSelf: 'center',
                    }
                ]}
                className="flex-col items-start rounded-[20px] border-4 border-accent bg-white shadow-lg"
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(102,51,25,0.8)']}
                    locations={[0, 0.6, 1]}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '100%',
                        width: '100%',
                        justifyContent: 'flex-end',
                        padding: 20,
                        borderRadius: 20,
                        zIndex: 0,
                    }}
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
    }, [pan, rotate, scale, nextCardScale, nextCardOpacity, panResponder, userLocation, currentIndex]);

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
                    disabled={isAnimating}
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
                    return renderCard(eatery, cardIndex, isActive);
                })}
            </View>

            <View className="absolute bottom-10 w-full flex-row justify-evenly px-5">
                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-white justify-center items-center shadow-md"
                    onPress={handleSwipeBack}
                    disabled={isAnimating}
                >
                    <Ionicons name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-accent justify-center items-center shadow-md"
                    onPress={swipeLeft}
                    disabled={isAnimating}
                >
                    <MaterialCommunityIcons name="thumb-down-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-accent justify-center items-center shadow-md"
                    onPress={swipeRight}
                    disabled={isAnimating}
                >
                    <MaterialCommunityIcons name="thumb-up-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-white justify-center items-center shadow-md border-2 border-white"
                    onPress={handleMenuPress}
                    disabled={isAnimating}
                >
                    <Entypo name="menu" size={28} color="#000" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}