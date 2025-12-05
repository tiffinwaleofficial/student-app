/**
 * Centralized Environment Configuration for Student App
 * Single source of truth for all environment variables and configuration
 */

import { Platform } from 'react-native';

/**
 * Platform-aware API URL selection
 * Web: localhost for development
 * Mobile: Production URL or network-accessible URL
 */
const getApiBaseUrl = (): string => {
  const environment = __DEV__ ? 'development' : 'production';
  
  if (environment === 'development') {
    // Platform-specific API URLs for development
    if (Platform.OS === 'web') {
      // Web: Use localhost for local development
      return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    } else if (Platform.OS === 'android') {
      // Android: Use production or local network IP
      return process.env.EXPO_PUBLIC_PROD_API_BASE_URL || 
             process.env.EXPO_PUBLIC_ANDROID_LAPTOP_IP_URL ||
             'https://api.tiffin-wale.com';
    } else {
      // iOS: Use production
      return process.env.EXPO_PUBLIC_PROD_API_BASE_URL || 'https://api.tiffin-wale.com';
    }
  } else {
    // For production, always use remote backend
    return process.env.EXPO_PUBLIC_PROD_API_BASE_URL || 'https://api.tiffin-wale.com';
  }
};

/**
 * WebSocket URL (same as API but with ws protocol)
 */
const getWebSocketUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
};

/**
 * Centralized configuration object
 * All environment variables and settings in one place
 */
export const config = {
  // API Configuration
  api: {
    baseUrl: getApiBaseUrl(),
    timeout: 15000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Firebase Configuration
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCgfF7twAURbSUCcwWYSmu6i1jqEPdn91E',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'tiffin-wale-15d70.firebaseapp.com',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'tiffin-wale-15d70',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'tiffin-wale-15d70.firebasestorage.app',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '375989594965',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:375989594965:web:981efda0254d50d8cf9ddc',
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-NEK8ZRXFCT',
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dols3w27e',
    uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'tiffin-wale',
    apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || '921455847536819',
    baseUrl: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME 
      ? `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}`
      : 'https://api.cloudinary.com/v1_1/dols3w27e',
    imageUrl: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
      ? `https://res.cloudinary.com/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
      : 'https://res.cloudinary.com/dols3w27e/image/upload',
  },

  // WebSocket Configuration
  websocket: {
    url: getWebSocketUrl(),
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
  },

  // RazorPay Configuration
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },

  // Environment Info
  environment: (__DEV__ ? 'development' : 'production') as 'development' | 'staging' | 'production',
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  
  // App Info
  app: {
    name: 'TiffinWale Student',
    version: '1.0.0',
    platform: Platform.OS,
  },

  // Feature Flags
  features: {
    enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    enablePushNotifications: true,
    enableChat: true,
    debugMode: __DEV__,
  },

  // Storage Keys (prefixed for student app)
  storage: {
    accessToken: '@tiffin_student_access_token',
    refreshToken: '@tiffin_student_refresh_token',
    userData: '@tiffin_student_user_data',
    authState: '@tiffin_student_auth_state',
  },
};

/**
 * Helper functions for environment checks
 */
export const isDevelopment = (): boolean => config.isDevelopment;
export const isProduction = (): boolean => config.isProduction;

/**
 * Validate required environment variables
 */
export const validateConfig = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  // Check API configuration
  if (!config.api.baseUrl) {
    missing.push('API_BASE_URL');
  }

  // Check Cloudinary configuration (optional but recommended)
  if (!config.cloudinary.cloudName && config.isProduction) {
    console.warn('⚠️ Cloudinary configuration missing - image uploads will not work');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};

// Log configuration on initialization (dev only)
if (__DEV__) {
  console.log('🔧 Student App Configuration:');
  console.log('  - Environment:', config.environment);
  console.log('  - API Base URL:', config.api.baseUrl);
  console.log('  - Platform:', config.app.platform);
  console.log('  - Firebase Project:', config.firebase.projectId);
  
  const validation = validateConfig();
  if (!validation.valid) {
    console.warn('⚠️ Missing required configuration:', validation.missing);
  }
}

export default config;
