import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Matched() {
    const router = useRouter();
    const { restaurantImage } = useLocalSearchParams();
    const imageUri = typeof restaurantImage === 'string' ? restaurantImage : '';

    const userImage =
        'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg';

    return (
        <ImageBackground
            source={require('../assets/images/match-bg.jpeg')}
            style={styles.background}
            resizeMode="cover"
        >
            <Text style={styles.title}>It's a match!</Text>

            <View style={styles.imagesContainer}>
                <Image source={{ uri: userImage }} style={styles.image} />
                <View style={styles.heartCircle}>
                    <FontAwesome name="heart" size={28} color="white" />
                </View>
                <Image source={{ uri: imageUri }} style={styles.image} />
            </View>

            <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/RestaurantDetails')}
            >
                <Text style={styles.primaryText}>Go to Eat!</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 10 }]}
                onPress={() =>
                    router.replace({
                        pathname: '/Swiping',
                        params: {
                            likedImage: imageUri,
                        },
                    })
                }
            >
                <Text style={styles.primaryText}>Keep swiping</Text>
            </TouchableOpacity>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 42,
        color: 'white',
        marginBottom: 40,
        fontFamily: 'Baloo-Regular',
    },
    imagesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
        position: 'relative',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 80,
        borderWidth: 4,
        borderColor: '#EEA191',
        marginHorizontal: -20,
    },
    heartCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF6B3E',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 45,
        zIndex: 2,
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
        fontFamily: 'Baloo-Regular',
        fontSize: 20,
    },
});
