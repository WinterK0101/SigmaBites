import { supabase } from '@/SupabaseConfig';

export async function searchUsersByUsername(query: string) {
    if (!query.trim()) return [];

    const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .ilike('username', `%${query}%`);

    if (error) {
        console.error('Error searching users:', error.message);
        return [];
    }

    return data.map((user) => ({
        id: user.id,
        username: user.username,
        name: user.name,
        avatar_url: user.avatar_url || null, // Pass the file path as string or null
    }));
}