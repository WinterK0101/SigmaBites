import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
} from 'react-native';
import RemoteImage from '@/components/RemoteImage';
import { useSession } from "@/context/SessionContext";
import { acceptFriendRequest, rejectFriendRequest } from "@/services/friendService";

export default function AcceptFriendRequestModal({
                                                     visible,
                                                     onClose,
                                                     user,
                                                     onSuccess
                                                 }) {
    const [loading, setLoading] = useState(false);
    const {session} = useSession();
    const currentUser = session?.user;

    const handleAccept = async () => {
        if (!currentUser || !user) {
            Alert.alert('Error', 'Missing user information');
            return;
        }

        setLoading(true);
        try {
            await acceptFriendRequest(user.id, currentUser.id);
            Alert.alert('Success', `You are now friends with @${user.username}!`);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error accepting friend request:', error);
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!currentUser || !user) {
            Alert.alert('Error', 'Missing user information');
            return;
        }

        setLoading(true);
        try {
            await rejectFriendRequest(user.id, currentUser.id);
            Alert.alert('Friend Request Rejected', `Friend request from @${user.username} has been rejected.`);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error rejecting friend request:', error);
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>

                    {/* Profile Picture */}
                    <View style={styles.profilePictureContainer}>
                        <RemoteImage
                            filePath={user.avatar_url}
                            bucket="avatars"
                            style={styles.profilePicture}
                        />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Friend Request</Text>

                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>@{user.username}</Text>
                        {user.name && (
                            <Text style={styles.displayName}>{user.name}</Text>
                        )}
                    </View>

                    <Text style={styles.message}>@{user.username} wants to be your friend</Text>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={handleReject}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            <Text style={styles.rejectButtonText}>
                                {loading ? 'Loading...' : 'Reject'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={handleAccept}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            <Text style={styles.acceptButtonText}>
                                {loading ? 'Loading...' : 'Accept'}
                            </Text>
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
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    closeButtonText: {
        fontSize: 20,
        fontFamily: 'Lexend-Bold',
        color: '#6c757d',
        lineHeight: 20,
    },
    profilePictureContainer: {
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 16,
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
    rejectButton: {
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
    rejectButtonText: {
        color: '#FE724C',
        fontFamily: 'Lexend-Medium',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 16,
    },
    acceptButton: {
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
    acceptButtonText: {
        color: 'white',
        fontFamily: 'Lexend-Medium',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 16,
    },
});
