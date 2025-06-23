import {View, Text} from 'react-native'
import React from 'react'
import {Stack} from "expo-router";

export default function SoloSwipingLayout() {
    return (
        <Stack
            screenOptions={({ route }) => ({
                headerShown: false,
                presentation: 'modal'
            })}
        >
        </Stack>
    )
}
