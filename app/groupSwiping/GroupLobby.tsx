import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Collapsible } from "react-native-fast-collapsible";
import {GroupParticipant, GroupSession, LocationData, User} from "@/interfaces/interfaces";
import { useSession } from '@/context/SessionContext';
import RemoteImage from '@/components/RemoteImage';
import {
    getGroup,
    getParticipants,
    listenToGroup,
    leaveGroup
} from "@/services/groupSwiping";

export default function GroupLobby() {
    const { groupID, useDummyData } = useLocalSearchParams<{
        groupID: string;
        useDummyData?: string;
    }>();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const session = useSession();
    const user = session?.user;

    // State
    const [groupSession, setGroupSession] = useState<GroupSession | null>(null);
    const [participants, setParticipants] = useState<GroupParticipant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltersVisible, setFiltersVisible] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    // Parsed data
    const parsedLocationData: LocationData = groupSession?.location
        ? JSON.parse(groupSession.location)
        : null;
    const parsedFilters = groupSession?.filters
        ? JSON.parse(groupSession.filters)
        : {};

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
                // Update specific participant
                setParticipants(prev => prev.map(p =>
                    p.memberID === payload.new.memberID
                        ? { ...p, joinStatus: payload.new.joinStatus, swipingStatus: payload.new.swipingStatus }
                        : p
                ));
            } else if (payload.eventType === 'INSERT') {
                console.log('Participant added:', payload.new);
                // Reload to get full participant data with user info
                setTimeout(() => loadGroupData(), 500);
            }
        } else if (payload.table === 'group_sessions') {
            console.log('Group session updated:', payload.new);
            setGroupSession(prev => prev ? { ...prev, ...payload.new } : payload.new);
        }

        console.log('=== END GROUP UPDATE ===');
    }, []);

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

    const handleLeaveGroup = async () => {
        if (!groupID || !user?.id) return;

        Alert.alert(
            'Leave Group',
            'Are you sure you want to leave this group session?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await leaveGroup(groupID as string, user.id);
                            router.back();
                        } catch (error) {
                            console.error('Error leaving group:', error);
                            Alert.alert('Error', 'Failed to leave group');
                        }
                    }
                }
            ]
        );
    };

    const handleStartSwiping = async () => {
        // Just show placeholder for now - no backend implementation
        Alert.alert('Coming Soon', 'Group swiping will start soon!');
    };

    const isHost = user?.id === groupSession?.hostID;
    const joinedParticipants = participants.filter(p => p.joinStatus === 'joined');
    const pendingParticipants = participants.filter(p => p.joinStatus === 'invited');

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#FE724C" />
                <Text className="font-lexend-regular text-black mt-4">Loading...</Text>
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
                                <Text className="text-black text-xs mt-2 font-lexend-regular">
                                    <Text className="font-lexend-bold">Location: </Text>
                                    <Text>{parsedLocationData.address}</Text>
                                </Text>
                                <Text className="text-black text-xs mt-2 font-lexend-regular">
                                    <Text className="font-lexend-bold">Search Radius: </Text>
                                    <Text>{parsedFilters.radius/1000} km</Text>
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
                        {/*<TouchableOpacity*/}
                        {/*    className="bg-white border-2 border-grey rounded-[30px] px-4 py-2"*/}
                        {/*    onPress={() => {*/}
                        {/*        // Navigate back to invite more friends*/}
                        {/*        router.back();*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <Text className="text-accent text-xs font-baloo-regular">Invite More Friends</Text>*/}
                        {/*</TouchableOpacity>*/}
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
                                    <Text className="font-lexend-bold text-black text-base">
                                        {participant.user?.name || 'Unknown User'}
                                    </Text>
                                    <Text className="font-lexend-regular text-black text-xs">
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
        </View>
    );
}