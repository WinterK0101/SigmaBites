import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import RemoteImage from '@/components/RemoteImage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: {
    displayName: string;
    username: string;
    avatar_url: string;
  };
  onSave: (updatedProfile: {
    displayName: string;
    username: string;
    avatar_url: string;
  }) => void | Promise<void>;
  onChangeProfilePicture: () => Promise<string | undefined>; // returns new url or undefined
}

const EditProfileModal = ({
  visible,
  onClose,
  profile,
  onSave,
  onChangeProfilePicture,
}: EditProfileModalProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(profile.displayName || '');
  const [username, setUsername] = useState(profile.username || '');
  const [profilePicUrl, setProfilePicUrl] = useState(profile.avatar_url || '');

  useEffect(() => {
    if (visible && profile) {
      setName(profile.displayName || '');
      setUsername(profile.username || '');
      setProfilePicUrl(profile.avatar_url || '');
    }
  }, [visible, profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        displayName: name,
        username,
        avatar_url: profilePicUrl,
      });
      onClose();
    } catch (error: any) {
      Alert.alert('Error updating profile', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPicture = async () => {
    try {
      setLoading(true);
      const newUrl = await onChangeProfilePicture();
      if (newUrl) setProfilePicUrl(newUrl);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          {/* Profile Picture with Pencil Icon */}
          <View style={styles.profilePictureContainer}>
            <RemoteImage
              filePath={profilePicUrl}
              bucket="avatars"
              style={styles.profilePicture}
            />
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={handleEditPicture}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="pencil-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>Edit Profile</Text>

          {/* Name Field */}
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>

          {/* Username Field */}
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FE724C" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default EditProfileModal;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  profilePictureContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignSelf: 'center',
  },
  editIconButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    marginRight: '28%',
    backgroundColor: '#FE724C',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 100,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Lexend-Bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FE724C',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Lexend-Medium',
    color: '#FE724C',
    width: 80,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FE724C',
  },
  cancelButtonText: {
    color: '#FE724C',
    fontFamily: 'Lexend-Medium',
    fontSize: 14,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FE724C',
    borderWidth: 1,
    borderColor: '#FE724C',
  },
  editButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Medium',
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});