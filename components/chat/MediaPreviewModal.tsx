import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MediaPreviewModalProps {
    visible: boolean;
    previewType: 'image' | 'video';
    previewImage: string | null;
    previewVideo: string | null;
    uploadProgress: number;
    uploadStatus: 'optimizing' | 'uploading' | 'completed' | 'failed';
    optimizationData: {
        originalSize: number;
        optimizedSize: number;
        compressionRatio: number;
    } | null;
    isSending: boolean;
    onClose: () => void;
    onSend: () => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
    visible,
    previewType,
    previewImage,
    previewVideo,
    uploadProgress,
    uploadStatus,
    optimizationData,
    isSending,
    onClose,
    onSend,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.previewOverlay}>
                <View style={styles.previewContainer}>
                    <View style={styles.previewHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.previewCloseButton}>✕</Text>
                        </TouchableOpacity>
                        <Text style={styles.previewTitle}>Preview</Text>
                        <TouchableOpacity onPress={onSend} disabled={isSending}>
                            <Text style={styles.previewSendButton}>Send</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.previewContent} contentContainerStyle={styles.previewContentContainer}>
                        {previewType === 'image' && previewImage && (
                            <Image source={{ uri: previewImage }} style={styles.previewImage} />
                        )}
                        {previewType === 'video' && previewVideo && (
                            <View style={styles.previewVideoContainer}>
                                <Image source={{ uri: previewVideo }} style={styles.previewVideo} />
                                <View style={styles.previewPlayButton}>
                                    <Text style={styles.previewPlayButtonText}>▶</Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>
                                {uploadStatus === 'optimizing' ? 'Optimizing...' :
                                    uploadStatus === 'uploading' ? 'Uploading...' :
                                        'Processing...'}
                            </Text>
                            <Text style={styles.progressPercentage}>{Math.round(uploadProgress)}%</Text>
                            {optimizationData && optimizationData.compressionRatio > 0 && (
                                <Text style={styles.compressionInfo}>
                                    Size reduced by {Math.round(optimizationData.compressionRatio * 100)}%
                                </Text>
                            )}
                        </View>
                    )}

                    {uploadStatus === 'failed' && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>Upload failed. Please try again.</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    previewContainer: {
        flex: 1,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    previewCloseButton: {
        color: theme.colors.white,
        fontSize: 24,
    },
    previewTitle: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: theme.typography.weight.semiBold,
    },
    previewSendButton: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: theme.typography.weight.semiBold,
    },
    previewContent: {
        flex: 1,
    },
    previewContentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: screenWidth,
        height: screenHeight * 0.7,
        resizeMode: 'contain',
    },
    previewVideoContainer: {
        width: screenWidth,
        height: screenHeight * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewVideo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    previewPlayButton: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewPlayButtonText: {
        color: theme.colors.white,
        fontSize: 24,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
    },
    progressText: {
        color: theme.colors.text,
        fontSize: 14,
        marginBottom: 4,
    },
    progressPercentage: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: theme.typography.weight.bold,
        position: 'absolute',
        right: 16,
        top: 16,
    },
    compressionInfo: {
        color: theme.colors.success,
        fontSize: 12,
        marginTop: 4,
    },
    errorContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: theme.colors.error,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    errorText: {
        color: theme.colors.white,
        fontSize: 14,
        fontWeight: theme.typography.weight.bold,
    },
});
