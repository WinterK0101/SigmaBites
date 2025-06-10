import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Matched() {
    const router = useRouter();
    const { restaurantImage } = useLocalSearchParams();

    const userImage =
        'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg';

    return (
        <View style={styles.container}>
            <Text style={styles.title}>It's a match!</Text>

            <View style={styles.imagesContainer}>
                <Image
                    source={{ uri: userImage }}
                    style={[styles.image, { marginRight: -20, zIndex: 1 }]}
                />
                <Image
                    source={{ uri: restaurantImage as string }}
                    style={[styles.image, { marginLeft: -20 }]}
                />
            </View>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/RestaurantDetails')}
            >
                <Text style={styles.primaryText}>Go to Eat!</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() =>
                    router.replace({
                        pathname: '/Swiping',
                        params: {
                            likedImage: restaurantImage, // 👈 pass image to filter it out
                        },
                    })
                }
            >
                <Text style={styles.primaryText}>Keep swiping</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF6B3E',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 40,
    },
    imagesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'white',
    },
    primaryButton: {
        backgroundColor: 'white',
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 60,
        marginBottom: 15,
    },
    primaryText: {
        color: '#FF6B3E',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
