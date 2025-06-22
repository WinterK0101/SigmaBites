import {View, Text, ActivityIndicator, ImageBackground, Image, TouchableOpacity, FlatList} from 'react-native'
import React, {useEffect, useState} from 'react'
import {images} from "@/constants/images";
import {getAllVotes, getTopEateries} from "@/services/votingService";
import {useLocalSearchParams, useRouter} from "expo-router";
import {Eatery} from "@/interfaces/interfaces"
import {fetchEateryByID} from "@/services/eateryService";
import {Ionicons} from "@expo/vector-icons";

export default function GroupResults() {
    const { groupID } = useLocalSearchParams<{groupID:string}>();
    const [loading, setLoading] = useState(false);
    const [topEateries, setTopEateries] = useState<Eatery[]>([]);
    const [index, setIndex] = useState(0);
    const router = useRouter();
    const [sortedVotes, setSortedVotes] = useState<{ eateryID: string; count: number }[]>([]);

    const goLeft = () => {
        if (index > 0) {
            const newIndex = index - 1;
            setIndex(newIndex);
        }
    };

    const goRight = () => {
        if (index < topEateries.length - 1) {
            const newIndex = index + 1;
            setIndex(newIndex);
        }
    };

    useEffect(() => {
        async function fetchVotes() {
            if (!groupID) return;

            setLoading(true);
            const sorted = await getAllVotes(groupID);
            setSortedVotes(sorted || []);
            const topIDs = getTopEateries(sorted);
            if (!topIDs || !topIDs.length) setTopEateries([]);
            else {
                const topEateries = await Promise.all(
                    topIDs.map((id: string) => fetchEateryByID(id))
                );
                setTopEateries(topEateries);
            }
            setLoading(false);
        }

        fetchVotes();
    }, [groupID]);

    // const dummyTopEateries = [
    //     {
    //         displayName: "Josh's Grill",
    //         photo: "https://picsum.photos/300/300?random=1",
    //     },
    //     {
    //         displayName: "Ramen Place",
    //         photo: "https://picsum.photos/300/300?random=2",
    //     },
    //     {
    //         displayName: "Another Restaurant",
    //         photo: "https://picsum.photos/300/300?random=3",
    //     },
    // ]

    // No eateries display
    if (!loading && topEateries.length === 0) {
        return (
            <ImageBackground source={images.nomatchesbg} className="flex-1 justify-center items-center px-6 bg-gray-50">
                <View className="items-center mb-8">
                    <Image source={images.deadfish} style={{width: 200, height: 200}}/>

                    <Text
                        className="font-baloo-regular text-3xl text-gray-800 text-center mt-3 mb-3"
                    >
                        No matches found
                    </Text>

                    <Text
                        className="font-lexend-regular text-base text-gray-600 text-center leading-6"
                    >
                        Looks like your group hasn't found any{'\n'}common eateries yet. Try again?
                    </Text>
                </View>

                <TouchableOpacity
                    className="bg-accent px-6 py-3 rounded-full"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                    onPress={()=>router.replace('/(tabs)/Discover')}
                >
                    <Text className="text-white text-base font-baloo-regular">
                        Go back to Discover
                    </Text>
                </TouchableOpacity>
            </ImageBackground>
        );
    }

    // Display for matches
    return (
        <ImageBackground
            source={images.primarybg}
            className="flex-1 w-full h-full"
            resizeMode="cover"
        >
            <View className="flex-1 justify-center items-center px-6">
                {/* Header */}
                <View className="items-center mb-10">
                    <Text
                        className="font-baloo-regular text-5xl text-white text-center"
                        style={{
                            textShadowColor: 'rgba(129, 52, 42, 1)',
                            textShadowOffset: { width: 3, height: 4 },
                            textShadowRadius: 0,
                            lineHeight: 52,
                        }}
                    >
                        It's a match!
                    </Text>
                    <Text
                        className="font-lexend-regular text-lg text-white text-center opacity-90"
                        style={{
                            textShadowColor: 'rgba(0, 0, 0, 0.5)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 3,
                        }}
                    >
                        Here are your group's top picks
                    </Text>
                </View>

                {/* Main Content */}
                {loading ? (
                    <ActivityIndicator size="large" color="white" />
                ) : (
                    <View className="flex-row items-center justify-center w-full">
                        {/* Left Arrow */}
                        <TouchableOpacity
                            onPress={goLeft}
                            disabled={index === 0}
                            className="shadow-lg"
                            style={{
                                opacity: index > 0 ? 1 : 0.3,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                        >
                            <Ionicons name="chevron-back" size={32} color="white" />
                        </TouchableOpacity>

                        {/* Restaurant Card */}
                        <View className="items-center flex-1 max-w-xs">
                            <View className="relative mb-10">
                                <Image
                                    source={{ uri: topEateries[index].photo }}
                                    className="w-56 h-56  rounded-full border-4 border-white"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 6,
                                    }}
                                />
                                {/* Heart Icon */}
                                <View
                                    className="absolute justify-center items-center bg-accent rounded-full p-3 border-4 border-white"
                                    style={{
                                        bottom: -20,
                                        left: '50%',
                                        transform: [{ translateX: -76 }],
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 6,
                                        elevation: 10,
                                    }}
                                >
                                    <Ionicons name="heart" size={40} color="white" />
                                </View>
                            </View>

                            <Text
                                className="font-baloo-regular text-3xl text-white text-center"
                                style={{
                                    textShadowColor: 'rgba(0, 0, 0, 0.5)',
                                    textShadowOffset: { width: 0, height: 2 },
                                    textShadowRadius: 4,
                                }}
                            >
                                {topEateries[index].displayName}
                            </Text>

                            <TouchableOpacity className="mb-6">
                                <Text
                                    className="text-white text-base font-lexend-regular"
                                >
                                    View More Details
                                </Text>
                            </TouchableOpacity>

                            {/* Position dots */}
                            {topEateries.length > 1 && (
                                <View className="flex-row justify-center">
                                    {topEateries.map((_, i) => (
                                        <View
                                            key={i}
                                            className={`w-2.5 h-2.5 rounded-full mx-1 ${
                                                i === index ? 'bg-white' : 'bg-white/40'
                                            }`}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Right Arrow */}
                        <TouchableOpacity
                            onPress={goRight}
                            disabled={index == topEateries.length - 1}
                            className="border-white shadow-lg"
                            style={{
                                opacity: index < topEateries.length - 1 ? 1 : 0.3,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                        >
                            <Ionicons name="chevron-forward" size={32} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Bottom Button */}
                <View className="absolute bottom-16 left-0 right-0 items-center px-5">
                    <TouchableOpacity
                        className="bg-white px-8 py-4 rounded-full shadow-lg flex-row items-center"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.3,
                            shadowRadius: 6,
                            elevation: 5,
                        }}
                        onPress={()=> router.push({
                            pathname: '/groupSwiping/VoteBreakdown',
                            params: { sortedVotes: JSON.stringify(sortedVotes) },
                        })}
                    >
                        <Text
                            className="text-accent text-base font-baloo-regular"
                        >
                            View All Votes
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-row items-center mt-4"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.3,
                            shadowRadius: 6,
                            elevation: 5,
                        }}
                        onPress={()=>router.replace('/(tabs)/Discover')}
                    >
                        <Text
                            className="text-white text-base font-baloo-regular"
                        >
                            Return to Discover
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    )
}