import * as Location from 'expo-location';
import {Alert, Linking} from 'react-native';

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