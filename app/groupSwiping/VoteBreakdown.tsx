import {View, Text, TouchableOpacity, ScrollView} from 'react-native'
import React from 'react'
import {LinearGradient} from "expo-linear-gradient";
import {MaterialCommunityIcons} from "@expo/vector-icons";

export default function VoteBreakdown() {
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
                    Group Lobby
                </Text>
                <TouchableOpacity style={{ marginTop: -16 }}>
                    <MaterialCommunityIcons name="door-open" size={36} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView className="flex-1 px-6">
            </ScrollView>
        </View>
    )
}
