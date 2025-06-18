import {View, Text, TouchableOpacity, TextInput} from 'react-native'
import React from 'react'
import {useLocalSearchParams, useRouter} from "expo-router";
import {LinearGradient} from "expo-linear-gradient";
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {icons} from "@/constants/icons";

export default function StartGroupSession() {
    const {latitude, longitude, filters, useDummyData } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View>
            <LinearGradient
                colors={['#d03939', '#fe724c']}
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingTop: insets.top,
                    paddingHorizontal: 24,
                    alignItems: "center",
                    height: 128,
                }}
            >
                <Text className="font-baloo-regular text-white text-3xl mr-6">Start Group Session</Text>
                <TouchableOpacity onPress={() => router.back()} style={{marginTop: -16}}><MaterialCommunityIcons name="door-open" size={36} color="white" /></TouchableOpacity>
            </LinearGradient>
            <View className="px-6">
                <Text className="font-lexend-bold text-accent text-2xl mt-8">Invite Friends</Text>
                <View className="flex-row items-center bg-grey rounded-2xl px-5 py-4 mt-4">
                    <icons.search height={20} width={20} stroke={"#6c6c6c"}/>
                    <TextInput
                        placeholder={"Enter a username"}
                        className="ml-3 flex-1 text-6c6c6c font-lexend-regular"
                        clearButtonMode={"while-editing"}
                        onFocus={() => {
                        }}
                    />
                </View>

            </View>
        </View>
    )
}