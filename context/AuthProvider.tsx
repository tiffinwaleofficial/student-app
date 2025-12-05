import React, { createContext, useContext, useEffect, useState } from 'react';
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
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authStore = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Initialize authentication on mount
  useEffect(() => {
    if (!authStore.isInitialized) {
      if (__DEV__) console.log('🔍 AuthProvider: Initializing authentication');
      authStore.initializeAuth();
    }
  }, [authStore.isInitialized, authStore.initializeAuth]);

  // Listen for token expiration events
  useEffect(() => {
    let isHandlingTokenExpired = false;
    
    const handleTokenExpired = async () => {
      // Prevent multiple simultaneous token expiration handling
      if (isHandlingTokenExpired) {
        if (__DEV__) console.log('🚨 AuthProvider: Token expiration already being handled, skipping');
        return;
      }
      
      if (__DEV__) console.log('🚨 AuthProvider: Token expired event received');
      isHandlingTokenExpired = true;
      
      try {
        // Only logout if user is currently authenticated
        if (authStore.isAuthenticated && !authStore.isLoggingOut) {
          await authStore.logout();
        } else {
          if (__DEV__) console.log('🚨 AuthProvider: User already logged out or logout in progress');
        }
      } catch (error) {
        console.error('❌ AuthProvider: Error handling token expiration:', error);
      } finally {
        isHandlingTokenExpired = false;
      }
    };

    // Add event listener for token expiration
    const subscription = DeviceEventEmitter.addListener('auth:token-expired', handleTokenExpired);
    
    return () => {
      subscription.remove();
      isHandlingTokenExpired = false;
    };
  }, [authStore.isAuthenticated, authStore.isLoggingOut, authStore.logout]);

  // Periodically check authentication status (reduced frequency)
  useEffect(() => {
    // Disable periodic auth checks to prevent infinite loops
    // TODO: Re-enable with proper dependency management if needed
    return;
    
    if (authStore.isAuthenticated && !isCheckingAuth && !authStore.isLoggingOut) {
      const checkAuthInterval = setInterval(async () => {
        if (__DEV__) console.log('🔍 AuthProvider: Periodic auth check');
        
        // Skip if logout is in progress
        if (authStore.isLoggingOut) {
          if (__DEV__) console.log('🔍 AuthProvider: Logout in progress, skipping auth check');
          return;
        }
        
        setIsCheckingAuth(true);
        try {
          // Only check with backend if local token seems valid
          const isLocallyValid = await authService.isAuthenticated();
          if (!isLocallyValid) {
            if (__DEV__) console.log('🔍 AuthProvider: Local token invalid, logging out');
            if (!authStore.isLoggingOut) {
              await authStore.logout();
            }
            return;
          }
          
          // Check with backend less frequently
          const isValid = await authService.validateToken();
          if (!isValid) {
            console.log('🔍 AuthProvider: Backend validation failed, logging out');
            if (!authStore.isLoggingOut) {
              await authStore.logout();
            }
          } else {
            console.log('✅ AuthProvider: Periodic auth check passed');
          }
        } catch (error) {
          console.error('❌ AuthProvider: Auth check failed:', error);
          // Don't logout on network errors
          if (error instanceof Error && !error.message.includes('network') && !authStore.isLoggingOut) {
            await authStore.logout();
          }
        } finally {
          setIsCheckingAuth(false);
        }
      }, 10 * 60 * 1000); // Check every 10 minutes (reduced frequency)

      return () => clearInterval(checkAuthInterval);
    }
  }, []);

  const checkAuth = async () => {
    if (authStore.isAuthenticated) {
      const isValid = await authService.validateToken();
      if (!isValid) {
        await authStore.logout();
      }
    }
  };

  const value: AuthContextType = {
    isAuthenticated: authStore.isAuthenticated,
    isInitialized: authStore.isInitialized,
    isLoading: authStore.isLoading || isCheckingAuth,
    user: authStore.user,
    error: authStore.error,
    login: authStore.login,
    loginWithPhone: authStore.loginWithPhone,
    checkUserExists: authStore.checkUserExists,
    register: authStore.register,
    registerWithOnboarding: authStore.registerWithOnboarding,
    logout: authStore.logout,
    clearError: authStore.clearError,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
