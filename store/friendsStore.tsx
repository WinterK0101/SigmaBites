import { create } from 'zustand';
import { fetchUserFriends } from '@/services/friendService';
import { User } from '@/interfaces/interfaces';

interface FriendsStore {
    friends: User[];
    isLoading: boolean;
    fetchFriends: (userId: string) => Promise<void>;
    addFriend: (friend: User) => void;
    removeFriend: (friendId: string) => void;
    updateFriend: (friend: User) => void;
}

export const useFriendsStore = create<FriendsStore>((set) => ({
    friends: [],
    isLoading: false,
    fetchFriends: async (userId) => {
        set({ isLoading: true });
        try {
            const friends = await fetchUserFriends(userId);
            set({ friends: friends || [], isLoading: false });
        } catch (error) {
            console.error("Failed to fetch friends:", error);
            set({ isLoading: false });
        }
    },
    addFriend: (friend) =>
        set((state) => ({
            friends: [...state.friends, friend]
        })),
    removeFriend: (friendId) =>
        set((state) => ({
            friends: state.friends.filter(friend => friend.id !== friendId)
        })),
    updateFriend: (updatedFriend) =>
        set((state) => ({
            friends: state.friends.map(friend =>
                friend.id === updatedFriend.id ? updatedFriend : friend
            )
        }))
}));