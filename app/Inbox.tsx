import React, {useEffect, useState, useRef} from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import HighlightedText from "../components/highlightedtexts.js";
import {useSession} from "@/context/SessionContext";
import {supabase} from "@/SupabaseConfig";
import {fetchUserByID} from "@/services/userService";
import RemoteImage from "@/components/RemoteImage";
import AcceptFriendRequestModal from "@/app/(modals)/AcceptFriendRequestModal";
import { useFriendsStore } from "@/store/friendsStore";

const highlightWords = ["friend", "group swipe"];

type Message = {
    inboxID: string;
    requestID: string;
    senderName: string;
    senderProfilePicture: string;
    time: string;
    messageText: string;
    type: string;
    senderID: string;
    senderUsername: string;
};

function getTimeAgo(isoString: string): string {
    const past = new Date(isoString);
    const now = new Date();

    const diffInMs = now.getTime() - past.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
    return `${Math.floor(diffInMinutes / 1440)} d`;
}

const retrieveRequests = async (currentUserId: string): Promise<Message[]> => {
    console.log('[Debug] Fetching requests for user:', currentUserId);

    const { data: requests, error } = await supabase
        .from('inbox')
        .select('id, friendshipID, inviteID, type, sender, created_at')
        .eq('receiver', currentUserId);

    console.log('[Debug] Raw requests data:', requests);
    console.log('[Debug] Requests error:', error);

    if (error) {
        console.error('[Debug] Error fetching requests:', error);
        throw new Error(`Failed to fetch requests: ${error.message}`);
    }

    if (!requests || requests.length === 0) {
        console.log('[Debug] No requests found');
        return [];
    }

    const messages = await Promise.all(
        requests.map(async (request) => {
            console.log('[Debug] Processing request:', request);
            const senderData = await fetchUserByID(request.sender);
            if (!senderData) {
                console.log('[Debug] No sender data found for:', request.sender);
                return null;
            }

            let messageText = '';
            let messageID = '';
            if (request.type === 'friendship') {
                messageText = 'Sent a friend request';
                messageID = request.friendshipID;
            } else if (request.type === 'invite') {
                messageText = 'Invited you to group swipe';
                messageID = request.inviteID;
            }

            return {
                inboxID: request.id,
                requestID: messageID,
                senderName: senderData.name,
                senderProfilePicture: senderData.avatar_url,
                senderID: request.sender,
                senderUsername: senderData.username,
                time: getTimeAgo(request.created_at),
                messageText,
                type: request.type,
            };
        })
    );

    const filteredMessages = messages.filter(Boolean) as Message[];
    console.log('[Debug] Final processed messages:', filteredMessages);
    return filteredMessages;
};

export default function InboxScreen() {
    const router = useRouter();
    const currentUser = useSession()?.user;
    const [messages, setMessages] = useState<Message[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { fetchFriends } = useFriendsStore();

    // Ref to store the subscription to prevent memory leaks
    const inboxSubscription = useRef<ReturnType<typeof supabase.channel> | null>(null);

    // Function to refresh messages
    const refreshMessages = async () => {
        if (currentUser) {
            console.log('[Debug] Refreshing messages for user:', currentUser.id);
            try {
                const updatedMessages = await retrieveRequests(currentUser.id);
                console.log('[Debug] Setting messages:', updatedMessages);
                setMessages(updatedMessages);
            } catch (error) {
                console.error('[Debug] Failed to refresh messages:', error);
            }
        }
    };

    // Set up realtime subscription
    const subscribeToInboxChanges = (userId: string) => {
        if (!userId || inboxSubscription.current) return;

        console.log('[Realtime] Setting up inbox subscription for user:', userId);

        inboxSubscription.current = supabase
            .channel('inbox-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'inbox'
                },
                async (payload) => {
                    console.log('[Realtime] Raw inbox change detected:', payload);

                    // Check if this change affects the current user
                    const newRecord = payload.new as any;
                    const oldRecord = payload.old as any;

                    const isUserAffected =
                        (newRecord && newRecord.receiver === userId) ||
                        (oldRecord && oldRecord.receiver === userId);

                    if (isUserAffected) {
                        console.log('[Realtime] User affected, refreshing inbox');
                        await refreshMessages();
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] Inbox subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('[Realtime] Successfully subscribed to inbox changes');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('[Realtime] Inbox channel error');
                } else if (status === 'TIMED_OUT') {
                    //console.error('[Realtime] Inbox channel timed out');
                    // Retry subscription after timeout
                    setTimeout(() => {
                        console.log('[Realtime] Retrying inbox subscription...');
                        unsubscribeFromInbox();
                        subscribeToInboxChanges(userId);
                    }, 5000);
                }
            });
    };

    // Clean up subscription
    const unsubscribeFromInbox = () => {
        if (inboxSubscription.current) {
            supabase.removeChannel(inboxSubscription.current);
            inboxSubscription.current = null;
            console.log('[Realtime] Unsubscribed from inbox changes');
        }
    };

    useEffect(() => {
        if (currentUser) {
            // Initial fetch
            refreshMessages();

            // Set up realtime subscription
            subscribeToInboxChanges(currentUser.id);
        }

        // Cleanup subscription when component unmounts or user changes
        return () => {
            unsubscribeFromInbox();
        };
    }, [currentUser]);

    const handleRequestPress = (item: Message) => {
        if (item.type === 'friendship') {
            const userForModal = {
                id: item.senderID,
                username: item.senderUsername,
                name: item.senderName,
                avatar_url: item.senderProfilePicture,
            };

            setSelectedUser(userForModal);
            setModalVisible(true);
        } else if (item.type === 'invite') {
            console.log('Group invite pressed:', item);
        }
    };

    const handleModalSuccess = async () => {
        if (currentUser) {
            // Refresh both the inbox and friends list
            await refreshMessages();
            await fetchFriends(currentUser.id);
        }
    };

    const renderItem = ({ item }: { item: Message }) => (
        <TouchableOpacity style={styles.messageCard} activeOpacity={0.7} onPress={() => handleRequestPress(item)}>
            <RemoteImage
                filePath={item.senderProfilePicture || 'default-profile.png'}
                bucket="avatars"
                style={styles.avatar}
            />
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.senderName}</Text>
                <HighlightedText
                    text={item.messageText}
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Icon name="chevron-back" size={28} color="#fe724c" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bites Inbox</Text>
                </View>

                <Text style={styles.subheader}>
                    {messages.length} Message{messages.length !== 1 ? 's' : ''}
                </Text>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Last 7 Days</Text>
                </View>

                <FlatList
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.inboxID}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <AcceptFriendRequestModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                user={selectedUser}
                onSuccess={handleModalSuccess}
            />
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
        color: '#333',
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