import { create } from 'zustand';
import { supabase } from "@/SupabaseConfig";

export const useInboxStore = create((set, get) => ({
    hasNewMessage: false,
    subscription: null,

    setNewMessageFlag: () => set({ hasNewMessage: true }),

    clearNewMessageFlag: () => set({ hasNewMessage: false }),

    // Subscribe to new messages for a specific user
    subscribeToNewMessages: (userId) => {
        // Clean up any existing subscription first
        const currentSubscription = get().subscription;
        if (currentSubscription) {
            currentSubscription.unsubscribe();
        }

        // Create new subscription
        const subscription = supabase
            .channel('inbox_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'inbox',
                    filter: `receiver=eq.${userId}`
                },
                (payload) => {
                    console.log('New message received:', payload);
                    set({ hasNewMessage: true });
                }
            )
            .subscribe();

        set({ subscription });
    },

    // Unsubscribe from inbox changes
    unsubscribeFromMessages: () => {
        const subscription = get().subscription;
        if (subscription) {
            subscription.unsubscribe();
            set({ subscription: null });
        }
    }
}));