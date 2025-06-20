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
import { useRouter } from 'expo-router';
import { supabase } from '@/SupabaseConfig';
import { useSession } from '@/context/SessionContext';
import EditProfileModal from '../(modals)/EditProfileModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import RemoteImage from "@/components/RemoteImage";

export default function Profile() {
  const router = useRouter();
  const session = useSession();

  // Profile state
  const [profile, setProfile] = useState({
    displayName: 'Loading...',
    username: 'Loading...',
    avatar_url: 'default-profile.png',
    favourite_eateries: [],
    liked_eateries: [],
  });

  const [favouriteEateries, setFavouriteEateries] = useState<
    { placeId: string; displayName: string; photo: string }[]
  >([]);

  // Eateries count state
  const [eateryCount, setEateryCount] = useState(0);

  const [recentlySaved, setRecentlySaved] = useState<
    { placeId: string; displayName: string; photo: string }[]
  >([]);
  // Friends state
  const [friendCount, setFriendCount] = useState(0);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch profile on mount or session change
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, name, avatar_url, favourite_eateries, liked_eateries')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.log('Error fetching profile:', error.message);
          return;
        }

        if (data) {
          const newProfile = {
            displayName: data.name,
            username: data.username,
            avatar_url: data.avatar_url,
            favourite_eateries: data.favourite_eateries || [],
            liked_eateries: data.liked_eateries || [],
          };

          setProfile(newProfile);
          setEateryCount(Array.isArray(data.favourite_eateries) ? data.favourite_eateries.length : 0);

          // Fetch favourite eateries details
          const favIds = Array.isArray(data.favourite_eateries) ? data.favourite_eateries : [];
          if (favIds.length > 0) {
            const { data: favs, error: favsError } = await supabase
              .from('Eatery')
              .select('placeId, displayName, photo')
              .in('placeId', favIds);

            if (favsError || !Array.isArray(favs)) {
              setFavouriteEateries([]);
            } else {
              // Order to match the order in favIds
              const orderedFavs = favIds
                .map(id => favs.find(e => e.placeId === id))
                .filter((e): e is { placeId: string; displayName: string; photo: string } => Boolean(e));
              setFavouriteEateries(orderedFavs);
            }
          } else {
            setFavouriteEateries([]);
          }

          // Fetch details for last 3 liked eateries
          const liked = Array.isArray(data.liked_eateries) ? data.liked_eateries : [];
          const lastThree = liked.slice(-3).reverse(); // Get last 3, most recent first

          if (lastThree.length > 0) {
            const { data: eateries, error: eateryError } = await supabase
              .from('Eatery')
              .select('placeId, displayName, photo')
              .in('placeId', lastThree);

            if (eateryError || !Array.isArray(eateries)) {
              setRecentlySaved([]);
            } else {
              // Order the eateries to match the order of lastThree
              const ordered = lastThree
                .map(id => eateries.find(e => e.placeId === id))
                .filter((e): e is { placeId: string; displayName: string; photo: string } => Boolean(e));
              setRecentlySaved(ordered);
            }
          } else {
            setRecentlySaved([]);
          }
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      }
    }

    async function fetchFriendCount() {
      if (!session?.user) return;
      const userId = session.user.id;

      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching friend count:', error.message);
        setFriendCount(0);
        return;
      }
      setFriendCount(count || 0);
    }

    fetchProfile();
    fetchFriendCount();
  }, [session]);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      return;
    }
    router.replace('/');
  };

  // Delete account: remove from profiles and friendships, sign out, redirect
  const handleDelete = async () => {
    setShowDeleteModal(false);
    if (!session?.user) return;
    const userId = session.user.id;

    // Delete friendships where user is user_id_1 or user_id_2
    const { error: friendshipError } = await supabase
      .from('friendships')
      .delete()
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

    if (friendshipError) {
      console.error('Error deleting friendships:', friendshipError.message);
      return;
    }

    // Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError.message);
      return;
    }

    // Delete Auth user via Edge Function (add Authorization header for dev/test)
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ userId }),
      });
      const resultText = await res.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch {
        result = {};
      }
      if (!res.ok) {
        console.error('Error deleting Auth user:', result.error, 'Raw response:', resultText);
      }
    } catch (err) {
      console.error('Error calling delete-user function:', err);
    }

    // Sign out and redirect
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>

      {/* Settings Dropdown */}
      <View style={{ position: 'absolute', top: 60, right: 20, zIndex: 999 }}>
        <TouchableOpacity
          onPress={() => setShowDropdown(!showDropdown)}
          style={styles.settingsIcon}
        >
          <Image
            source={{
              uri: 'https://www.iconpacks.net/icons/2/free-settings-icon-3110-thumb.png',
            }}
            style={styles.settingsImage}
          />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              onPress={() => {
                setShowDropdown(false);
                setShowLogoutModal(true);
              }}
            >
              <Text style={styles.dropdownItem}>Log out</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              onPress={() => {
                setShowDropdown(false);
                setShowDeleteModal(true);
              }}
            >
              <Text style={styles.dropdownItem}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Profile Header */}
      <LinearGradient colors={['#D03939', '#FE724C']} style={styles.header}>
        <View className="relative mt-16">
          <View
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              borderRadius: 60,
            }}
          >
            <RemoteImage
              filePath={profile.avatar_url ? profile.avatar_url : 'default-profile.png'}
              bucket="avatars"
              style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: 'white' }}
            />
          </View>
        </View>

        <Text style={styles.name}>{profile.displayName}</Text>
        <Text style={styles.username}>@{profile.username}</Text>

        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.8}
          onPress={() => setShowEditModal(true)}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center items-center">
          <View className="flex-col items-center mr-10">
            <Text className="font-lexend-bold text-xl text-white">{eateryCount}</Text>
            <Text className="font-lexend-regular text-sm text-white">Eateries</Text>
          </View>
          <View className="flex-col items-center">
            <Text className="font-lexend-bold text-xl text-white">{friendCount}</Text>
            <Text className="font-lexend-regular text-sm text-white">Friends</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Recently Saved */}
      <View
        className="flex-col bg-white w-[350px] h-[145px] self-center rounded-2xl py-2 px-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          marginTop: -40,
        }}
      >
        <Text className="font-lexend-bold text-primary text-base mb-3">Recently Saved</Text>
        <View className="flex-row items-center">
          {recentlySaved.length === 0 ? (
            <Text className="text-xs text-gray-400">No recently saved eateries</Text>
          ) : (
            recentlySaved.map((eatery) => (
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
                <Text
                  className="text-xs w-[80px] font-lexend-regular text-primary text-center mt-2"
                  numberOfLines={1}
                >
                  {eatery.displayName}
                </Text>
              </TouchableOpacity>
            ))
          )}
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
        <Text className="font-lexend-bold text-primary text-base">Favourites</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row items-center">
            {favouriteEateries.length === 0 ? (
              <Text className="text-xs text-gray-400">No favourites yet</Text>
            ) : (
              favouriteEateries.map((eatery) => (
                <TouchableOpacity
                  key={eatery.placeId}
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
                        className="text-white text-xs font-lexend-medium ml-2"
                        numberOfLines={2}
                      >
                        {eatery.displayName}
                      </Text>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onSave={async (updatedProfile) => {
          if (!session?.user) return;
          const { error } = await supabase
            .from('profiles')
            .update({
              name: updatedProfile.displayName,
              username: updatedProfile.username,
              avatar_url: updatedProfile.avatar_url,
            })
            .eq('id', session.user.id);

          if (!error) {
            setProfile((prev) => ({
              ...prev,
              displayName: updatedProfile.displayName,
              username: updatedProfile.username,
              avatar_url: updatedProfile.avatar_url,
            }));
            setShowEditModal(false);
          } else {
            // Optionally show an error message
            console.error('Error updating profile:', error.message);
          }
        }}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Delete Account"
        message="This action cannot be undone. All your data will be permanently deleted."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
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
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 10,
    right: 0,
    zIndex: 999,
  },
  settingsImage: {
    width: 18,
    height: 18,
    tintColor: 'white',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 42,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingVertical: 8,
    width: 110,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontFamily: 'Lexend-Regular',
    fontSize: 13,
    color: '#FE724C',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 6,
    marginHorizontal: 12,
  },
});