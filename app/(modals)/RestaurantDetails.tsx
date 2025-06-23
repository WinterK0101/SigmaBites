import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Linking, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Eatery, Review, User } from "@/interfaces/interfaces";
import { supabase } from '@/SupabaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toggleFavorite } from '@/services/favouriteService';
import { useSession } from '@/context/SessionContext';
import {calculateDistance, getOpeningHoursForToday} from "@/services/apiDetailsForUI";
import {checkIfFriendLiked} from "@/services/checkIfFriendLiked";
import RemoteImage from "@/components/RemoteImage";

export default function RestaurantDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const {session, currLocation} = useSession();

    const [eatery, setEatery] = useState<Eatery | null>(null);
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState<User[]>([]);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [currentFavorites, setCurrentFavorites] = useState([]);
    const [isFavorited, setIsFavorited] = useState(false);

    const eateryObj = params.eatery ? JSON.parse(params.eatery as string) : null;
    const placeId = params.placeId as string;

    useEffect(() => {
        const fetchEatery = async () => {
            try {
                const { data: currEatery, error: fetchError } = await supabase
                    .from("Eatery")
                    .select("*")
                    .eq("placeId", placeId)
                    .single();

                if (fetchError) console.log(fetchError.message);
                if (currEatery) {
                    setEatery(currEatery);

                    if (session?.user.id) {
                        const mutualFriends = await checkIfFriendLiked(currEatery.placeId, session.user.id);
                        console.log("Mutual friends:", mutualFriends);
                        setFriends(mutualFriends);
                    }
                } else {
                    console.log("No eatery found for placeId:", placeId);
                }

            } catch (err) {
                console.log(err);
            }
        };
        const fetchReview = async () => {
            try {
                const { data: currReview, error: fetchError } = await supabase
                    .from("review")
                    .select("*")
                    .eq("placeId", placeId);

                if (fetchError) console.log(fetchError.message);
                if (currReview) setReviews(currReview);
            } catch (err) {
                console.log(err);
            }
        };

        const fetchFavorites = async () => {
            if (session?.user.id) {
                try {
                    const { data: currFav, error: fetchError } = await supabase
                        .from("profiles")
                        .select("favourite_eateries")
                        .eq("id", session.user.id)
                        .single();

                    if (fetchError) console.log(fetchError.message);
                    if (currFav) {
                        setCurrentFavorites(currFav.favourite_eateries || []);
                        setIsFavorited(currFav.favourite_eateries?.includes(placeId) || false);
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        };

        if (placeId) {
            fetchEatery();
            fetchReview();
            fetchFavorites();
        } else if (eateryObj) {
            setEatery(eateryObj);
            setLoading(false);
            if (session?.user.id) {
                fetchFavorites();
            }
        } else {
            setLoading(false);
        }
    }, []);

// Render stars component
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Ionicons key={`full-${i}`} name="star" size={14} color="#FFD700" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <Ionicons key="half" name="star-half" size={14} color="#FFD700" />
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#FFD700" />
            );
        }

        return stars;
    };

    const renderReviewItem = ({ item }: { item: Review }) => (
        <View className="bg-offwhite rounded-xl p-4 mr-3 w-72 border border-[#d9d9d9]">
            <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-accent items-center justify-center mr-3">
                    {item.author.photoUri ? (
                        <Image
                            source={{ uri: item.author.photoUri }}
                            className="w-10 h-10 rounded-full"
                        />
                    ) : (
                        <Text className="text-white font-lexend-bold text-sm">
                            {item.author.displayName.charAt(0).toUpperCase()}
                        </Text>
                    )}
                </View>

                <View className="flex-1">
                    <Text className="text-base font-lexend-bold text-primary" numberOfLines={1}>
                        {item.author.displayName}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <View className="flex-row items-center mr-2">
                            {renderStars(item.rating)}
                        </View>
                    </View>
                </View>
            </View>

            {/* Review Text */}
            <Text className="text-sm font-lexend-regular text-gray-700 leading-5" numberOfLines={4}>
                {item.text}
            </Text>
        </View>
    );

    // Getting Directions
    const getDirectionOnPress = () => {
        if (eatery){
            Linking.openURL(eatery.googleMapsUri);
        }
    }

    const heartBtnOnPress = async () => {
       try {
            const result = await toggleFavorite(session.user.id, eatery.placeId, currentFavorites);
            setCurrentFavorites(result.updatedFavorites);
            setIsFavorited(!isFavorited);

            Alert.alert(
                "Success",
                result.wasAdded ? "Added to favorites!" : "Removed from favorites!"
            );
        } catch (error) {
            Alert.alert("Error", "Failed to update favorites");
        }
    }

    const handlePhonePress = () => {
        if (eatery?.internationalPhoneNumber) {
            Linking.openURL(`tel:${eatery.internationalPhoneNumber}`);
        } else {
            Alert.alert(
                "Phone Not Available",
                "This eatery doesn't have a phone number available.",
                [{ text: "OK", style: "default" }]
            );
        }
    };

    const handleWebsitePress = () => {
        if (eatery?.websiteUri) {
            const url = eatery.websiteUri.startsWith('http')
                ? eatery.websiteUri
                : `https://${eatery.websiteUri}`;
            Linking.openURL(url);
        } else {
            Alert.alert(
                "Website Not Available",
                "This eatery doesn't have a website available.",
                [{ text: "OK", style: "default" }]
            );
        }
    };

    const displayedReviews = showAllReviews ? reviews : reviews?.slice(0, 5);

    const getDistance = (currLocation, eateryLocation) => {
       if (!currLocation || !eateryLocation) {
           return;
       }
        const dist = calculateDistance(
            currLocation.latitude,
            currLocation.longitude,
            eateryLocation.latitude,
            eateryLocation.longitude
        );
        return `${dist.toFixed(2)} km`;
    }


    return (
        <View className="flex-1 bg-white">
            {/* Header*/}
            <View className="h-80 relative">
                <Image
                    source={{ uri: eatery?.photo || 'https://via.placeholder.com/300' }}
                    className="w-full h-full"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(102,51,25,0.8)']}
                    locations={[0, 0.8, 1]}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '100%',
                        width: '100%',
                        zIndex: 1,
                    }}
                />

                {/* Restaurant Info Overlay*/}
                <View className="absolute bottom-4 left-5 right-5 z-2" style={{ zIndex: 2 }}>
                    <Text className="text-3xl font-baloo-regular text-white">
                        {eatery?.displayName}
                    </Text>
                    <Text className="text-base font-lexend-regular text-white/90 mb-3" numberOfLines={2}>
                        {getDistance(currLocation, eatery?.location)}  •  {eatery?.primaryTypeDisplayName}  •  {getOpeningHoursForToday(eatery)}
                    </Text>
                    <View className="flex-row items-centzer">
                        <Text className="text-base font-lexend-regular text-white ml-2">
                            ★ {eatery?.rating}  •  {'$'.repeat(eatery?.priceLevel)}
                        </Text>
                    </View>
                </View>

                {/* Back Button */}
                <TouchableOpacity
                    className="absolute top-12 left-5 bg-black/50 p-3 rounded-full"
                    onPress = {()=>{router.back()}}
                    style={{zIndex: 20}}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* INFORMATION!! */}
            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 20}}>

                {/* Summary (optional)*/}
                {(eatery?.editorialSummary || eatery?.generativeSummary) && (
                    <View className="px-5 py-4 bg-offwhite border-b border-grey">
                        <Text className="text-sm font-lexend-regular text-primary">
                            {eatery?.editorialSummary ? eatery.editorialSummary : eatery?.generativeSummary}
                        </Text>
                    </View>
                )}

                {/* Information Section */}
                <View className="px-5 py-6">
                    <Text className="text-xl font-lexend-bold text-accent mb-2">Information</Text>
                    <View className="bg-offwhite rounded-xl px-6 py-5 mb-4 border border-[#d9d9d9]">
                        <View className="flex-row items-start mb-4">
                            <Ionicons name="location-outline" size={32} color="#FF6B3E" />
                            <Text className="text-base font-lexend-regular text-gray-700 ml-3 flex-1 leading-6">
                                {eatery?.formattedAddress}
                            </Text>
                        </View>

                        <View className="flex-row gap-6">
                            <TouchableOpacity
                                className="flex-1 bg-accent flex-row items-center justify-center py-3 px-4 rounded-full shadow-sm"
                                activeOpacity={0.8}
                                onPress={handlePhonePress}
                            >
                                <Ionicons name="call-outline" size={20} color="#fff" />
                                <Text className="text-white text-base font-baloo-regular ml-2">Call</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-accent flex-row items-center justify-center py-3 px-4 rounded-full shadow-sm"
                                onPress={handleWebsitePress}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="globe-outline" size={20} color="#fff" />
                                <Text className="text-white text-base font-baloo-regular ml-2">Website</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Reviews Section */}
                {reviews && reviews.length > 0 && (
                    <View className="px-5 -mt-4 mb-2">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-xl font-lexend-bold text-accent mb-2">Reviews</Text>
                            {reviews.length > 3 && (
                                <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
                                    <Text className="text-accent text-base font-lexend-regular">
                                        {showAllReviews ? '< View Less' : 'View More >'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <FlatList
                            data={displayedReviews}
                            renderItem={renderReviewItem}
                            keyExtractor={(item) => String(item.id)}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 20 }}
                        />
                    </View>
                )}

                {/* Friends Section */}
                <View className="px-5 py-4">
                    <Text className="text-xl font-lexend-bold text-accent mb-2">Friends Who Also Saved</Text>
                    <View className="bg-offwhite rounded-xl px-6 py-5 mb-4 border border-[#d9d9d9]">
                        {friends.length > 0 ? (
                            <ScrollView className="flex-row flex-wrap gap-3" horizontal showsHorizontalScrollIndicator={false}>
                                {friends.map((friend) => (
                                    <View key={friend.id} className="items-center mr-4 flex-col justify-center">
                                        <RemoteImage
                                            filePath={friend.avatar_url}
                                            bucket="avatars"
                                            style={{ width: 48, height: 48, borderRadius: 24 }}
                                        />
                                        <Text className="text-sm font-lexend-regular text-center mt-1 text-primary">
                                            @{friend.username}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <Text className="text-base font-lexend-regular text-gray-500">No friends have saved this yet.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Add to Favourites & Get Directions Buttons */}
            <View
                style={{
                    paddingBottom: insets.bottom + 8,
                    paddingTop: 16,
                    paddingHorizontal: 24,
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#d9d9d9',
                    flexDirection: 'row',
                }}
            >
                <TouchableOpacity
                    className="w-14 h-14 bg-accent rounded-full justify-center items-center shadow-inner"
                    onPress={heartBtnOnPress}
                >
                    <MaterialCommunityIcons name={isFavorited ? "heart" : "heart-outline"} size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-1 bg-accent ml-4 rounded-full py-4 flex-row justify-center items-center"
                    onPress={getDirectionOnPress}
                >
                    <Text className="text-white font-lexend-bold text-base">Get Directions</Text>
                    <Ionicons name="navigate" size={20} color="#fff" className="ml-2" />
                </TouchableOpacity>
            </View>
        </View>
    );
}