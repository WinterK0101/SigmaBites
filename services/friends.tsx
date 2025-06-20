import { supabase } from '@/SupabaseConfig';
import { useSession } from "@/context/SessionContext";
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

export const checkExistingFriendship = async (otherUserId: string) => {
    const currentUserId = useSession()?.user.id;
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


export const getFriendshipStatus = async (otherUserId: string): Promise<FriendStatus> => {
    const currentUserId = useSession()?.user.id;
    const friendship = await checkExistingFriendship(currentUserId, otherUserId);

    if (!friendship) return FRIEND_STATUS.NOT_FRIENDS;
    if (friendship.status === 'accepted') return FRIEND_STATUS.FRIENDS;

    return friendship.user_id_1 === currentUserId
        ? FRIEND_STATUS.REQUEST_SENT
        : FRIEND_STATUS.REQUEST_RECEIVED;
};

export const sendFriendRequest = async (senderId: string, recipientId: string) => {
    try {

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

export const cancelFriendRequest = async (senderId: string) => {
    const currentUserId = useSession()?.user.id;
    const { data: friendship, error: friendshipError } = await supabase
        .from('friendships')
        .select('user_id_1')
}

