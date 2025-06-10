import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

const cards = [
    {
        name: 'Ajisen Ramen',
        image: 'https://ucarecdn.com/14373564-94e1-48f6-bcd5-a99767cbc5f2/-/crop/1867x777/0,294/-/format/auto/-/resize/1024x/',
        details: '12.0 km • Japanese • 11:30 am to 9:30 pm',
        rating: '★ 3.0 • $$$$',
    },
    {
        name: 'Pepper Lunch',
        image: 'https://moribyan.com/wp-content/uploads/2023/10/Pepper-Lunch-683x1024.jpg',
        details: '1.6 km • Japanese • 11:00 am to 10:00 pm',
        rating: '★ 4.2 • $$$',
    },
    {
        name: "Josh's Grill",
        image: 'https://www.capitaland.com/sg/malls/bugisjunction/en/stores/josh-s-grill/_jcr_content/root/container/container/entitydetails.coreimg.jpeg/content/dam/capitaland-sites/singapore/shop/malls/bugis-junction/tenants/Josh%27s%20Grill%20-%20Sirloin%20Beef%20.jpg',
        details: '10.0 km • Western • 10:00 am to 9:00 pm',
        rating: '★ 4.5 • $$$',
    },
];

export default function Swiping() {
    const swiperRef = useRef<Swiper<any>>(null);
    const router = useRouter();
    const { likedImage } = useLocalSearchParams();
    const [restaurants, setRestaurants] = useState(cards);
    const [lastSwipeWasRight, setLastSwipeWasRight] = useState(false);
    const lastSwipeWasRightRef = useRef(false);

    useEffect(() => {
        if (likedImage) {
            const filtered = cards.filter((restaurant) => restaurant.image !== likedImage);
            setRestaurants(filtered);
        } else {
            setRestaurants(cards);
        }
    }, [likedImage]);

    const handleSwipeLeft = (index: number) => {
        lastSwipeWasRightRef.current = false;
        console.log('Disliked:', restaurants[index]?.name);
    };

    const handleSwipeRight = (index: number) => {
        lastSwipeWasRightRef.current = true;
        const likedRestaurant = restaurants[index];
        console.log('Liked:', likedRestaurant.name);

        router.push({
            pathname: '/Matched',
            params: {
                restaurantImage: likedRestaurant.image,
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
        <View className="flex-1 bg-white">
            <Swiper
                ref={swiperRef}
                cards={restaurants}
                renderCard={(card) => (
                    <View className="rounded-[20px] border-4 border-[#FF6B3E] bg-white h-[500px] p-5 items-center shadow-lg">
                        <Image
                            source={{ uri: card.image }}
                            className="w-full h-[340px] rounded-2xl"
                        />
                        <Text className="text-2xl font-bold my-2.5 text-center">
                            {card.name}
                        </Text>
                        <Text className="text-base text-gray-600 mb-1 text-center">
                            {card.details}
                        </Text>
                        <Text className="text-lg font-semibold text-gray-700 text-center">
                            {card.rating}
                        </Text>
                    </View>
                )}
                onSwipedLeft={handleSwipeLeft}
                onSwipedRight={handleSwipeRight}
                onSwipedAll={() => {
                    if (!lastSwipeWasRightRef.current) {
                        router.replace('/NoMatches');
                    }
                }}
                stackSize={3}
                cardIndex={0}
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
                    className="w-[66px] h-[66px] rounded-full bg-[#FF6B3E] justify-center items-center shadow-lg"
                    onPress={() => swiperRef.current?.swipeLeft()}
                >
                    <MaterialCommunityIcons name="thumb-down-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-[#FF6B3E] justify-center items-center shadow-lg"
                    onPress={() => swiperRef.current?.swipeRight()}
                >
                    <MaterialCommunityIcons name="thumb-up-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-[66px] h-[66px] rounded-full bg-white justify-center items-center shadow-lg border-2 border-white"
                    onPress={() => router.push('/RestaurantDetails')}
                >
                    <Entypo name="menu" size={28} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );
}