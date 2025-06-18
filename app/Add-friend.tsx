import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';


type RecentUser = {
    id: string;
    name: string;
    image: any;
};

export default function AddFriendScreen() {
    const [search, setSearch] = useState('');
    const [recentSearches, setRecentSearches] = useState([
        { id: '1', name: 'bubblegumprincess', image: require('../assets/images/personA.png') },
        { id: '2', name: 'johnnie', image: require('../assets/images/personB.png') },
        { id: '3', name: 'corpseking', image: require('../assets/images/personC.png') },
    ]);
    const router = useRouter();

    const renderItem = ({ item }: { item: RecentUser }) => (
        <TouchableOpacity
            onLongPress={() => {
                Alert.alert(
                    "Remove Recent Search",
                    `Remove ${item.name} from recent searches?`,
                    [
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                        {
                            text: "Remove",
                            style: "destructive",
                            onPress: () => {
                                setRecentSearches(prev => prev.filter(user => user.id !== item.id));
                            },
                        },
                    ],
                    { cancelable: true }
                );
            }}

            style={styles.userCard}
        >
            <Image source={item.image} style={styles.avatar} />
            <Text style={styles.username}>{item.name}</Text>
        </TouchableOpacity>
    );



    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="chevron-back" size={28} color="#FF6B3E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Friends</Text>
            </View>

            {/* Search Bar */}
            <TextInput
                style={styles.searchInput}
                placeholder="Search username"
                placeholderTextColor="#aaa"
                value={search}
                onChangeText={setSearch}
            />

            {/* Recent */}
            <Text style={styles.sectionTitle}>Recent</Text>
            <FlatList
                data={recentSearches}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        paddingRight: 4,
    },
    headerTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FF6B3E',
        fontFamily: 'Baloo-Regular',
        marginLeft: 10,
    },
    searchInput: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        fontFamily: 'Baloo-Regular',
    },
    list: {
        paddingBottom: 100,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 14,
    },
    username: {
        fontSize: 16,
        fontFamily: 'Lexend-Regular',
    },
});
