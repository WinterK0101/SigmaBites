import React, { useState } from 'react';
import { getCurrentLocation } from "@/services/locationService";
import { icons } from "@/constants/icons";
import { Text, TouchableOpacity, View } from "react-native";

export const LocationDisplay = ({selectedLocation, onLocationChange}) => {
    const [displayText, setDisplayText] = useState('Tap here to use current location');
    const [isLoading, setIsLoading] = useState(false);

    const getDisplayText = () => {
        if (selectedLocation) {
            return selectedLocation.description; // Sets display text as a "custom" location
        }
        return displayText; // Sets display text as current location
    }

    const handleLocationPress = async () => {
        setIsLoading(true);
        setDisplayText('Getting location...');

        try {
            const address = await getCurrentLocation();
            setDisplayText(address);
            if (onLocationChange) {
                onLocationChange(null);
            }
        } catch (error) {
            setDisplayText('Failed to get location');
            console.error('Location error:', error);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <TouchableOpacity
            className="flex-row items-center bg-white border-grey border-2 shadow-inner rounded-2xl px-5 py-6 mt-5"
            onPress={handleLocationPress}
            disabled={isLoading}
        >
            <icons.location height={35} width={35} stroke={"#6c6c6c"} />
            <View className="flex-column ml-3">
                <Text className="text-primary font-baloo-regular text-xl">Location</Text>
                <Text className="text-primary font-lexend-regular text-xs">
                    {getDisplayText()}
                </Text>
            </View>
        </TouchableOpacity>
    );
};