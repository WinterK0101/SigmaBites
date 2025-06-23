import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '@/SupabaseConfig';
import { useSession } from '@/context/SessionContext';
import { useFriendsStore } from '@/store/friendsStore';
import EditProfileModal from '../(modals)/EditProfileModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import RemoteImage from "@/components/RemoteImage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  // Empty state styles
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontFamily: 'Lexend-medium',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 11,
    fontFamily: 'Lexend-regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 14,
    maxWidth: 250,
  },
}
);

export default function Profile() {
  const router = useRouter();
  const {session} = useSession();

  // Use the friends store for friend count and real-time updates
  const {
    friendCount,
    fetchFriendCount,
    subscribeToFriendChanges,
    unsubscribe
  } = useFriendsStore();

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

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // For edit modal: store a temporary avatar url for preview
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | undefined>(undefined);

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
          setEateryCount(Array.isArray(data.liked_eateries) ? data.liked_eateries.length : 0);

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

    fetchProfile();
  }, [session]);

  // Setup friend count and real-time subscription
  useEffect(() => {
    if (!session?.user) return;

    const userId = session.user.id;

    // Fetch initial friend count
    fetchFriendCount(userId);

    // Subscribe to real-time changes
    subscribeToFriendChanges(userId);

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [session?.user?.id, fetchFriendCount, subscribeToFriendChanges, unsubscribe]);

  const handleLogout = async () => {
    setShowLogoutModal(false);

    // Unsubscribe from real-time updates before logout
    unsubscribe();

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

    // Unsubscribe from real-time updates before deletion
    unsubscribe();

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

  // ----------- Profile Picture Edit Function -----------
  // This only uploads and returns the new file path, does not update profile state
  const handleTempProfilePicture = async (): Promise<string | undefined> => {
    if (!session?.user) return undefined;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to change your profile picture.');
      return undefined;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      const fileExt = image.uri.split('.').pop();
      const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Read the file as base64 and convert to buffer
      const fileData = await FileSystem.readAsStringAsync(image.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileBuffer = Buffer.from(fileData, 'base64');

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileBuffer, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        Alert.alert('Upload failed!', uploadError.message);
        return undefined;
      }

      // Do NOT update profile here, just return the new filePath for preview
      setTempAvatarUrl(filePath);
      return filePath;
    }
    return undefined;
  };
  // -----------------------------------------------------

  // Always reset tempAvatarUrl when opening the modal
  const handleOpenEditModal = () => {
    setTempAvatarUrl(undefined);
    setShowEditModal(true);
  };

  const EmptyRecentlySavedState = () => (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
              name="bookmark-outline"
              size={28}
              color="#FE724C"
          />
        </View>
        <Text style={styles.emptyStateTitle}>No Recent Saves</Text>
        <Text style={styles.emptyStateSubtitle}>
          Start exploring and save eateries you love!
        </Text>
      </View>
  );

  const EmptyFavouritesState = () => (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons
              name="heart-outline"
              size={28}
              color="#FE724C"
          />
        </View>
        <Text style={styles.emptyStateTitle}>No Favourites Yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Heart eateries you discover to add them here
        </Text>
      </View>
  );

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

        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            overScrollMode="never"
        >
          {/* Profile Header */}
          <LinearGradient colors={['#D03939', '#FE724C']} style={styles.header}>
            <View className="relative mt-16">
              <TouchableOpacity onPress={handleOpenEditModal} activeOpacity={0.8}>
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
                  <View style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 4,
                  }}>
                    <MaterialCommunityIcons name="camera" size={20} color="#FE724C" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>{profile.displayName}</Text>
            <Text style={styles.username}>@{profile.username}</Text>

            <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.8}
                onPress={handleOpenEditModal}
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
          className="flex-col bg-white w-[350px] self-center rounded-2xl py-4 px-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            marginTop: -40,
            minHeight: 110,
          }}
        >
          <Text className="font-lexend-bold text-primary text-base mb-3">Recently Saved</Text>
          {recentlySaved.length === 0 ? (
            <EmptyRecentlySavedState />
          ) : (
            <View className="flex-row justify-center flex-wrap items-center gap-x-10 gap-y-4">
              {recentlySaved.map((eatery) => (
                <TouchableOpacity
                  key={eatery.displayName}
                  activeOpacity={0.8}
                  className="items-center"
                  onPress={() => router.push({
                    pathname: '/(modals)/RestaurantDetails',
                    params: {
                      placeId: eatery?.placeId,
                      eatery: JSON.stringify(eatery)
                    }
                  })}
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
              ))}
            </View>
          )}
        </View>

        {/* Favourites */}
        <View
          className="flex-col bg-white w-[350px] self-center rounded-2xl py-4 px-4 mt-4"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            minHeight: 135,
          }}
        >
          <Text className="font-lexend-bold text-primary text-base mb-3">Favourites</Text>
          {favouriteEateries.length === 0 ? (
            <EmptyFavouritesState />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row items-center">
                {favouriteEateries.map((eatery) => (
                  <TouchableOpacity
                    key={eatery.placeId}
                    activeOpacity={0.8}
                    className="mr-3 items-center"
                    onPress={() => router.push({
                      pathname: '/(modals)/RestaurantDetails',
                      params: {
                        placeId: eatery?.placeId,
                        eatery: JSON.stringify(eatery)
                      }
                    })}
                  >
                    <View style={{ position: 'relative' }}>
                      <Image
                        source={{ uri: eatery.photo }}
                        className="w-[110px] h-[120px] rounded-2xl"
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(102,51,25,0.8)']}
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
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>

        {/* Edit Profile Modal */}
        <EditProfileModal
            visible={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setTempAvatarUrl(undefined); // revert temp avatar on cancel
            }}
            profile={{
              ...profile,
              avatar_url: tempAvatarUrl ?? profile.avatar_url,
            }}
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
            setTempAvatarUrl(undefined);
            setShowEditModal(false);
          } else {
            console.error('Error updating profile:', error.message);
          }
        }}
        onChangeProfilePicture={handleTempProfilePicture}
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