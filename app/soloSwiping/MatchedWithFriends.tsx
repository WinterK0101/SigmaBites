import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ImageBackground,
    Modal,
    Pressable,
    Alert,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import {images} from '@/constants/images';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSession } from '@/context/SessionContext';
import RemoteImage from '@/components/RemoteImage';
import {Eatery, User} from '@/interfaces/interfaces'
import {fetchUserByID} from "@/services/userService";

export default function MatchedWithFriends() {
    const {session} = useSession();
    const user = session?.user;
    const { eatery: eateryParam, friends: friendsParam} = useLocalSearchParams();
    const router = useRouter();
    const [eatery, setEatery] = useState<Eatery | null>(null);
    const [friends, setFriends] = useState<User[]>();
    const [currentUser, setCurrentUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [friendsListVisible, setFriendsListVisible] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (eateryParam && friendsParam) {
                try {
                    // Parse the JSON strings
                    const parsedFriends = JSON.parse(friendsParam);
                    const parsedEatery = JSON.parse(eateryParam);
                    const userData = await fetchUserByID(user.id);
                    setCurrentUser(userData);
                    setFriends(parsedFriends);
                    setEatery(parsedEatery);
                } catch (error) {
                    console.error("Error parsing params or fetching user:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }

        fetchData();
    }, [eateryParam, friendsParam, user?.id]);

    // Function to show multiple friends
    const renderFriendAvatars = () => {
        if (!friends || friends.length === 0) return null;

        const count = friends.length;
        const friendImageList = friends.map(friend => friend.avatar_url);

        if (count === 1) {
            return (
                <View style={styles.friendBubble}>
                    <RemoteImage
                        filePath={friendImageList[0]}
                        bucket="avatars"
                        style={styles.fullSize}
                    />
                </View>
            );
        }

        if (count === 2) {
            return (
                <View style={[styles.friendBubble, { flexDirection: 'row' }]}>
                    {friendImageList.slice(0, 2).map((uri, index) => (
                        <View
                            key={index}
                            style={[
                                styles.half,
                                index === 0 ? styles.leftHalf : styles.rightHalf,
                            ]}
                        >
                            <RemoteImage
                                filePath={uri}
                                bucket="avatars"
                                style={styles.fullSize}
                            />
                        </View>
                    ))}
                </View>
            );
        }

        // For 3+ friends
        return (
            <View style={[styles.friendBubble, { flexDirection: 'row' }]}>
                {friendImageList.slice(0, 3).map((uri, index) => (
                    <View
                        key={index}
                        style={[
                            styles.third,
                            index === 0 ? styles.leftThird :
                                index === 1 ? styles.middleThird : styles.rightThird,
                        ]}
                    >
                        <RemoteImage
                            filePath={uri}
                            bucket="avatars"
                            style={styles.fullSize}
                        />
                    </View>
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <ImageBackground
                source={images.primarybg}
                className="flex-1 justify-center items-center p-5"
                resizeMode="cover"
            >
                <Text className="text-white text-xl">Loading...</Text>
            </ImageBackground>
        );
    }

    if (!eatery) {
        return (
            <ImageBackground
                source={images.primarybg}
                className="flex-1 justify-center items-center p-5"
                resizeMode="cover"
            >
                <Text className="text-white text-xl">Restaurant not found</Text>
                <TouchableOpacity
                    className="mt-4 bg-white px-6 py-3 rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-black">Go Back</Text>
                </TouchableOpacity>
            </ImageBackground>
        );
    }

    // Generate restaurant link for sharing
    const restaurantLink = `Link to Restaurant Details Page`

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(restaurantLink);
        Alert.alert('Copied!', 'The restaurant link has been copied to your clipboard.');
    };

    return (
        <ImageBackground
            source={images.primarybg}
            className="flex-1 items-center justify-center p-5"
            resizeMode="cover"
        >
            <Text
                className="font-baloo-regular text-5xl text-white text-center"
                style={{
                    textShadowColor: 'rgba(129, 52, 42, 1)',
                    textShadowOffset: { width: 3, height: 4 },
                    textShadowRadius: 0,
                    lineHeight: 52,
                }}
            >
                It's a match!
            </Text>

            {/* Friend count indicator at top */}
            {friends && friends.length > 0 && (
                <Text
                    className="font-lexend-regular text-lg text-white text-center opacity-90 px-4 py-2 mt-[-10] mb-4"
                    style={{
                        textShadowColor: 'rgba(0, 0, 0, 0.5)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3,
                    }}
                >
                    {friends.length} friend{friends.length !== 1 ? 's' : ''} love{friends.length === 1 ? 's' : ''} this place!
                </Text>
            )}

            <View className="items-center mb-12 relative">
                <View className="flex-row mb-[-40px] items-center">
                    {/* User's avatar */}
                    <RemoteImage
                        filePath={currentUser?.avatar_url}
                        bucket="avatars"
                        style={{
                            width: 150,
                            height: 150,
                            borderRadius: 100,
                            borderWidth: 4,
                            borderColor: 'white',
                            marginHorizontal: -20,
                            zIndex: 10,
                        }}
                    />

                    {/* Dynamic friends avatars */}
                    <View className="relative -mx-5 z-10">
                        {renderFriendAvatars()}

                        <TouchableOpacity
                            className="absolute -bottom-0 -right-0 w-10 h-10 rounded-full bg-white items-center justify-center shadow-lg"
                            onPress={() => setFriendsListVisible(true)}
                        >
                            <Text className="text-accent text-lg font-lexend-bold align-middle">
                                ⋯
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="w-20 h-20 rounded-full bg-[#FE724C] items-center justify-center absolute top-[85px] left-1/2 ml-[-100px] z-20 shadow-lg">
                    <MaterialCommunityIcons name="heart" size={32} color="white" />
                </View>

                <Image
                    source={{ uri: eatery?.photo }}
                    className="w-[150px] h-[150px] rounded-full border-4 border-white bg-gray-300"
                    resizeMode="cover"
                />
            </View>

            {/* Bottom Button */}
            <View className="absolute bottom-20 left-0 right-0 items-center px-5">
                <TouchableOpacity
                    className="bg-white px-16 py-4 rounded-full shadow-lg flex-row items-center"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 5,
                    }}
                    onPress={() => setModalVisible(true)}
                >
                    <Text
                        className="text-accent text-xl font-baloo-regular"
                        style={{lineHeight: 28}}
                    >
                        Send an invite
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-row items-center mt-4"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 5,
                    }}
                    onPress={() => router.back()}
                >
                    <Text
                        className="text-white text-xl font-baloo-regular"
                    >
                        Keep Swiping
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Invite Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-5">
                    <View className="bg-white rounded-3xl p-6 w-[90%] max-w-[400px] items-center">
                        <Text className="text-2xl mb-4 text-center text-primary" style={{ fontFamily: 'Lexend-Bold' }}>
                            Send this link to your friend(s)!
                        </Text>
                        <Text className="text-base text-gray-700 mb-5 text-center" style={{ fontFamily: 'Lexend-Regular' }}>
                            {restaurantLink}
                        </Text>

                        <TouchableOpacity
                            className="bg-accent py-3 px-10 rounded-full mb-4"
                            onPress={copyToClipboard}
                        >
                            <Text className="text-white text-lg" style={{ fontFamily: 'Lexend-Bold' }}>
                                Copy Link
                            </Text>
                        </TouchableOpacity>

                        <Pressable
                            className="py-2.5 px-5"
                            onPress={() => setModalVisible(false)}
                        >
                            <Text className="text-base text-[#FE724C]" style={{ fontFamily: 'Lexend-Bold' }}>
                                Close
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Friends List Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={friendsListVisible}
                onRequestClose={() => setFriendsListVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-5">
                    <View className="bg-white rounded-2xl p-6 w-[90%] max-w-[400px] max-h-[70%]">
                        <Text className="text-2xl mb-4 text-center text-primary font-lexend-bold">
                            Friends Who Swiped Right
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                            {friends && friends.map((friend, index) => (
                                <View key={index} className="flex-row items-center py-3 px-2">
                                    <RemoteImage
                                        filePath={friend.avatar_url}
                                        bucket="avatars"
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 100,
                                            borderWidth: 2,
                                            borderColor: '#fe724c',
                                            marginRight: 16,
                                        }}
                                    />
                                    <View className="flex-1">
                                        <Text className="text-primary text-lg font-lexend-bold">
                                            {friend.name}
                                        </Text>
                                        <Text className="text-gray-600 text-sm font-lexend-regular">
                                            @{friend.username}
                                        </Text>
                                    </View>
                                    <View className="w-6 h-6 rounded-full bg-[#FE724C] items-center justify-center">
                                        <MaterialCommunityIcons name="heart" size={12} color="white" />
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <Pressable
                            className="py-3 px-5 bg-[#FE724C] rounded-full items-center"
                            onPress={() => setFriendsListVisible(false)}
                        >
                            <Text className="text-white text-lg" style={{ fontFamily: 'Lexend-Bold' }}>
                                Close
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ImageBackground>
    );
}

// Styles for the friends
const styles = StyleSheet.create({
    friendBubble: {
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: 'white',
        backgroundColor: '#f0f0f0',
    },
    fullSize: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
    },
    half: {
        width: '50%',
        height: '100%',
        overflow: 'hidden',
    },
    third: {
        width: '33.33%',
        height: '100%',
        overflow: 'hidden',
    },
});