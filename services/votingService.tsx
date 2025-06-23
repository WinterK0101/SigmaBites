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

export async function removeVote(groupID: string, userID: string, eateryID: string): Promise<void> {
    const { error } = await supabase
        .from('votes')
        .delete()
        .match({
            groupID: groupID,
            userID: userID,
            eateryID: eateryID,
        });

    if (error) {
        throw error;
    }
}

export async function getAllVotes(groupID: string): Promise<{ eateryID: string; count: number }[] | null> {
    const { data: votes, error } = await supabase
        .from('votes')
        .select('eateryID')
        .eq('groupID', groupID);

    if (error) {
        console.error('Error fetching votes:', error);
        return null;
    }

    // Count votes per eatery
    const voteCounts = votes.reduce((acc, vote) => {
        acc[vote.eateryID] = (acc[vote.eateryID] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Convert to sorted array
    return Object.entries(voteCounts)
        .map(([eateryID, count]) => ({ eateryID, count }))
        .sort((a, b) => b.count - a.count);
}

export function getTopEateries(sortedVotes: any) {
    if (!sortedVotes || sortedVotes.length === 0) return [];

    const maxCount = sortedVotes[0].count;

    return sortedVotes
        .filter(vote => vote.count === maxCount)
        .map(vote => vote.eateryID);
}