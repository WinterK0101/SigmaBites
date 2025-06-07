import {View, Text, Button, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import LocationSearch from "@/components/LocationSearch";
import {LocationDisplay} from "@/components/LocationDisplay";
import React, {useState} from 'react';
import {LocationData} from "@/services/locationService";
import {getNearbyEateries} from "@/services/eaterySearch";

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

    const initiateEaterySearch = async () => {
        if (!userLocation) {
            Alert.alert("Please enter a valid location");
            return;
        }
        try {
            const eateries = await getNearbyEateries(
                userLocation.coordinates.latitude,
                userLocation.coordinates.longitude
            );
            console.log("Eateries: ", eateries);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <SafeAreaView className="bg-offwhite flex-1">
            <View className="px-4 pt-8 flex-1">
                <Text className="font-baloo-regular text-accent text-4xl py-4">Discover</Text>
                <LocationSearch onLocationSelect={setUserLocation}/>
                <LocationDisplay
                    selectedLocation={userLocation}
                    onLocationChange={handleLocationChange}
                />
                <Button
                    title="Start Swiping!"
                    onPress={initiateEaterySearch}
                />
            </View>
        </SafeAreaView>
    );
}