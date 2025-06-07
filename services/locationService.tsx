import * as Location from 'expo-location';
import {Alert, Linking} from 'react-native';
import debounce from 'lodash.debounce';

export const getCurrentLocation = async (): Promise<string> => {
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
        let location = await Location.getCurrentPositionAsync({});

        // Reverse geocode to get address
        let { latitude, longitude } = location.coords;
        let response = await Location.reverseGeocodeAsync({ latitude, longitude });

        if (response.length > 0) {
            let item = response[0];
            let address = `${item.name || ''} ${item.city || ''} ${item.postalCode || ''}`.trim();
            return address || 'Location found but address unavailable';
        } else {
            return 'Address not found';
        }
    } catch (error) {
        console.error('Location error:', error);
        throw error;
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

// Create the debounced function once and export it
export const debouncedLocationSearch = debounce(
    (query: string, setPredictions: Function, setLoading: Function) => {
        searchLocations(query, setPredictions, setLoading);
    },
    300
);