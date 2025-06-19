import * as Location from 'expo-location';
import {Alert, Linking} from 'react-native';
import debounce from 'lodash.debounce';
import { LocationData } from '@/interfaces/interfaces';

// Creates location object with the important location details if user selects current location
export const getCurrentLocation = async (skipGeocode = false): Promise<LocationData> => {
    try {
        // Request permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Location Permission Required',
                'Please enable location access in your device settings to use this feature.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings()
                    }
                ]
            );
            throw new Error('Permission to access location was denied');
        }

        // Get current position
        let location = await Location.getCurrentPositionAsync({}); // Creates a new location object based on current location
        let { latitude, longitude } = location.coords;

        // Reverse geocode to get formatted address
        const address = skipGeocode ? '' : await reverseGeocode(latitude, longitude);

        return {
            coordinates: { latitude, longitude },
            address,
            isCurrentLocation: true
        };
    } catch (error) {
        console.error('Location error:', error);
        throw error;
    }
};

// Creates a location object with the important details if location search is done
export const getLocationFromPlaceId = async (placeId: string): Promise<LocationData> => {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.result.geometry) {
            const { lat, lng } = data.result.geometry.location;

            // Use reverse geocode for consistent formatting
            const address = await reverseGeocode(lat, lng);

            return {
                coordinates: { latitude: lat, longitude: lng },
                address,
                isCurrentLocation: false
            };
        } else {
            throw new Error('Failed to get place details');
        }
    } catch (error) {
        console.error('Place details error:', error);
        throw error;
    }
};

const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
        let response = await Location.reverseGeocodeAsync({ latitude, longitude });

        if (response.length > 0) {
            let item = response[0];
            let address = `${item.name || ''} ${item.city || ''} ${item.postalCode || ''}`.trim();
            return address || 'Location found but address unavailable';
        } else {
            return 'Address not found';
        }
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return 'Address formatting failed';
    }
};

const searchLocations = async (query: string, setPredictions: Function, setLoading: Function) => {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY}`;

    setLoading(true);
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            setPredictions(data.predictions || []);
        } else {
            console.error('Google Places API error:', data.status, data.error_message);
            setPredictions([]);
        }
    } catch (error) {
        console.error('Fetching predictions failed:', error);
        setPredictions([]);
    } finally {
        setLoading(false);
    }
};

// Adds a delay to reduce API cals
export const debouncedLocationSearch = debounce(
    (query: string, setPredictions: Function, setLoading: Function) => {
        searchLocations(query, setPredictions, setLoading);
    },
    500
);