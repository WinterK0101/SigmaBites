import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native'
import React, {useEffect, useState} from 'react'
import {LinearGradient} from "expo-linear-gradient";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useLocalSearchParams, useRouter} from "expo-router";
import {fetchEateryByID} from "@/services/eateryService";
import {Eatery} from "@/interfaces/interfaces";

export default function VoteBreakdown() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const {sortedVotes: sortedVotesParam} = useLocalSearchParams()
    const [votes, setVotes] = useState<{ eateryID: string; count: number }[]>([])
    const [loading, setLoading] = useState(false)
    const [eateries, setEateries] = useState<Eatery[]>([])

    useEffect(() => {
        async function fetchVoteInformation() {
            try {
                setLoading(true);
                const sortedVotes = JSON.parse(sortedVotesParam);

                // // FOR TESTING!!!!
                // const sortedVotes = [
                //     {
                //         eateryID: 'ChIJcY9MxKfY2jERipP87g9f0Ws',
                //         count: 8
                //     },
                //     {
                //         eateryID: 'ChIJ04DTdbQZ2jERFt4kBQi-E60',
                //         count: 5
                //     },
                //     {
                //         eateryID: 'ChIJ1Y5ET7A92jERgEtUCvAQepI',
                //         count: 4
                //     },
                //     {
                //         eateryID: 'ChIJ3YoS3ukP2jERkcHsff2PWBo',
                //         count: 2
                //     },
                //     {
                //         eateryID: 'ChIJ5T8-VXUZ2jERMpGzIj6L2ts',
                //         count: 0
                //     },
                // ]

                setVotes(sortedVotes);

                const eateriesArr: Eatery[] = await Promise.all(
                    sortedVotes.map(async (vote: { eateryID: string; count: number }) => {
                        try {
                            const eatery = await fetchEateryByID(vote.eateryID);
                            return eatery;
                        } catch (error) {
                            console.error(`Error fetching eatery ${vote.eateryID}:`, error);
                        }
                    })
                );
                setEateries(eateriesArr);
            } catch (error) {
                console.error('Error in fetchVoteInformation:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchVoteInformation();
    }, [sortedVotesParam]);

    // Helper to get vote count for an eatery
    const getVoteCount = (eateryID: string) => {
        const vote = votes.find(v => v.eateryID === eateryID);
        return vote ? vote.count : 0;
    };

    return (
        <View className="flex-1">
            {/* Header */}
            <LinearGradient
                colors={['#d03939', '#fe724c']}
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingTop: insets.top,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                    height: 128,
                }}
            >
                <Text className="font-baloo-regular text-white text-3xl mr-6">
                    Vote Breakdown
                </Text>
                <TouchableOpacity style={{ marginTop: -16 }} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="door-open" size={36} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView className="flex-1 mt-6 flex-grow" contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}>
                {loading ? (
                    <Text className="text-center text-primary font-lexend-regular opacity-60 mt-10">Loading votes...</Text>
                ) : eateries.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">No eateries found</Text>
                ) : (
                    eateries.map((eatery: Eatery) => (
                        <TouchableOpacity
                            className="rounded-2xl w-full mb-2 h-[100] border-2 px-6 py-2 flex-row items-center"
                            key={eatery.placeId}
                            activeOpacity={0.8}
                            onPress={() => {router.push({
                                pathname: '/(modals)/RestaurantDetails',
                                params: {
                                    placeId: eatery.placeId,
                                    eatery: JSON.stringify(eatery)
                                }
                            });}}
                            style={{
                                backgroundColor: 'white',
                                borderColor: '#d9d9d9',
                            }}
                        >
                            <Image
                                source={{uri: eatery.photo || 'https://via.placeholder.com/50'}}
                                style={{ width: 64, height: 64, borderRadius: 25 }}
                            />
                            <View className="flex-col ml-6 flex-1">
                                <Text className="font-lexend-bold text-lg text-primary pr-2" numberOfLines={2}>
                                    {eatery.displayName || 'Unknown Restaurant'}
                                </Text>
                                <Text className="font-lexend-regular text-sm text-primary-600">
                                    {getVoteCount(eatery.placeId)} votes
                                </Text>
                            </View>
                            <View className="bg-accent rounded-xl px-4 py-2">
                                <Text className="text-white font-lexend-bold text-sm">
                                    {getVoteCount(eatery.placeId)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    )
}