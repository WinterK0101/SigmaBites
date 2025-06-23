import React, { useState, useEffect } from 'react';
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
import { sendFriendRequest } from "@/services/friendService";

export default function SendFriendRequestModal({
    visible,
    onClose,
    user,
    onSuccess
}) {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false); // ✅ New state
    const session = useSession();
    const { session } = useSession();
    const currentUser = session?.user;

    useEffect(() => {
        if (!visible) setSent(false); // ✅ Reset when modal closes
    }, [visible]);

    const handleSend = async () => {
        if (!currentUser || !user) {
            Alert.alert('Error', 'Missing user information');
            return;
        }

        setLoading(true);
        try {
            await sendFriendRequest(currentUser.id, user.id);
            setSent(true); // ✅ Show success state
            onSuccess?.();
        } catch (error) {
            console.error('Error sending friend request:', error);
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
                    {/* Profile Picture */}
                    <View style={styles.profilePictureContainer}>
                        <RemoteImage
                            filePath={user.avatar_url}
                            bucket="avatars"
                            style={styles.profilePicture}
                        />
                    </View>

                    {/* Title and Message */}
                    {sent ? (
                        <>
                            <Text style={styles.title}>Friend Request Sent</Text>
                            <Text style={styles.message}>
                                You’ve sent a friend request to @{user.username}.
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.title}>Send Friend Request</Text>
                            <Text style={styles.message}>
                                Do you want to send a friend request to @{user.username}?
                            </Text>
                        </>
                    )}

                    {/* Buttons */}
                    {sent ? (
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.sendButtonText}>Got it</Text>
                        </TouchableOpacity>
                    ) : (
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
                                style={styles.sendButton}
                                onPress={handleSend}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                <Text style={styles.sendButtonText}>
                                    {loading ? 'Loading...' : 'Send'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
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
