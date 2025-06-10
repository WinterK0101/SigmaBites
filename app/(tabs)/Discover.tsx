import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    Animated,
    Switch
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import LocationSearch from "@/components/LocationSearch";
import { LocationDisplay } from "@/components/LocationDisplay";
import React, { useState } from 'react';
import { LocationData } from "@/services/locationService";
import Slider from "@react-native-community/slider";
import ScrollView = Animated.ScrollView;
import { LinearGradient } from "expo-linear-gradient";
import { EateryFilters } from "@/interfaces/interfaces";
import { Ratings } from "@hammim-in/react-native-ratings";
import { useRouter } from 'expo-router';
import {getNearbyEateries} from "@/services/eaterySearch";

export default function Discover() {
    const router = useRouter();
    const [userLocation, setUserLocation] = useState<LocationData | null>(null);
    const [searchRadius, setSearchRadius] = useState(2000);
    const [selectedPrices, setSelectedPrices] = useState(new Set([1]));
    const [selectedCuisines, setSelectedCuisines] = useState(new Set(['All']));
    const [searchOpen, setSearchOpen] = useState(true);
    const [minimumRating, setMinimumRating] = useState(1);
    const [useDummyData, setUseDummyData] = useState(true); // Toggle for testing

    const priceLevelOptions = [1, 2, 3, 4];
    const cuisineOptions = ['All', 'Japanese', 'Korean', 'Chinese', 'Indian', 'Thai', 'American', 'Asian'];

    const handleLocationChange = (location: LocationData | null) => {
        setUserLocation(location);
    };

    const togglePrice = (price: number) => {
        setSelectedPrices(prev => {
            const newSet = new Set(prev);
            newSet.has(price) ? newSet.delete(price) : newSet.add(price);
            return newSet;
        });
    };

    const toggleCuisines = (cuisine: string) => {
        setSelectedCuisines((prev: Set<string>) => {
            const newSet = new Set(prev);

            if (cuisine === 'All') {
                // If "All" is selected, clear everything and add only "All"
                return new Set(['All']);
            } else {
                // If a specific cuisine is selected, remove "All" first
                newSet.delete('All');

                // Then toggle the selected cuisine
                if (newSet.has(cuisine)) {
                    newSet.delete(cuisine);
                    // If no cuisines are selected after removal, default back to "All"
                    if (newSet.size === 0) {
                        newSet.add('All');
                    }
                } else {
                    newSet.add(cuisine);
                }
            }

            return newSet;
        });
    };

    const toggleOpenNow = () => {
        setSearchOpen(!searchOpen);
    };

    const startSwiping = async () => {
        if (!userLocation) {
            Alert.alert("Please select a location");
            return;
        }

        if (selectedPrices.size === 0) {
            Alert.alert("Please select a price level");
            return;
        }

        if (selectedCuisines.size === 0) {
            Alert.alert("Please select a cuisine type");
            return;
        }

        const filters: EateryFilters = {
            priceLevels: Array.from(selectedPrices),
            minimumRating: minimumRating,
            cuisineTypes: Array.from(selectedCuisines),
            radius: searchRadius,
            openNowToggle: searchOpen
        };

        let eateries = [];

        if (useDummyData) {
            // Use dummy data for testing
            eateries = [];
        } else {
            try {
                // Get real data from API
                eateries = await getNearbyEateries(
                    userLocation.coordinates.latitude,
                    userLocation.coordinates.longitude,
                    filters
                );
            } catch (error) {
                console.error('API call failed:', error);
                Alert.alert("Error", "Failed to fetch eateries");
                return;
            }
        }

        // Navigate to Swiping screen with eateries data
        router.push({
            pathname: '/Swiping',
            params: {
                latitude: userLocation.coordinates.latitude.toString(),
                longitude: userLocation.coordinates.longitude.toString(),
                eateries: JSON.stringify(eateries),
                useDummyData: useDummyData.toString()
            }
        });
    }

    return (
        <SafeAreaView className="bg-offwhite flex-1" edges={['top', 'left', 'right']}>
            <ScrollView
                className="px-5 flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <Text className="font-baloo-regular text-accent text-4xl pt-4 pb-2">Discover</Text>

                <LocationSearch onLocationSelect={setUserLocation} />
                <LocationDisplay
                    selectedLocation={userLocation}
                    onLocationChange={handleLocationChange}
                />

                {/* Search Radius */}
                <View className="mt-6">
                    <Text className="font-lexend-bold text-primary text-base">Search Radius</Text>
                    <Slider
                        minimumValue={500}
                        maximumValue={5000}
                        minimumTrackTintColor="#fe724c"
                        step={100}
                        value={searchRadius}
                        onValueChange={setSearchRadius}
                    />
                    <View className="flex-row justify-between">
                        <Text className="text-gray-600 opacity-60 text-base font-lexend-regular">0.5 km</Text>
                        <Text className="text-accent text-base font-lexend-bold">{searchRadius / 1000} km</Text>
                        <Text className="text-gray-600 opacity-60 text-base font-lexend-regular">5 km</Text>
                    </View>
                </View>

                {/* Price Range */}
                <View className="mt-6">
                    <Text className="font-lexend-bold text-primary text-base mb-3">Price Range</Text>
                    <View className="flex-row justify-between">
                        {priceLevelOptions.map((price) => (
                            <TouchableOpacity
                                key={price}
                                style={{
                                    backgroundColor: selectedPrices.has(price) ? '#fe724c' : '#d9d9d9',
                                    borderRadius: 15,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 70,
                                    height: 36,
                                }}
                                onPress={() => togglePrice(price)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={{ color: selectedPrices.has(price) ? '#ffffff' : '#272d2f' }}
                                    className="text-base font-baloo-regular"
                                >
                                    {'$'.repeat(price)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Minimum Rating */}
                <View className="mt-6">
                    <Text className="font-lexend-bold text-primary text-base mb-2">Minimum Rating</Text>
                    <Ratings
                        defaultRating={minimumRating}
                        size={32}
                        count={5}
                        onFinishRating={setMinimumRating}
                    />
                </View>

                {/* Cuisine Types */}
                <View className="mt-6">
                    <Text className="font-lexend-bold text-base text-primary mb-3">Cuisine Types</Text>
                    <View className="flex-row flex-wrap">
                        {cuisineOptions.map((cuisine) => (
                            <TouchableOpacity
                                key={cuisine}
                                style={{
                                    backgroundColor: selectedCuisines.has(cuisine) ? '#fe724c' : '#d9d9d9',
                                    borderRadius: 15,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    margin: 4,
                                    minWidth: 80,
                                }}
                                onPress={() => toggleCuisines(cuisine)}
                            >
                                <Text
                                    style={{
                                        color: selectedCuisines.has(cuisine) ? '#ffffff' : '#272d2f',
                                    }}
                                    className="font-lexend-regular text-base"
                                >
                                    {cuisine}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Open Now Toggle */}
                <View className="mt-6">
                    <Text className="font-lexend-bold text-primary text-base mb-3">Show Only Open Eateries?</Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#fe724c' }}
                        thumbColor={searchOpen ? '#ffffff' : '#f4f3f4'}
                        ios_backgroundColor="#d9d9d9"
                        onValueChange={toggleOpenNow}
                        value={searchOpen}
                    />
                </View>

                {/* Testing Toggle */}
                <View className="mt-4 mb-2">
                    <Text className="font-lexend-bold text-primary text-base mb-3">Use Dummy Data (Testing)</Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#fe724c' }}
                        thumbColor={useDummyData ? '#ffffff' : '#f4f3f4'}
                        ios_backgroundColor="#d9d9d9"
                        onValueChange={setUseDummyData}
                        value={useDummyData}
                    />
                </View>

                {/* Start Swiping Button */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={startSwiping}
                >
                    <LinearGradient
                        colors={['#d03939', '#fe724c']}
                        style={{
                            borderRadius: 30,
                            marginTop: 32,
                            marginBottom: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            height: 60,
                        }}
                    >
                        <Text className="font-baloo-regular text-white text-2xl pt-2">
                            Start Swiping!
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}