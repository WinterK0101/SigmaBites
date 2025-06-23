import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Collapsible } from "react-native-fast-collapsible";
import { Eatery, GroupParticipant, GroupSession, LocationData } from "@/interfaces/interfaces";
import { useSession } from '@/context/SessionContext';
import RemoteImage from '@/components/RemoteImage';
import {
    getGroup,
    getParticipants,
    listenToGroup,
    leaveGroup,
} from "@/services/groupSwiping";
import { getNearbyEateries } from "@/services/eaterySearch";
import { filterEateries } from "@/services/filterService";
import { supabase } from '@/SupabaseConfig';
import ConfirmationModal from '@/components/ConfirmationModal';

// Helper function to safely parse JSON from database
const safeJsonParse = (data: any, fallback: any = null) => {
    // If data is null or undefined, return fallback
    if (data == null) return fallback;

    // If it's already an object (Supabase auto-parses JSON columns), return it directly
    if (typeof data === 'object') {
        return data;
    }

    // If it's a string, try to parse it
    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.warn('Failed to parse JSON string:', data, error);
            return fallback;
        }
    }

    // For any other type, return fallback
    console.warn('Unexpected data type for JSON parsing:', typeof data, data);
    return fallback;
};

export default function GroupLobby() {
    const params = useLocalSearchParams<{
        groupID: string;
        useDummyData?: string;
    }>();

    const { groupID, useDummyData } = params;

    const insets = useSafeAreaInsets();
    const router = useRouter();
    const {session} = useSession();
    const user = session?.user;

    // State
    const [groupSession, setGroupSession] = useState<GroupSession | null>(null);
    const [participants, setParticipants] = useState<GroupParticipant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltersVisible, setFiltersVisible] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);

    // Get data directly from group session (much cleaner!)
    const parsedLocationData: LocationData = groupSession?.location
        ? safeJsonParse(groupSession.location)
        : null;

    const parsedFilters = groupSession?.filters
        ? safeJsonParse(groupSession.filters, {})
        : {};

    const isUsingDummyData = useDummyData === 'true';

    // Load initial data
    const loadGroupData = async () => {
        if (!groupID || !user?.id) return;

        try {
            setIsLoading(true);
            const [sessionData, participantsData] = await Promise.all([
                getGroup(groupID as string),
                getParticipants(groupID as string)
            ]);

            setGroupSession(sessionData);
            setParticipants(participantsData);
        } catch (error) {
            console.error('Error loading group data:', error);
            Alert.alert('Error', 'Failed to load group data');
        } finally {
            setIsLoading(false);
        }
    };

    // Navigate to swiping screen (shared function for host and participants)
    const navigateToSwiping = useCallback(async () => {
        if (!parsedLocationData || !groupID) return;

        let eateries = [];
        let shouldUseDummyData = false;

        try {
            // For group mode, check the group setting first
            const { data: groupSession } = await supabase
                .from('group_sessions')
                .select('useDummyData')
                .eq('id', groupID)
                .single();

            shouldUseDummyData = groupSession?.useDummyData || false;

            if (shouldUseDummyData) {
                // Use dummy data - no API call needed
                eateries = [];
            } else {
                // Get real data from API
                eateries = await getNearbyEateries(
                    parsedLocationData.coordinates.latitude,
                    parsedLocationData.coordinates.longitude,
                    parsedFilters
                );
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (!shouldUseDummyData) {
                Alert.alert("Error", "Failed to fetch eateries");
                return;
            }
        }

        let filteredEateries: Eatery[] = [];
        if (eateries.length > 0) {
            filteredEateries = filterEateries(eateries, parsedFilters);
        }

        router.push({
            pathname: '/Swiping',
            params: {
                swipingMode: 'group',
                latitude: parsedLocationData.coordinates.latitude.toString(),
                longitude: parsedLocationData.coordinates.longitude.toString(),
                eateries: JSON.stringify(filteredEateries),
                useDummyData: shouldUseDummyData.toString(), // Use the group setting
                groupID: groupID as string,
            }
        });
    }, [parsedLocationData, groupID, router, parsedFilters]);

    // Handle realtime updates with better debugging
    const handleGroupUpdate = useCallback(async (payload: any) => {
        console.log('=== GROUP UPDATE RECEIVED ===');
        console.log('Event Type:', payload.eventType);
        console.log('Table:', payload.table);
        console.log('Payload:', payload);

        if (payload.table === 'group_participants') {
            if (payload.eventType === 'DELETE') {
                console.log('Participant deleted:', payload.old);
                // Remove participant from state immediately
                setParticipants(prev => prev.filter(p => p.memberID !== payload.old.memberID));
            } else if (payload.eventType === 'UPDATE') {
                console.log('Participant updated:', payload.new);

                // If someone's status changed to 'leaving', remove them from the UI immediately
                if (payload.new.joinStatus === 'leaving') {
                    setParticipants(prev => prev.filter(p => p.memberID !== payload.new.memberID));
                } else {
                    // Normal update for other status changes
                    setParticipants(prev => prev.map(p =>
                        p.memberID === payload.new.memberID
                            ? { ...p, joinStatus: payload.new.joinStatus, swipingStatus: payload.new.swipingStatus }
                            : p
                    ));
                }
            } else if (payload.eventType === 'INSERT') {
                console.log('Participant added:', payload.new);
                // Reload to get full participant data with user info
                setTimeout(() => loadGroupData(), 500);
            }
        } else if (payload.table === 'group_sessions') {
            console.log('Group session updated:', payload.new);
            const updatedSession = payload.new;

            setGroupSession(prev => prev ? { ...prev, ...updatedSession } : updatedSession);

            // Check if swiping has started and current user is not the host
            if (updatedSession.status === 'active' && user?.id !== updatedSession.hostID) {
                console.log('Swiping started by host, navigating to swiping screen...');
                await navigateToSwiping();
            }
        }

        console.log('=== END GROUP UPDATE ===');
    }, [user?.id, navigateToSwiping]);

    // Setup realtime subscriptions
    useEffect(() => {
        if (!groupID) return;

        console.log('Setting up realtime subscription for group:', groupID);

        const subscription = listenToGroup(
            groupID as string,
            handleGroupUpdate
        );

        return () => {
            console.log('Cleaning up subscription for group:', groupID);
            subscription?.unsubscribe();
        };
    }, [groupID, handleGroupUpdate]);

    // Load data on focus
    useFocusEffect(
        useCallback(() => {
            loadGroupData();
        }, [groupID, user?.id])
    );

    const handleLeaveGroup = () => {
        setShowLeaveModal(true);
    };

    const confirmLeaveGroup = async () => {
        if (!groupID || !user?.id) return;

        try {
            // First, update the participant's status to 'leaving' instead of deleting immediately
            // This triggers an UPDATE event that other users can listen to
            await supabase
                .from('group_participants')
                .update({ joinStatus: 'leaving' })
                .eq('groupID', groupID)
                .eq('memberID', user.id);

            // Give a small delay to ensure the update propagates to other users
            await new Promise(resolve => setTimeout(resolve, 500));

            // Delete the participant record
            await leaveGroup(groupID as string, user.id);

            setShowLeaveModal(false);
            router.back();
        } catch (error) {
            console.error('Error leaving group:', error);
            Alert.alert('Error', 'Failed to leave group');
        }
    };

    const handleStartSwiping = async () => {
        if (!groupID || !user?.id) return;

        setIsStarting(true);

        try {
            // Store the host's dummy data preference in the group session
            await supabase
                .from('group_sessions')
                .update({
                    useDummyData: isUsingDummyData,
                    status: 'active'
                })
                .eq('id', groupID);

            // Navigate host to swiping screen
            await navigateToSwiping();

        } catch (error) {
            console.error('Error starting swiping session:', error);
            Alert.alert('Error', 'Failed to start swiping session');
        } finally {
            setIsStarting(false);
        }
    };

    const isHost = user?.id === groupSession?.hostID;
    const joinedParticipants = participants.filter(p => p.joinStatus === 'joined');
    const pendingParticipants = participants.filter(p => p.joinStatus === 'invited');

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#FE724C" />
                <Text className="font-lexend-regular text-primary mt-4">Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {/* Header */}
            <LinearGradient
                colors={['#d03939', '#fe724c']}
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingTop: insets.top,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                    height: 128,
                }}
            >
                <Text className="font-baloo-regular text-white text-3xl mr-6">
                    Group Lobby
                </Text>
                <TouchableOpacity onPress={handleLeaveGroup} style={{ marginTop: -16 }}>
                    <MaterialCommunityIcons name="door-open" size={36} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView className="flex-1 px-6">
                {/* Filters */}
                {parsedLocationData && (
                    <View className="bg-white p-5 mt-6 rounded-2xl border-2 border-grey">
                        <TouchableOpacity
                            className="flex-row justify-between items-center"
                            onPress={() => setFiltersVisible(!isFiltersVisible)}
                        >
                            <Text className="font-lexend-bold text-base text-black">Filter Settings</Text>
                            <MaterialCommunityIcons
                                name={isFiltersVisible ? "chevron-down" : "chevron-right"}
                                size={20}
                                color="#333"
                            />
                        </TouchableOpacity>

                        <Collapsible isVisible={isFiltersVisible}>
                            <View className="mt-4">
                                <View className="h-[2px] bg-grey mb-2" />
                                {isUsingDummyData && (
                                    <Text className="text-accent text-xs mt-2 font-lexend-bold">
                                        Using Dummy Data for Testing
                                    </Text>
                                )}
                                <Text className="text-black text-xs mt-2 font-lexend-regular">
                                    <Text className="font-lexend-bold">Location: </Text>
                                    <Text>{parsedLocationData.address}</Text>
                                </Text>
                                <Text className="text-black text-xs mt-2 font-lexend-regular">
                                    <Text className="font-lexend-bold">Search Radius: </Text>
                                    <Text>{parsedFilters.radius / 1000} km</Text>
                                </Text>
                                <Text className="text-black text-xs mt-2 font-lexend-regular">
                                    <Text className="font-lexend-bold">Price Levels: </Text>
                                    <Text>{parsedFilters.priceLevels?.map((price: number) => '$'.repeat(price)).join(', ')}</Text>
                                </Text>
                                <Text className="text-black text-xs mt-2 font-lexend-regular">
                                    <Text className="font-lexend-bold">Minimum Rating: </Text>
                                    <Text>{parsedFilters.minimumRating}</Text>
                                </Text>
                                <Text className="text-black text-xs mt-2 font-lexend-regular">
                                    <Text className="font-lexend-bold">Prioritised Cuisines: </Text>
                                    <Text>
                                        {parsedFilters.cuisineTypes?.map((cuisine: string) => cuisine).join(', ')}
                                    </Text>
                                </Text>
                                <Text className="text-black text-xs mt-2 font-lexend-regular">
                                    <Text className="font-lexend-bold">Only Open Eateries?: </Text>
                                    <Text>{parsedFilters.openNowToggle ? 'Yes' : 'No'}</Text>
                                </Text>
                            </View>
                        </Collapsible>
                    </View>
                )}

                {/* Members Section */}
                <View className="mt-6">
                    <Text className="text-accent text-2xl font-lexend-bold">
                        Members ({joinedParticipants.length}/{participants.length})
                    </Text>
                    <View className="flex-row justify-between items-center mt-2">
                        <Text className="text-[#6C6C6C] font-lexend-regular text-base">
                            {joinedParticipants.length} joined, {pendingParticipants.length} pending
                        </Text>
                    </View>

                    {/* Participants List */}
                    <View className="mt-4 mb-8">
                        {participants.map((participant, index) => (
                            <View
                                key={`${participant.memberID}-${index}`}
                                className="bg-white rounded-2xl p-4 mb-3 border-2 border-grey flex-row items-center"
                            >
                                <RemoteImage
                                    filePath={participant.user?.avatar_url}
                                    bucket="avatars"
                                    style={{ width: 50, height: 50, borderRadius: 25 }}
                                />
                                <View className="flex-1 ml-4">
                                    <Text className="font-lexend-bold text-primary text-base">
                                        {participant.user?.name || 'Unknown User'}
                                    </Text>
                                    <Text className="font-lexend-regular text-primary text-xs">
                                        @{participant.user?.username || 'unknown'}
                                    </Text>
                                </View>

                                {/* Status Badge */}
                                <View className="flex-row items-center">
                                    {participant.memberID === groupSession?.hostID && (
                                        <View className="bg-accent rounded-full px-2 py-1 mr-2">
                                            <Text className="text-white text-xs font-lexend-bold">HOST</Text>
                                        </View>
                                    )}
                                    <View className={`rounded-full px-3 py-1 ${participant.joinStatus === 'joined' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                        <Text className={`text-xs font-lexend-regular ${participant.joinStatus === 'joined' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {participant.joinStatus === 'joined' ? 'Joined' : 'Pending'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Start Group Swiping Button */}
            {isHost && (
                <View
                    style={{
                        paddingBottom: insets.bottom + 16,
                        paddingTop: 16,
                        paddingHorizontal: 24,
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#d9d9d9',
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleStartSwiping}
                        disabled={joinedParticipants.length < 2 || isStarting}
                    >
                        <LinearGradient
                            colors={joinedParticipants.length >= 2 && !isStarting ? ['#d03939', '#fe724c'] : ['#d9d9d9', '#d9d9d9']}
                            style={{
                                borderRadius: 30,
                                height: 60,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text className="font-baloo-regular text-white text-2xl pt-2">
                                {isStarting ? 'Starting...' : 'Start Group Swiping'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    {joinedParticipants.length < 2 && (
                        <Text className="text-center text-[#6C6C6C] text-xs mt-2 font-lexend-regular">
                            Need at least 2 members to start
                        </Text>
                    )}
                </View>
            )}

            <ConfirmationModal
                visible={showLeaveModal}
                title="Leave Group"
                message="Are you sure you want to leave this group session?"
                confirmText="Leave"
                onCancel={() => setShowLeaveModal(false)}
                onConfirm={confirmLeaveGroup}
            />
        </View>
    );
}