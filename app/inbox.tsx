import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import HighlightedText from "../components/__tests__/highlightedtexts.js";

// ✅ 1. Define Message type
type Message = {
    id: string;
    name: string;
    message: string;
    time: string;
    image: any;
};

// ✅ 2. Sample data
const messages: Message[] = [
    {
        id: '1',
        name: 'bubblegumprincess',
        message: 'Sent a friend request',
        time: '2h ago',
        image: require('../assets/images/personA.png'),
    },
    {
        id: '3',
        name: 'corpseking',
        message: 'Invited you to Group Swipe',
        time: '1d ago',
        image: require('../assets/images/personC.png'),
    },
    {
        id: '2',
        name: 'johnnie',
        message: 'Invited you to Ajisen Ramen',
        time: '1d ago',
        image: require('../assets/images/personB.png'),
    },
    {
        id: '3',
        name: 'corpseking',
        message: 'Accepted your friend request',
        time: '3d ago',
        image: require('../assets/images/personC.png'),
    },
    {
        id: '3',
        name: 'corpseking',
        message: 'Sent a friend request',
        time: '3d ago',
        image: require('../assets/images/personC.png'),
    },
];

export default function InboxScreen() {
    const router = useRouter();

    const renderItem = ({ item }: { item: Message }) => (
        <View style={styles.card}>
            <Image source={item.image} style={styles.avatar} />
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.message}>{item.message}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Icon name="chevron-back" size={28} color="#FF6B3E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bites Inbox</Text>
                <View style={{ width: 28 }} /> {/* Placeholder to balance layout */}
            </View>

            {/* Inbox List */}
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B3E',
    },
    list: {
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 14,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 16,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 2,
    },
    message: {
        color: '#555',
        fontSize: 14,
    },
    time: {
        fontSize: 12,
        color: '#999',
        marginLeft: 10,
    },
});
