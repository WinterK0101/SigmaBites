import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { supabase } from '@/SupabaseConfig';
import RemoteImage from '@/components/RemoteImage';
import { useSession } from "@/context/SessionContext";

export default function FriendRequestModal({ visible, onClose, user }) {
    const [loading, setLoading] = useState(false);
    const session = useSession();
    const currentUser = session?.user;

    const handleSendRequest = async () => {
        setLoading(true);
        try {
            if (!currentUser) {
                Alert.alert('Error', 'No user logged in');
                setLoading(false);
                return;
            }

            if (!user) {
                Alert.alert('Error', 'No user selected');
                setLoading(false);
                return;
            }

            // Check if friend request already exists
            const { data: existingRequest, error: checkError } = await supabase
                .from('friendships')
                .select('id')
                .or(`and(user_id_1.eq.${currentUser.id},user_id_2.eq.${user.id}),and(user_id_1.eq.${user.id},user_id_2.eq.${currentUser.id})`)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingRequest) {
                Alert.alert('Alert', 'Friend request already exists');
                onClose();
                return;
            }

            // Send friend request
            const { error } = await supabase
                .from('friendships')
                .insert({
                    user_id_1: currentUser.id,
                    user_id_2: user.id,
                    status: 'pending',
                    created_at: new Date().toISOString(),
                });

            if (error) throw error;

            Alert.alert('Success', `Friend request sent to @${user.username}!`);
            onClose();
        } catch (error) {
            Alert.alert('Error sending friend request', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

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
                        <RemoteImage
                            filePath={user.avatar_url}
                            bucket="avatars"
                            style={styles.profilePicture}
                        />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Send Friend Request</Text>

                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>@{user.username}</Text>
                        {user.name && (
                            <Text style={styles.displayName}>{user.name}</Text>
                        )}
                    </View>

                    <Text style={styles.message}>
                        Do you want to send a friend request to this user?
                    </Text>

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
                            style={styles.sendButton}
                            onPress={handleSendRequest}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.sendButtonText}>Send</Text>
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
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#FE724C',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Lexend-Bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#FE724C',
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 16,
    },
    username: {
        fontSize: 18,
        fontFamily: 'Lexend-Medium',
        color: '#333',
        marginBottom: 4,
    },
    displayName: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: '#666',
    },
    message: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#FE724C',
        minHeight: 44,
    },
    cancelButtonText: {
        color: '#FE724C',
        fontFamily: 'Lexend-Medium',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 16,
    },
    sendButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FE724C',
        borderWidth: 1,
        borderColor: '#FE724C',
        minHeight: 44,
    },
    sendButtonText: {
        color: 'white',
        fontFamily: 'Lexend-Medium',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 16,
    },
});