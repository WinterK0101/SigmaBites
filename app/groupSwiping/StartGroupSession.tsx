import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { icons } from '@/constants/icons';
import { fetchUserFriends } from '@/services/friendService';
import {useSession} from "@/context/SessionContext";
import RemoteImage from "@/components/RemoteImage";

export default function StartGroupSession() {
    const { locationData, filters, useDummyData } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const user = useSession()?.user;

    const [userFriends, setUserFriends] = useState<any[]>([]);
    const [invitedFriends, setInvitedFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');


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

            {/*Tab Header*/}
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

                {/*Search Bar*/}
                <View className="flex-row items-center bg-grey rounded-2xl px-5 py-4 mt-4">
                    <icons.search height={20} width={20} stroke="#6c6c6c" />
                    <TextInput
                        placeholder="Enter a username"
                        className="ml-3 flex-1 text-6c6c6c font-lexend-regular"
                        clearButtonMode="while-editing"
                        onChangeText={(text) => setSearchQuery(text)}
                        value={searchQuery}
                    />
                </View>

                {/* Invited Friends Display */}
                {invitedFriends.length > 0 && (
                    <View className="bg-white rounded-2xl p-4 mt-6 border-grey border-2 shadow-inner">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        >
                            {invitedFriends.map((friend) => (
                                <View key={friend.id} className="mr-3 items-center" style={{ width: 70 }}>
                                    <View className="relative">
                                        <RemoteImage
                                            filePath={friend.avatar_url}
                                            bucket="avatars"
                                            style={{ width: 50, height: 50, borderRadius: 25 }}
                                        />
                                        <TouchableOpacity
                                            onPress={() => uninviteFriend(friend)}
                                            className="absolute -right-1 bg-accent rounded-full"
                                            style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}
                                            activeOpacity={0.7}
                                        >
                                            <MaterialCommunityIcons name="close" size={14} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text
                                        className="font-lexend-regular text-primary text-xs mt-2 text-center"
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {friend.name}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/*List of Friends*/}
                <Text className="font-lexend-bold text-base text-primary mt-6">Friends</Text>

                <ScrollView className="mt-2 flex-grow" style={{ paddingBottom: 20 }}>
                    {userFriends.length === 0 ? (
                        <Text className="font-lexend-regular text-primary">No friends found.</Text>
                    ) : (
                        userFriends
                            .filter(friend=>friend.username.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((friend) => (
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

            {/*Go to Lobby*/}
            <View
                className="bg-white border-t border-grey"
                style={{
                    paddingBottom: insets.bottom + 16,
                    paddingTop: 24,
                    paddingHorizontal: 24,
                }}
            >
                <TouchableOpacity
                    className="bg-accent rounded-3xl justify-center items-center"
                    style={{
                        height: 60,
                        shadowColor: '#FE724C',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                    }}
                    activeOpacity={0.9}
                    onPress={() => {{
                        if (invitedFriends.length === 0) {
                            alert("You have not invited any friends!");
                            return;
                        }
                        router.push({
                        pathname: '/groupSwiping/GroupLobby',
                        params: {
                            locationData,
                            filters,
                            useDummyData,
                        }
                        });
                    }}}
                >
                    <Text className="font-baloo-regular text-white text-xl">
                        Go to Lobby ({invitedFriends.length} invited)
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}