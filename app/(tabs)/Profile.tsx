import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/SupabaseConfig';
import { useSession } from '@/context/SessionContext';
import EditProfileModal from '../(modals)/EditProfileModal';

const dummyUser = {
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
    },
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
      displayName: 'Tsukimi Hamburg',
      photo: 'https://njoy.com.sg/wp-content/uploads/2022/08/Tsukimi-Hamburg-Don.jpg',
    },
  ],
};

export default function Profile() {
  const router = useRouter();
  const session = useSession();

  // Profile state
  const [profile, setProfile] = useState({
    displayName: 'Loading...',
    username: 'Loading...',
    avatar_url: 'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg',
  });
  const [avatarPath, setAvatarPath] = useState(null);

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
            displayName: data.name || 'No name',
            username: data.username || 'No username',
            avatar_url: data.avatar_url || 'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg',
          };

          setProfile(newProfile);

          // Download the avatar using the freshly fetched avatar_url
          if (data.avatar_url) {
            try {
              const { data: avatarData, error: avatarError } = await supabase.storage
                  .from('avatars')
                  .download(data.avatar_url);

              if (avatarError) {
                console.log('Error downloading avatar:', avatarError.message);
                return;
              }

              if (avatarData) {
                const fr = new FileReader();
                fr.readAsDataURL(avatarData);
                fr.onload = () => {
                  setAvatarPath(fr.result);
                };
              }
            } catch (avatarDownloadError) {
              console.error('Error in avatar download:', avatarDownloadError);
            }
          }
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
              {avatarPath ? (
                  <Image
                      source={{ uri: avatarPath }}
                      className="w-[120px] h-[120px] rounded-full border-4 border-white"
                      resizeMode="cover"
                  />
              ) : (
                  <Image
                      source={{ uri: profile.avatar_url }}
                      className="w-[120px] h-[120px] rounded-full border-4 border-white"
                      resizeMode="cover"
                  />
              )}
            </View>

            <TouchableOpacity
                className="w-9 h-9 rounded-full bg-white items-center justify-center absolute bottom-0 right-0"
                activeOpacity={0.8}
                onPress={() => setShowEditModal(true)}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#fe724c" />
            </TouchableOpacity>
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
        <EditProfileModal visible={showEditModal} onClose={() => setShowEditModal(false)} />

        {/* Logout Confirmation Modal */}
        <Modal visible={showLogoutModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.confirmationModal}>
              <Text style={styles.modalTitle}>Log Out</Text>
              <Text style={styles.modalText}>Are you sure you want to log out?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleLogout}
                >
                  <Text style={styles.confirmButtonText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal visible={showDeleteModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.confirmationModal}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <Text style={styles.modalText}>This action cannot be undone. All your data will be permanently deleted.</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleDelete}
                >
                  <Text style={styles.confirmButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'offwhite',
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
    marginTop: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
    marginBottom: 8,
    color: '#FE724C',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderColor: '#FE724C',
  },
  confirmButton: {
    backgroundColor: '#FE724C',
    borderColor: '#FE724C',
  },
  cancelButtonText: {
    color: '#FE724C',
    fontFamily: 'Lexend-Medium',
    fontSize: 14,
  },
  confirmButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Medium',
    fontSize: 14,
  },
});