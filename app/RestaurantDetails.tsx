import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RestaurantDetails() {
    const router = useRouter();
    const { name, image, details, rating } = useLocalSearchParams<{
        name: string;
        image: string | string[];
        details: string;
        rating: string;
    }>();


    return (
        <View style={styles.container}>
            <Image
                source={{ uri: Array.isArray(image) ? image[0] : image || 'https://via.placeholder.com/300' }}
                style={styles.image}
            />


            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.overlayBox}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.details}>{details}</Text>
                <Text style={styles.rating}>{rating}</Text>
            </View>

            <ScrollView style={styles.infoSection} contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={styles.sectionTitle}>Information</Text>
                <View style={styles.infoBox}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>1 Sengkang Square, #62 - 38</Text>

                    <Text style={styles.label}>Website:</Text>
                    <Text
                        style={[styles.value, { color: '#FF6B3E' }]}
                        onPress={() => Linking.openURL('http://www.ajisen.com.sg/')}
                    >
                        http://www.ajisen.com.sg/
                    </Text>

                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>6386 3970</Text>
                </View>

                <Text style={styles.sectionTitle}>Reviews</Text>
                <View style={styles.reviewBox}>
                    <Text style={styles.reviewUser}>@User</Text>
                    <Text style={styles.reviewText}>Lorem ipsum dolor sit amet, consectetur adipiscing…</Text>
                </View>

                <Text style={styles.sectionTitle}>Friends Who Also Saved</Text>
                <View style={styles.friendRow}>
                    <Image source={{ uri: 'https://i.pravatar.cc/100?u=friend1' }} style={styles.avatar} />
                    <Image source={{ uri: 'https://i.pravatar.cc/100?u=friend2' }} style={styles.avatar} />
                    <Image source={{ uri: 'https://i.pravatar.cc/100?u=friend3' }} style={styles.avatar} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF6B3E',
    },
    image: {
        width: '100%',
        height: 260,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: '#00000055',
        padding: 8,
        borderRadius: 20,
    },
    overlayBox: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        margin: 16,
        marginTop: -40,
        elevation: 3,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    details: {
        fontSize: 14,
        color: '#777',
        marginTop: 4,
    },
    rating: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 6,
    },
    infoSection: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B3E',
        marginTop: 20,
        marginBottom: 10,
    },
    infoBox: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 10,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 6,
    },
    value: {
        marginBottom: 4,
    },
    reviewBox: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    reviewUser: {
        fontWeight: '600',
    },
    reviewText: {
        marginTop: 4,
    },
    friendRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 10,
    },
});
