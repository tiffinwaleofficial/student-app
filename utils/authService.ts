import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './apiClient';
import { LoginRequest, RegisterRequest, LoginResponse, CustomerProfile } from '../types/api';
import { API_BASE_URL } from './apiConfig';

// Use consistent token keys across the app
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

export const authService = {
  // Email/password login removed - using phone OTP only
  
  /**
   * Register a new user
   */
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    try {
      console.log('🔧 AuthService: Starting registration process');
      console.log('📥 Input userData:', userData);
      
      // Send only the fields expected by the backend register endpoint
      const registrationData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        role: userData.role
      };
      
      console.log('📤 Sending to API:', registrationData);
      console.log('🌐 API Base URL:', API_BASE_URL);
      
      const response = await api.auth.register(registrationData);
      
      console.log('✅ API Response received:', response);
      
      // Backend returns 'token' but we expect 'accessToken'
      const normalizedResponse = {
        ...response,
        accessToken: (response as any).token || response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user
      };
      
      // Store tokens and user data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, normalizedResponse.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, normalizedResponse.refreshToken);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(normalizedResponse.user));
      
      console.log('💾 Tokens stored successfully');
      console.log('✅ Token stored:', normalizedResponse.accessToken.substring(0, 20) + '...');
      
      return normalizedResponse;
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw error;
    }
  },
  
  /**
   * Logout user and clear stored tokens
   */
  logout: async (): Promise<void> => {
    console.log('🚪 AuthService: Starting logout process');
    try {
      // Call logout API (don't throw if it fails)
      try {
        await api.auth.logout();
        console.log('✅ AuthService: Logout API call successful');
      } catch (apiError) {
        console.warn('⚠️ AuthService: Logout API call failed, but continuing with local cleanup:', apiError);
        // Continue with local cleanup even if API fails
      }
      
      // Always clear local storage
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
      console.log('✅ AuthService: Local storage cleared');
    } catch (error) {
      console.error('❌ AuthService: Logout error:', error);
      // Even if there's an error, try to clear storage
      try {
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
        console.log('✅ AuthService: Local storage cleared after error');
      } catch (clearError) {
        console.error('❌ AuthService: Failed to clear local storage:', clearError);
      }
      throw error;
    }
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        console.log('🔍 No auth token found');
        return false;
      }
      
      // Enhanced token validation
      if (token.length < 10) {
        console.log('🔍 Token too short, clearing');
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        return false;
      }
      
      // Check if token is a valid JWT format
      if (!token.includes('.')) {
        console.log('🔍 Invalid token format, clearing');
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        return false;
      }
      
      // Try to decode JWT to check expiry (basic check)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('🔍 Token expired, clearing');
          await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
          return false;
        }
      } catch (decodeError) {
        console.log('🔍 Token decode error, clearing');
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        return false;
      }
      
      console.log('✅ Token is valid');
      return true;
    } catch (error) {
      console.error('❌ Auth check error:', error);
      return false;
    }
  },

  /**
   * Validate token with backend
   */
  validateToken: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        console.log('🔍 No token to validate');
        return false;
      }
      
      // First check local token validity
      const isLocallyValid = await authService.isAuthenticated();
      if (!isLocallyValid) {
        console.log('🔍 Token failed local validation');
        return false;
      }
      
      // Try to make a request to validate token with backend
      const { API_BASE_URL } = await import('./apiConfig');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/api/customers/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 401) {
        console.log('🔍 Token invalid on backend, clearing');
        await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
        return false;
      }
      
      if (response.ok) {
        console.log('✅ Token validated successfully with backend');
        return true;
      }
      
      console.log('🔍 Backend validation failed with status:', response.status);
      return false;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      // On network errors, don't clear tokens immediately - might be temporary
      if (error instanceof Error && error.message.includes('network')) {
        console.log('🔍 Network error during validation, keeping tokens');
        return true; // Assume token is still valid on network errors
      }
      
      // On other errors, clear tokens
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY]);
      return false;
    }
  },

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken: async (): Promise<string | null> => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        console.log('🔍 No refresh token available');
        return null;
      }

      const { API_BASE_URL } = await import('./apiConfig');
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token: newToken, refreshToken: newRefreshToken } = data;

        if (newToken) {
          // Store new tokens
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
          if (newRefreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }
          console.log('✅ Token refreshed successfully');
          return newToken;
        }
      }

      console.log('❌ Token refresh failed');
      return null;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return null;
    }
  },

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return true;
      
      // Basic JWT expiration check (this is a simplified check)
      // In production, you should decode the JWT and check the exp claim
      return false;
    } catch (error) {
      console.error('Token expiration check error:', error);
      return true;
    }
  },
  
  /**
   * Get the current authenticated user
   */
  getCurrentUser: async (): Promise<LoginResponse['user'] | null> => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  /**
   * Get the current auth token
   */
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    try {
      const response = await api.auth.refreshToken(refreshToken);
      
      // Get current user data from storage since refresh endpoint only returns tokens
      const currentUser = await authService.getCurrentUser();
      
      // Normalize response format to match LoginResponse interface
      const normalizedResponse: LoginResponse = {
        accessToken: response.token,
        refreshToken: response.refreshToken,
        user: currentUser || {} as any, // Use current user or empty object as fallback
      };
      
      return normalizedResponse;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },
  
  /**
   * Change user password
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.auth.changePassword(oldPassword, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  /**
   * Update stored user data
   */
  updateStoredUser: async (userData: CustomerProfile): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log('✅ User data updated in storage');
    } catch (error) {
      console.error('Update stored user error:', error);
      throw error;
    }
  },

  /**
   * Login with phone (Firebase OTP)
   */
  loginWithPhone: async (phoneNumber: string, firebaseUid: string): Promise<LoginResponse> => {
    try {
      console.log('📱 AuthService: Attempting phone login for:', phoneNumber);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber, 
          firebaseUid,
          role: 'customer' // Student app is for customers only
        }),
      });

      if (!response.ok) {
        throw new Error('Phone login failed');
      }

      const data = await response.json();
      
      // Normalize response
      const normalizedResponse = {
        ...data,
        accessToken: data.token || data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user
      };

      console.log('✅ AuthService: Phone login successful');
      return normalizedResponse;
    } catch (error) {
      console.error('❌ AuthService: Phone login error:', error);
      throw error;
    }
  },

  /**
   * Check if user exists by phone number
   */
  checkUserExists: async (phoneNumber: string): Promise<boolean> => {
    try {
      console.log('🔍 AuthService: Checking if user exists for phone:', phoneNumber);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/check-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          role: 'customer' // Student app is for customers only
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('❌ AuthService: Check user exists error:', error);
      return false;
    }
  },

  /**
   * Register with onboarding data
   */
  registerWithOnboarding: async (onboardingData: any): Promise<LoginResponse> => {
    try {
      console.log('🏪 AuthService: registerWithOnboarding called with:', onboardingData);
      
      // Map onboarding data to registration format for register-customer endpoint
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

      console.log('🏪 AuthService: Mapped registration data:', registrationData);

      const response = await fetch(`${API_BASE_URL}/api/auth/register-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Normalize response - backend returns accessToken directly
      const normalizedResponse = {
        ...data,
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken,
        user: data.user
      };

      console.log('✅ AuthService: Registration with onboarding successful');
      return normalizedResponse;
    } catch (error) {
      console.error('❌ AuthService: Registration with onboarding error:', error);
      throw error;
    }
  }
};

export default authService; 