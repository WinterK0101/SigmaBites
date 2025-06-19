import {View, Text, TouchableOpacity, Animated, ScrollView} from 'react-native'
import React, {useState} from 'react'
import {useLocalSearchParams, useRouter} from "expo-router";
import {LinearGradient} from "expo-linear-gradient";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {Collapsible} from "react-native-fast-collapsible";
import {LocationData} from "@/interfaces/interfaces";

export default function GroupLobby() {
    const { locationData, filters, useDummyData } = useLocalSearchParams();
    const parsedLocationData: LocationData = locationData ? JSON.parse(locationData as string) : null;
    const parsedFilters = filters ? JSON.parse(filters as string) : {};
    const insets = useSafeAreaInsets();
    const router = useRouter();

    // For filters collapsible
    const [isVisible, setVisibility] = useState(false);
    const toggleVisibility = () => {
        setVisibility((previous) => !previous);
    };

    return (
        <View className="flex-1">
            {/*Tab Header*/}
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
                    Group Lobby
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: -16 }}>
                    <MaterialCommunityIcons name="door-open" size={36} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <View className="px-6 flex-1">

                {/*Filters*/}
                <View className="bg-white p-5 mt-6 rounded-2xl border-2 border-grey">
                    <TouchableOpacity className="flex-row justify-between" onPress={toggleVisibility}>
                        <Text className="font-lexend-bold text-base text-primary">Filter Settings</Text>
                        <Text style={{
                            transform: isVisible ? [{ rotate: '90deg' }] : [{ rotate: '0deg' }],
                        }}><MaterialCommunityIcons name="greater-than" size={20}/></Text>
                    </TouchableOpacity>

                    <Collapsible isVisible={isVisible}>
                        <View className="mt-4">
                            <View className="h-[2] bg-grey mb-2" />
                            <Text className="text-primary text-xs mt-2 font-lexend-regular">
                                <Text className="font-lexend-bold">Location: </Text>
                                <Text>{parsedLocationData.address}</Text>
                            </Text>
                            <Text className="text-primary text-xs mt-2 font-lexend-regular">
                                <Text className="font-lexend-bold">Search Radius: </Text>
                                <Text>{parsedFilters.radius/1000} km</Text>
                            </Text>
                            <Text className="text-primary text-xs mt-2 font-lexend-regular">
                                <Text className="font-lexend-bold">Price Levels: </Text>
                                <Text>{parsedFilters.priceLevels.map((price: number) => '$'.repeat(price)).join(', ')}</Text>
                            </Text>
                            <Text className="text-primary text-xs mt-2 font-lexend-regular">
                                <Text className="font-lexend-bold">Minimum Rating: </Text>
                                <Text>{parsedFilters.minimumRating}</Text>
                            </Text>
                            <Text className="text-primary text-xs mt-2 font-lexend-regular">
                                <Text className="font-lexend-bold">Prioritised Cuisines: </Text>
                                <Text>
                                    {parsedFilters.cuisineTypes.map((cuisine: string) => (cuisine)).join(', ')}
                                </Text>
                            </Text>
                            <Text className="text-primary text-xs mt-2 font-lexend-regular">
                                <Text className="font-lexend-bold">Only Open Eateries?: </Text>
                                <Text>{parsedFilters.openNowToggle ? 'Yes' : 'No'}</Text>
                            </Text>
                            <TouchableOpacity className="mt-2"><Text className="font-baloo-regular text-accent">Edit Filters</Text></TouchableOpacity>
                        </View>
                    </Collapsible>
                </View>

                <Text className="text-accent text-2xl font-lexend-bold mt-6">Members (2/3)</Text>
                <View className="flex-row justify-between items-center">
                    <Text className="text-[#6C6C6C] font-lexend-regular text-base">2 joined, 1 pending</Text>
                    <TouchableOpacity
                        className="bg-white border-2 border-grey rounded-[30] w-[136] h-[36] justify-center items-center"
                    >
                        <Text className="text-accent text-xs font-baloo-regular">Invite More Friends</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-1">
                    <ScrollView
                        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* TODO: Invited friends will be here */}
                    </ScrollView>

                    {/* Start Group Swiping Button */}
                    <View
                        style={{
                            position: 'absolute',
                            bottom: insets.bottom + 16,
                            left: 24,
                            right: 24,
                        }}
                    >
                        <TouchableOpacity activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#d03939', '#fe724c']}
                                style={{
                                    borderRadius: 30,
                                    height: 60,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text className="font-baloo-regular text-white text-2xl pt-2">
                                    Start Group Swiping
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>




            </View>


        </View>
    )
}
