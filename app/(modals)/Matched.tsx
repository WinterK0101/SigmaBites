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
            source={require('../../assets/images/match-bg.jpeg')}
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
                style={{ marginTop: 10 }}
                onPress={() =>
                    router.back()
                }
            >
                <Text className="font-baloo-regular text-2xl text-white">Keep swiping</Text>
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
        borderColor: 'white',
        marginHorizontal: -20,
    },
    heartCircle: {
        width: 80,
        height: 80,
        borderRadius: 100,
        backgroundColor: '#FE724C',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 100,
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
        color: '#FF724C',
        fontFamily: 'Baloo-Regular',
        fontSize: 20,
    },
});
