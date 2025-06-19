import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { icons } from '@/constants/icons';
import { fetchUserFriends } from '@/services/friends';
import {useSession} from "@/context/SessionContext";
import RemoteImage from "@/components/RemoteImage";

export default function StartGroupSession() {
    const { latitude, longitude, filters, useDummyData } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const user = useSession()?.user;

    const [userFriends, setUserFriends] = useState<any[]>([]);
    const [invitedFriends, setInvitedFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);


    function inviteFriend(friend: any) {
        if (!invitedFriends.includes(friend)) {
            setInvitedFriends([...invitedFriends, friend]);
            console.log(`Friend added: ${friend.name}, ${friend.username}, ${friend.avatar_url}`);
        }
    }

    function uninviteFriend(friend: any) {
        if (invitedFriends.includes(friend)) {
            setInvitedFriends(invitedFriends.filter(f => f.id !== friend.id));
            console.log(`Friend deleted: ${friend.name}, ${friend.username}, ${friend.avatar_url}`);
        }
    }


    useEffect(() => {
        if (!user?.id) return;

        const loadFriends = async () => {
            setLoading(true);
            const friends = await fetchUserFriends(user.id);
            setUserFriends(friends || []);
            setLoading(false);
        };

        loadFriends();
    }, [user?.id]);

    return (
        <View style={{ flex: 1 }}>
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
                    Start Group Session
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: -16 }}>
                    <MaterialCommunityIcons name="door-open" size={36} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <View className="px-6 flex-1">
                <Text className="font-lexend-bold text-accent text-2xl mt-8">Invite Friends</Text>
                <View className="flex-row items-center bg-grey rounded-2xl px-5 py-4 mt-4">
                    <icons.search height={20} width={20} stroke="#6c6c6c" />
                    <TextInput
                        placeholder="Enter a username"
                        className="ml-3 flex-1 text-6c6c6c font-lexend-regular"
                        clearButtonMode="while-editing"
                        onFocus={() => {}}
                    />
                </View>

                <Text className="font-lexend-bold text-base text-primary mt-6">Friends</Text>

                <ScrollView className="mt-2 flex-grow">
                        {userFriends.length === 0 ? (
                            <Text>No friends found.</Text>
                        ) : (
                            userFriends.map((friend) => (
                                <TouchableOpacity
                                    className="rounded-2xl w-full mb-2 h-20 border-2 px-6 flex-row items-center flex-start"
                                    key={friend.id}
                                    activeOpacity={0.7}
                                    onPress={()=>{
                                        if (!invitedFriends.includes(friend)) inviteFriend(friend);
                                        else uninviteFriend(friend);
                                    }}
                                    style={{
                                        backgroundColor: invitedFriends.includes(friend) ? '#FFF2F2' : 'white',
                                        borderColor: invitedFriends.includes(friend) ? '#FE724C' : '#d9d9d9',
                                    }}
                                >
                                    <RemoteImage filePath={friend.avatar_url} bucket="avatars" style={{width: 50, height: 50, borderRadius: 100}} />
                                    <View className="flex-col ml-6">
                                        <Text className="font-lexend-bold text-primary text-base">{friend.name}</Text>
                                        <Text className="font-lexend-regular text-primary text-xs">@{friend.username}</Text>
                                    </View>
                                    {invitedFriends.includes(friend) ? (
                                        <View className="ml-auto rounded-full bg-accent p-2">
                                            <MaterialCommunityIcons name="check" size={24} color="white" />
                                        </View>
                                    ) : null}
                                </TouchableOpacity>
                            ))
                        )}
                </ScrollView>
            </View>
        </View>
    );
}
