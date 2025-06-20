import { supabase } from '@/SupabaseConfig';
import { FRIEND_STATUS, FriendStatus } from "@/constants/friendStatus";
import { useFriendsStore } from "@/store/friendsStore";
import { User } from '@/interfaces/interfaces';

export async function fetchUserFriends(userId: string): Promise<User[]> {
    if (!userId) {
        console.error("No user found");
        return [];
    }

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

    const friendIds = friendsData.map(({ user_id_1, user_id_2 }) =>
        user_id_1 === userId ? user_id_2 : user_id_1
    );

    const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds);

    if (usersError) {
        console.error('Error fetching user info:', usersError);
        return [];
    }

    return usersData || [];
}

export const checkExistingFriendship = async (currentUserId: string, otherUserId: string) => {
    if (!currentUserId || !otherUserId) throw new Error("Both user IDs are required");

    const { data, error } = await supabase
        .from('friendships')
        .select('id, status, user_id_1, user_id_2')
        .or(`and(user_id_1.eq.${otherUserId},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${otherUserId})`)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    return data;
};

export const getFriendshipStatus = async (currentUserId: string, otherUserId: string): Promise<FriendStatus> => {
    const friendship = await checkExistingFriendship(currentUserId, otherUserId);

    if (!friendship) return FRIEND_STATUS.NOT_FRIENDS;
    if (friendship.status === 'accepted') return FRIEND_STATUS.FRIENDS;

    return friendship.user_id_1 === currentUserId
        ? FRIEND_STATUS.REQUEST_SENT
        : FRIEND_STATUS.REQUEST_RECEIVED;
};

export const sendFriendRequest = async (senderId: string, recipientId: string) => {
    if (!senderId || !recipientId) throw new Error("Both sender and recipient IDs are required");

    try {
        const existingFriendship = await checkExistingFriendship(senderId, recipientId);
        if (existingFriendship) throw new Error("Friendship already exists");

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
    if (!senderId || !recipientId) throw new Error("Both sender and recipient IDs are required");

    try {
        const { data: friendship, error: fetchError } = await supabase
            .from('friendships')
            .select('id')
            .eq('user_id_1', senderId)
            .eq('user_id_2', recipientId)
            .eq('status', 'pending')
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!friendship) throw new Error('Friendship request not found');

        const { error: inboxError } = await supabase
            .from('inbox')
            .delete()
            .eq('friendshipID', friendship.id);

        if (inboxError) throw inboxError;

        const { error: friendshipError } = await supabase
            .from('friendships')
            .delete()
            .eq('id', friendship.id);

        if (friendshipError) throw friendshipError;

        useFriendsStore.getState().removeFriend(recipientId);

        return true;
    } catch (error) {
        console.error('Error canceling request:', error);
        throw error;
    }
};

export const acceptFriendRequest = async (senderId: string, currentUserId: string) => {
    if (!senderId || !currentUserId) throw new Error("Both sender and current user IDs are required");

    try {
        const { data: friendship, error: fetchError } = await supabase
            .from('friendships')
            .select('id')
            .or(
                `and(user_id_1.eq.${senderId},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${senderId})`
            )
            .maybeSingle();

        if (fetchError) throw fetchError;
        if (!friendship) throw new Error("Friendship not found");

        await supabase
            .from('inbox')
            .delete()
            .eq('friendshipID', friendship.id);

        const { data: updated, error: updateError } = await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .eq('id', friendship.id)
            .select();

        if (updateError) throw updateError;

        const { data: newFriend } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', senderId)
            .single();

        if (newFriend) {
            useFriendsStore.getState().addFriend(newFriend);
        }

        return updated;
    } catch (error) {
        console.error('Error accepting friend request:', error);
        throw error;
    }
};

export const rejectFriendRequest = async (senderId: string, currentUserId: string) => {
    if (!senderId || !currentUserId) throw new Error("Both sender and current user IDs are required");

    try {
        await supabase
            .from('inbox')
            .delete()
            .eq('sender', senderId)
            .eq('receiver', currentUserId)
            .eq('type', 'friendship');

        await supabase
            .from('friendships')
            .delete()
            .or(
                `and(user_id_1.eq.${senderId},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${senderId})`
            );

        useFriendsStore.getState().removeFriend(senderId);

        return true;
    } catch (error) {
        console.error('Failed to reject friend request:', error);
        throw error;
    }
};

export const removeFriend = async (currentUserId: string, otherUserId: string) => {
    if (!currentUserId || !otherUserId) throw new Error("Both user IDs are required");

    try {
        const { error } = await supabase
            .from('friendships')
            .delete()
            .or(
                `and(user_id_1.eq.${otherUserId},user_id_2.eq.${currentUserId}),and(user_id_1.eq.${currentUserId},user_id_2.eq.${otherUserId})`
            );

        if (error) throw error;

        useFriendsStore.getState().removeFriend(otherUserId);

        return true;
    } catch (error) {
        console.error('Failed to remove friend:', error);
        throw error;
    }
};
