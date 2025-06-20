import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ConfirmationModal({
                                              visible,
                                              title,
                                              message,
                                              confirmText,
                                              cancelText = 'Cancel',
                                              onConfirm,
                                              onCancel,
                                          }) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.confirmationModal}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalText}>{message}</Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
