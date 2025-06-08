import {View, Text, TouchableOpacity, TextInput} from 'react-native';
import {icons} from "@/constants/icons";
import {SafeAreaView} from "react-native-safe-area-context";
import LocationSearch from "@/components/LocationSearch";
import {LocationDisplay} from "@/components/LocationDisplay";
import React, {useState} from 'react';
import {LocationData} from "@/services/locationService";

export default function Discover() {
    const [userLocation, setUserLocation] = useState<LocationData | null>(null);

    const handleLocationChange = (location: LocationData | null) => {
        setUserLocation(location);
    };

    // Helper function to get coordinates
    const getCurrentCoordinates = () => {
        return userLocation?.coordinates || null;
    };

    // Helper function to get address
    const getCurrentAddress = () => {
        return userLocation?.address || null;
    };

    return (
        <SafeAreaView className="bg-offwhite flex-1">
            <View className="px-4 pt-8 flex-1">
                <Text className="font-baloo-regular text-accent text-4xl py-4">Discover</Text>
                <LocationSearch onLocationSelect={setUserLocation}/>
                <LocationDisplay
                    selectedLocation={userLocation}
                    onLocationChange={handleLocationChange}
                />
            </View>
        </SafeAreaView>
    );
}