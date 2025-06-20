import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/SupabaseConfig';
import { useSession } from '@/context/SessionContext';
import { fetchUserByUsername } from "@/services/userService";
import { FRIEND_STATUS } from '@/constants/friendStatus';

const dummyUser = {
    friendCount: 12,
    savedEateries: 28,
    recentEateries: [
        {
            displayName: 'Din Tai Fung',
            photo: 'https://images.deliveryhero.io/image/fd-sg/LH/v6s4-hero.jpg',
        },
        {
            displayName: 'Shake Shack',
            photo: 'https://images.deliveryhero.io/image/fd-sg/LH/b8vo-hero.jpg',
        },
        {
            displayName: 'Gong Cha',
            photo: 'https://images.deliveryhero.io/image/fd-sg/LH/x7m2-hero.jpg',
        },
    ],
    favouriteEateries: [
        {
            displayName: 'Paradise Dynasty',
            photo: 'https://images.deliveryhero.io/image/fd-sg/LH/m4n8-hero.jpg',
        },
        {
            displayName: 'Crystal Jade',
            photo: 'https://images.deliveryhero.io/image/fd-sg/LH/p2k9-hero.jpg',
        },
        {
            displayName: 'Tim Ho Wan',
            photo: 'https://images.deliveryhero.io/image/fd-sg/LH/q5r7-hero.jpg',
        },
    ],
};


export default function OtherUserProfile() {
    const router = useRouter();
    const session = useSession();
    const { username } = useLocalSearchParams();

    const [profile, setProfile] = useState({
        displayName: 'Loading...',
        username: 'Loading...',
        avatar_url: 'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg',
        id: null,
    });
    const [avatarPath, setAvatarPath] = useState(null);
    const [friendStatus, setFriendStatus] = useState(FRIEND_STATUS.NOT_FRIENDS);
    const [isLoading, setIsLoading] = useState(false);
    const [showUnfriendModal, setShowUnfriendModal] = useState(false);

    useEffect(() => {
        async function fetchProfileAndFriendStatus() {
            if (!session?.user || !username) return;

            try {
                const data = await fetchUserByUsername(username as string);

                if (data) {
                    const newProfile = {
                        displayName: data.name || 'No name',
                        username: data.username || 'No username',
                        avatar_url: data.avatar_url || 'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg',
                        id: data.id,
                    };

                    setProfile(newProfile);

                    if (data.avatar_url) {
                        try {
                            const { data: avatarData, error: avatarError } = await supabase.storage
                                .from('avatars')
                                .download(data.avatar_url);

                            if (avatarError) {
                                console.log('Error downloading avatar:', avatarError.message);
                                return;
                            }

                            if (avatarData) {
                                const fr = new FileReader();
                                fr.readAsDataURL(avatarData);
                                fr.onload = () => {
                                    setAvatarPath(fr.result);
                                };
                            }
                        } catch (avatarDownloadError) {
                            console.error('Error in avatar download:', avatarDownloadError);
                        }
                    }

                    await fetchFriendStatus(data.id);
                }
            } catch (error) {
                console.error('Error in fetchProfileAndFriendStatus:', error);
            }
        }

        fetchProfileAndFriendStatus();
    }, [session, username]);

    const fetchFriendStatus = async (targetUserId) => {
        if (!session?.user || !targetUserId) return;

        const [id1, id2] = [session.user.id, targetUserId].sort();

        try {
            const { data, error } = await supabase
                .from('friendships')
                .select('*')
                .eq('user_id_1', id1)
                .eq('user_id_2', id2);

            if (error) {
                console.log('Error fetching friend status:', error.message);
                return;
            }

            if (data && data.length > 0) {
                const friendship = data[0];

                if (friendship.status === 'accepted') {
                    setFriendStatus(FRIEND_STATUS.FRIENDS);
                } else if (friendship.status === 'pending') {
                    if (session.user.id < profile.id) {
                        setFriendStatus(FRIEND_STATUS.REQUEST_SENT);
                    } else {
                        setFriendStatus(FRIEND_STATUS.REQUEST_RECEIVED);
                    }
                }
            } else {
                setFriendStatus(FRIEND_STATUS.NOT_FRIENDS);
            }
        } catch (error) {
            console.error('Error in fetchFriendStatus:', error);
        }
    };

    const handleFriendAction = async () => {
        if (!session?.user || !profile.id || isLoading) return;

        setIsLoading(true);
        const [id1, id2] = [session.user.id, profile.id].sort();

        try {
            switch (friendStatus) {
                case FRIEND_STATUS.NOT_FRIENDS:
                    const { error: insertError } = await supabase
                        .from('friendships')
                        .insert({
                            user_id_1: id1,
                            user_id_2: id2,
                            status: 'pending',
                        });

                    if (!insertError) {
                        setFriendStatus(FRIEND_STATUS.REQUEST_SENT);
                    }
                    break;

                case FRIEND_STATUS.REQUEST_RECEIVED:
                    const { error: updateError } = await supabase
                        .from('friendships')
                        .update({ status: 'accepted' })
                        .eq('user_id_1', id1)
                        .eq('user_id_2', id2);

                    if (!updateError) {
                        setFriendStatus(FRIEND_STATUS.FRIENDS);
                    }
                    break;

                case FRIEND_STATUS.REQUEST_SENT:
                    const { error: deletePendingError } = await supabase
                        .from('friendships')
                        .delete()
                        .eq('user_id_1', id1)
                        .eq('user_id_2', id2);

                    if (!deletePendingError) {
                        setFriendStatus(FRIEND_STATUS.NOT_FRIENDS);
                    }
                    break;

                case FRIEND_STATUS.FRIENDS:
                    setShowUnfriendModal(true);
                    break;
            }
        } catch (error) {
            console.error('Error in handleFriendAction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnfriend = async () => {
        if (!session?.user || !profile.id) return;

        const [id1, id2] = [session.user.id, profile.id].sort();

        try {
            const { error } = await supabase
                .from('friendships')
                .delete()
                .eq('user_id_1', id1)
                .eq('user_id_2', id2);

            if (!error) {
                setFriendStatus(FRIEND_STATUS.NOT_FRIENDS);
            }
        } catch (error) {
            console.error('Error in handleUnfriend:', error);
        } finally {
            setShowUnfriendModal(false);
        }
    };

    const getFriendButtonText = () => {
        switch (friendStatus) {
            case FRIEND_STATUS.NOT_FRIENDS:
                return 'Add Friend';
            case FRIEND_STATUS.REQUEST_SENT:
                return 'Requested';
            case FRIEND_STATUS.REQUEST_RECEIVED:
                return 'Accept Request';
            case FRIEND_STATUS.FRIENDS:
                return 'Friends';
            default:
                return 'Add Friend';
        }
    };

    const getFriendButtonStyle = () => {
        switch (friendStatus) {
            case FRIEND_STATUS.REQUEST_SENT:
                return [styles.friendButton, styles.requestedButton];
            case FRIEND_STATUS.FRIENDS:
                return [styles.friendButton, styles.friendsButton];
            default:
                return styles.friendButton;
        }
    };

    const getFriendButtonTextStyle = () => {
        switch (friendStatus) {
            case FRIEND_STATUS.REQUEST_SENT:
                return [styles.friendButtonText, styles.requestedButtonText];
            case FRIEND_STATUS.FRIENDS:
                return [styles.friendButtonText, styles.friendsButtonText];
            default:
                return styles.friendButtonText;
        }
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>

            {/* Profile Header */}
            <LinearGradient colors={['#D03939', '#FE724C']} style={styles.header}>
                <View className="relative mt-12">
                    <View
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 5,
                            borderRadius: 60,
                        }}
                    >
                        {avatarPath ? (
                            <Image
                                source={{ uri: avatarPath }}
                                className="w-[120px] h-[120px] rounded-full border-4 border-white"
                                resizeMode="cover"
                            />
                        ) : (
                            <Image
                                source={{ uri: profile.avatar_url }}
                                className="w-[120px] h-[120px] rounded-full border-4 border-white"
                                resizeMode="cover"
                            />
                        )}
                    </View>
                </View>

                <Text style={styles.name}>{profile.displayName}</Text>
                <Text style={styles.username}>@{profile.username}</Text>

                <TouchableOpacity
                    style={getFriendButtonStyle()}
                    activeOpacity={0.8}
                    onPress={handleFriendAction}
                    disabled={isLoading}
                >
                    <Text style={getFriendButtonTextStyle()}>
                        {isLoading ? 'Loading...' : getFriendButtonText()}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                    <View className="flex-col items-center mr-10">
                        <Text className="font-lexend-bold text-xl text-white">{dummyUser.savedEateries}</Text>
                        <Text className="font-lexend-regular text-sm text-white">Eateries</Text>
                    </View>
                    <View className="flex-col items-center">
                        <Text className="font-lexend-bold text-xl text-white">{dummyUser.friendCount}</Text>
                        <Text className="font-lexend-regular text-sm text-white">Friends</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Recently Saved */}
            <View
                className="flex-col bg-white w-[350px] h-[145px] self-center rounded-2xl py-2 px-4"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    marginTop: -40,
                }}
            >
                <Text className="font-lexend-bold text-primary text-base mb-3">Recently Saved</Text>
                <View className="flex-row items-center justify-between">
                    {dummyUser.recentEateries.map((eatery) => (
                        <TouchableOpacity
                            key={eatery.displayName}
                            activeOpacity={0.8}
                            className="mr-3 items-center"
                        >
                            <Image
                                source={{ uri: eatery.photo }}
                                className="w-[70px] h-[70px] rounded-full"
                                resizeMode="cover"
                            />
                            <Text
                                className="text-xs w-[80px] font-lexend-regular text-primary text-center mt-2"
                                numberOfLines={1}
                            >
                                {eatery.displayName}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Favourites */}
            <View
                className="flex-col bg-white w-[350px] h-[175px] self-center rounded-2xl py-2 px-4 mt-4 mb-4"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                }}
            >
                <Text className="font-lexend-bold text-primary text-base">Favourites</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row items-center">
                        {dummyUser.favouriteEateries.map((eatery) => (
                            <TouchableOpacity
                                key={eatery.displayName}
                                activeOpacity={0.8}
                                className="mr-3 items-center"
                            >
                                <View style={{ position: 'relative' }}>
                                    <Image
                                        source={{ uri: eatery.photo }}
                                        className="w-[110px] h-[120px] rounded-2xl"
                                        resizeMode="cover"
                                    />

                                    <LinearGradient
                                        colors={[
                                            'rgba(0,0,0,0)',
                                            'rgba(0,0,0,0.3)',
                                            'rgba(102,51,25,0.8)'
                                        ]}
                                        locations={[0, 0.6, 1]}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: 110,
                                            height: 120,
                                            borderRadius: 16,
                                            justifyContent: 'flex-end',
                                            paddingBottom: 8,
                                        }}
                                    >
                                        <Text
                                            className="text-white text-xs font-lexend-medium ml-2"
                                            numberOfLines={2}
                                        >
                                            {eatery.displayName}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Unfriend Confirmation Modal */}
            <Modal visible={showUnfriendModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmationModal}>
                        <Text style={styles.modalTitle}>Remove Friend</Text>
                        <Text style={styles.modalText}>
                            Are you sure you want to remove {profile.displayName} from your friends?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowUnfriendModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleUnfriend}
                            >
                                <Text style={styles.confirmButtonText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'offwhite',
        overflow: 'hidden',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    header: {
        width: 1000,
        height: 440,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
        borderRadius: '100%',
        alignSelf: 'center',
        overflow: 'hidden',
        top: -60,
    },
    name: {
        fontSize: 32,
        color: '#fff',
        fontFamily: 'Baloo-regular',
        marginTop: 12,
    },
    username: {
        color: '#fff',
        marginTop: -12,
        fontSize: 14,
        fontFamily: 'Lexend-regular',
    },
    friendButton: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 28,
        paddingVertical: 6,
        marginVertical: 12,
    },
    requestedButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    friendsButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    friendButtonText: {
        color: '#FE724C',
        fontFamily: 'Baloo-regular',
        fontSize: 16,
    },
    requestedButtonText: {
        color: 'rgba(255,255,255,0.9)',
    },
    friendsButtonText: {
        color: 'rgba(255,255,255,0.9)',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmationModal: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxWidth: 320,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Lexend-Bold',
        marginBottom: 8,
        color: '#FE724C',
        textAlign: 'center',
    },
    modalText: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        marginBottom: 24,
        color: '#333',
        textAlign: 'center',
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    cancelButton: {
        backgroundColor: 'white',
        borderColor: '#FE724C',
    },
    confirmButton: {
        backgroundColor: '#FE724C',
        borderColor: '#FE724C',
    },
    cancelButtonText: {
        color: '#FE724C',
        fontFamily: 'Lexend-Medium',
        fontSize: 14,
    },
    confirmButtonText: {
        color: 'white',
        fontFamily: 'Lexend-Medium',
        fontSize: 14,
    },
});