import React, {useCallback, useEffect} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {useFocusEffect, useRouter} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '@/interfaces/interfaces';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSession } from "@/context/SessionContext";
import RemoteImage from "@/components/RemoteImage";
import { useFriendsStore } from "@/store/friendsStore";

export default function FriendsScreen() {
  const router = useRouter();
  const user = useSession()?.user;
  const { friends, isLoading, fetchFriends } = useFriendsStore();

  // Fetch friends upon login
  useEffect(() => {
    if (user?.id) fetchFriends(user.id);
  }, [user?.id]);

  const handleFriendPress = (friend: User) => {
    router.push({
      pathname: '/(modals)/OtherUserProfile',
      params: { username: friend.username },
    });
  };

  return (
      <SafeAreaView className="bg-offwhite flex-1" edges={['top', 'left', 'right']}>
        <View className="px-5 flex-1">
          {/* Header with title and buttons */}
          <View className="flex-row justify-between items-center mt-8">
            <Text className="font-baloo-regular text-accent text-4xl pt-4">Friends</Text>
            <View className="flex-row items-center gap-2.5">
              {/* Mail Icon to go to Inbox */}
              <TouchableOpacity onPress={() => router.push('/Inbox')}>
                <Icon
                    name="mail-outline"
                    size={24}
                    color="#fe724c"
                    className="mr-2.5"
                />
              </TouchableOpacity>

              {/* Add Friend Button */}
              <TouchableOpacity
                  className="bg-accent py-2 px-3.5 rounded-full"
                  onPress={() => router.push('/AddFriend')}
              >
                <Text className="text-white font-lexend-bold">+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Subheader */}
          <Text className="text-primary opacity-80 text-base font-lexend-regular mb-6">
            {friends.length} Friends
          </Text>

          {/* Friend List */}
          <ScrollView className="mt-2 flex-grow" style={{ paddingBottom: 20 }}>
            {isLoading ? (
                <Text className="text-center text-primary opacity-60 mt-10">Loading friends...</Text>
            ) : friends.length === 0 ? (
                <View className="flex-1 justify-center items-center mt-20">
                  <Text className="text-center text-primary opacity-60 text-lg font-lexend-bold">No friends yet</Text>
                  <Text className="text-center text-primary opacity-40 text-sm mt-2 font-lexend-regular">
                    Start adding friends to see them here!
                  </Text>
                </View>
            ) : (
                friends.map((friend) => (
                    <TouchableOpacity
                        className="rounded-2xl w-full mb-2 h-20 border-2 px-6 flex-row items-center flex-start"
                        key={friend.id}
                        activeOpacity={0.7}
                        style={{
                          backgroundColor: 'white',
                          borderColor: '#d9d9d9',
                        }}
                        onPress={() => handleFriendPress(friend)}
                    >
                      <RemoteImage
                          filePath={friend.avatar_url}
                          bucket="avatars"
                          style={{ width: 50, height: 50, borderRadius: 100 }}
                      />
                      <View className="flex-col ml-6 flex-1">
                        <Text className="font-lexend-bold text-primary text-base">{friend.name}</Text>
                        <Text className="font-lexend-regular text-primary text-xs">@{friend.username}</Text>
                      </View>
                    </TouchableOpacity>
                ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
  );
}