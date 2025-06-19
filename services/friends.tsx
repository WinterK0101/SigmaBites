import { supabase } from '@/SupabaseConfig';
import { useSession } from "@/context/SessionContext";

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
