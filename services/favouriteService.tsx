import { supabase } from '@/SupabaseConfig';

export async function addToFavorites(userId: string, eateryId: string, currentFavorites = []) {
        try {
            const updatedFavorites = [...currentFavorites, eateryId];

            const { error } = await supabase
                .from('profiles')
                .update({ favourite_eateries: updatedFavorites })
                .eq('id', userId);

            if (error) throw error;
            console.log('Successfully added to favorites');
            return updatedFavorites;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            throw error;
        }
}

export async function removeFromFavorites(userId: string, eateryId: string, currentFavorites = []) {
        try {
            const updatedFavorites = currentFavorites.filter(id => id !== eateryId);
            const { error } = await supabase
                .from('profiles')
                .update({ favourite_eateries: updatedFavorites })
                .eq('id', userId);

            if (error) throw error;

            console.log('Successfully removed from favorites');
            return updatedFavorites;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw error;
        }
}

export async function toggleFavorite(userId, eateryId, currentFavorites = []) {
    try {
        const isFavorited = currentFavorites.includes(eateryId);
        let updatedFavorites;
        if (isFavorited) {
            updatedFavorites = await removeFromFavorites(userId, eateryId, currentFavorites); // Remove 'this.'
        } else {
            updatedFavorites = await addToFavorites(userId, eateryId, currentFavorites); // Remove 'this.'
        }
        return {
            updatedFavorites,
            wasAdded: !isFavorited
        };
    } catch (error) {
        console.error('Error toggling favorite:', error);
        throw error;
    }
}
