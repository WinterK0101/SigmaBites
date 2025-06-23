import { supabase } from "@/SupabaseConfig";
import {EateryFilters, LocationData} from "@/interfaces/interfaces";
import {fetchUserByID} from "@/services/userService";

// Create a group and send invites
export async function createGroup(
    hostID: string,
    filters: EateryFilters,
    location: LocationData,
    friendIDs: string[],
    useDummyData: boolean,
) {
    // Create group
    const { data: group, error } = await supabase
        .from('group_sessions')
        .insert({
            hostID: hostID,
            filters: JSON.stringify(filters),
            location: JSON.stringify(location),
            status: 'waiting',
            useDummyData: useDummyData,
        })
        .select()
        .single();

    if (error) throw error;

    // Add host as participant (joined)
    await supabase.from('group_participants').insert({
        groupID: group.id,
        memberID: hostID,
        swipingStatus: 'incomplete',
        joinStatus: 'joined',
    });

    // Add invited friends as participants with joinStatus 'invited'
    if (friendIDs.length > 0) {
        const invitedParticipants = friendIDs.map((friendID) => ({
            groupID: group.id,
            memberID: friendID,
            swipingStatus: 'incomplete',
            joinStatus: 'invited',
        }));

        await supabase.from('group_participants').insert(invitedParticipants);
    }

    // Send invites to friends
    if (friendIDs.length > 0) {
        const invites = friendIDs.map((friendID) => ({
            groupID: group.id,
            sender: hostID,
            receiver: friendID,
            status: 'pending',
        }));

        const { data: createdInvites, error: inviteError } = await supabase
            .from('invites')
            .insert(invites)
            .select('id, receiver');

        if (inviteError) throw inviteError;

        // Add to inbox for each invite
        const inboxEntries = createdInvites.map((invite) => ({
            type: 'invite',
            sender: hostID,
            receiver: invite.receiver,
            inviteID: invite.id,
        }));

        await supabase.from('inbox').insert(inboxEntries);
    }

    return group.id;
}



// Accept invite and join group
export async function acceptInvite(inviteID: string, userID: string) {
    // Get invite details
    const { data: invite, error: fetchError } = await supabase
        .from('invites')
        .select('groupID, receiver')
        .eq('id', inviteID)
        .eq('receiver', userID)
        .single();

    if (fetchError) throw fetchError;

    // Update invite status
    await supabase
        .from('invites')
        .update({ status: 'accepted' })
        .eq('id', inviteID);

    // Update participant's joinStatus to 'joined'
    const { error } = await supabase
        .from('group_participants')
        .update({ joinStatus: 'joined' })
        .eq('groupID', invite.groupID)
        .eq('memberID', userID);

    // Delete the invite
    const { error: deleteInviteError } = await supabase
        .from('invites')
        .delete()
        .eq('id', inviteID)
        .eq('receiver', userID);

    if (deleteInviteError) throw deleteInviteError;

    if (error) throw error;

    return invite.groupID;
}

// Reject invite (removes from invites table)
export async function rejectInvite(inviteId: string, userId: string) {
    // Get invite details (to know groupID)
    const { data: invite, error: fetchError } = await supabase
        .from('invites')
        .select('groupID')
        .eq('id', inviteId)
        .eq('receiver', userId)
        .single();

    if (fetchError) throw fetchError;

    // Delete the invite
    const { error: deleteInviteError } = await supabase
        .from('invites')
        .delete()
        .eq('id', inviteId)
        .eq('receiver', userId);

    if (deleteInviteError) throw deleteInviteError;

    // Remove participant entry for the invited user
    const { error: deleteParticipantError } = await supabase
        .from('group_participants')
        .delete()
        .eq('groupID', invite.groupID)
        .eq('memberID', userId);

    if (deleteParticipantError) throw deleteParticipantError;
}

// Leave group
export async function leaveGroup(groupId: string, userId: string) {
    const { error } = await supabase
        .from('group_participants')
        .delete()
        .eq('groupID', groupId)
        .eq('memberID', userId);

    if (error) throw error;

    // Delete the invite
    const { error: deleteInviteError } = await supabase
        .from('invites')
        .delete()
        .eq('groupID', groupId)
        .eq('receiver', userId);

    if (deleteInviteError) throw deleteInviteError;
}

// Update Session Status
export async function updateSwipingSessionStatus(groupId: string, status: string) {
    // Update status to active
    const { error } = await supabase
        .from('group_sessions')
        .update({ status: status })
        .eq('id', groupId);

    if (error) throw error;
}

export async function getSessionStatus(groupID: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('group_sessions')
            .select('status')
            .eq('id', groupID)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows found
                console.log(`No session found for groupID: ${groupID}`);
                return null;
            }
            throw error;
        }

        return data?.status || null;
    } catch (error) {
        console.error('Error fetching session status:', error);
        return null;
    }
}


// Mark swiping as completed
export async function completeSwiping(groupId: string, userId: string) {
    const { error } = await supabase
        .from('group_participants')
        .update({ swipingStatus: 'completed' })
        .eq('groupID', groupId)
        .eq('memberID', userId);

    if (error) throw error;
}

// Get group info
export async function getGroup(groupId: string) {
    const { data, error } = await supabase
        .from('group_sessions')
        .select('*')
        .eq('id', groupId)
        .single();

    if (error) throw error;
    return data;
}

// Get participants
export async function getParticipants(groupId: string) {
    const { data: participants, error } = await supabase
        .from('group_participants')
        .select('memberID, swipingStatus, joinStatus')
        .eq('groupID', groupId);

    if (error) throw error;

    const users = await Promise.all(
        (participants || []).map(async (participant) => {
            const user = await fetchUserByID(participant.memberID);
            return {
                memberID: participant.memberID,
                swipingStatus: participant.swipingStatus,
                joinStatus: participant.joinStatus,
                user
            };
        })
    );

    return users;
}

// Get user's pending invites
export async function getUserInvites(userId: string) {
    const { data, error } = await supabase
        .from('invites')
        .select(`
            *,
            group_sessions(hostID, filters, location),
            sender:senderID(name, username)
        `)
        .eq('receiverID', userId)
        .eq('status', 'pending');

    if (error) throw error;
    return data || [];
}

export const listenToGroup = (groupID: string, callback: (payload: any) => void) => {
    console.log('Setting up subscription for groupID:', groupID);

    return supabase
        .channel(`group_${groupID}`) // Use a more specific channel name
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'group_participants',
                filter: `groupID=eq.${groupID}`
            },
            (payload) => {
                console.log('Participant INSERTED:', payload);
                callback(payload);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'group_participants',
                filter: `groupID=eq.${groupID}`
            },
            (payload) => {
                console.log('Participant UPDATED:', payload);
                callback(payload);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'group_participants',
                filter: `groupID=eq.${groupID}`
            },
            (payload) => {
                console.log('Participant DELETED:', payload);
                callback(payload);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'DELETE',
                schema: 'public',
                table: 'invites',
                filter: `groupID=eq.${groupID}`
            },
            (payload) => {
                console.log('Invite deleted (rejected):', payload);
                callback(payload);
            }
        )
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'group_sessions',
                filter: `id=eq.${groupID}`
            },
            (payload) => {
                console.log('Group session updated:', payload);
                callback(payload);
            }
        )
        .subscribe((status) => {
            console.log('Subscription status:', status);
            if (status === 'SUBSCRIBED') {
                console.log('Successfully subscribed to group updates');
            } else if (status === 'CHANNEL_ERROR') {
                // console.error('Error subscribing to group updates');
            } else if (status === 'CLOSED') {
                console.log('Subscription closed');
            }
        });
};

// To get the group members who are still swiping and whether all swiping is completed
export async function getWaitingStatus(groupId: string) {
    const { data: participants, error } = await supabase
        .from('group_participants')
        .select('memberID, swipingStatus')
        .eq('groupID', groupId);

    if (error) throw error;

    const stillWaiting = [];

    for (const participant of participants || []) {
        if (participant.swipingStatus === 'incomplete') {
            const user = await fetchUserByID(participant.memberID);
            stillWaiting.push(user);
        }
    }

    const everyoneReady = stillWaiting.length === 0;

    return {
        stillWaitingFor: stillWaiting,
        everyoneReady
    };
}

export function subscribeToWaitingUpdates(groupId: string, onUpdate: (update: any) => void) {
    console.log('Setting up waiting screen subscription for group:', groupId);

    const fetchAndUpdate = async () => {
        try {
            const update = await getWaitingStatus(groupId);
            onUpdate(update);
        } catch (error) {
            console.error('Error fetching waiting status:', error);
        }
    };

    // Subscribe to changes in group_participants table
    const channel = supabase
        .channel(`waiting_${groupId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'group_participants',
                filter: `groupID=eq.${groupId}`
            },
            (payload) => {
                console.log('Participant status changed:', payload);
                fetchAndUpdate();
            }
        )
        .subscribe((status) => {
            console.log('Waiting screen subscription status:', status);
            if (status === 'SUBSCRIBED') {
                fetchAndUpdate();
            }
        });

    return channel;
}

export function unsubscribeWaiting(channel: any) {
    if (channel) {
        supabase.removeChannel(channel);
    }
}