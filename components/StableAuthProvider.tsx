import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import authService from '@/utils/authService';
import { CustomerProfile } from '@/types/api';
import { RegisterRequest } from '@/types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  user: CustomerProfile | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string, firebaseUid: string) => Promise<void>;
  checkUserExists: (phoneNumber: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<void>;
  registerWithOnboarding: (onboardingData: any) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within a StableAuthProvider');
  }
  return context;
};

export const StableAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authStore = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Memoize the auth functions to prevent re-creation on every render
  const login = useCallback(async (email: string, password: string) => {
    return authStore.login(email, password);
  }, [authStore.login]);

  const loginWithPhone = useCallback(async (phoneNumber: string, firebaseUid: string) => {
    return authStore.loginWithPhone(phoneNumber, firebaseUid);
  }, [authStore.loginWithPhone]);

  const checkUserExists = useCallback(async (phoneNumber: string) => {
    return authStore.checkUserExists(phoneNumber);
  }, [authStore.checkUserExists]);

  const register = useCallback(async (userData: RegisterRequest) => {
    return authStore.register(userData);
  }, [authStore.register]);

  const registerWithOnboarding = useCallback(async (onboardingData: any) => {
    return authStore.registerWithOnboarding(onboardingData);
  }, [authStore.registerWithOnboarding]);

  const logout = useCallback(async () => {
    return authStore.logout();
  }, [authStore.logout]);

  const clearError = useCallback(() => {
    authStore.clearError();
  }, [authStore.clearError]);

  const checkAuth = useCallback(async () => {
    if (authStore.isAuthenticated) {
      const isValid = await authService.validateToken();
      if (!isValid) {
        await logout();
      }
    }
  }, [authStore.isAuthenticated, logout]);

  // Initialize authentication only once
  useEffect(() => {
    if (!authStore.isInitialized) {
      if (__DEV__) console.log('🔍 StableAuthProvider: Initializing authentication');
      authStore.initializeAuth();
    }
  }, []); // Empty dependency array - only run once

  // Listen for token expiration events - stable dependencies
  useEffect(() => {
    let isHandlingTokenExpired = false;
    
    const handleTokenExpired = async () => {
      if (isHandlingTokenExpired) {
        if (__DEV__) console.log('🚨 StableAuthProvider: Token expiration already being handled');
        return;
      }
      
      if (__DEV__) console.log('🚨 StableAuthProvider: Token expired event received');
      isHandlingTokenExpired = true;
      
      try {
        if (authStore.isAuthenticated && !authStore.isLoggingOut) {
          await logout();
        }
      } catch (error) {
        console.error('❌ StableAuthProvider: Error handling token expiration:', error);
      } finally {
        isHandlingTokenExpired = false;
      }
    };

    const subscription = DeviceEventEmitter.addListener('auth:token-expired', handleTokenExpired);
    
    return () => {
      subscription.remove();
      isHandlingTokenExpired = false;
    };
  }, [logout]); // Only depend on the memoized logout function

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated: authStore.isAuthenticated,
    isInitialized: authStore.isInitialized,
    isLoading: authStore.isLoading,
    user: authStore.user,
    error: authStore.error,
    login,
    loginWithPhone,
    checkUserExists,
    register,
    registerWithOnboarding,
    logout,
    clearError,
    checkAuth,
  }), [
    authStore.isAuthenticated,
    authStore.isInitialized,
    authStore.isLoading,
    authStore.user,
    authStore.error,
    login,
    loginWithPhone,
    checkUserExists,
    register,
    registerWithOnboarding,
    logout,
    clearError,
    checkAuth,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default StableAuthProvider;




