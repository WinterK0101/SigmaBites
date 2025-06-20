import React, { useState } from 'react';
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
import { sendFriendRequest, acceptFriendRequest } from "@/services/friendService";

export default function FriendRequestModal({
                                               visible,
                                               onClose,
                                               user,
                                               action = 'send', // 'send' or 'accept'
                                               onSuccess
                                           }) {
    const [loading, setLoading] = useState(false);
    const session = useSession();
    const currentUser = session?.user;

    const getModalConfig = () => {
        switch (action) {
            case 'send':
                return {
                    title: 'Send Friend Request',
                    message: 'Do you want to send a friend request to this user?',
                    confirmText: 'Send',
                    confirmStyle: styles.sendButton,
                    confirmTextStyle: styles.sendButtonText
                };
            case 'accept':
                return {
                    title: 'Accept Friend Request',
                    message: `Accept friend request from @${user?.username}?`,
                    confirmText: 'Accept',
                    confirmStyle: styles.acceptButton,
                    confirmTextStyle: styles.acceptButtonText
                };
            default:
                return {
                    title: 'Send Friend Request',
                    message: 'Do you want to send a friend request to this user?',
                    confirmText: 'Send',
                    confirmStyle: styles.sendButton,
                    confirmTextStyle: styles.sendButtonText
                };
        }
    };

    const handleAction = async () => {
        if (!currentUser || !user) {
            Alert.alert('Error', 'Missing user information');
            return;
        }

        setLoading(true);
        try {
            if (action === 'send') {
                await sendFriendRequest(currentUser.id, user.id);
                Alert.alert('Success', `Friend request sent to @${user.username}!`);
            } else if (action === 'accept') {
                await acceptFriendRequest(user.id, currentUser.id);
                Alert.alert('Success', `You are now friends with @${user.username}!`);
            }

            onSuccess?.(); // Call success callback if provided
            onClose();
        } catch (error) {
            console.error('Error with friend action:', error);
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const config = getModalConfig();

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
                    <Text style={styles.title}>{config.title}</Text>

                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>@{user.username}</Text>
                        {user.name && (
                            <Text style={styles.displayName}>{user.name}</Text>
                        )}
                    </View>

                    <Text style={styles.message}>{config.message}</Text>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={config.confirmStyle}
                            onPress={handleAction}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            <Text style={config.confirmTextStyle}>
                                {loading ? 'Loading...' : config.confirmText}
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
    acceptButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fe724c',
        borderWidth: 1,
        borderColor: '#28a745',
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