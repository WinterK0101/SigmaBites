import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function NoMatches() {
    const router = useRouter();

    return (
        <ImageBackground
            source={require('../assets/images/nomatches-bg.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <Text style={styles.title}>Oops!</Text>

            <Image
                source={require('../assets/images/deadfishwhy.png')}
                style={styles.fishbone}
            />

            <Text style={styles.subtitle}>No more matches found</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/Discover')}
            >
                <Text style={styles.buttonText}>Go to Discover</Text>
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
        fontFamily: 'Baloo-Regular',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'Lexend-Regular',
        marginTop: 10,
        marginBottom: 30,
    },
    fishbone: {
        width: 240,
        height: 240,
        resizeMode: 'contain',
    },
    button: {
        backgroundColor: 'white',
        borderRadius: 30,
        paddingVertical: 14,
        paddingHorizontal: 50,
    },
    buttonText: {
        color: '#FF6B3E',
        fontFamily: 'Baloo-Regular',
        fontSize: 20,
    },
});
