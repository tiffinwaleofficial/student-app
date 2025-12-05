/**
 * TiffinWale Secure API Client
 * Enhanced API client with automatic token management and validation
 * 
 * Features:
 * - Automatic token injection in all requests
 * - Token refresh on 401 errors
 * - Request/response interceptors
 * - Centralized error handling
 * - No hardcoded credentials
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenManager } from './tokenManager';
import { API_CONFIG } from './apiConfig';

class SecureApiClient {
  private static instance: SecureApiClient;
  private axiosInstance: AxiosInstance;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): SecureApiClient {
    if (!SecureApiClient.instance) {
      SecureApiClient.instance = new SecureApiClient();
    }
    return SecureApiClient.instance;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add token to all requests
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await tokenManager.getAccessToken();
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔐 SecureApiClient: Token added to request');
        } else {
          console.warn('⚠️ SecureApiClient: No token available for request');
        }

        // Log request details (excluding sensitive data)
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        
        return config;
      },
      (error) => {
        console.error('❌ SecureApiClient: Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle token refresh on 401
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`📥 API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log('🔄 SecureApiClient: Attempting token refresh due to 401');
            const newToken = await tokenManager.refreshAccessToken();

            if (newToken) {
              console.log('✅ SecureApiClient: Token refreshed successfully');
              
              // Process failed queue
              this.processQueue(null, newToken);
              
              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              
              return this.axiosInstance(originalRequest);
            } else {
              console.log('❌ SecureApiClient: Token refresh failed, clearing auth');
              this.processQueue(new Error('Token refresh failed'), null);
              
              // Clear tokens and redirect to login
              await tokenManager.clearTokens();
              
              // Emit auth error event for app to handle
              this.emitAuthError();
              
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error('❌ SecureApiClient: Token refresh error:', refreshError);
            this.processQueue(refreshError, null);
            
            await tokenManager.clearTokens();
            this.emitAuthError();
            
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Log other errors
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Emit authentication error event
   */
  private emitAuthError(): void {
    // You can implement custom event emission here
    // For now, we'll just log it
    console.log('🚨 SecureApiClient: Authentication error - user should be logged out');
    
    // You could dispatch a custom event here that the app listens to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-error'));
    }
  }

  /**
   * Make GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * Make POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T = any>(
    url: string,
    file: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  }

  /**
   * Update base URL (useful for environment switching)
   */
  updateBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
    console.log('🌐 SecureApiClient: Base URL updated to:', baseURL);
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.axiosInstance.defaults.baseURL || '';
  }

  /**
   * Add custom header to all requests
   */
  setDefaultHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  /**
   * Remove custom header
   */
  removeDefaultHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }

  /**
   * Get axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Test connection to API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.get('/health');
      console.log('✅ SecureApiClient: Connection test successful');
      return true;
    } catch (error) {
      console.error('❌ SecureApiClient: Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get request statistics
   */
  getStats(): {
    baseURL: string;
    isRefreshing: boolean;
    queuedRequests: number;
  } {
    return {
      baseURL: this.getBaseURL(),
      isRefreshing: this.isRefreshing,
      queuedRequests: this.failedQueue.length,
    };
  }
}

// Export singleton instance
export const secureApiClient = SecureApiClient.getInstance();

// Export class for type definitions
export { SecureApiClient };

