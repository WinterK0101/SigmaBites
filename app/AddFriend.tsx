import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import {icons} from "@/constants/icons";
import { searchUsersByUsername } from '@/services/userService';
import {User} from '@/interfaces/interfaces'
import RemoteImage from "@/components/RemoteImage";
import FriendRequestModal from "@/components/FriendRequestModal";

export default function AddFriendScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [recentSearches, setRecentSearches] = useState<User[]>([]);
    const router = useRouter();
    const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            if (searchQuery.trim() === '') {
                setSearchResults([]);
                return;
            }

            try {
                const results = await searchUsersByUsername(searchQuery);
                setSearchResults(results);
            } catch (error) {
                console.error('Error searching users:', error);
                setSearchResults([]);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleUserPress = (user: User) => {
        // Add to recent searches if not already there and if it's a search result
        if (searchQuery.trim() !== '' && !recentSearches.find(recent => recent.id === user.id)) {
            setRecentSearches(prev => [user, ...prev.slice(0, 9)]); // Keep only 10 recent searches
        }

        setSelectedUser(user);
        router.push({
            pathname: '/(modals)/OtherUserProfile',
            params: { username: user.username },
        });
    };

    const removeFromRecentSearches = (userId: string) => {
        setRecentSearches(prev => prev.filter(user => user.id !== userId));
    };

    return (
        <SafeAreaView className="bg-offwhite flex-1" edges={['top', 'left', 'right']}>
            <View className="px-5 flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center mt-8">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="pr-1">
                            <Icon name="chevron-back" size={28} color="#fe724c" />
                        </TouchableOpacity>
                        <Text className="font-baloo-regular text-accent text-4xl pt-4 ml-2.5">
                            Add Friends
                        </Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-grey rounded-2xl px-5 py-4 mt-4">
                    <icons.search height={20} width={20} stroke="#6c6c6c" />
                    <TextInput
                        placeholder="Enter a username"
                        className="ml-3 flex-1 font-lexend-regular"
                        style={{
                            color: '#6c6c6c',
                            textAlignVertical: 'center',
                            includeFontPadding: false,
                            paddingVertical: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                            lineHeight: 20
                        }}
                        clearButtonMode="while-editing"
                        onChangeText={(text) => setSearchQuery(text)}
                        value={searchQuery}
                    />
                </View>

                {/* Recent Searches Section */}
                <View className="mt-8">
                    {/* Section Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-primary font-lexend-bold text-base">
                            Recent
                        </Text>
                        {recentSearches.length > 0 && (
                            <TouchableOpacity onPress={() => setRecentSearches([])}>
                                <Text className="text-accent font-lexend-regular text-sm">
                                    Clear all
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Recent Searches List */}
                    <ScrollView className="flex-grow" showsVerticalScrollIndicator={false}>
                        {(searchQuery.trim() !== '' ? searchResults : recentSearches).length === 0 ? (
                            <View className="items-center justify-center py-12">
                                <Icon
                                    name={searchQuery.trim() === '' ? 'time-outline' : 'help-circle-outline'}
                                    size={48}
                                    color="#d9d9d9"
                                />
                                <Text className="font-lexend-regular text-gray-600 opacity-60 text-base mt-3 text-center">
                                    {searchQuery.trim() === ''
                                        ? 'No recent searches'
                                        : 'No users found'}
                                </Text>
                            </View>
                        ) : (
                            (searchQuery.trim() !== '' ? searchResults : recentSearches).map((user) => (
                                <TouchableOpacity
                                    key={user.id}
                                    className="flex-row items-center py-3"
                                    activeOpacity={0.7}
                                    onPress={() => handleUserPress(user)}
                                >
                                    <RemoteImage
                                        filePath={user.avatar_url}
                                        bucket="avatars"
                                        style={{ width: 50, height: 50, borderRadius: 25 }}
                                    />
                                    <View className="flex-1 ml-3">
                                        <Text className="font-lexend-medium text-primary text-base">
                                            {user.username}
                                        </Text>
                                    </View>
                                    {searchQuery.trim() === '' && (
                                        <TouchableOpacity
                                            className="p-2"
                                            onPress={() => removeFromRecentSearches(user.id)}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Icon name="close" size={18} color="#999" />
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>

                </View>
            </View>
            <FriendRequestModal
                visible={showFriendRequestModal}
                onClose={() => {
                    setShowFriendRequestModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />
        </SafeAreaView>
    );
}