import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { AuthContextType, AuthState, AuthUser, AuthTokens, AuthErrorType } from './types';
import { secureTokenManager } from './SecureTokenManager';
import { authInterceptor } from './AuthInterceptor';
import axios from 'axios';
import { authService } from '@/utils/authService';
import { RegisterRequest } from '@/types/api';
import api from '@/utils/apiClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    error: null,
  });

  /**
   * Initialize authentication system
   */
  const initializeAuth = useCallback(async () => {
    console.log('🔐 AuthProvider: Initializing authentication system...');
    
    try {
      // Initialize secure token manager
      await secureTokenManager.initialize();
      
      // Initialize auth interceptor
      authInterceptor.initialize(axios);
      
      // Check if user has stored tokens
      const hasTokens = await secureTokenManager.hasTokens();
      const storedUser = await secureTokenManager.getUser();
      const storedAuthState = await secureTokenManager.getAuthState();
      
      if (hasTokens && storedUser && storedAuthState) {
        // Validate tokens with backend
        const accessToken = await secureTokenManager.getAccessToken();
        
        if (accessToken && !secureTokenManager.isAccessTokenExpired(accessToken)) {
          // Tokens are valid, restore auth state
          setAuthState({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
          
          console.log('✅ AuthProvider: Authentication restored from storage');
          return;
        } else {
          // Try to refresh tokens
          const refreshSuccess = await authInterceptor.manualRefresh();
          
          if (refreshSuccess) {
            const newAccessToken = await secureTokenManager.getAccessToken();
            if (newAccessToken) {
              setAuthState({
                user: storedUser,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
                error: null,
              });
              
              console.log('✅ AuthProvider: Authentication restored via token refresh');
              return;
            }
          }
        }
      }
      
      // No valid authentication found
      await secureTokenManager.clearAll();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      
      console.log('🔐 AuthProvider: No valid authentication found');
    } catch (error) {
      console.error('❌ AuthProvider: Initialization failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: 'Authentication initialization failed',
      });
    }
  }, []);

  /**
   * Login with phone (Firebase OTP) - preserved existing flow
   */
  const loginWithPhone = useCallback(async (phoneNumber: string, firebaseUid: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Use existing authService method (preserves Firebase OTP flow)
      const response = await authService.loginWithPhone(phoneNumber, firebaseUid);
      
      // Store tokens securely
      await secureTokenManager.storeTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      
      // Store user data
      await secureTokenManager.storeUser(response.user);
      await secureTokenManager.storeAuthState(true);
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      
      console.log('✅ AuthProvider: Phone login successful');
    } catch (error: any) {
      console.error('❌ AuthProvider: Phone login failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Phone login failed',
      }));
      throw error;
    }
  }, []);

  /**
   * Check if user exists - preserved existing flow
   */
  const checkUserExists = useCallback(async (phoneNumber: string): Promise<boolean> => {
    try {
      return await authService.checkUserExists(phoneNumber);
    } catch (error) {
      console.error('❌ AuthProvider: Check user exists failed:', error);
      return false;
    }
  }, []);

  /**
   * Register with onboarding - preserved existing flow
   */
  const registerWithOnboarding = useCallback(async (onboardingData: any) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Use existing authService method (preserves onboarding flow)
      const response = await authService.registerWithOnboarding(onboardingData);
      
      // Store tokens securely
      await secureTokenManager.storeTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      
      // Store user data
      await secureTokenManager.storeUser(response.user);
      await secureTokenManager.storeAuthState(true);
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      
      console.log('✅ AuthProvider: Onboarding registration successful');
    } catch (error: any) {
      console.error('❌ AuthProvider: Onboarding registration failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed',
      }));
      throw error;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Call logout API first to invalidate tokens on backend
      try {
        await api.auth.logout();
        if (__DEV__) console.log('✅ AuthProvider: Logout API call successful');
      } catch (apiError) {
        if (__DEV__) console.warn('⚠️ AuthProvider: Logout API call failed, but continuing with local cleanup:', apiError);
        // Continue with local cleanup even if API fails
      }
      
      // Clear all stored data
      await secureTokenManager.clearAll();
      
      // Reset auth state
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      
      if (__DEV__) console.log('✅ AuthProvider: Logout successful');
    } catch (error) {
      console.error('❌ AuthProvider: Logout failed:', error);
      // Still clear state even if logout fails
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  }, []);

  /**
   * Refresh tokens manually
   */
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      return await authInterceptor.manualRefresh();
    } catch (error) {
      console.error('❌ AuthProvider: Manual token refresh failed:', error);
      return false;
    }
  }, []);

  /**
   * Get current access token
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return await secureTokenManager.getAccessToken();
  }, []);

  /**
   * Check if token is valid
   */
  const isTokenValid = useCallback(async (): Promise<boolean> => {
    const token = await secureTokenManager.getAccessToken();
    if (!token) return false;
    
    return !secureTokenManager.isAccessTokenExpired(token);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    console.log('🔐 AuthProvider: Component mounted, initializing auth...');
    initializeAuth();
  }, [initializeAuth]);

  // Debug auth state changes
  useEffect(() => {
    console.log('🔐 AuthProvider: Auth state changed:', {
      isAuthenticated: authState.isAuthenticated,
      isInitialized: authState.isInitialized,
      isLoading: authState.isLoading,
      hasUser: !!authState.user,
      userId: authState.user?.id,
      error: authState.error
    });
  }, [authState]);

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('🚨 AuthProvider: Token expired event received');
      logout();
    };

    const subscription = DeviceEventEmitter.addListener('auth:token-expired', handleTokenExpired);
    
    return () => {
      subscription.remove();
    };
  }, [logout]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(() => ({
    ...authState,
    loginWithPhone,
    checkUserExists,
    registerWithOnboarding,
    logout,
    refreshTokens,
    clearError,
    getAccessToken,
    isTokenValid,
  }), [
    authState,
    loginWithPhone,
    checkUserExists,
    registerWithOnboarding,
    logout,
    refreshTokens,
    clearError,
    getAccessToken,
    isTokenValid,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
