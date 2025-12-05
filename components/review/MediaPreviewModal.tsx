import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { X, Play } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface MediaPreviewModalProps {
    visible: boolean;
    media: { uri: string; type: 'image' | 'video' } | null;
    onClose: () => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
    visible,
    media,
    onClose,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    if (!media) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.previewModalContainer}>
                <TouchableOpacity
                    style={styles.previewModalBackground}
                    onPress={onClose}
                >
                    <View style={styles.previewModalContent}>
                        <TouchableOpacity
                            style={styles.previewCloseButton}
                            onPress={onClose}
                        >
                            <X size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        {media.type === 'image' ? (
                            <Image source={{ uri: media.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.previewVideoContainer}>
                                <Image source={{ uri: media.uri }} style={styles.previewImage} />
                                <View style={styles.previewVideoOverlay}>
                                    <Play size={40} color="#FFFFFF" fill="#FFFFFF" />
                                </View>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    previewModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewModalBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewModalContent: {
        width: '100%',
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    previewVideoContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewVideoOverlay: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 40,
        padding: 20,
    },
});
