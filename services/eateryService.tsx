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