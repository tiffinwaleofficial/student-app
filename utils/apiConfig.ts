/**
 * API Configuration Utility
 * Handles different base URLs for different platforms with comprehensive Android support
 */

import { Platform } from 'react-native';

// Define multiple potential backend URLs for Android emulator
const ANDROID_BACKEND_OPTIONS = [
  'http://10.0.2.2:3001',     // Standard Android emulator host mapping
  'http://192.168.1.100:3001', // Replace with your actual laptop IP
  'http://192.168.0.100:3001', // Alternative common IP range
  'http://127.0.0.1:3001',     // Localhost fallback
];

// Function to get your laptop's local IP (you'll need to replace this)
const getLocalIpAddress = (): string => {
  // Your laptop's actual IP address from ipconfig
  return '10.130.40.1'; // Your WiFi adapter IP address
};

export const getApiBaseUrl = (): string => {
  // Platform-specific configuration
  if (Platform.OS === 'android') {
    // Android uses production backend
    const prodUrl = 'https://api.tiffin-wale.com';
    if (__DEV__) console.log('📱 Android using production backend:', prodUrl);
    return prodUrl;
  }
  
  if (Platform.OS === 'ios') {
    // iOS uses production backend for mobile
    const prodUrl = 'https://api.tiffin-wale.com';
    if (__DEV__) console.log('📱 iOS using production backend:', prodUrl);
    return prodUrl;
  }
  
  // Web platform uses local backend for development
  if (Platform.OS === 'web') {
    const localUrl = 'http://127.0.0.1:3001';
    if (__DEV__) console.log('🌐 Web using local backend:', localUrl);
    return localUrl;
  }
  
  // Default fallback to production
  const defaultUrl = 'https://api.tiffin-wale.com';
  if (__DEV__) console.log('🌐 Using production backend:', defaultUrl);
  return defaultUrl;
};

// Function to test connectivity and provide alternative URLs
export const getAlternativeUrls = (): string[] => {
  if (Platform.OS === 'android') {
    const localIp = getLocalIpAddress();
    return [
      'http://10.0.2.2:3001',
      `http://${localIp}:3001`,
      'http://192.168.1.100:3001', // Common IP ranges
      'http://192.168.0.100:3001',
      'http://192.168.1.101:3001',
      'http://127.0.0.1:3001',
    ];
  }
  return [API_BASE_URL];
};

export const API_BASE_URL = getApiBaseUrl();

// WebSocket URL (same as API but with ws protocol)
export const getWebSocketUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
};

export const getNativeWebSocketUrl = (): string => {
  const apiUrl = getApiBaseUrl();
  // Native WebSocket runs on port 3002 (different from Socket.IO)
  const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  
  // Replace port 3001 with 3002 for native WebSocket
  if (wsUrl.includes(':3001')) {
    return wsUrl.replace(':3001', ':3002');
  }
  
  // For production URLs, append the native WebSocket port
  if (wsUrl.includes('api-tiffin-wale') && wsUrl.includes('vercel.app')) {
    // For Vercel, we'll use the same URL but with a different path
    return wsUrl + '/native-ws';
  }
  
  return wsUrl;
};

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  WS_BASE_URL: getWebSocketUrl(),
  NATIVE_WS_URL: getNativeWebSocketUrl(), // New native WebSocket URL
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Enhanced logging for debugging (only in development)
if (__DEV__) {
  console.log('🌐 API Configuration:', {
    baseUrl: API_BASE_URL,
    platform: Platform.OS,
    wsUrl: API_CONFIG.WS_BASE_URL,
  });
}
