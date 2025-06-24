import {View, Text, ImageBackground, ScrollView, Image, ActivityIndicator} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { images } from "@/constants/images"
import {
    getParticipants,
    getSessionStatus,
    subscribeToWaitingUpdates,
    updateSwipingSessionStatus
} from '@/services/groupSwiping'
import { GroupParticipant } from '@/interfaces/interfaces'
import RemoteImage from "@/components/RemoteImage";

export default function Waiting() {
    const { groupID } = useLocalSearchParams()
    const router = useRouter()
    const [participants, setParticipants] = useState<GroupParticipant[]>([])

    useEffect(() => {
        if (!groupID) return

        let hasNavigated = false; // Prevent multiple navigations

        // Get all participants initially
        const fetchParticipants = async () => {
            try {
                const users = await getParticipants(groupID as string)
                setParticipants(users)
            } catch (error) {
                console.error('Error fetching participants:', error)
            }
        }

        fetchParticipants()

        // Subscribe to real-time updates
        const channel = subscribeToWaitingUpdates(groupID as string, async (update) => {
            // Prevent multiple navigation attempts
            if (hasNavigated) return;

            try {
                // Refresh participants data when there's an update
                const users = await getParticipants(groupID as string)
                setParticipants(users)

                // If everyone is ready, navigate to results
                if (update.everyoneReady && !hasNavigated) {
                    hasNavigated = true;

                    // Only one user should update the session status
                    // Check if status is already 'completed' to avoid race conditions
                    const currentStatus = await getSessionStatus(groupID as string);

                    if (currentStatus !== 'completed') {
                        await updateSwipingSessionStatus(groupID as string, 'completed');
                    }

                    // Navigate immediately without delay
                    router.replace({
                        pathname: '/groupSwiping/GroupResults',
                        params: {groupID: groupID as string},
                    });
                }
            } catch (error) {
                console.error('Error updating participants:', error)
                hasNavigated = false; // Reset flag on error
            }
        })

        // Cleanup subscription on unmount
        return () => {
            if (channel) {
                channel.unsubscribe()
            }
        }
    }, [groupID, router])

    return (
        <ImageBackground
            source={images.primarybg}
            style={{flex: 1, width: '100%', height: '100%'}}
            resizeMode="cover"
        >
            <View className="flex-1 justify-center items-center px-6">
                <Text
                    className="font-baloo-regular text-5xl text-white text-center"
                    style={{
                        textShadowColor: 'rgba(129, 52, 42, 1)',
                        textShadowOffset: { width: 3, height: 4 },
                        textShadowRadius: 0,
                        lineHeight: 52,
                    }}
                >
                    Waiting for Others...
                </Text>

                <View className="bg-white rounded-2xl w-3/4 h-2/6 mt-10 items-center px-4 py-6">
                    <Text className="font-baloo-regular text-accent text-2xl">Progress</Text>
                    <ScrollView
                        className="flex-1 mt-3"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center', paddingBottom: 4}}
                    >
                        {participants.map((participant) => (
                            <View
                                key={participant.user?.username || participant.memberID}
                                className="flex flex-row items-center justify-between w-full mb-4 px-2"
                            >
                                <View className="flex flex-row items-center flex-1">
                                    <RemoteImage filePath={participant.user?.avatar_url}
                                                 bucket="avatars"
                                                 style={{ width: 50, height: 50, borderRadius: 100, marginRight: 12}}/>
                                    <Text className="font-lexend-regular text-primary text-base" style={{maxWidth: '72%'}}>@{participant.user?.username}</Text>
                                </View>

                                {/* Status indicator */}
                                <View className="ml-2">
                                    {participant.swipingStatus === 'completed' ? (
                                        <View className="bg-accent rounded-full w-8 h-8 justify-center align-center">
                                            <Text className="text-white text-xl text-center">✓</Text>
                                        </View>
                                    ) : (
                                        <ActivityIndicator size="small" color="#fe724c" />
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </ImageBackground>
    )
}