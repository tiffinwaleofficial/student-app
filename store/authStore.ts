import { create } from 'zustand';
import { RegisterRequest, CustomerProfile } from '@/types/api';
import { authService } from '@/utils/authService';
import api from '@/utils/apiClient';
import { getErrorMessage, isNetworkError, isAuthError } from '@/utils/errorHandler';
import { tokenManager } from '@/utils/tokenManager';
import { nativeWebSocketService } from '@/services/nativeWebSocketService';
import { config } from '@/config'; // Use centralized config
import i18n from '@/i18n/config';

interface AuthState {
  user: CustomerProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  isLoggingOut: boolean; // Add flag to prevent double logout
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string, firebaseUid: string) => Promise<void>;
  checkUserExists: (phoneNumber: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<void>;
  registerWithOnboarding: (onboardingData: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<CustomerProfile>) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set: any, get: any) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
  isLoggingOut: false,

  initializeAuth: async () => {
    if (__DEV__) console.log('🔍 AuthStore: Starting authentication initialization');
    set({ isLoading: true, error: null });
    
    try {
      // Debug: Check what's in storage
      const token = await authService.getToken();
      const user = await authService.getCurrentUser();
      if (__DEV__) console.log('🔍 AuthStore: Storage check:', { 
        hasToken: !!token, 
        tokenLength: token?.length || 0,
        hasUser: !!user,
        userId: user?.id 
      });
      
      // First check if we have a valid token locally
      const isAuthenticated = await authService.isAuthenticated();
      if (__DEV__) console.log('🔍 AuthStore: Local auth check result:', isAuthenticated);
      
      if (isAuthenticated) {
        // Get user from storage first
        const storedUser = await authService.getCurrentUser();
        if (__DEV__) console.log('🔍 AuthStore: Stored user:', storedUser ? 'Found' : 'Not found');
        
        if (storedUser) {
          // Validate token with backend
          if (__DEV__) console.log('🔍 AuthStore: Validating token with backend...');
          const isValidWithBackend = await authService.validateToken();
          if (__DEV__) console.log('🔍 AuthStore: Backend validation result:', isValidWithBackend);
          
          if (isValidWithBackend) {
            if (__DEV__) console.log('✅ AuthStore: Auth initialized successfully with valid user');
            set({ 
              user: storedUser, 
              isAuthenticated: true, 
              isLoading: false,
              isInitialized: true,
              error: null
            });
            return;
          } else {
            if (__DEV__) console.log('⚠️ AuthStore: Token invalid with backend, clearing auth');
            await authService.logout();
          }
        } else {
          if (__DEV__) console.log('⚠️ AuthStore: No stored user found, clearing auth');
          await authService.logout();
        }
      }
      
      // If we reach here, user is not authenticated
      if (__DEV__) console.log('🔍 AuthStore: User not authenticated, setting initial state');
      set({ 
        user: null,
        isAuthenticated: false, 
        isLoading: false,
        isInitialized: true,
        error: null
      });
      
    } catch (error) {
      console.error('❌ AuthStore: Auth initialization error:', error);
      const errorMessage = getErrorMessage(error);
      set({ 
        user: null,
        isAuthenticated: false, 
        isLoading: false,
        isInitialized: true,
        error: errorMessage
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      
      // Store tokens securely using TokenManager
      await tokenManager.storeTokens(response.accessToken, response.refreshToken);
      await tokenManager.storeUserData(response.user);
      
      set({ 
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false 
      });
      
      if (__DEV__) console.log('✅ AuthStore: Login successful, tokens stored securely');
      
      // Connect WebSocket after successful login
      try {
        await nativeWebSocketService.connect();
        if (__DEV__) console.log('✅ AuthStore: Native WebSocket connected after login');
      } catch (wsError) {
        if (__DEV__) console.warn('⚠️ AuthStore: Failed to connect native WebSocket after login:', wsError);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  loginWithPhone: async (phoneNumber: string, firebaseUid: string) => {
    set({ isLoading: true, error: null });
    try {
      if (__DEV__) console.log('📱 AuthStore: Attempting phone login for:', phoneNumber);
      
      // Call backend API for phone login with customer role
      const response = await fetch(`${config.api.baseUrl}/api/auth/login-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber, 
          firebaseUid,
          role: 'customer' // Student app is for customers
        }),
      });

      if (!response.ok) {
        throw new Error(i18n.t('auth:phoneLoginFailed'));
      }

      const data = await response.json();
      
      // Handle both token formats and validate tokens exist
      const accessToken = data.token || data.accessToken;
      const refreshToken = data.refreshToken;
      
      if (!accessToken) {
        throw new Error(i18n.t('auth:noAccessToken'));
      }
      
      // Store tokens securely using TokenManager
      await tokenManager.storeTokens(accessToken, refreshToken);
      await tokenManager.storeUserData(data.user);
      
      set({ 
        user: data.user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false 
      });
      
      if (__DEV__) console.log('✅ AuthStore: Phone login successful');
      
      // Connect WebSocket after successful login
      try {
        await nativeWebSocketService.connect();
        if (__DEV__) console.log('✅ AuthStore: Native WebSocket connected after phone login');
      } catch (wsError) {
        if (__DEV__) console.warn('⚠️ AuthStore: Failed to connect native WebSocket after phone login:', wsError);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  checkUserExists: async (phoneNumber: string): Promise<boolean> => {
    try {
      if (__DEV__) console.log('🔍 AuthStore: Checking if user exists for phone:', phoneNumber);
      
      // Call backend API to check user existence with role 'customer'
      const response = await fetch(`${config.api.baseUrl}/api/auth/check-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          role: 'customer' // Student app is for customers
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('❌ AuthStore: Error checking user existence:', error);
      return false;
    }
  },

  register: async (userData: RegisterRequest) => {
    console.log('🏪 AuthStore: register function called with:', userData);
    set({ isLoading: true, error: null });
    try {
      console.log('🏪 AuthStore: Calling authService.register');
      const response = await authService.register(userData);
      console.log('✅ AuthStore: authService.register completed successfully');
      set({ 
        user: response.user,
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      console.error('❌ AuthStore: Registration error:', error);
      const errorMessage = getErrorMessage(error);
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },

  registerWithOnboarding: async (onboardingData: any) => {
    console.log('🏪 AuthStore: registerWithOnboarding called with:', onboardingData);
    set({ isLoading: true, error: null });
    try {
      // Map onboarding data to registration format
      const registrationData = {
        // Personal info
        firstName: onboardingData.personalInfo?.firstName,
        lastName: onboardingData.personalInfo?.lastName,
        email: onboardingData.personalInfo?.email,
        phoneNumber: onboardingData.phoneVerification?.phoneNumber,
        
        // Food preferences
        cuisinePreferences: onboardingData.foodPreferences?.cuisinePreferences || [],
        dietaryType: onboardingData.foodPreferences?.dietaryType,
        spiceLevel: onboardingData.foodPreferences?.spiceLevel || 3,
        allergies: onboardingData.foodPreferences?.allergies || [],
        
        // Delivery location
        address: onboardingData.deliveryLocation?.address,
        addressType: onboardingData.deliveryLocation?.addressType,
        deliveryInstructions: onboardingData.deliveryLocation?.deliveryInstructions,
        
        // Role
        role: 'customer' as const,
      };

      console.log('🏪 AuthStore: Mapped registration data:', registrationData);
      
      // Call backend API for registration with onboarding data
      const response = await fetch(`${config.api.baseUrl}/api/auth/register-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        throw new Error(i18n.t('auth:registrationFailed'));
      }

      const data = await response.json();
      
      // Store tokens securely using TokenManager (handle both token formats)
      const accessToken = data.token || data.accessToken;
      await tokenManager.storeTokens(accessToken, data.refreshToken);
      await tokenManager.storeUserData(data.user);
      
      set({ 
        user: data.user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false 
      });
      
      console.log('✅ AuthStore: Registration with onboarding successful');
      
      // Connect WebSocket after successful registration
      try {
        await nativeWebSocketService.connect();
        console.log('✅ AuthStore: Native WebSocket connected after registration');
      } catch (wsError) {
        console.warn('⚠️ AuthStore: Failed to connect native WebSocket after registration:', wsError);
      }
    } catch (error) {
      console.error('❌ AuthStore: Registration with onboarding error:', error);
      const errorMessage = getErrorMessage(error);
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    const currentState = get();
    
    // Prevent double logout calls
    if (currentState.isLoggingOut) {
      if (__DEV__) console.log('🚪 AuthStore: Logout already in progress, skipping');
      return;
    }
    
    if (__DEV__) console.log('🚪 AuthStore: Starting logout process');
    set({ isLoggingOut: true, isLoading: true, error: null });
    
    try {
      await authService.logout();
      if (__DEV__) console.log('✅ AuthStore: Logout API call completed');
      
      // Disconnect WebSocket
      try {
        nativeWebSocketService.disconnect();
        console.log('✅ AuthStore: Native WebSocket disconnected on logout');
      } catch (wsError) {
        console.warn('⚠️ AuthStore: Failed to disconnect WebSocket on logout:', wsError);
      }
      
      // Clear all tokens using TokenManager
      await tokenManager.clearTokens();
      
      set({ 
        user: null,
        token: null,
        isAuthenticated: false, 
        isLoading: false,
        isLoggingOut: false 
      });
    } catch (error) {
      console.error('❌ AuthStore: Logout error:', error);
      const errorMessage = getErrorMessage(error);
      
      // Even if logout API fails, clear local state and tokens
      // Also disconnect WebSocket
      try {
        nativeWebSocketService.disconnect();
        console.log('✅ AuthStore: Native WebSocket disconnected on logout error');
      } catch (wsError) {
        console.warn('⚠️ AuthStore: Failed to disconnect WebSocket on logout error:', wsError);
      }
      
      await tokenManager.clearTokens();
      
      set({ 
        user: null,
        token: null,
        isAuthenticated: false,
        error: errorMessage, 
        isLoading: false,
        isLoggingOut: false 
      });
    }
  },

  fetchUserProfile: async () => {
    console.log('🔍 AuthStore: fetchUserProfile called');
    set({ isLoading: true, error: null });
    try {
      console.log('📱 AuthStore: Fetching user profile from API...');
      
      // Try to fetch from API first
      try {
        const profileData = await api.customer.getProfile();
        console.log('✅ AuthStore: Profile fetched from API:', profileData);
        
        // Update local storage with fresh data
        await authService.updateStoredUser(profileData);
        
        // Update subscription store if subscription data is available
        if ((profileData as any).currentSubscription) {
          console.log('🔔 AuthStore: Updating subscription store with profile data');
          const { useSubscriptionStore } = await import('./subscriptionStore');
          const subscriptionStore = useSubscriptionStore.getState();
          subscriptionStore.currentSubscription = (profileData as any).currentSubscription;
        }
        
        set({ user: profileData, isLoading: false });
        return;
      } catch (apiError) {
        console.log('⚠️ AuthStore: API fetch failed, falling back to stored user');
        console.error('API Error:', apiError);
        
        // Fallback to stored user if API fails
        const storedUser = await authService.getCurrentUser();
        console.log('👤 AuthStore: Stored user:', storedUser);
        
        if (storedUser) {
          console.log('✅ AuthStore: Using stored user data');
          set({ user: storedUser, isLoading: false });
        } else {
          console.log('❌ AuthStore: No user found in storage either');
          set({ 
            error: i18n.t('auth:userProfileNotFound'), 
            isLoading: false 
          });
        }
      }
    } catch (error) {
      console.error('❌ AuthStore: Error in fetchUserProfile:', error);
      const errorMessage = getErrorMessage(error);
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },

  updateUserProfile: async (data: Partial<CustomerProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await api.user.updateProfile(data);
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : i18n.t('auth:updateProfileFailed'), 
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));