/**
 * Profile Image Service
 * Handles profile image uploads to Cloudinary and backend integration
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '@/utils/apiClient';

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
}

interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

interface UploadStrategy {
  useBackend: boolean;
  useCloudinary: boolean;
}

export class ProfileImageService {
  private config: CloudinaryConfig;
  private strategy: UploadStrategy;

  constructor() {
    // Get Cloudinary config from Expo constants and fallback to direct env vars
    const extra = Constants.expoConfig?.extra;
    
    // Debug logging
    console.log('🔍 Cloudinary config debug:', {
      extraExists: !!extra,
      cloudinaryExtra: extra?.cloudinary,
      envVars: {
        cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'not found',
        apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || 'not found',
        uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'not found',
      }
    });
    
    this.config = {
      cloudName: extra?.cloudinary?.cloudName || process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dols3w27e',
      apiKey: extra?.cloudinary?.apiKey || process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '921455847536819',
      apiSecret: extra?.cloudinary?.apiSecret || process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET || 'yMhNxiV135Kr4aWf7FsYR_G_Zjc',
      uploadPreset: extra?.cloudinary?.uploadPreset || process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'tiffin-wale',
    };

    // Determine upload strategy
    this.strategy = {
      useBackend: true, // Always try backend first
      useCloudinary: this.isCloudinaryConfigured(),
    };

    console.log('🔧 ProfileImageService initialized with strategy:', this.strategy);
    console.log('🔧 Cloudinary config status:', {
      cloudName: this.config.cloudName,
      apiKey: this.config.apiKey ? 'set' : 'not set',
      uploadPreset: this.config.uploadPreset,
    });
  }

  /**
   * Upload profile image using the best available strategy
   */
  async uploadProfileImage(imageUri: string | File): Promise<UploadResult> {
    try {
      console.log('📸 Starting profile image upload...');

      // Strategy 1: Try backend API first (preferred for consistency)
      if (this.strategy.useBackend) {
        try {
          const result = await this.uploadViaBackend(imageUri);
          if (result.success) {
            console.log('✅ Profile image uploaded via backend');
            return result;
          }
        } catch (backendError) {
          console.warn('⚠️ Backend upload failed, trying Cloudinary:', backendError);
        }
      }

      // Strategy 2: Fallback to direct Cloudinary upload
      if (this.strategy.useCloudinary) {
        try {
          const result = await this.uploadViaCloudinary(imageUri);
          if (result.success) {
            console.log('✅ Profile image uploaded via Cloudinary');
            return result;
          }
        } catch (cloudinaryError) {
          console.error('❌ Cloudinary upload failed:', cloudinaryError);
        }
      }

      throw new Error('All upload strategies failed');

    } catch (error) {
      console.error('❌ Profile image upload error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Upload via backend API
   */
  private async uploadViaBackend(imageUri: string | File): Promise<UploadResult> {
    console.log('📤 Uploading via backend API...');

    const formData = new FormData();
    
    // Handle different platforms
    if (Platform.OS === 'web') {
      // For web, imageUri is either a File object or blob URL
      if (typeof imageUri === 'object' && imageUri instanceof File) {
        formData.append('file', imageUri);
      } else {
        // Convert blob URL to File
        const response = await fetch(imageUri as string);
        const blob = await response.blob();
        const file = new File([blob], `profile_${Date.now()}.jpg`, { type: 'image/jpeg' });
        formData.append('file', file);
      }
    } else {
      // For mobile platforms
      const file = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile_${Date.now()}.jpg`,
      } as any;
      formData.append('file', file);
    }

    const response = await api.upload.uploadImage(formData, 'profile');
    
    return {
      success: true,
      url: response.url,
      publicId: response.publicId,
    };
  }

  /**
   * Upload directly to Cloudinary
   */
  private async uploadViaCloudinary(imageUri: string | File): Promise<UploadResult> {
    console.log('📤 Uploading directly to Cloudinary...');

    if (!this.config.cloudName || !this.config.uploadPreset) {
      throw new Error('Cloudinary configuration is incomplete');
    }

    const formData = new FormData();
    
    // Handle different platforms
    if (Platform.OS === 'web') {
      // For web, imageUri is either a File object or blob URL
      if (typeof imageUri === 'object' && imageUri instanceof File) {
        formData.append('file', imageUri);
      } else {
        // Convert blob URL to File
        const response = await fetch(imageUri as string);
        const blob = await response.blob();
        const file = new File([blob], `profile_${Date.now()}.jpg`, { type: 'image/jpeg' });
        formData.append('file', file);
      }
    } else {
      // For mobile platforms
      const file = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile_${Date.now()}.jpg`,
      } as any;
      formData.append('file', file);
    }

    formData.append('upload_preset', this.config.uploadPreset);
    formData.append('folder', 'profile-images');
    
    // Add transformations for profile images
    formData.append('transformation', JSON.stringify([
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ]));
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.config.cloudName}/upload`,
      {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it automatically for FormData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  /**
   * Delete profile image
   */
  async deleteProfileImage(publicId: string): Promise<UploadResult> {
    try {
      console.log('🗑️ Deleting profile image:', publicId);

      // Try backend first
      if (this.strategy.useBackend) {
        try {
          await api.upload.deleteImage(publicId);
          console.log('✅ Profile image deleted via backend');
          return { success: true };
        } catch (backendError) {
          console.warn('⚠️ Backend deletion failed:', backendError);
        }
      }

      // Fallback to direct Cloudinary deletion (requires server-side implementation)
      console.log('⚠️ Direct Cloudinary deletion not implemented for client-side');
      
      return {
        success: false,
        error: 'Deletion failed - backend unavailable',
      };

    } catch (error) {
      console.error('❌ Profile image deletion error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(publicId: string, transformations?: any[]): string {
    if (!this.config.cloudName) {
      return '';
    }

    const defaultTransformations = [
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ];

    const transformString = (transformations || defaultTransformations)
      .map(t => Object.entries(t).map(([key, value]) => `${key}_${value}`).join(','))
      .join('/');

    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${transformString}/${publicId}`;
  }

  /**
   * Check if Cloudinary is properly configured
   */
  private isCloudinaryConfigured(): boolean {
    return !!(this.config.cloudName && this.config.uploadPreset);
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return this.strategy.useBackend || this.strategy.useCloudinary;
  }

  /**
   * Get configuration status
   */
  getConfigStatus(): { configured: boolean; strategies: string[]; missing: string[] } {
    const strategies: string[] = [];
    const missing: string[] = [];
    
    if (this.strategy.useBackend) {
      strategies.push('backend');
    }
    
    if (this.strategy.useCloudinary) {
      strategies.push('cloudinary');
    } else {
      if (!this.config.cloudName) missing.push('cloudName');
      if (!this.config.uploadPreset) missing.push('uploadPreset');
    }
    
    return {
      configured: strategies.length > 0,
      strategies,
      missing,
    };
  }
}

// Export singleton instance
export const profileImageService = new ProfileImageService();
export default profileImageService;
