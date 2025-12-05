import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Camera, Trash2, Play } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

export interface MediaFile {
    uri: string;
    type: 'image' | 'video';
    duration?: number;
    cloudinaryUrl?: string;
    uploading?: boolean;
    progress?: number;
    status?: 'optimizing' | 'uploading' | 'completed' | 'failed';
    optimizationData?: {
        originalSize: number;
        optimizedSize: number;
        compressionRatio: number;
    };
}

interface ReviewMediaProps {
    mediaFiles: MediaFile[];
    isUploadingMedia: boolean;
    onAddMedia: () => void;
    onRemoveMedia: (index: number) => void;
    onPreviewMedia: (media: { uri: string; type: 'image' | 'video' }) => void;
}

export const ReviewMedia: React.FC<ReviewMediaProps> = ({
    mediaFiles,
    isUploadingMedia,
    onAddMedia,
    onRemoveMedia,
    onPreviewMedia,
}) => {
    const { t } = useTranslation('common');
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('addPhotosVideos')} (optional)</Text>

            {/* Selected Media */}
            {mediaFiles.length > 0 && (
                <View style={styles.selectedMediaContainer}>
                    <FlatList
                        data={mediaFiles}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View style={styles.mediaPreviewContainer}>
                                <TouchableOpacity
                                    onPress={() => onPreviewMedia({ uri: item.uri, type: item.type })}
                                    style={styles.mediaPreviewTouchable}
                                >
                                    {item.type === 'image' ? (
                                        <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
                                    ) : (
                                        <View style={styles.videoPreview}>
                                            <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
                                            <View style={styles.videoOverlay}>
                                                <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                                            </View>
                                            {item.duration && (
                                                <Text style={styles.videoDuration}>
                                                    {Math.round(item.duration)}s
                                                </Text>
                                            )}
                                        </View>
                                    )}

                                    {/* Upload Progress Indicator */}
                                    {item.uploading && (
                                        <View style={styles.uploadingOverlay}>
                                            <View style={styles.progressContainer}>
                                                <View style={styles.progressBar}>
                                                    <View
                                                        style={[
                                                            styles.progressFill,
                                                            { width: `${item.progress || 0}%` }
                                                        ]}
                                                    />
                                                </View>
                                                <Text style={styles.uploadingText}>
                                                    {item.status === 'optimizing' ? 'Optimizing...' :
                                                        item.status === 'uploading' ? 'Uploading...' :
                                                            'Processing...'}
                                                </Text>
                                                <Text style={styles.progressPercentage}>
                                                    {Math.round(item.progress || 0)}%
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Upload Success Indicator */}
                                    {item.cloudinaryUrl && !item.uploading && (
                                        <View style={styles.uploadSuccessOverlay}>
                                            <Text style={styles.uploadSuccessText}>✓</Text>
                                            {item.optimizationData && item.optimizationData.compressionRatio > 0 && (
                                                <Text style={styles.compressionText}>
                                                    -{Math.round(item.optimizationData.compressionRatio * 100)}%
                                                </Text>
                                            )}
                                        </View>
                                    )}

                                    {/* Upload Failed Indicator */}
                                    {item.status === 'failed' && (
                                        <View style={styles.uploadFailedOverlay}>
                                            <Text style={styles.uploadFailedText}>✗</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.removeMediaButton}
                                    onPress={() => onRemoveMedia(index)}
                                >
                                    <Trash2 size={16} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            )}

            {/* Add Media Button */}
            <TouchableOpacity
                style={styles.addMediaButton}
                onPress={onAddMedia}
                disabled={isUploadingMedia}
            >
                <Camera size={24} color={theme.colors.primary} />
                <Text style={styles.addMediaText}>
                    {isUploadingMedia ? t('uploading') : t('addPhotosVideos')}
                </Text>
            </TouchableOpacity>

            {/* Media Count */}
            {mediaFiles.length > 0 && (
                <Text style={styles.mediaCountText}>
                    {mediaFiles.length} file{mediaFiles.length > 1 ? 's' : ''} selected
                </Text>
            )}
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    section: {
        marginVertical: theme.spacing.m,
    },
    sectionTitle: {
        fontSize: theme.typography.size.m,
        fontWeight: theme.typography.weight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
        fontFamily: theme.typography.fontFamily.semiBold,
    },
    selectedMediaContainer: {
        marginBottom: theme.spacing.m,
    },
    mediaPreviewContainer: {
        width: 120,
        height: 120,
        marginRight: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
        position: 'relative',
    },
    mediaPreviewTouchable: {
        width: '100%',
        height: '100%',
    },
    mediaPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    videoPreview: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoOverlay: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 8,
    },
    videoDuration: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: '#FFFFFF',
        fontSize: 10,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
    },
    uploadingText: {
        color: '#FFFFFF',
        fontSize: 10,
        marginBottom: 2,
    },
    progressPercentage: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    uploadSuccessOverlay: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: theme.colors.success,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadSuccessText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    compressionText: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: '#FFFFFF',
        fontSize: 10,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    uploadFailedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadFailedText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    removeMediaButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
    },
    addMediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.l,
    },
    addMediaText: {
        fontSize: theme.typography.size.s,
        color: theme.colors.primary,
        marginLeft: theme.spacing.s,
        fontFamily: theme.typography.fontFamily.medium,
    },
    mediaCountText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.s,
        fontFamily: theme.typography.fontFamily.regular,
    },
});
