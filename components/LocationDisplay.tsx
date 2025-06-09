import React, { useState } from 'react';
import { getCurrentLocation, LocationData } from "@/services/locationService";
import { icons } from "@/constants/icons";
import { Text, TouchableOpacity, View } from "react-native";

interface LocationDisplayProps {
    selectedLocation: LocationData | null;
    onLocationChange: (locationData: LocationData | null) => void;
}

export const LocationDisplay = ({selectedLocation, onLocationChange}: LocationDisplayProps) => {
    const [displayText, setDisplayText] = useState('Tap here to use current location');
    const [isLoading, setIsLoading] = useState(false);

    const getDisplayText = () => {
        if (selectedLocation) {
            return selectedLocation.address; // Use formatted address from coordinates
        }
        return displayText; // Current location display text
    }

    const handleLocationPress = async () => {
        setIsLoading(true);
        setDisplayText('Getting location...');

        try {
            const locationData = await getCurrentLocation();
            setDisplayText(locationData.address);

            if (onLocationChange) {
                onLocationChange(locationData); // Pass the full LocationData object
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
                <Text className="text-primary font-lexend-bold text-base">Location</Text>
                <Text className="text-primary font-lexend-regular text-xs">
                    {getDisplayText()}
                </Text>
            </View>
        </TouchableOpacity>
    );
};