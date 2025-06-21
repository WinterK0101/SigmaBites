import {supabase} from "@/SupabaseConfig";

export async function addVote(groupID: string, userID: string, eateryID: string): Promise<void> {
    const {data, error} = await supabase
        .from('votes')
        .insert({
            groupID: groupID,
            userID: userID,
            eateryID: eateryID,
        });
    if (error) {
        throw error;
    }
}

export async function getAllVotes(groupID: string): Promise<{ eateryID: string; count: number }[] | null> {
    const { data: sortedVotes, error } = await supabase
        .from('votes')
        .select('eateryID, count')
        .eq('groupID', groupID)
        .order('count', { ascending: false });

    if (error) {
        console.error('Error fetching votes:', error);
        return null;
    }

    return sortedVotes;
}

export function getTopEateries(sortedVotes: any) {
    const maxCount = sortedVotes[0].count;

    const topEateryIDs = sortedVotes
        .filter(vote => vote.count === maxCount)
        .map(vote => vote.eateryID);

    return topEateryIDs;
}