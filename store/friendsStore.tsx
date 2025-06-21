import { create } from 'zustand';
import { fetchUserFriends, fetchFriendCount } from '@/services/friendService';
import { User } from '@/interfaces/interfaces';

interface FriendsStore {
    friends: User[];
    isLoading: boolean;
    friendCount: number;
    fetchFriends: (userId: string) => Promise<void>;
    fetchFriendCount: (userId: string) => Promise<void>;
    addFriend: (friend: User) => void;
    removeFriend: (friendId: string) => void;
    updateFriend: (friend: User) => void;
}

export const useFriendsStore = create<FriendsStore>((set) => ({
    friends: [],
    isLoading: false,
    friendCount: 0, // Initialize count

    fetchFriends: async (userId) => {
        set({ isLoading: true });
        try {
            const friends = await fetchUserFriends(userId);
            set({
                friends: friends || [],
                isLoading: false,
                // Update count when fetching friends
                friendCount: friends?.length || 0
            });
        } catch (error) {
            console.error("Failed to fetch friends:", error);
            set({ isLoading: false });
        }
    },

    // Add this new function
    fetchFriendCount: async (userId) => {
        try {
            const count = await fetchFriendCount(userId);
            set({ friendCount: count });
        } catch (error) {
            console.error("Failed to fetch friend count:", error);
        }
    },

    addFriend: (friend) =>
        set((state) => ({
            friends: [...state.friends, friend],
            friendCount: state.friendCount + 1 // Increment count
        })),

    removeFriend: (friendId) =>
        set((state) => ({
            friends: state.friends.filter(friend => friend.id !== friendId),
            friendCount: state.friendCount - 1 // Decrement count
        })),

    updateFriend: (updatedFriend) =>
        set((state) => ({
            friends: state.friends.map(friend =>
                friend.id === updatedFriend.id ? updatedFriend : friend
            )
        }))
}));