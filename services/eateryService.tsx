import {Eatery} from "@/interfaces/interfaces";
import {supabase} from "@/SupabaseConfig";

export async function fetchEateryByID(id: string): Promise<Eatery | null> {
    if (!id) {
        console.error('No ID provided');
        return null;
    }

    const { data, error } = await supabase
        .from('Eatery')
        .select('*')
        .eq('placeId', id)
        .single();

    if (error) {
        console.error('Error fetching eatery by placeId:', error);
        return null;
    }

    return data as Eatery;
}

export const removeFromLikedEateries = async (userId, placeId) => {
    try {
        // 1. Fetch current liked_eateries
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('liked_eateries')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error('Error fetching profile:', profileError.message);
            return { success: false, error: profileError.message };
        }

        // 2. Get current liked eateries array
        let likedEateriesArr = Array.isArray(profileData?.liked_eateries)
            ? profileData.liked_eateries
            : [];

        // 3. Remove placeId if present
        if (likedEateriesArr.includes(placeId)) {
            const index = likedEateriesArr.indexOf(placeId);
            likedEateriesArr.splice(index, 1);

            // 4. Update the profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ liked_eateries: likedEateriesArr })
                .eq('id', userId);

            if (updateError) {
                console.error('Error updating liked_eateries:', updateError.message);
                return { success: false, error: updateError.message };
            }

            return { success: true };
        } else {
            // Place ID not found in liked eateries
            return { success: false, error: 'Eatery not found in liked list' };
        }
    } catch (error) {
        console.error('Unexpected error removing eatery:', error);
        return { success: false, error: error.message };
    }
};