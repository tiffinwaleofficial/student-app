import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useReviewStore } from '@/store/reviewStore';
import { imageUploadService, UploadType } from '@/services/imageUploadService';
import { cloudinaryDeleteService } from '@/services/cloudinaryDeleteService';
import * as ImagePicker from 'expo-image-picker';
import { useValidationNotifications } from '@/hooks/useFirebaseNotification';
import { Review } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

import {
  ReviewRating,
  ReviewComment,
  ReviewMedia,
  MediaPreviewModal,
  MediaFile
} from './review';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  restaurantId?: string;
  menuItemId?: string;
  onReviewSubmitted?: () => void;
  editingReview?: Review | null;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  restaurantId,
  menuItemId,
  onReviewSubmitted,
  editingReview,
}) => {
  const { t } = useTranslation('common');
  const { requiredField } = useValidationNotifications();
  const { showSuccess, showError, showInfo } = require('@/hooks/useFirebaseNotification').default();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ uri: string, type: 'image' | 'video' } | null>(null);

  // Initialize form with editing review data
  React.useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating);
      setComment(editingReview.comment || '');
      // Initialize media files from existing review images
      const existingMedia = (editingReview.images || []).map(imageUrl => ({
        uri: imageUrl,
        type: 'image' as const,
        cloudinaryUrl: imageUrl,
        uploading: false,
      }));
      setMediaFiles(existingMedia);
    } else {
      // Reset form for new review
      setRating(0);
      setComment('');
      setMediaFiles([]);
    }
  }, [editingReview, visible]);

  const { createReview, updateReview } = useReviewStore();

  // Remove media file and clean up Cloudinary asset if needed
  const removeMediaFile = async (index: number) => {
    const fileToRemove = mediaFiles[index];

    // If it's a Cloudinary URL (not a local file), delete from Cloudinary
    if (fileToRemove.cloudinaryUrl && fileToRemove.cloudinaryUrl.startsWith('http')) {
      console.log('🗑️ ReviewModal: Removing Cloudinary asset:', fileToRemove.cloudinaryUrl);

      if (cloudinaryDeleteService.isConfigured()) {
        const success = await cloudinaryDeleteService.deleteAsset(fileToRemove.cloudinaryUrl);
        if (success) {
          console.log('✅ ReviewModal: Cloudinary asset deleted successfully');
        } else {
          console.warn('⚠️ ReviewModal: Failed to delete Cloudinary asset');
        }
      } else {
        console.warn('⚠️ ReviewModal: Cloudinary delete service not configured');
      }
    }

    // Remove from local state
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload to Cloudinary with optimization and progress tracking
  const uploadToCloudinaryWithProgress = async (fileUri: string, mediaType: 'image' | 'video') => {
    try {
      console.log('☁️ Starting optimized Cloudinary upload for:', mediaType);
      console.log('☁️ File URI:', fileUri);

      // Check if imageUploadService is configured
      const configStatus = imageUploadService.getConfigStatus();
      console.log('☁️ Cloudinary config status:', configStatus);

      if (!configStatus.configured) {
        console.error('❌ Cloudinary not configured:', configStatus.missing);
        showError('Configuration Error', 'Media upload is temporarily unavailable. Please try again later! 📷');
        return;
      }

      const uploadType = mediaType === 'video' ? UploadType.REVIEW_VIDEO : UploadType.REVIEW_IMAGE;
      console.log('☁️ Upload type:', uploadType);

      // Progress callback to update UI
      const onProgress = (progress: number, status: string, optimizationData?: any) => {
        console.log(`📊 Upload progress: ${progress}% - ${status}`);

        setMediaFiles(prev => prev.map(file =>
          file.uri === fileUri
            ? {
              ...file,
              progress: progress,
              status: status as any,
              optimizationData: optimizationData ? {
                originalSize: optimizationData.originalSize,
                optimizedSize: optimizationData.optimizedSize,
                compressionRatio: optimizationData.compressionRatio
              } : undefined
            }
            : file
        ));
      };

      // Use the new optimized upload method
      const result = await imageUploadService.uploadImageWithProgress(
        fileUri,
        uploadType,
        onProgress
      );

      if (result.success && result.url) {
        console.log('✅ Optimized Cloudinary upload successful:', result.url);

        // Update the media file with final result
        setMediaFiles(prev => prev.map(file =>
          file.uri === fileUri
            ? {
              ...file,
              cloudinaryUrl: result.url,
              uploading: false,
              progress: 100,
              status: 'completed'
            }
            : file
        ));

        // Show success message with optimization info
        if (result.metadata?.optimization?.compressionRatio > 0) {
          const compressionPercent = Math.round(result.metadata.optimization.compressionRatio * 100);
          showSuccess('Upload Complete! 🎉', `File optimized and uploaded successfully! Reduced size by ${compressionPercent}% 📉`);
        }
      } else {
        console.error('❌ Optimized Cloudinary upload failed:', result.error);

        // Mark upload as failed
        setMediaFiles(prev => prev.map(file =>
          file.uri === fileUri
            ? { ...file, uploading: false, status: 'failed', progress: 0 }
            : file
        ));

        showError('Upload Failed 😅', result.error || 'Failed to upload media. Please try again!');
      }
    } catch (error) {
      console.error('❌ Optimized Cloudinary upload error:', error);

      // Mark upload as failed
      setMediaFiles(prev => prev.map(file =>
        file.uri === fileUri
          ? { ...file, uploading: false, status: 'failed', progress: 0 }
          : file
      ));

      showError('Upload Error 😅', 'Failed to upload media to Cloudinary. Please try again!');
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      requiredField('rating');
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if all media files are uploaded
      const uploadingFiles = mediaFiles.filter(file => file.uploading);
      if (uploadingFiles.length > 0) {
        showInfo('Still Uploading! ⏳', 'Please wait for all media files to finish uploading. Good things take time!');
        setIsSubmitting(false);
        return;
      }

      // Use already uploaded Cloudinary URLs
      let uploadedMediaUrls: string[] = [];

      if (mediaFiles.length > 0) {
        uploadedMediaUrls = mediaFiles
          .filter(file => file.cloudinaryUrl)
          .map(file => file.cloudinaryUrl!);

        console.log('✅ Using uploaded media URLs:', uploadedMediaUrls);
      }

      // Create or update review with uploaded media URLs
      if (editingReview) {
        // Update existing review
        await updateReview(editingReview.id, {
          rating,
          comment: comment.trim() || undefined,
          images: uploadedMediaUrls,
        });
      } else {
        // Create new review
        await createReview({
          rating,
          comment: comment.trim() || undefined,
          images: uploadedMediaUrls, // Backend expects 'images' field for all media
          restaurantId,
          menuItemId,
        });
      }

      // Reset form
      setRating(0);
      setComment('');
      setMediaFiles([]);

      onReviewSubmitted?.();
      onClose();

      showSuccess('Review Submitted! 🌟', 'Thank you for your feedback! Your review helps other food lovers make better choices 🍽️');
    } catch (error) {
      console.error('❌ Review submission error:', error);
      showError('Submission Failed 😅', 'Failed to submit review. Don\'t worry, your opinion still matters to us!');
    } finally {
      setIsSubmitting(false);
      setIsUploadingMedia(false);
    }
  };

  const handleAddMedia = async () => {
    try {
      console.log('🔍 ReviewModal: Add media button clicked');

      // For web, we'll use a simple file input approach
      if (Platform.OS === 'web') {
        // ... (Web implementation omitted for brevity, assuming mobile focus for now or can be re-added if needed)
        // Re-adding web implementation for completeness if needed, but focusing on refactor
        // Keeping it simple for now as per request to break down components
        // If web support is critical, I should have extracted it to a service or hook
        // For now, I'll just use Alert for mobile as primary flow

        // Check if we're in a browser environment
        if (typeof document === 'undefined') {
          console.error('❌ Document not available - not in browser environment');
          Alert.alert('Error', 'File upload not available in this environment');
          return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.multiple = true;
        input.style.display = 'none';

        input.onchange = (event: any) => {
          const files = Array.from(event.target.files) as File[];
          if (files.length === 0) return;

          files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              const mediaType = file.type.startsWith('video/') ? 'video' as const : 'image' as const;

              setMediaFiles(prev => {
                const newFiles = [...prev, {
                  uri: result,
                  type: mediaType,
                  duration: undefined,
                  uploading: true,
                }];
                return newFiles;
              });

              uploadToCloudinaryWithProgress(result, mediaType);
            };
            reader.readAsDataURL(file);
          });
        };

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
        return;
      }

      // For mobile platforms
      Alert.alert(t('addMedia'), t('chooseHowToAddMedia'), [
        { text: t('takePhoto'), onPress: () => takePicture() },
        { text: t('recordVideo'), onPress: () => takeVideo() },
        { text: t('chooseFromGallery'), onPress: () => pickMedia() },
        { text: t('cancel'), style: 'cancel' },
      ]);
    } catch (error) {
      console.error('❌ Media picker error:', error);
      Alert.alert('Error', `Failed to open media picker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const takePicture = async () => {
    try {
      const result = await imageUploadService.takePicture({
        aspect: [4, 3],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setMediaFiles(prev => [...prev, {
          uri: asset.uri,
          type: 'image' as const,
          uploading: true,
        }]);

        uploadToCloudinaryWithProgress(asset.uri, 'image');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const takeVideo = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setMediaFiles(prev => [...prev, {
          uri: asset.uri,
          type: 'video' as const,
          duration: asset.duration || undefined,
          uploading: true,
        }]);

        uploadToCloudinaryWithProgress(asset.uri, 'video');
      }
    } catch (error) {
      console.error('❌ Video recording error:', error);
      Alert.alert('Error', 'Failed to record video');
    }
  };

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsEditing: true,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets) {
        const newMediaFiles = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' as const : 'image' as const,
          duration: asset.duration || undefined,
          uploading: true,
        }));
        setMediaFiles(prev => [...prev, ...newMediaFiles]);

        result.assets.forEach(asset => {
          const mediaType = asset.type === 'video' ? 'video' as const : 'image' as const;
          uploadToCloudinaryWithProgress(asset.uri, mediaType);
        });
      }
    } catch (error) {
      console.error('❌ Media picker error:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {editingReview ? t('editReview') : t('writeReview')}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ReviewRating rating={rating} onRatingChange={setRating} />

          <ReviewComment comment={comment} onCommentChange={setComment} />

          <ReviewMedia
            mediaFiles={mediaFiles}
            isUploadingMedia={isUploadingMedia}
            onAddMedia={handleAddMedia}
            onRemoveMedia={removeMediaFile}
            onPreviewMedia={setPreviewMedia}
          />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              rating === 0 && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            <Text style={[
              styles.submitButtonText,
              rating === 0 && styles.submitButtonTextDisabled,
            ]}>
              {isSubmitting
                ? (isUploadingMedia ? t('uploadingMedia') : t('submitting'))
                : (editingReview ? t('updateReview') : t('submitReview'))
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Media Preview Modal */}
      <MediaPreviewModal
        visible={!!previewMedia}
        media={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </Modal>
  );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.size.l,
    fontWeight: theme.typography.weight.semiBold,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
  },
  footer: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.m,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  submitButtonText: {
    fontSize: theme.typography.size.m,
    fontWeight: theme.typography.weight.semiBold,
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  submitButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },
});
