import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const swiperRef = useRef<Swiper<any>>(null);
    const router = useRouter();
    const { likedImage } = useLocalSearchParams(); // 👈 capture passed param
    const [restaurants, setRestaurants] = useState(cards);
    const [lastSwipeWasRight, setLastSwipeWasRight] = useState(false);
    const lastSwipeWasRightRef = useRef(false);

    useEffect(() => {
        if (likedImage) {
            // 👇 filter out already liked restaurant by image URL
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
        <View style={styles.container}>
            <Swiper
                ref={swiperRef}
                cards={restaurants}
                renderCard={(card) => (
                    <View style={styles.card}>
                        <Image source={{ uri: card.image }} style={styles.image} />
                        <Text style={styles.title}>{card.name}</Text>
                        <Text style={styles.details}>{card.details}</Text>
                        <Text style={styles.subDetails}>{card.rating}</Text>
                    </View>
                )}
                onSwipedLeft={handleSwipeLeft}
                onSwipedRight={handleSwipeRight}
                onSwiped={(index) => setCurrentIndex(index + 1)}
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

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.circle} onPress={handleSwipeBack}>
                    <Ionicons name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.circle, styles.orangeCircle]}
                    onPress={() => swiperRef.current?.swipeLeft()}
                >
                    <MaterialCommunityIcons name="thumb-down-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.circle, styles.orangeCircle]}
                    onPress={() => swiperRef.current?.swipeRight()}
                >
                    <MaterialCommunityIcons name="thumb-up-outline" size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        const currentCard = cards[currentIndex];
                        router.push({
                            pathname: "/RestaurantDetails",
                            params: {
                                name: currentCard.name,
                                image: Array.isArray(currentCard.image) ? currentCard.image[0] : currentCard.image,
                                details: currentCard.details,
                                rating: currentCard.rating,
                            },
                        });
                    }}
                >
                    <Entypo name="menu" size={28} color="#000" />
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    card: {
        borderRadius: 20,
        borderWidth: 4,
        borderColor: '#FF6B3E',
        backgroundColor: '#fff',
        height: 500,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    image: {
        width: '100%',
        height: 340,
        borderRadius: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    details: {
        fontSize: 16,
        color: '#555',
        marginBottom: 4,
    },
    subDetails: {
        fontSize: 18,
        fontWeight: '600',
        color: '#444',
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 20,
    },
    circle: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    orangeCircle: {
        backgroundColor: '#FF6B3E',
    },
    infoCircle: {
        borderWidth: 2,
        borderColor: 'white',
    },
});
