import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        time: '2h',
        image: require('../assets/images/personA.png'),
    },
    {
        id: '3',
        name: 'corpseking',
        message: 'Invited you to Group Swipe',
        time: '1d',
        image: require('../assets/images/personC.png'),
    },
    {
        id: '2',
        name: 'johnnie',
        message: 'Invited you to Ajisen Ramen',
        time: '1d',
        image: require('../assets/images/personB.png'),
    },
    {
        id: '4',
        name: 'corpseking',
        message: 'Accepted your friend request',
        time: '3d',
        image: require('../assets/images/personC.png'),
    },
    {
        id: '5',
        name: 'corpseking',
        message: 'Sent a friend request',
        time: '3d',
        image: require('../assets/images/personC.png'),
    },
];

export default function InboxScreen() {
    const router = useRouter();

    const renderItem = ({ item }: { item: Message }) => (
        <TouchableOpacity
            style={styles.messageCard}
            activeOpacity={0.7}
        >
            <Image source={item.image} style={styles.avatar} />
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <HighlightedText
                    text={item.message}
                    highlights={highlightWords}
                    style={styles.messageText}
                    highlightStyle={styles.highlightedText}
                />
            </View>
            <Text style={styles.time}>{item.time}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.innerContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Icon name="chevron-back" size={28} color="#fe724c" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bites Inbox</Text>
                </View>

                {/* Subheader */}
                <Text style={styles.subheader}>
                    {messages.length} Messages
                </Text>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Last 7 Days</Text>
                </View>

                {/* Inbox List */}
                <FlatList
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    innerContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fe724c',
        fontFamily: 'Baloo-Regular',
        marginLeft: 8,
    },
    backButton: {
        paddingRight: 4,
    },
    subheader: {
        fontSize: 16,
        color: '#333',
        opacity: 0.8,
        fontFamily: 'Lexend-Regular',
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Baloo-Regular',
    },

    list: {
        paddingBottom: 20,
        flexGrow: 1,
    },
    messageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 8,
        height: 80,
        borderWidth: 2,
        borderColor: '#d9d9d9',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 24,
        borderColor: '#fe724c',
        borderWidth: 2,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333', // primary color
        fontFamily: 'Lexend-Bold',
        marginBottom: 2,
    },
    messageText: {
        fontSize: 12,
        color: '#333',
        fontFamily: 'Lexend-Regular',
        opacity: 0.8,
    },
    highlightedText: {
        color: '#fe724c',
        fontFamily: 'Lexend-Bold',
    },
    time: {
        marginLeft: 16,
        fontSize: 12,
        color: '#999',
        fontFamily: 'Lexend-Regular',
    },
});