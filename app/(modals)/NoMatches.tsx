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
import { images } from "@/constants/images";

export default function NoMatches() {
    const router = useRouter();

    return (
        <ImageBackground
            source={images.nomatchesbg}
            style={styles.background}
            resizeMode="cover"
        >
            <Text className="font-baloo-regular text-5xl pt-2">Oops!</Text>
            <Image
                source={images.deadfish}
                style={styles.fishbone}
            />

            <Text style={styles.subtitle}>No more eateries found</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.back()}
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
    subtitle: {
        fontSize: 20,
        color: 'primary',
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
        borderWidth: 2,
        borderColor: '#fe724c',
    },
    buttonText: {
        color: '#FF6B3E',
        fontFamily: 'Baloo-Regular',
        fontSize: 20,
    },
});