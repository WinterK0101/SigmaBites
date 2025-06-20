import { supabase } from '@/SupabaseConfig';
import { User } from '@/interfaces/interfaces';

export async function fetchUserByUsername(username: string): Promise<User | null> {
    if (!username) {
        console.error('No username provided');
        return null;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (error) {
        console.error('Error fetching user by username:', error);
        return null;
    }

    return data as User;
}

export async function searchUsersByUsername(query: string) {
    if (!query.trim()) return [];

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error('Unable to fetch current user:', userError?.message);
        return [];
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', user.id); // Exclude current user

    if (error) {
        console.error('Error searching users:', error.message);
        return [];
    }

    return data.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url || null,
    }));
}
