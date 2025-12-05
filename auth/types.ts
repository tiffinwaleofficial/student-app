import { CustomerProfile } from '@/types/api';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser extends CustomerProfile {
  // Add any additional auth-specific user properties if needed
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  // Firebase OTP methods (preserved)
  loginWithPhone: (phoneNumber: string, firebaseUid: string) => Promise<void>;
  checkUserExists: (phoneNumber: string) => Promise<boolean>;
  registerWithOnboarding: (onboardingData: any) => Promise<void>;
  
  // Core auth methods
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  clearError: () => void;
  
  // Utility methods
  getAccessToken: () => Promise<string | null>;
  isTokenValid: () => Promise<boolean>;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  user?: AuthUser;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  REFRESH_FAILED = 'REFRESH_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: any;
}
