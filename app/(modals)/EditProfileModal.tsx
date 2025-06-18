import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
} from 'react-native';

export default function EditProfileModal({ visible, onClose }) {
  const [name, setName] = useState('John');
  const [username, setUsername] = useState('@username');
  const [isPrivate, setIsPrivate] = useState(true);

  const handleSave = () => {
    console.log({ name, username, privacy: isPrivate ? 'Private' : 'Public' });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
        <Text style={styles.title}>Editing Profile</Text>
          <View style={styles.profilePictureContainer}>
            <Image
              source={{ uri: 'https://placekitten.com/100/100' }} 
              style={styles.profilePicture}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{name}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{username}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Privacy</Text>
            <View style={styles.toggleContainer}>
              <Text style={styles.privacyText}>{isPrivate ? 'Private' : 'Public'}</Text>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: '#767577', true: '#f5c7ba' }}
                thumbColor={isPrivate ? '#FF6B3E' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#FE724C',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Baloo-Regular',
    marginBottom: 12,
    textAlign: 'center',
    color: '#803A00',
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
  },
  value: {
    fontSize: 14,
    fontFamily: 'Lexend-Regular',
    fontWeight: 'normal',
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyText: {
    marginRight: 8,
    fontSize: 14,
    fontFamily: 'Lexend-Medium',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#333',
    fontFamily: 'Lexend-Medium',
  },
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#FE724C',
  },
  editButtonText: {
    color: 'white',
    fontFamily: 'Lexend-Medium',
    fontWeight: 'normal',
  },
});
