import { create } from 'zustand';
import { supabase } from '@/SupabaseConfig';
import { fetchUserFriends, fetchFriendCount } from '@/services/friendService';
import { User } from '@/interfaces/interfaces';

// Type definition for friendship record
interface FriendshipRecord {
    id?: string;
    user_id_1: string;
    user_id_2: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

interface FriendsStore {
    friends: User[];
    isLoading: boolean;
    friendCount: number;
    fetchFriends: (userId: string) => Promise<void>;
    fetchFriendCount: (userId: string) => Promise<void>;
    addFriend: (friend: User) => void;
    removeFriend: (friendId: string) => void;
    subscribeToFriendChanges: (userId: string) => void;
    unsubscribe: () => void;
}

let friendSubscription: ReturnType<typeof supabase.channel> | null = null;

export const useFriendsStore = create<FriendsStore>((set, get) => ({
    friends: [],
    isLoading: false,
    friendCount: 0,

    fetchFriends: async (userId) => {
        set({ isLoading: true });
        try {
            const friends = await fetchUserFriends(userId);
            set({
                friends: friends || [],
                isLoading: false,
                friendCount: friends?.length || 0
            });
        } catch (error) {
            console.error("Failed to fetch friends:", error);
            set({ isLoading: false });
        }
    },

    fetchFriendCount: async (userId) => {
        try {
            const count = await fetchFriendCount(userId);
            set({ friendCount: count });
        } catch (error) {
            console.error("Failed to fetch friend count:", error);
        }
    },

    addFriend: (friend) => {
        set((state) => ({
            friends: [...state.friends, friend],
            friendCount: state.friendCount + 1
        }));
    },

    removeFriend: (friendId) => {
        set((state) => ({
            friends: state.friends.filter(friend => friend.id !== friendId),
            friendCount: Math.max(0, state.friendCount - 1)
        }));
    },

    subscribeToFriendChanges: (userId) => {
        if (!userId) return;
        if (friendSubscription) return; // prevent duplicate subscriptions

        // Create a unique channel name to avoid conflicts
        const channelName = `friendships_${userId}_${Date.now()}`;

        friendSubscription = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'friendships',
                    // Listen to all friendship changes, then filter in the callback
                },
                async (payload) => {
                    console.log('[Realtime] Friendship change detected:', payload);

                    // Check if this change affects the current user
                    const newRecord = payload.new as FriendshipRecord | null;
                    const oldRecord = payload.old as FriendshipRecord | null;

                    const isUserAffected =
                        (newRecord && (newRecord.user_id_1 === userId || newRecord.user_id_2 === userId)) ||
                        (oldRecord && (oldRecord.user_id_1 === userId || oldRecord.user_id_2 === userId));

                    if (isUserAffected) {
                        console.log('[Realtime] User affected, refreshing friends data');
                        const { fetchFriends } = get();

                        // Refresh both friends list and count
                        await fetchFriends(userId);
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[Realtime] Subscribed to friendship changes');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('[Realtime] Channel error');
                } else if (status === 'TIMED_OUT') {
                    console.error('[Realtime] Channel timed out');
                }
            });
    },

    unsubscribe: () => {
        if (friendSubscription) {
            supabase.removeChannel(friendSubscription);
            friendSubscription = null;
            console.log('[Realtime] Unsubscribed from friendship changes');
        }
    }
}));