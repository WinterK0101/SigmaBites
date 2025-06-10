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
import {LinearGradient} from "expo-linear-gradient";
import {distanceFromUser, getOpeningHoursForToday} from "@/services/apiDetailsForUI";
import {useEffect, useRef, useState} from "react";

const dummyEateries = [
    {
        displayName: 'Ajisen Ramen',
        location: {
            latitude: 1.35096,
            longitude: 103.848619,
        },
        currentOpeningHours: {
            openNow: true,
            weekdayDescriptions: [
                "Monday: 11:30 am – 2:30 pm, 5:00pm–9:00pm",
                "Tuesday: 11:30 am – 2:30 pm, 5:00pm–9:00pm",
                "Wednesday: 11:30 am – 2:30 pm, 5:00pm–9:00pm",
                "Thursday: 11:30 am – 2:30 pm, 5:00pm–9:00pm",
                "Friday: 11:30 am – 2:30 pm, 5:00pm–9:00pm",
                "Saturday: 11:30 am – 2:30 pm, 5:00pm–9:00pm",
                "Sunday: 11:30 am – 2:30 pm, 5:00pm–9:00pm",
            ]
        },
        photo: 'https://ucarecdn.com/14373564-94e1-48f6-bcd5-a99767cbc5f2/-/crop/1867x777/0,294/-/format/auto/-/resize/1024x/',
        primaryTypeDisplayName: 'Japanese',
        priceLevel: 2,
        rating: 4.5,
    },
    {
        displayName: 'Pepper Lunch',
        location: {
            latitude: 1.39258,
            longitude: 103.89525,
        },
        currentOpeningHours: {
            openNow: true,
            weekdayDescriptions: [
                "Monday: 5:00pm–9:00pm",
                "Tuesday: 5:00pm–9:00pm",
                "Wednesday: 5:00pm–9:00pm",
                "Thursday: 5:00pm–9:00pm",
                "Friday: 5:00pm–9:00pm",
                "Saturday: 5:00pm–9:00pm",
                "Sunday: 5:00pm–9:00pm",
            ]
        },
        photo: 'https://moribyan.com/wp-content/uploads/2023/10/Pepper-Lunch-683x1024.jpg',
        primaryTypeDisplayName: 'Japanese',
        priceLevel: 3,
        rating: 3,
    },
    {
        displayName: "Josh's Grill",
        location: {
            latitude: 1.299521,
            longitude: 103.855501,
        },
        currentOpeningHours: {
            openNow: true,
            weekdayDescriptions: [
                "Monday: 5:00pm–9:00pm",
                "Tuesday: 5:00pm–9:00pm",
                "Wednesday: 5:00pm–9:00pm",
                "Thursday: 5:00pm–9:00pm",
                "Friday: 5:00pm–9:00pm",
                "Saturday: 5:00pm–9:00pm",
                "Sunday: 5:00pm–9:00pm",
            ]
        },
        primaryTypeDisplayName: 'Western',
        priceLevel: 3,
        rating: 4.9,
        photo: 'https://www.capitaland.com/sg/malls/bugisjunction/en/stores/josh-s-grill/_jcr_content/root/container/container/entitydetails.coreimg.jpeg/content/dam/capitaland-sites/singapore/shop/malls/bugis-junction/tenants/Josh%27s%20Grill%20-%20Sirloin%20Beef%20.jpg',
    },
]

export default function Swiping() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const swiperRef = useRef<Swiper<any>>(null);
    const router = useRouter();
    const { latitude, longitude, likedImage, eateries, useDummyData } = useLocalSearchParams();
    const [restaurants, setRestaurants] = useState(dummyEateries);
    const [lastSwipeWasRight, setLastSwipeWasRight] = useState(false);
    const lastSwipeWasRightRef = useRef(false);

    const userLocation = latitude && longitude ? {
        coordinates: {
            latitude: parseFloat(latitude as string),
            longitude: parseFloat(longitude as string)
        }
    } : null;

    useEffect(() => {
        const shouldUseDummy = useDummyData === 'true';

        if (shouldUseDummy) {
            // Use dummy data
            if (likedImage) {
                const filtered = dummyEateries.filter((eatery) => eatery.photo !== likedImage);
                setRestaurants(filtered);
            } else {
                setRestaurants(dummyEateries);
            }
        } else {
            // Use API data
            if (eateries) {
                try {
                    const parsedEateries = JSON.parse(eateries as string);
                    if (likedImage) {
                        const filtered = parsedEateries.filter((eatery: any) => eatery.photo !== likedImage);
                        setRestaurants(filtered);
                    } else {
                        setRestaurants(parsedEateries);
                    }
                } catch (error) {
                    console.error('Failed to parse eateries:', error);
                    setRestaurants(dummyEateries); // Fallback to dummy data
                }
            } else {
                setRestaurants(dummyEateries); // Fallback to dummy data
            }
        }
    }, [likedImage, eateries, useDummyData]);

    const handleSwipeLeft = (index: number) => {
        lastSwipeWasRightRef.current = false;
        console.log('Disliked:', restaurants[index]?.displayName);
    };

    const handleSwipeRight = (index: number) => {
        lastSwipeWasRightRef.current = true;
        const likedRestaurant = restaurants[index];
        console.log('Liked:', likedRestaurant.displayName);

        router.push({
            pathname: '/Matched',
            params: {
                restaurantImage: likedRestaurant.photo,
            },
        });
    };

    const handleSwipeBack = () => {
        const swiper = swiperRef.current;
        const cardIndex = (swiper as any)?.state?.cardIndex;

        if (swiper && typeof cardIndex === 'number' && cardIndex > 0) {
            swiper.jumpToCardIndex(cardIndex - 1);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-offwhite">
            <Swiper
                ref={swiperRef}
                cards={restaurants}
                renderCard={(eatery) => (
                    <View
                        className="mt-6 flex-col items-start rounded-[20px] border-4 border-accent h-[500px] bg-white"
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
                )}
                onSwipedLeft={handleSwipeLeft}
                onSwipedRight={handleSwipeRight}
                onSwipedAll={() => {
                    router.replace('/NoMatches');
                }}
                onSwiped={(index) => setCurrentIndex(index + 1)}
                cardIndex={0}
                stackSize={3}
                stackSeparation={0}
                stackScale={0}
                backgroundColor="transparent"
                verticalSwipe={false}
            />

            <View className="absolute bottom-10 w-full flex-row justify-evenly px-5">
                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-white justify-center items-center shadow-lg"
                    onPress={handleSwipeBack}
                >
                    <Ionicons name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-accent justify-center items-center shadow-lg"
                    onPress={() => swiperRef.current?.swipeLeft()}
                >
                    <MaterialCommunityIcons name="thumb-down-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-accent justify-center items-center shadow-lg"
                    onPress={() => swiperRef.current?.swipeRight()}
                >
                    <MaterialCommunityIcons name="thumb-up-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-white justify-center items-center shadow-lg border-2 border-white"
                    onPress={() => {
                        const currentCard: any = restaurants[currentIndex];
                        router.push({
                            pathname: "/RestaurantDetails",
                            params: {
                                name: currentCard.displayName,
                                image: currentCard.image,
                                rating: currentCard.rating,
                            },
                        });
                    }}
                >
                    <Entypo name="menu" size={28} color="#000" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}