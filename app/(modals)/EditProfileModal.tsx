import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { supabase } from '@/SupabaseConfig';
import RemoteImage from '@/components/RemoteImage';
import { useSession } from "@/context/SessionContext";

export default function EditProfileModal({ visible, onClose }) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const { user } = useSession();

    useEffect(() => {
        if (visible) {
            fetchUserProfile();
        }
    }, [visible]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);

            if (!user) {
                Alert.alert('Error', 'No user logged in');
                setLoading(false);
                return;
            }

            const userId = user.id;

            let { data, error, status } = await supabase
                .from('profiles')
                .select('name, username, avatar_url')
                .eq('id', userId)
                .single();

            if (error && status !== 406) throw error;

            if (data) {
                setName(data.name || '');
                setUsername(data.username || '');
                setProfilePicUrl(data.avatar_url || '');
            }
        } catch (error) {
            Alert.alert('Error loading profile', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (!user) {
                Alert.alert('Error', 'No user logged in');
                setLoading(false);
                return;
            }

            const userId = user.id;

            const updates = {
                id: userId,
                name,
                username,
                updated_at: new Date().toISOString(),
            };

            let { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            Alert.alert('Success', 'Profile updated!');
            onClose();
        } catch (error) {
            Alert.alert('Error updating profile', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Modal visible={visible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <ActivityIndicator size="large" color="#FE724C" />
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    {/* Profile Picture */}
                    <View style={styles.profilePictureContainer}>
                        {profilePicUrl ? (
                            <RemoteImage
                                filePath={profilePicUrl}
                                bucket="avatars"
                                style={styles.profilePicture}
                            />
                        ) : (
                            <Image
                                source={{
                                    uri:
                                        'https://i.pinimg.com/564x/39/33/f6/3933f64de1724bb67264818810e3f2cb.jpg',
                                }}
                                style={styles.profilePicture}
                            />
                        )}
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Edit Profile</Text>

                    {/* Name Field */}
                    <View style={styles.fieldRow}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>{name}</Text>
                    </View>

                    {/* Username Field */}
                    <View style={styles.fieldRow}>
                        <Text style={styles.label}>Username</Text>
                        <Text style={styles.value}>{username}</Text>
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
                </View>
            </View>
        </Modal>
    );
}

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
        alignItems: 'center',
        marginBottom: 16,
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
    },
    value: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: '#333',
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
});