import {
    View,
    Text,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';

import Swiper from 'react-native-deck-swiper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { distanceFromUser, getOpeningHoursForToday } from "@/services/apiDetailsForUI";
import { useEffect, useRef, useState, useCallback } from "react";
import {checkIfFriendLiked} from "@/services/checkIfFriendLiked";
import {dummyEateries} from '@/data/dummyEateries';
import {checkGroupSwipingCompleted} from "@/services/groupSwiping";

export default function Swiping() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [eateries, setEateries] = useState(dummyEateries);

    const swiperRef = useRef<Swiper<any>>(null);
    const [lastSwipeWasRight, setLastSwipeWasRight] = useState(false);
    const router = useRouter();

    const { swipingMode, latitude, longitude, eateries: eateriesParam, useDummyData } = useLocalSearchParams();

    const userLocation = latitude && longitude ? {
        coordinates: {
            latitude: parseFloat(latitude as string),
            longitude: parseFloat(longitude as string)
        }
    } : null;

    // Initialize eateries data
    const initializeEateries = useCallback(() => {
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
    }, [eateriesParam, useDummyData]);

    useEffect(() => {
        setEateries(initializeEateries());
    }, [initializeEateries]);


    const handleSwipeLeft = useCallback((index: number) => {
        setLastSwipeWasRight(false);
        console.log('Disliked:', eateries[index]?.displayName); // For testing and debugging
    }, [eateries]);

    const handleSwipeRight = useCallback((index: number) => {
        setLastSwipeWasRight(true);
        const likedEatery = eateries[index];
        console.log('Liked:', likedEatery.displayName); // For testing and debugging
        if (swipingMode === 'solo') {
            // TODO: Create checkIfFriendLiked function
            const mutualLikes = checkIfFriendLiked(likedEatery);
            if (mutualLikes) {
                router.push({
                    pathname: '/(modals)/MatchedWithFriends',
                    params: {
                            restaurantImage: likedEatery.photo,
                            matchedFriends: JSON.stringify(mutualLikes),
                        },
                });
            } else {
                router.push({
                    pathname: '/(modals)/LikedConfirmation',
                    params: {
                        restaurantImage: likedEatery.photo,
                    }
                })
            }
        }
        else if (swipingMode === 'group') {
            // TODO: Add function to handle the voting count
        }
        // TODO: Add function to add liked eatery to the database and to the user's like history
    }, [eateries, router]);

    const handleSwipeBack = useCallback(() => {
        if (!swiperRef.current) return;
        if (currentIndex === 0) {
            router.back(); // Returns to Discover if at the first card
        }
        if (currentIndex > 0) {
            swiperRef.current.jumpToCardIndex(currentIndex - 1);
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

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

    const handleSwipedAll = useCallback(() => {
        if (!lastSwipeWasRight && swipingMode === 'solo') {
            router.replace('/(modals)/NoMatches');
        } else if (swipingMode === 'group') {
            // TODO: Implement checkGroupSwipingCompleted function
            if (checkGroupSwipingCompleted()) {
                router.replace('/(modals)/Waiting');
            } else {
                router.replace('/(modals)/VotedEateries');
            }
        }
    }, [lastSwipeWasRight, router]);

    // Function for creating the cards
    const renderCard = useCallback((eatery) => {
        if (!eatery) return null;

        return (
            <View
                className="mt-14 flex-col items-start rounded-[20px] border-4 border-accent h-[500px] bg-white"
                style={{
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.20,
                    shadowRadius: 5,
                }}
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
                    className="size-full"
                    style={{
                        zIndex: -3,
                        borderRadius: 16,
                    }}
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
                        ★ {eatery.rating.toFixed(1)}  •  {'$'.repeat(eatery.priceLevel)}
                    </Text>
                    <View className="flex-row mt-2 items-center">
                        <Text className="bg-white/20 font-lexend-regular px-3 py-1 rounded-full text-white text-xs">
                            {eatery.currentOpeningHours.openNow ? 'Open now' : 'Closed'}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }, [userLocation]);

    return (
        <SafeAreaView className="flex-1 bg-offwhite">
            <Swiper
                ref={swiperRef}
                cards={eateries}
                renderCard={renderCard}
                onSwipedLeft={handleSwipeLeft}
                onSwipedRight={handleSwipeRight}
                onSwipedAll={handleSwipedAll}
                onSwiped={(index) => {
                    const newIndex = index + 1;
                    setCurrentIndex(newIndex);
                }}
                cardIndex={0}
                stackSize={3}
                stackSeparation={0}
                stackScale={0}
                backgroundColor="transparent"
                verticalSwipe={false}
            />

            <View className="absolute bottom-10 w-full flex-row justify-evenly px-5">
                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-white justify-center items-center shadow"
                    onPress={handleSwipeBack}
                >
                    <Ionicons name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-accent justify-center items-center shadow"
                    onPress={() => swiperRef.current?.swipeLeft()}
                >
                    <MaterialCommunityIcons name="thumb-down-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-accent justify-center items-center shadow"
                    onPress={() => swiperRef.current?.swipeRight()}
                >
                    <MaterialCommunityIcons name="thumb-up-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-white justify-center items-center shadow border-2 border-white"
                    onPress={handleMenuPress}
                >
                    <Entypo name="menu" size={28} color="#000" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}