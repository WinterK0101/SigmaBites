import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function NoMatches() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Oops!</Text>

            <Image
                source={{
                    uri: 'https://cdn-icons-png.flaticon.com/512/7436/7436569.png',
                }}
                style={styles.fishbone}
            />

            <Text style={styles.subtitle}>No more matches found</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/Discover')}
            >
                <Text style={styles.buttonText}>Go to Discover</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D3D3D3',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        marginTop: 10,
        marginBottom: 30,
    },
    fishbone: {
        width: 160,
        height: 160,
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
        fontWeight: 'bold',
        fontSize: 16,
    },
});
