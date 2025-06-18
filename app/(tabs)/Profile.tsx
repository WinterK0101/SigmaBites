import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import { supabase } from '../../SupabaseConfig'
import { useSession } from '../../context/SessionContext';

const dummyUser = {
  displayName: 'John',
  username: 'username',
  profilePicture: 'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg',
  friendCount: 3,
  savedEateries: 15,
  recentEateries: [
    {
      displayName: 'Ajisen Ramen',
      photo: 'https://ucarecdn.com/14373564-94e1-48f6-bcd5-a99767cbc5f2/-/crop/1867x777/0,294/-/format/auto/-/resize/1024x/',
    },
    {
      displayName: 'Project Acai',
      photo: 'https://images.happycow.net/venues/1024/10/44/hcmp104455_819821.jpeg',
    },
    {
      displayName: "Sally's",
      photo: 'https://images.deliveryhero.io/image/fd-sg/products/39252511.jpg?width=%s',
    }
  ],
  favouriteEateries: [
    {
      displayName: 'Ajisen Ramen',
      photo: 'https://ucarecdn.com/14373564-94e1-48f6-bcd5-a99767cbc5f2/-/crop/1867x777/0,294/-/format/auto/-/resize/1024x/',
    },
    {
      displayName: '18Chefs',
      photo: 'https://images.happycow.net/venues/1024/10/44/hcmp104455_819821.jpeg',
    },
    {
      displayName: "Tsukimi Hamburg",
      photo: 'https://njoy.com.sg/wp-content/uploads/2022/08/Tsukimi-Hamburg-Don.jpg',
    }
  ]
}

export default function Profile() {

  const session = useSession();
  console.log(session)
  // State for profile info
  const [profile, setProfile] = useState({
    displayName: 'Loading...',
    username: 'Loading...',
    avatar_url: 'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg',
  });
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  // Fetch profile on mount or session change
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.log('Error fetching profile:', error.message);
          return;
        }

        if (data) {
          setProfile({
            displayName: data.name || 'No name',
            username: data.username || 'No username',
            avatar_url: data.avatar_url || 'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg',
          });
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      }
      const { data } = await supabase.storage.from('avatars').download(profile.avatar_url);
        if (data){
          const fr = new FileReader()
            fr.readAsDataURL(data)
            fr.onload = () => {
              setAvatarPath(fr.result as string)
            }
        }
    }

    fetchProfile();
  }, [session]);
  

  return (
      <View style={styles.container}>
          <LinearGradient colors={['#D03939', '#FE724C']} style={styles.header}>
            <View className="relative mt-12">
              <View
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    borderRadius: 60,
                  }}
              >
                {avatarPath && (
                  <Image
                    source={{ uri: avatarPath }}
                    className="w-[120px] h-[120px] rounded-full border-4 border-white"
                    resizeMode="cover"
                  />
                )}
              
              </View>

              <TouchableOpacity
                  className="w-9 h-9 rounded-full bg-white items-center justify-center absolute bottom-0 right-0"
                  activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#fe724c" />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>{profile.displayName}</Text>
            <Text style={styles.username}>@ {profile.username}</Text>

            <TouchableOpacity style={styles.editButton}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <View className="flex-col items-center mr-10">
                <Text className="font-lexend-bold text-xl text-white">{dummyUser.savedEateries}</Text>
                <Text className="font-lexend-regular text-sm text-white">Eateries</Text>
              </View>
              <View className="flex-col items-center">
                <Text className="font-lexend-bold text-xl text-white">{dummyUser.friendCount}</Text>
                <Text className="font-lexend-regular text-sm text-white">Friends</Text>
              </View>
            </View>

          </LinearGradient>

          {/* Recently Saved */}
          <View className="flex-col bg-white w-[350px] h-[145px] self-center rounded-2xl py-2 px-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  marginTop: -40,
                }}>
            <Text className="font-lexend-bold text-primary text-base mb-3">Recently Saved</Text>
            <View className="flex-row items-center justify-between">
              {dummyUser.recentEateries.map((eatery: any) => (
                  <TouchableOpacity
                      key={eatery.displayName}
                      activeOpacity={0.8}
                      className="mr-3 items-center"
                  >
                    <Image
                        source={{ uri: eatery.photo }}
                        className="w-[70px] h-[70px] rounded-full"
                        resizeMode="cover"
                    />
                    <Text className="text-xs w-[80px] font-lexend-regular text-primary text-center mt-2" numberOfLines={1}>{eatery.displayName}</Text>
                  </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Favourites */}
        <View
            className="flex-col bg-white w-[350px] h-[175px] self-center rounded-2xl py-2 px-4 mt-4 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
        >
          <Text className="font-lexend-bold text-primary text-base">
            Favourites
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center">
              {dummyUser.favouriteEateries.map((eatery: any) => (
                  <TouchableOpacity
                      key={eatery.displayName}
                      activeOpacity={0.8}
                      className="mr-3 items-center"
                  >
                    <View style={{ position: 'relative' }}>
                      <Image
                          source={{ uri: eatery.photo }}
                          className="w-[110px] h-[120px] rounded-2xl"
                          resizeMode="cover"
                      />

                      <LinearGradient
                          colors={[
                            'rgba(0,0,0,0)',
                            'rgba(0,0,0,0.3)',
                            'rgba(102,51,25,0.8)'
                          ]}
                          locations={[0, 0.6, 1]}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: 110,
                            height: 120,
                            borderRadius: 16,
                            justifyContent: 'flex-end',
                            paddingBottom: 8,
                          }}
                      >
                        <Text
                            className="text-white text-xs font-lexend-regular ml-2 pr-2"
                            numberOfLines={2}
                        >
                          {eatery.displayName}
                        </Text>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'offwhite',
    overflow: 'hidden',
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    width: 1000,
    height: 440,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    borderRadius: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    top: -60,
  },

  name: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Baloo-regular',
  },

  username: {
    color: '#fff',
    marginTop: -12,
    fontSize: 14,
    fontFamily: 'Lexend-regular',
  },

  editButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 6,
    marginVertical: 12,
  },
  editButtonText: {
    color: '#FE724C',
    fontFamily: 'Baloo-regular',
    fontSize: 16,
  },
});