import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Linking, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Eatery, Review } from "@/interfaces/interfaces";
import { supabase } from '@/SupabaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addToFavorites } from '@/services/favouriteService';
import { useSession } from '@/context/SessionContext';

export default function RestaurantDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const session = useSession();

    const [eatery, setEatery] = useState<Eatery | null>(null);
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [loading, setLoading] = useState(true);

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
                if (currEatery) setEatery(currEatery);
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

        if (placeId) {
            fetchEatery();
            fetchReview();
        } else if (eateryObj) {
            setEatery(eateryObj);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, []);

    const renderItem = ({ item }: { item: Review }) => (
        <View style={styles.reviewBox}>
            <Text style={styles.reviewUser}>{item.author.displayName}</Text>
            <Text style={styles.reviewText}>{item.text}</Text>
        </View>
    );

    // Handle onpress for Get Direction
    const getDirectionOnPress = () => {
        if (eatery){
            const url = `https://www.google.com/maps/search/?api=1&query=${eatery.location.latitude},${eatery.location.longitude}`;
            Linking.openURL(url);
        }
    }

    // Handle onpress for heart button
    const heartBtnOnPress = () => {
        console.log("you have clicked the favourite button")
        const retrieveFavourites = async () => {
            const {data:currFav, error:fetchError} = await supabase
            .from("profiles")
            .select("favourite_eateries")
            .eq("id", session?.user.id)
            .single()

            if (fetchError) console.log(fetchError.message)
            
            if (eatery && session && currFav)
            {
                addToFavorites(session.user.id, eatery.placeId, currFav.favourite_eateries)
                console.log("added to favourites")
            }
            else{
                console.log(eatery?.placeId)
                console.log(session?.user.id)
                console.log(currFav?.favourite_eateries)
            }
        }

        retrieveFavourites()
    }

    return (
        <View style={{ flex: 1 }}>
            <Image
                source={{ uri: eatery?.photo || 'https://via.placeholder.com/300' }}
                style={styles.image}
            />

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.overlayBox}>
                <Text style={styles.name}>{eatery?.displayName}</Text>
                <Text style={styles.details}>
                    {eatery?.editorialSummary ? eatery.editorialSummary : eatery?.generativeSummary}
                </Text>
                <Text style={styles.rating}>{eatery?.rating}</Text>
            </View>

            {/* Scrollable info section */}
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Information</Text>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Address:</Text>
                        <Text style={styles.value}>{eatery?.formattedAddress}</Text>

                        <Text style={styles.label}>Website:</Text>
                        <Text
                            style={[styles.value, { color: '#FF6B3E' }]}
                            onPress={() => {
                                if (eatery?.websiteUri) {
                                    // Add https:// if not present to ensure valid URL
                                    const url = eatery.websiteUri.startsWith('http') 
                                        ? eatery.websiteUri 
                                        : `https://${eatery.websiteUri}`;
                                    Linking.openURL(url);
                                }
                            }}
                        >
                            {eatery?.websiteUri || 'No website available'}
                        </Text>

                        <Text style={styles.label}>Phone:</Text>
                        <Text style={styles.value}>{eatery?.internationalPhoneNumber}</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Reviews</Text>
                    <FlatList
                        data={reviews}
                        renderItem={renderItem}
                        keyExtractor={(item) => String(item.id)}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />

                    <Text style={styles.sectionTitle}>Friends Who Also Saved</Text>
                    <View style={styles.friendRow}>
                        <Image source={{ uri: 'https://i.pravatar.cc/100?u=friend1' }} style={styles.avatar} />
                        <Image source={{ uri: 'https://i.pravatar.cc/100?u=friend2' }} style={styles.avatar} />
                    </View>
                </ScrollView>
            </View>

            {/* Bottom buttons */}
            <View style={[styles.bottomButtons, { paddingBottom: insets.bottom + 24}]}>
                <TouchableOpacity style={styles.heartButton} onPress={heartBtnOnPress}>
                    <Ionicons name="heart" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.directionsButton} onPress={getDirectionOnPress}>
                    <Text style={styles.directionsText}>Get Directions ➝</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 260,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: '#00000055',
        padding: 8,
        borderRadius: 20,
    },
    overlayBox: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        margin: 16,
        marginTop: -40,
        elevation: 3,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    details: {
        fontSize: 14,
        color: '#777',
        marginTop: 4,
    },
    rating: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 6,
    },
    infoSection: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B3E',
        marginTop: 20,
        marginBottom: 10,
    },
    infoBox: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 10,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 6,
    },
    value: {
        marginBottom: 4,
    },
    reviewBox: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        marginRight: 10,
    },
    reviewUser: {
        fontWeight: '600',
    },
    reviewText: {
        marginTop: 4,
    },
    friendRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 10,
    },
    bottomButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    heartButton: {
        width: 56,
        height: 56,
        backgroundColor: '#FF6B3E',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    directionsButton: {
        flex: 1,
        backgroundColor: '#FF6B3E',
        marginLeft: 20,
        borderRadius: 30,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    directionsText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
