import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CustomAlertModal({
    visible,
    onClose,
    title,
    message,
    type = 'info', // 'success', 'error', 'info'
    primaryButtonLabel = 'OK',
    onPrimaryPress,
    icon,
}) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#FE724C',
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>

                    {icon && <View style={styles.icon}>{icon}</View>}

                    <Text style={[styles.title, { color: colors[type] }]}>{title}</Text>

                    <Text style={styles.message}>{message}</Text>

                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors[type] }]}
                        onPress={onPrimaryPress || onClose}
                    >
                        <Text style={styles.primaryButtonText}>{primaryButtonLabel}</Text>
                    </TouchableOpacity>
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
        alignItems: 'center',
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
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    closeButtonText: {
        fontSize: 20,
        fontFamily: 'Lexend-Bold',
        color: '#6c757d',
    },
    icon: {
        marginVertical: 12,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Lexend-Bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        fontFamily: 'Lexend-Regular',
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    primaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    primaryButtonText: {
        color: 'white',
        fontFamily: 'Lexend-Medium',
        fontSize: 14,
    },
});
