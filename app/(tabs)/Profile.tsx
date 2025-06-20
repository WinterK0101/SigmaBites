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
import {dummyUser} from "@/data/dummyUser";

export default function Profile() {
  const router = useRouter();
  const session = useSession();

  // Profile state
  const [profile, setProfile] = useState({
    displayName: 'Loading...',
    username: 'Loading...',
    avatar_url: 'default-profile.png',
  });

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
            .select('username, name, avatar_url')
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
          };

          setProfile(newProfile);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      }
    }

    fetchProfile();
  }, [session]);

  const handleLogout = () => {
    setShowLogoutModal(false);
    // Logout logic to be added here
    console.log('User logged out');
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    // Delete account logic to be added here
    console.log('Account deleted');
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
          <View className="flex-row items-center justify-between">
            {dummyUser.recentEateries.map((eatery) => (
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
          <Text className="font-lexend-bold text-primary text-base">Favourites</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-center">
              {dummyUser.favouriteEateries.map((eatery) => (
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
        </View>

        {/* Edit Profile Modal */}
        <EditProfileModal
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
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