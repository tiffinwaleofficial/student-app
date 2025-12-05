/**
 * API Configuration Utility
 * Centralized configuration for backend API URLs
 * 
 * To switch between remote and local backend:
 * - Set USE_LOCAL_BACKEND to true for local development
 * - Set USE_LOCAL_BACKEND to false for remote/production backend
 */

import { Platform } from 'react-native';

// ============================================
// BACKEND CONFIGURATION TOGGLE
// ============================================
// Set to true to use local backend, false for remote
const USE_LOCAL_BACKEND = false;

// Backend URLs
const REMOTE_BACKEND_URL = 'https://api.tiffin-wale.com';
const LOCAL_BACKEND_URL = 'http://localhost:3001';

// ============================================
// API URL RESOLUTION
// ============================================
export const getApiBaseUrl = (): string => {
  // Check for environment variable override first
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    if (__DEV__) console.log('🌐 Using environment API URL:', envUrl);
    return envUrl;
  }

  // Use configuration toggle
  if (USE_LOCAL_BACKEND) {
    // Platform-specific local backend URLs
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine
      const androidUrl = 'http://10.0.2.2:3001';
      if (__DEV__) console.log('📱 Android using local backend:', androidUrl);
      return androidUrl;
    }
    if (__DEV__) console.log('🏠 Using local backend:', LOCAL_BACKEND_URL);
    return LOCAL_BACKEND_URL;
  }

  // Default to remote backend
  if (__DEV__) console.log('🌍 Using remote backend:', REMOTE_BACKEND_URL);
  return REMOTE_BACKEND_URL;
};

// ============================================
// WEBSOCKET URL RESOLUTION
// ============================================
export const getWebSocketUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
};

export const getNativeWebSocketUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  
  // For local development, use port 3002 for native WebSocket
  if (wsUrl.includes(':3001')) {
    return wsUrl.replace(':3001', ':3002');
  }
  
  return wsUrl;
};

// ============================================
// EXPORTED CONFIGURATION
// ============================================
export const API_BASE_URL = getApiBaseUrl();

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  WS_BASE_URL: getWebSocketUrl(),
  NATIVE_WS_URL: getNativeWebSocketUrl(),
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export const isUsingLocalBackend = (): boolean => USE_LOCAL_BACKEND;
export const isUsingRemoteBackend = (): boolean => !USE_LOCAL_BACKEND;

// Log configuration on initialization (dev only)
if (__DEV__) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    platform: Platform.OS,
    isLocal: USE_LOCAL_BACKEND,
    wsUrl: API_CONFIG.WS_BASE_URL,
  });
}
