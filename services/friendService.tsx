import { supabase } from '@/SupabaseConfig';
import {FRIEND_STATUS, FriendStatus} from "@/constants/friendStatus";

export async function fetchUserFriends(userId: string) {
    if (!userId) {
        console.error("No user found");
        return [];
    }

    // Get all friend relationships where user is involved
    const { data: friendsData, error: friendsError } = await supabase
        .from('friendships')
        .select('user_id_1, user_id_2')
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .eq('status', 'accepted');

    if (friendsError) {
        console.error('Error fetching friendships:', friendsError);
        return [];
    }
    if (!friendsData) return [];

    // Extract friends' user IDs
    const friendIds = friendsData.map(({ user_id_1, user_id_2 }) =>
        user_id_1 === userId ? user_id_2 : user_id_1
    );

    // Fetch user info from the friends' IDs
    const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, name, avatar_url')
        .in('id', friendIds);

    if (usersError) {
        console.error('Error fetching user info:', usersError);
        return [];
    }

    return usersData || [];
}

export const checkExistingFriendship = async (currentUserId: string, otherUserId: string) => {
    if (!currentUserId || !otherUserId) {
        throw new Error("Both user IDs are required");
    }

    const { data, error } = await supabase
        .from('friendships')
        .select('id, status, user_id_1, user_id_2')
        .or(`and(user_id_1.eq.${otherUserId},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${otherUserId})`)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
        throw error;
    }

    return data;
};

export const getFriendshipStatus = async (currentUserId: string, otherUserId: string): Promise<FriendStatus> => {
    if (!currentUserId || !otherUserId) {
        throw new Error("Both user IDs are required");
    }

    const friendship = await checkExistingFriendship(currentUserId, otherUserId);

    if (!friendship) return FRIEND_STATUS.NOT_FRIENDS;
    if (friendship.status === 'accepted') return FRIEND_STATUS.FRIENDS;

    return friendship.user_id_1 === currentUserId
        ? FRIEND_STATUS.REQUEST_SENT
        : FRIEND_STATUS.REQUEST_RECEIVED;
};

export const sendFriendRequest = async (senderId: string, recipientId: string) => {
    if (!senderId || !recipientId) {
        throw new Error("Both sender and recipient IDs are required");
    }

    try {
        // Check if friendship already exists
        const existingFriendship = await checkExistingFriendship(senderId, recipientId);
        if (existingFriendship) {
            throw new Error("Friendship already exists");
        }

        // Adds request to the database
        const { data: friendship, error: friendshipError } = await supabase
            .from('friendships')
            .insert({
                user_id_1: senderId,
                user_id_2: recipientId,
                status: 'pending',
                created_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (friendshipError) throw friendshipError;
        if (!friendship) throw new Error('Failed to create friendship');

        // Updates the inbox to have the request as well
        const { error: inboxError } = await supabase
            .from('inbox')
            .insert({
                sender: senderId,
                receiver: recipientId,
                friendshipID: friendship.id,
                type: 'friendship',
                created_at: new Date().toISOString(),
            });

        if (inboxError) throw inboxError;

        return true;
    } catch (error) {
        console.error('Failed to send friend request:', error);
        throw error;
    }
};

export const cancelFriendRequest = async (senderId: string, recipientId: string) => {
    if (!senderId || !recipientId) {
        throw new Error("Both sender and recipient IDs are required");
    }

    try {
        // Find friendship between the two users
        const { data: friendship, error: fetchError } = await supabase
            .from('friendships')
            .select('id')
            .eq('user_id_1', senderId)
            .eq('user_id_2', recipientId)
            .eq('status', 'pending')
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!friendship) throw new Error('Friendship request not found');

        // First, delete ALL inbox entries referencing that friendship ID
        // (there might be multiple or the delete condition might not be specific enough)
        const { error: inboxError } = await supabase
            .from('inbox')
            .delete()
            .eq('friendshipID', friendship.id);

        if (inboxError) {
            console.error('Error deleting inbox entries:', inboxError);
            throw inboxError;
        }

        // Then delete the friendship
        const { error: friendshipError } = await supabase
            .from('friendships')
            .delete()
            .eq('id', friendship.id);

        if (friendshipError) throw friendshipError;

        return true;
    } catch (error) {
        console.error('Error canceling request:', error);
        throw error;
    }
};


export const acceptFriendRequest = async (senderId: string, currentUserId: string) => {
    if (!senderId || !currentUserId) {
        throw new Error("Both sender and current user IDs are required");
    }

    try {
        // Update the friendship status to accepted
        const { data, error: friendshipError } = await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .or(
                `and(user_id_1.eq.${senderId},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${senderId})`
            );

        if (friendshipError) throw friendshipError;

        // Remove the inbox entry since the request has been handled
        const { error: inboxError } = await supabase
            .from('inbox')
            .delete()
            .eq('sender', senderId)
            .eq('receiver', currentUserId)
            .eq('type', 'friendship');

        if (inboxError) {
            console.warn('Failed to clean up inbox entry:', inboxError);
        }

        return data;
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw error;
    }
};

export const rejectFriendRequest = async (senderId: string, currentUserId: string) => {
    if (!senderId || !currentUserId) {
        throw new Error("Both sender and current user IDs are required");
    }

    try {
        // Delete the friendship request
        const { error: friendshipError } = await supabase
            .from('friendships')
            .delete()
            .or(
                `and(user_id_1.eq.${senderId},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${senderId})`
            );

        if (friendshipError) throw friendshipError;

        // Remove the inbox entry
        const { error: inboxError } = await supabase
            .from('inbox')
            .delete()
            .eq('sender', senderId)
            .eq('receiver', currentUserId)
            .eq('type', 'friendship');

        if (inboxError) {
            console.warn('Failed to clean up inbox entry:', inboxError);
        }

        return true;
    } catch (error) {
        console.error('Failed to reject friend request:', error);
        throw error;
    }
};

export const removeFriend = async (currentUserId: string, otherUserId: string) => {
    if (!currentUserId || !otherUserId) {
        throw new Error("Both user IDs are required");
    }

    try {
        const { error } = await supabase
            .from('friendships')
            .delete()
            .or(
                `and(user_id_1.eq.${otherUserId},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${otherUserId})`
            );

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Failed to remove friend:', error);
        throw error;
    }
};