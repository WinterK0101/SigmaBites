import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import HighlightedText from "../components/highlightedtexts.js";

const highlightWords = ["friend", "Group Swipe"];


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
                <HighlightedText
                    text={item.message}
                    highlights={highlightWords}
                    style={styles.saved}
                    highlightStyle={styles.restaurant}
                />

            </View>
            <Text style={styles.time}>{item.time}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="chevron-back" size={28} color="#FF6B3E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bites Inbox</Text>
            </View>


            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Last 7 Days</Text>
                <TouchableOpacity onPress={() => {/* Add See More action */ }}>
                    <Text style={styles.seeMore}>See more</Text>
                </TouchableOpacity>
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
        paddingTop: 0,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 44,
        fontWeight: 'bold',
        color: 'black',
        fontFamily: 'Baloo-Regular',
        marginLeft: 8,
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
        color: '#888',
        fontSize: 14,
        marginTop: 2,
        fontFamily: 'Lexend-Regular',
    },
    time: {
        fontSize: 12,
        color: '#999',
        marginLeft: 10,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 0,
        paddingBottom: 5,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        fontFamily: 'Baloo-Regular',
    },

    seeMore: {
        fontSize: 14,
        color: "#FF6B3E",
        fontFamily: 'Lexend-Regular',
    },
    backButton: {
        paddingRight: 4, // optional: tap area around icon
    },
    saved: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
        fontFamily: 'Lexend-Regular',
    },
    restaurant: {
        color: '#FF6B3E',
    },


});
