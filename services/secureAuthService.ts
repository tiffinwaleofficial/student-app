import { authService } from '@/utils/authService';
import api from '@/utils/apiClient';
import { tokenManager } from '@/utils/tokenManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface AuthenticationResult {
  success: boolean;
  userExists: boolean;
  user?: any;
  token?: string;
  error?: string;
  requiresOnboarding?: boolean;
}

export interface SecurityValidation {
  isValid: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  reasons: string[];
}

class SecureAuthService {
  private readonly MAX_OTP_ATTEMPTS = 3;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Enhanced security validation for phone authentication
   */
  private async validateSecurityContext(phoneNumber: string): Promise<SecurityValidation> {
    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    try {
      // Check for suspicious patterns
      const attempts = await this.getOtpAttempts(phoneNumber);
      if (attempts >= this.MAX_OTP_ATTEMPTS) {
        reasons.push('Too many OTP attempts');
        riskLevel = 'high';
      }

      // Check device fingerprinting (basic)
      const deviceInfo = await this.getDeviceFingerprint();
      const knownDevice = await this.isKnownDevice(phoneNumber, deviceInfo);
      
      if (!knownDevice) {
        reasons.push('New device detected');
        if (riskLevel === 'low') riskLevel = 'medium';
      }

      // Check time-based patterns
      const lastLogin = await this.getLastLoginTime(phoneNumber);
      if (lastLogin) {
        const timeDiff = Date.now() - lastLogin;
        if (timeDiff < 60000) { // Less than 1 minute
          reasons.push('Rapid login attempts');
          riskLevel = 'high';
        }
      }

      return {
        isValid: riskLevel !== 'high',
        riskLevel,
        reasons
      };
    } catch (error) {
      console.error('Security validation error:', error);
      return {
        isValid: false,
        riskLevel: 'high',
        reasons: ['Security validation failed']
      };
    }
  }

  /**
   * Check if user exists in backend with enhanced security
   */
  async checkUserExistsSecurely(phoneNumber: string, firebaseUid: string): Promise<AuthenticationResult> {
    try {
      console.log('🔍 SecureAuth: Checking user existence for:', phoneNumber);

      // First, validate security context
      const securityCheck = await this.validateSecurityContext(phoneNumber);
      if (!securityCheck.isValid) {
        return {
          success: false,
          userExists: false,
          error: `Security validation failed: ${securityCheck.reasons.join(', ')}`,
        };
      }

      // Use auth store to check if user exists
      const { useAuthStore } = await import('@/store/authStore');
      const authStore = useAuthStore.getState();
      
      const userExists = await authStore.checkUserExists(phoneNumber);
      console.log('🔍 SecureAuth: User exists check:', userExists);

      if (userExists) {
        // User exists, attempt login
        console.log('✅ SecureAuth: User exists, attempting login');
        return await this.loginExistingUser(phoneNumber, firebaseUid);
      } else {
        // User doesn't exist, needs onboarding
        console.log('📝 SecureAuth: User does not exist, requires onboarding');
        return {
          success: true,
          userExists: false,
          requiresOnboarding: true,
        };
      }
    } catch (error: any) {
      console.error('❌ SecureAuth: Error checking user existence:', error);
      return {
        success: false,
        userExists: false,
        error: error.message || 'Failed to check user existence',
      };
    }
  }

  /**
   * Login existing user with enhanced security
   */
  private async loginExistingUser(phoneNumber: string, firebaseUid: string): Promise<AuthenticationResult> {
    try {
      console.log('🔐 SecureAuth: Logging in existing user');

      // Use auth store to login
      const { useAuthStore } = await import('@/store/authStore');
      const authStore = useAuthStore.getState();
      
      await authStore.loginWithPhone(phoneNumber, firebaseUid);
      
      // Get the updated auth state after login
      const updatedAuthStore = useAuthStore.getState();
      const currentUser = updatedAuthStore.user;
      const currentToken = updatedAuthStore.token;

      if (currentToken && currentUser) {
        // Store authentication data securely with the fresh token from auth store
        await this.storeAuthDataSecurely(currentToken, currentUser);
        
        // Update device fingerprint
        await this.updateDeviceFingerprint(phoneNumber);
        
        // Record successful login
        await this.recordSuccessfulLogin(phoneNumber);

        console.log('✅ SecureAuth: Login successful with token:', currentToken.substring(0, 20) + '...');
        return {
          success: true,
          userExists: true,
          user: currentUser,
          token: currentToken,
        };
      } else {
        throw new Error('Login failed - no token or user data received from auth store');
      }
    } catch (error: any) {
      console.error('❌ SecureAuth: Login failed:', error);
      
      // Record failed attempt
      await this.recordFailedAttempt(phoneNumber);
      
      return {
        success: false,
        userExists: true,
        error: error.message || 'Login failed',
      };
    }
  }

  /**
   * Store authentication data with enhanced security
   */
  private async storeAuthDataSecurely(token: string, user: any): Promise<void> {
    try {
      // Store with timestamp for session management
      const authData = {
        token,
        user,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.SESSION_TIMEOUT,
      };

      // Store tokens in tokenManager for API calls
      await tokenManager.storeTokens(token);
      
      // Update user data in authService
      await authService.updateStoredUser(user);
      
      // Store secure session data
      await AsyncStorage.setItem('secure_auth_data', JSON.stringify(authData));
      
      console.log('🔐 SecureAuth: Auth data stored securely in all systems');
      console.log('🔐 SecureAuth: Token stored in tokenManager');
      console.log('🔐 SecureAuth: User data updated in authService');
      console.log('🔐 SecureAuth: Session data stored with expiry:', new Date(authData.expiresAt).toISOString());
    } catch (error) {
      console.error('❌ SecureAuth: Failed to store auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Validate session security with automatic token refresh
   */
  async validateSession(): Promise<boolean> {
    try {
      const authDataStr = await AsyncStorage.getItem('secure_auth_data');
      if (!authDataStr) return false;

      const authData = JSON.parse(authDataStr);
      const now = Date.now();

      // Check if session has expired
      if (now > authData.expiresAt) {
        console.log('⚠️ SecureAuth: Session expired');
        await this.clearAuthData();
        return false;
      }

      // Check if token is about to expire (within 1 hour) and refresh if needed
      const timeUntilExpiry = authData.expiresAt - now;
      const oneHour = 60 * 60 * 1000;
      
      if (timeUntilExpiry < oneHour) {
        console.log('🔄 SecureAuth: Token expiring soon, attempting refresh');
        const refreshed = await this.refreshTokenIfNeeded();
        if (!refreshed) {
          console.log('❌ SecureAuth: Token refresh failed');
          await this.clearAuthData();
          return false;
        }
      }

      // Validate token with backend
      const isValid = await authService.validateToken();
      if (!isValid) {
        console.log('⚠️ SecureAuth: Token invalid with backend');
        await this.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ SecureAuth: Session validation failed:', error);
      return false;
    }
  }

  /**
   * Refresh token if needed to prevent expiry
   */
  private async refreshTokenIfNeeded(): Promise<boolean> {
    try {
      console.log('🔄 SecureAuth: Attempting token refresh');
      
      // Get current token from tokenManager
      const currentToken = await tokenManager.getAccessToken();
      if (!currentToken) {
        console.log('❌ SecureAuth: No current token for refresh');
        return false;
      }

      // Token refresh is handled by tokenManager automatically
      // Just verify we have a valid token after the refresh attempt
      const refreshedToken = await tokenManager.getAccessToken();
      
      if (refreshedToken && refreshedToken !== currentToken) {
        console.log('✅ SecureAuth: Token refreshed successfully');
        
        // Update our secure auth data with the new token
        const authDataStr = await AsyncStorage.getItem('secure_auth_data');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          authData.token = refreshedToken;
          authData.timestamp = Date.now();
          authData.expiresAt = Date.now() + this.SESSION_TIMEOUT;
          await AsyncStorage.setItem('secure_auth_data', JSON.stringify(authData));
        }
        
        return true;
      }

      console.log('ℹ️ SecureAuth: Token refresh not needed or failed');
      return false;
    } catch (error) {
      console.error('❌ SecureAuth: Token refresh error:', error);
      return false;
    }
  }

  /**
   * Clear authentication data
   */
  async clearAuthData(): Promise<void> {
    try {
      await tokenManager.clearTokens();
      await authService.logout();
      await AsyncStorage.removeItem('secure_auth_data');
      console.log('🧹 SecureAuth: Auth data cleared');
    } catch (error) {
      console.error('❌ SecureAuth: Failed to clear auth data:', error);
    }
  }

  /**
   * Get current valid token for API calls
   */
  async getCurrentToken(): Promise<string | null> {
    try {
      // First validate session to ensure token is still valid
      const isValid = await this.validateSession();
      if (!isValid) {
        console.log('⚠️ SecureAuth: Session invalid, no token available');
        return null;
      }

      // Get token from tokenManager (which handles refresh automatically)
      const token = await tokenManager.getAccessToken();
      if (token) {
        console.log('✅ SecureAuth: Valid token retrieved for API call');
        return token;
      }

      console.log('❌ SecureAuth: No valid token available');
      return null;
    } catch (error) {
      console.error('❌ SecureAuth: Error getting current token:', error);
      return null;
    }
  }

  // Security helper methods
  private async getOtpAttempts(phoneNumber: string): Promise<number> {
    try {
      const key = `otp_attempts_${phoneNumber}`;
      const attempts = await AsyncStorage.getItem(key);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch {
      return 0;
    }
  }

  private async recordFailedAttempt(phoneNumber: string): Promise<void> {
    try {
      const key = `otp_attempts_${phoneNumber}`;
      const attempts = await this.getOtpAttempts(phoneNumber);
      await AsyncStorage.setItem(key, (attempts + 1).toString());
      
      // Set expiry for attempts counter
      setTimeout(async () => {
        await AsyncStorage.removeItem(key);
      }, this.LOCKOUT_DURATION);
    } catch (error) {
      console.error('Failed to record failed attempt:', error);
    }
  }

  private async recordSuccessfulLogin(phoneNumber: string): Promise<void> {
    try {
      // Clear failed attempts on successful login
      await AsyncStorage.removeItem(`otp_attempts_${phoneNumber}`);
      
      // Record last login time
      const key = `last_login_${phoneNumber}`;
      await AsyncStorage.setItem(key, Date.now().toString());
    } catch (error) {
      console.error('Failed to record successful login:', error);
    }
  }

  private async getLastLoginTime(phoneNumber: string): Promise<number | null> {
    try {
      const key = `last_login_${phoneNumber}`;
      const time = await AsyncStorage.getItem(key);
      return time ? parseInt(time, 10) : null;
    } catch {
      return null;
    }
  }

  private async getDeviceFingerprint(): Promise<string> {
    try {
      // Basic device fingerprinting
      const platform = Platform.OS;
      const version = Platform.Version;
      
      // In a real app, you'd collect more device info
      const fingerprint = `${platform}_${version}_${Date.now()}`;
      return fingerprint;
    } catch {
      return 'unknown_device';
    }
  }

  private async isKnownDevice(phoneNumber: string, fingerprint: string): Promise<boolean> {
    try {
      const key = `device_${phoneNumber}`;
      const knownFingerprint = await AsyncStorage.getItem(key);
      return knownFingerprint === fingerprint;
    } catch {
      return false;
    }
  }

  private async updateDeviceFingerprint(phoneNumber: string): Promise<void> {
    try {
      const fingerprint = await this.getDeviceFingerprint();
      const key = `device_${phoneNumber}`;
      await AsyncStorage.setItem(key, fingerprint);
    } catch (error) {
      console.error('Failed to update device fingerprint:', error);
    }
  }
}

export const secureAuthService = new SecureAuthService();
export default secureAuthService;
