import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { AuthTokens, AuthUser } from './types';

// Secure storage keys
const ACCESS_TOKEN_KEY = 'secure_access_token';
const REFRESH_TOKEN_KEY = 'secure_refresh_token';
const USER_DATA_KEY = 'secure_user_data';
const AUTH_STATE_KEY = 'secure_auth_state';

class SecureTokenManager {
  private accessToken: string | null = null; // Keep in memory only
  private _isInitialized = false;
  
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Platform-aware secure storage methods
   */
  private async setSecureItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web (less secure but functional)
      await AsyncStorage.setItem(key, value);
    } else {
      // Use SecureStore for mobile (more secure)
      await SecureStore.setItemAsync(key, value);
    }
  }

  private async getSecureItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web
      return await AsyncStorage.getItem(key);
    } else {
      // Use SecureStore for mobile
      return await SecureStore.getItemAsync(key);
    }
  }

  private async deleteSecureItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use AsyncStorage for web
      await AsyncStorage.removeItem(key);
    } else {
      // Use SecureStore for mobile
      await SecureStore.deleteItemAsync(key);
    }
  }

  /**
   * Initialize the token manager by loading tokens from secure storage
   */
  async initialize(): Promise<void> {
    if (this._isInitialized) return;

    try {
      // Load access token into memory (if exists)
      this.accessToken = await this.getSecureItem(ACCESS_TOKEN_KEY);
      this._isInitialized = true;
      if (__DEV__) console.log('🔐 SecureTokenManager: Initialized successfully', Platform.OS === 'web' ? '(using AsyncStorage for web)' : '(using SecureStore)');
    } catch (error) {
      console.error('❌ SecureTokenManager: Initialization failed:', error);
      this._isInitialized = true; // Mark as initialized even if failed
    }
  }

  /**
   * Store authentication tokens securely
   */
  async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      // Store access token in memory and secure storage (for persistence)
      this.accessToken = tokens.accessToken;
      await this.setSecureItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      
      // Store refresh token in secure storage only
      await this.setSecureItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      
      if (__DEV__) console.log('🔐 SecureTokenManager: Tokens stored successfully');
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Get access token (from memory first, fallback to secure storage)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this._isInitialized) {
      await this.initialize();
    }

    // Return from memory if available
    if (this.accessToken) {
      return this.accessToken;
    }

    // Fallback to secure storage
    try {
      this.accessToken = await this.getSecureItem(ACCESS_TOKEN_KEY);
      return this.accessToken;
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get refresh token from secure storage
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await this.getSecureItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Update access token (in memory and storage)
   */
  async updateAccessToken(accessToken: string): Promise<void> {
    try {
      this.accessToken = accessToken;
      await this.setSecureItem(ACCESS_TOKEN_KEY, accessToken);
      if (__DEV__) console.log('🔐 SecureTokenManager: Access token updated');
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to update access token:', error);
      throw error;
    }
  }

  /**
   * Store user data securely
   */
  async storeUser(user: AuthUser): Promise<void> {
    try {
      await this.setSecureItem(USER_DATA_KEY, JSON.stringify(user));
      if (__DEV__) console.log('🔐 SecureTokenManager: User data stored successfully');
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to store user data:', error);
      throw error;
    }
  }

  /**
   * Get stored user data
   */
  async getUser(): Promise<AuthUser | null> {
    try {
      const userData = await this.getSecureItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Store authentication state
   */
  async storeAuthState(isAuthenticated: boolean): Promise<void> {
    try {
      await this.setSecureItem(AUTH_STATE_KEY, JSON.stringify({ isAuthenticated }));
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to store auth state:', error);
    }
  }

  /**
   * Get stored authentication state
   */
  async getAuthState(): Promise<boolean> {
    try {
      const authState = await this.getSecureItem(AUTH_STATE_KEY);
      return authState ? JSON.parse(authState).isAuthenticated : false;
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to get auth state:', error);
      return false;
    }
  }

  /**
   * Check if tokens exist
   */
  async hasTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();
    return !!(accessToken && refreshToken);
  }

  /**
   * Clear all stored authentication data
   */
  async clearAll(): Promise<void> {
    try {
      // Clear memory
      this.accessToken = null;
      
      // Clear secure storage
      await Promise.all([
        this.deleteSecureItem(ACCESS_TOKEN_KEY).catch(() => {}),
        this.deleteSecureItem(REFRESH_TOKEN_KEY).catch(() => {}),
        this.deleteSecureItem(USER_DATA_KEY).catch(() => {}),
        this.deleteSecureItem(AUTH_STATE_KEY).catch(() => {}),
      ]);
      
      if (__DEV__) console.log('🔐 SecureTokenManager: All data cleared');
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to clear data:', error);
    }
  }

  /**
   * Check if access token is expired (basic check)
   */
  isAccessTokenExpired(token: string): boolean {
    try {
      // Decode JWT payload (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to decode token:', error);
      return true; // Assume expired if can't decode
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('❌ SecureTokenManager: Failed to get token expiration:', error);
      return null;
    }
  }
}

export const secureTokenManager = new SecureTokenManager();
export default secureTokenManager;
