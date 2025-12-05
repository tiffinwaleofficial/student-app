import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { secureTokenManager } from './SecureTokenManager';
import { AuthErrorType } from './types';
import { DeviceEventEmitter } from 'react-native';
import { API_BASE_URL } from '@/utils/apiConfig';

class AuthInterceptor {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  /**
   * Initialize axios interceptors
   */
  initialize(axiosInstance: typeof axios) {
    // Request interceptor - attach access token
    axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await secureTokenManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized responses
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              const token = secureTokenManager.getAccessToken();
              if (originalRequest.headers && token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const success = await this.refreshTokens();
            
            if (success) {
              // Process queued requests
              this.processQueue(null);
              
              // Retry original request with new token
              const newToken = await secureTokenManager.getAccessToken();
              if (originalRequest.headers && newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return axiosInstance(originalRequest);
            } else {
              // Refresh failed, logout user
              this.processQueue(new Error('Token refresh failed'));
              this.handleAuthFailure();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.handleAuthFailure();
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    console.log('🔐 AuthInterceptor: Initialized successfully');
  }

  /**
   * Refresh authentication tokens
   */
  private async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = await secureTokenManager.getRefreshToken();
      
      if (!refreshToken) {
        console.log('❌ AuthInterceptor: No refresh token available');
        return false;
      }

      // Make refresh request (without interceptor to avoid infinite loop)
      const response = await axios.post('/auth/refresh', {
        refreshToken
      }, {
        baseURL: `${API_BASE_URL}/api`,
        timeout: 10000
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      await secureTokenManager.storeTokens({
        accessToken,
        refreshToken: newRefreshToken || refreshToken
      });

      console.log('✅ AuthInterceptor: Tokens refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ AuthInterceptor: Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure() {
    console.log('🚨 AuthInterceptor: Authentication failed, clearing tokens');
    
    // Clear all stored tokens
    secureTokenManager.clearAll();
    
    // Emit auth failure event
    DeviceEventEmitter.emit('auth:token-expired');
  }

  /**
   * Manually refresh tokens (can be called externally)
   */
  async manualRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      return false;
    }

    this.isRefreshing = true;
    try {
      const success = await this.refreshTokens();
      return success;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Check if currently refreshing tokens
   */
  get isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }
}

export const authInterceptor = new AuthInterceptor();
export default authInterceptor;
