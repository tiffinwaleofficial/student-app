/**
 * Unified API Client for Student App
 * Single axios instance for all API calls with automatic token management
 * 
 * Features:
 * - Automatic token injection in requests
 * - Automatic token refresh on 401 errors
 * - Request/response interceptors
 * - Error handling and retry logic
 * - Consistent error formatting
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { secureTokenManager } from '@/auth/SecureTokenManager';
import { DeviceEventEmitter } from 'react-native';
import { config } from '@/config';

/**
 * Create axios instance with default configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${config.api.baseUrl}/api`,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically inject authentication token
 */
apiClient.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    try {
      const url = requestConfig.url || '';
      
      // Skip auth for public endpoints
      const publicEndpoints = [
        '/auth/login',
        '/auth/register',
        '/auth/register-customer',
        '/auth/check-phone',
        '/auth/login-phone',
        '/auth/refresh-token',
        '/auth/forgot-password',
      ];
      
      const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));
      
      if (isPublicEndpoint) {
        if (__DEV__) console.log('🔓 API: Public endpoint:', url);
        return requestConfig;
      }

      // Get and inject token from SecureTokenManager
      // Ensure SecureTokenManager is initialized
      if (!secureTokenManager.isInitialized) {
        await secureTokenManager.initialize();
      }
      
      const token = await secureTokenManager.getAccessToken();
      
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
        if (__DEV__) console.log('🔐 API: Token injected for:', url);
      } else {
        if (__DEV__) console.warn('⚠️ API: No token available for:', url);
      }
    } catch (error) {
      console.error('❌ API: Request interceptor error:', error);
    }
    
    return requestConfig;
  },
  (error: AxiosError): Promise<never> => {
    console.error('❌ API: Request interceptor failed:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle token refresh on 401 errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log successful responses in dev
    if (__DEV__) {
      console.log('✅ API Response:', response.config.url, response.status);
    }
    return response;
  },
  async (error: AxiosError): Promise<never> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (__DEV__) console.log('🚨 API: 401 Unauthorized for:', originalRequest.url);
      
      // Prevent infinite loops
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token using SecureTokenManager
        if (__DEV__) console.log('🔄 API: Attempting token refresh...');
        
        const refreshToken = await secureTokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Import auth service to refresh token
        const { authService } = await import('@/utils/authService');
        const response = await authService.refreshToken(refreshToken);
        
        // Store new tokens
        await secureTokenManager.storeTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        
          // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          if (__DEV__) console.log('✅ API: Token refreshed, retrying request');
          return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('❌ API: Token refresh error:', refreshError);
        await secureTokenManager.clearAll();
        
        // Emit auth error event
        DeviceEventEmitter.emit('auth:session-expired', {
          message: 'Session expired. Please login again.',
        });
      }
    }
    
    // Handle other errors
    if (__DEV__) {
      console.error('❌ API Error:', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.response?.data || error.message,
      });
    }
    
    return Promise.reject(error);
  }
);

/**
 * Error handling utility
 * Extracts user-friendly error messages
 */
export const handleApiError = (error: any, context: string): never => {
  if (__DEV__) console.error(`❌ API Error (${context}):`, error);
  
  let message = 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with error status
    message = error.response.data?.message || 
              error.response.data?.error || 
              error.response.statusText || 
              'Server error occurred';
  } else if (error.request) {
    // Request was made but no response received
    message = 'Network error. Please check your connection.';
  } else if (error.message) {
    // Something else happened
    message = error.message;
  }
  
  throw new Error(message);
};

/**
 * Retry mechanism with exponential backoff
 */
export const retryRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  maxRetries: number = config.api.retryAttempts,
  baseDelay: number = config.api.retryDelay
): Promise<AxiosResponse<T>> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status && status >= 400 && status < 500 && status !== 429) {
          throw lastError;
        }
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      
      if (__DEV__) {
        console.log(`🔄 API: Retry attempt ${attempt}/${maxRetries} in ${Math.round(delay)}ms`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

/**
 * Helper: Check if error is network error
 */
export const isNetworkError = (error: any): boolean => {
  return error.message === 'Network Error' || 
         error.code === 'ECONNABORTED' ||
         !error.response;
};

/**
 * Helper: Check if error is authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Helper: Check if error is server error
 */
export const isServerError = (error: any): boolean => {
  const status = error.response?.status;
  return status >= 500 && status < 600;
};

export default apiClient;
