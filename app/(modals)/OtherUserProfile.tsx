import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { fetchUserByUsername } from "@/services/userService";
import { supabase } from '@/SupabaseConfig';
import {FRIEND_STATUS, FriendStatus} from '@/constants/friendStatus';
import ConfirmationModal from "@/components/ConfirmationModal";
import RemoteImage from "@/components/RemoteImage";
import {cancelFriendRequest, fetchFriendCount, getFriendshipStatus, removeFriend} from "@/services/friendService";
import SendFriendRequestModal from "@/app/(modals)/SendFriendRequestModal";
import AcceptFriendRequestModal from "@/app/(modals)/AcceptFriendRequestModal";

const getFriendButtonText = (status: FriendStatus) => {
    switch (status) {
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

const getFriendButtonStyle = (status: FriendStatus, styles) => {
    switch (status) {
        case FRIEND_STATUS.REQUEST_SENT:
            return [styles.friendButton, styles.requestedButton];
        case FRIEND_STATUS.FRIENDS:
            return [styles.friendButton, styles.friendsButton];
        default:
            return styles.friendButton;
    }
};

const getFriendButtonTextStyle = (status: FriendStatus, styles) => {
    switch (status) {
        case FRIEND_STATUS.REQUEST_SENT:
            return [styles.friendButtonText, styles.requestedButtonText];
        case FRIEND_STATUS.FRIENDS:
            return [styles.friendButtonText, styles.friendsButtonText];
        default:
            return styles.friendButtonText;
    }
};

export default function OtherUserProfile() {
    const router = useRouter();
    const { session } = useSession()
    const currentUser = session?.user;
    if (!currentUser) return;
    const { username } = useLocalSearchParams();

    // Refs for subscriptions
    const friendshipSubscription = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const userProfileSubscription = useRef<ReturnType<typeof supabase.channel> | null>(null);

    const [profile, setProfile] = useState<{
        displayName: string;
        username: string;
        avatar_url: string;
        id: string;
        favourite_eateries: string[];
        liked_eateries: string[];
    }>({
        displayName: 'Loading...',
        username: 'Loading...',
        avatar_url: 'default-profile.png',
        id: '',
        favourite_eateries: [],
        liked_eateries: [],
    });

    const [favouriteEateries, setFavouriteEateries] = useState<
        { placeId: string; displayName: string; photo: string }[]
    >([]);

    const [recentlySaved, setRecentlySaved] = useState<
        { placeId: string; displayName: string; photo: string }[]
    >([]);

    // Counts
    const [eateryCount, setEateryCount] = useState(0);
    const [friendCount, setFriendCount] = useState(0);

    const [friendStatus, setFriendStatus] = useState<FriendStatus>(FRIEND_STATUS.NOT_FRIENDS);
    const [isLoading, setIsLoading] = useState(false);

    // Modal states
    const [showUnfriendModal, setShowUnfriendModal] = useState(false);
    const [showFriendRequestModal, setShowFriendRequestModal] = useState(false);
    const [showCancelRequestModal, setShowCancelRequestModal] = useState(false);
    const [friendRequestAction, setFriendRequestAction] = useState('send'); // 'send' or 'accept'

    // Function to fetch eatery details
    const fetchEateryDetails = async (eateryIds: string[]) => {
        if (eateryIds.length === 0) return [];

        const { data, error } = await supabase
            .from('Eatery')
            .select('placeId, displayName, photo')
            .in('placeId', eateryIds);

        if (error || !Array.isArray(data)) {
            console.error('Error fetching eatery details:', error);
            return [];
        }

        return data;
    };

    // Function to refresh profile data
    const refreshProfileData = async () => {
        if (!currentUser || !username) return;

        try {
            const data = await fetchUserByUsername(username as string);

            if (data) {
                const userProfile = {
                    displayName: data.name,
                    username: data.username,
                    avatar_url: data.avatar_url,
                    id: data.id,
                    favourite_eateries: data.favourite_eateries || [],
                    liked_eateries: data.liked_eateries || [],
                };

                setProfile(userProfile);
                setEateryCount(Array.isArray(data.favourite_eateries) ? data.favourite_eateries.length : 0);

                // Fetch favourite eateries details
                const favIds = Array.isArray(data.favourite_eateries) ? data.favourite_eateries : [];
                if (favIds.length > 0) {
                    const favs = await fetchEateryDetails(favIds);
                    // Order to match the order in favIds
                    const orderedFavs = favIds
                        .map(id => favs.find(e => e.placeId === id))
                        .filter((e): e is { placeId: string; displayName: string; photo: string } => Boolean(e));
                    setFavouriteEateries(orderedFavs);
                } else {
                    setFavouriteEateries([]);
                }

                // Fetch details for last 3 liked eateries
                const liked = Array.isArray(data.liked_eateries) ? data.liked_eateries : [];
                const lastThree = liked.slice(-3).reverse(); // Get last 3, most recent first

                if (lastThree.length > 0) {
                    const eateries = await fetchEateryDetails(lastThree);
                    // Order the eateries to match the order of lastThree
                    const ordered = lastThree
                        .map(id => eateries.find(e => e.placeId === id))
                        .filter((e): e is { placeId: string; displayName: string; photo: string } => Boolean(e));
                    setRecentlySaved(ordered);
                } else {
                    setRecentlySaved([]);
                }

                // Fetch friend status and count
                const status = await getFriendshipStatus(currentUser.id, data.id);
                setFriendStatus(status);

                const count = await fetchFriendCount(data.id);
                setFriendCount(count);
            }
        } catch (error) {
            console.error('Error in refreshProfileData:', error);
        }
    };

    // Set up real-time subscriptions
    const setupRealtimeSubscriptions = () => {
        if (!profile.id || !currentUser) return;

        // Clean up existing subscriptions
        cleanupSubscriptions();

        // 1. Subscribe to friendship changes affecting this user relationship
        friendshipSubscription.current = supabase
            .channel(`friendship_user_${profile.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'friendships',
                },
                async (payload) => {
                    console.log('[Realtime] Friendship change detected:', payload);

                    const newRecord = payload.new as any;
                    const oldRecord = payload.old as any;

                    // Check if this change affects the current user-profile relationship
                    const isRelevant =
                        (newRecord && ((newRecord.user_id_1 === currentUser.id && newRecord.user_id_2 === profile.id) ||
                            (newRecord.user_id_1 === profile.id && newRecord.user_id_2 === currentUser.id))) ||
                        (oldRecord && ((oldRecord.user_id_1 === currentUser.id && oldRecord.user_id_2 === profile.id) ||
                            (oldRecord.user_id_1 === profile.id && oldRecord.user_id_2 === currentUser.id)));

                    if (isRelevant) {
                        console.log('[Realtime] Refreshing friendship status and count');
                        const [status, count] = await Promise.all([
                            getFriendshipStatus(currentUser.id, profile.id),
                            fetchFriendCount(profile.id)
                        ]);
                        setFriendStatus(status);
                        setFriendCount(count);
                    }
                }
            )
            .subscribe();

        // 2. Subscribe to profile user's data changes
        userProfileSubscription.current = supabase
            .channel(`user_profile_${profile.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${profile.id}`,
                },
                async (payload) => {
                    console.log('[Realtime] User profile change detected:', payload);

                    // Refresh profile data when the user's profile is updated
                    await refreshProfileData();
                }
            )
            .subscribe();
    };

    // Clean up subscriptions
    const cleanupSubscriptions = () => {
        if (friendshipSubscription.current) {
            supabase.removeChannel(friendshipSubscription.current);
            friendshipSubscription.current = null;
        }
        if (userProfileSubscription.current) {
            supabase.removeChannel(userProfileSubscription.current);
            userProfileSubscription.current = null;
        }
    };

    // Initial data fetch
    useEffect(() => {
        refreshProfileData();
    }, [currentUser, username]);

    // Set up subscriptions when profile ID is available
    useEffect(() => {
        if (profile.id && profile.id !== '') {
            setupRealtimeSubscriptions();
        }

        return cleanupSubscriptions;
    }, [profile.id, currentUser?.id]);

    // Focus effect to refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            refreshProfileData();
        }, [username])
    );

    const refreshFriendStatus = async () => {
        try {
            const status = await getFriendshipStatus(currentUser.id, profile.id);
            setFriendStatus(status);
        } catch (error) {
            console.error('Error refreshing friend status:', error);
        }
    };

    const handleFriendAction = () => {
        switch (friendStatus) {
            case FRIEND_STATUS.REQUEST_SENT:
                setShowCancelRequestModal(true);
                break;
            case FRIEND_STATUS.FRIENDS:
                setShowUnfriendModal(true);
                break;
            case FRIEND_STATUS.NOT_FRIENDS:
                setFriendRequestAction('send');
                setShowFriendRequestModal(true);
                break;
            case FRIEND_STATUS.REQUEST_RECEIVED:
                setFriendRequestAction('accept');
                setShowFriendRequestModal(true);
                break;
        }
    };

    const handleCancelRequest = async () => {
        try {
            await cancelFriendRequest(currentUser.id, profile.id);
            await refreshFriendStatus();
            setShowCancelRequestModal(false);
        } catch (error) {
            console.error('Error canceling request:', error);
        }
    };

    const handleUnfriend = async () => {
        try {
            await removeFriend(currentUser.id, profile.id);
            await refreshFriendStatus();
            setShowUnfriendModal(false);
        } catch (error) {
            console.error('Error unfriending:', error);
        }
    };

    // Empty state components
    const EmptyRecentlySavedState = () => (
        <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons
                    name="bookmark-outline"
                    size={28}
                    color="#FE724C"
                />
            </View>
            <Text style={styles.emptyStateTitle}>No Recent Saves</Text>
            <Text style={styles.emptyStateSubtitle}>
                {profile.displayName} hasn't saved any eateries recently
            </Text>
        </View>
    );

    const EmptyFavouritesState = () => (
        <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons
                    name="heart-outline"
                    size={28}
                    color="#FE724C"
                />
            </View>
            <Text style={styles.emptyStateTitle}>No Favourites Yet</Text>
            <Text style={styles.emptyStateSubtitle}>
                {profile.displayName} hasn't added any favourite eateries
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
                overScrollMode="never"
            >
                {/* Profile Header */}
                <LinearGradient colors={['#D03939', '#FE724C']} style={styles.header}>
                    <View className="relative mt-8">
                        <View style={styles.avatarShadow}>
                            <RemoteImage
                                filePath={profile.avatar_url}
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 60,
                                    borderWidth: 4,
                                    borderColor: 'white',
                                }}
                            />
                        </View>
                    </View>

                    <Text style={styles.name}>{profile.displayName}</Text>
                    <Text style={styles.username}>@{profile.username}</Text>

                    <TouchableOpacity
                        style={getFriendButtonStyle(friendStatus, styles)}
                        activeOpacity={0.8}
                        onPress={handleFriendAction}
                        disabled={isLoading}
                    >
                        <Text style={getFriendButtonTextStyle(friendStatus, styles)}>
                            {isLoading ? 'Loading...' : getFriendButtonText(friendStatus)}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center items-center">
                        <View className="flex-col items-center mr-10">
                            <Text className="font-lexend-bold text-xl text-white">{eateryCount}</Text>
                            <Text className="font-lexend-regular text-sm text-white">Eateries</Text>
                        </View>
                        <View className="flex-col items-center">
                            <Text className="font-lexend-bold text-xl text-white">{friendCount}</Text>
                            <Text className="font-lexend-regular text-sm text-white">Friends</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Recently Saved */}
                <View
                    className="flex-col bg-white w-[350px] self-center rounded-2xl py-4 px-4"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        marginTop: -60,
                        minHeight: 110,
                    }}
                >
                    <Text className="font-lexend-bold text-primary text-base mb-3">Recently Saved</Text>

                    {recentlySaved.length === 0 ? (
                        <EmptyRecentlySavedState />
                    ) : (
                        <View className="flex-row items-center">
                            {recentlySaved.map((eatery) => (
                                <TouchableOpacity
                                    key={eatery.placeId}
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
                    )}
                </View>

                {/* Favourites */}
                <View
                    className="flex-col bg-white w-[350px] self-center rounded-2xl py-4 px-4 mt-4"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        minHeight: 135,
                    }}
                >
                    <Text className="font-lexend-bold text-primary text-base mb-3">Favourites</Text>

                    {favouriteEateries.length === 0 ? (
                        <EmptyFavouritesState />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row items-center">
                                {favouriteEateries.map((eatery) => (
                                    <TouchableOpacity
                                        key={eatery.placeId}
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
                    )}
                </View>
            </ScrollView>

            {/* Friend Request Modal (for send/accept) */}
            {friendRequestAction === 'send' ? (
                <SendFriendRequestModal
                    visible={showFriendRequestModal}
                    user={profile}
                    onClose={() => setShowFriendRequestModal(false)}
                    onSuccess={refreshFriendStatus}
                />
            ) : (
                <AcceptFriendRequestModal
                    visible={showFriendRequestModal}
                    user={profile}
                    onClose={() => setShowFriendRequestModal(false)}
                    onSuccess={refreshFriendStatus}
                />
            )}

            {/* Unfriend Confirmation Modal */}
            <ConfirmationModal
                visible={showUnfriendModal}
                title="Remove Friend"
                message={`Are you sure you want to remove @${profile.username} from your friends?`}
                confirmText="Remove"
                cancelText="Cancel"
                onConfirm={handleUnfriend}
                onCancel={() => setShowUnfriendModal(false)}
            />

            {/* Cancel Friend Request Confirmation Modal */}
            <ConfirmationModal
                visible={showCancelRequestModal}
                title="Cancel Request"
                message={`Are you sure you want to cancel your friend request to @${profile.username}?`}
                confirmText="Confirm"
                cancelText="Keep"
                onConfirm={handleCancelRequest}
                onCancel={() => setShowCancelRequestModal(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    backButton: {
        position: 'absolute',
        top: 50,
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
        top: -80,
    },
    avatarShadow: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderRadius: 60,
    },
    name: {
        fontSize: 32,
        color: '#fff',
        fontFamily: 'Baloo-regular',
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
    // Empty state styles
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    emptyIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF5F2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyStateTitle: {
        fontSize: 14,
        fontFamily: 'Lexend-medium',
        color: '#333',
        marginBottom: 2,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 11,
        fontFamily: 'Lexend-regular',
        color: '#666',
        textAlign: 'center',
        marginBottom: 6,
        lineHeight: 14,
        maxWidth: 250,
    },
});