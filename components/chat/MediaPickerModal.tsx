import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface MediaPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onImagePick: () => void;
    onCameraCapture: () => void;
    onDocumentPick: () => void;
    t: (key: string) => string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
    visible,
    onClose,
    onImagePick,
    onCameraCapture,
    onDocumentPick,
    t,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.mediaPickerContainer}>
                    <TouchableOpacity style={styles.mediaOption} onPress={onImagePick}>
                        <Text style={styles.mediaOptionText}>{t('gallery')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mediaOption} onPress={onCameraCapture}>
                        <Text style={styles.mediaOptionText}>{t('camera')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mediaOption} onPress={onDocumentPick}>
                        <Text style={styles.mediaOptionText}>{t('document')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.modalOverlay,
        justifyContent: 'flex-end',
    },
    mediaPickerContainer: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
    },
    mediaOption: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    mediaOptionText: {
        fontSize: 18,
        color: theme.colors.text,
    },
    cancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginTop: 8,
    },
    cancelButtonText: {
        fontSize: 18,
        color: theme.colors.error,
        textAlign: 'center',
    },
});
