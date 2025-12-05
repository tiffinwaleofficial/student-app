import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { getWebSocketManager } from './websocketManager';
import { secureTokenManager } from '../auth/SecureTokenManager';
import { useAuthStore } from '@/store/authStore';
import {
  CustomerProfile,
  DeliveryAddress,
  OrderCreateData,
  Subscription,
  LoginResponse,
  RegisterRequest,
  Order,
  OrderTracking,
  Menu,
  MenuCategory,
  MenuItem,
  SubscriptionPlan,
  PaymentMethod,
  PaymentMethodData,
  PaymentData,
  PaymentResult,
  FeedbackData,
  Feedback,
  SupportTicketData,
  SupportTicket,
  MealCustomization,
  SubscriptionCreateData,
} from '../types/api';
import { Meal, Review } from '../types';

interface WebSocketMessage {
  type: string;
  channel?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

interface WebSocketCallback {
  (data: Record<string, unknown>): void;
}

import { generateIdempotencyKey, generateRequestHash, isStateChangingMethod } from './idempotency';
import { API_BASE_URL } from './apiConfig';

// Request deduplication map: tracks active requests by idempotency key
const activeRequests = new Map<string, AbortController>();

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding authentication token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    try {
      // Skip auth for login/register endpoints
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
        if (__DEV__) console.log('🔓 Skipping auth for public endpoint:', config.url);
        return config;
      }

      // Use SecureTokenManager for secure token management (handles refresh automatically)
      const token = await secureTokenManager.getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (__DEV__) console.log('🔐 SecureTokenManager: Adding auth token to request:', config.url);
      } else {
        if (__DEV__) console.warn('⚠️ SecureTokenManager: No valid token available for request:', config.url);

        // Check if user should be authenticated
        const hasTokens = await secureTokenManager.hasTokens();
        if (!hasTokens) {
          if (__DEV__) console.log('🚨 SecureTokenManager: User not authenticated, request may fail');
        }
      }
    } catch (error) {
      console.error('❌ SecureTokenManager: Error in request interceptor:', error);
    }

    // Request deduplication for state-changing methods
    const method = config.method?.toUpperCase() || 'GET';

    // Only apply idempotency to state-changing methods
    if (isStateChangingMethod(method)) {
      const requestKey = generateRequestHash(method, config.url || '', config.data);

      if (activeRequests.has(requestKey)) {
        // Cancel this NEW duplicate request - another identical request is already in flight
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort('Duplicate request cancelled - another identical request is already in progress');

        if (__DEV__) console.log('🚫 Duplicate request cancelled:', requestKey);
        return config; // Return early, request will be cancelled
      }

      // Create new abort controller for this request
      const controller = new AbortController();
      activeRequests.set(requestKey, controller);
      config.signal = controller.signal;

      // Add idempotency key
      const idempotencyKey = generateIdempotencyKey();
      config.headers['Idempotency-Key'] = idempotencyKey;

      // Store metadata for cleanup (using a custom property on config)
      // @ts-ignore - adding custom metadata
      config.metadata = {
        requestKey,
        idempotencyKey,
      };

      if (__DEV__) console.log('🔑 Idempotency key added:', idempotencyKey);
    }

    return config;
  },
  (error: AxiosError): Promise<never> => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh and cleanup
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Clean up active request tracking on success
    // @ts-ignore - accessing custom metadata
    if (response.config?.metadata?.requestKey) {
      // @ts-ignore
      activeRequests.delete(response.config.metadata.requestKey);
    }
    return response;
  },
  async (error: AxiosError): Promise<never> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; metadata?: { requestKey: string } };

    // Clean up active request tracking
    if (originalRequest?.metadata?.requestKey) {
      activeRequests.delete(originalRequest.metadata.requestKey);
    }

    // Handle cancelled requests (duplicate requests)
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      if (__DEV__) console.log('🚫 Request was cancelled:', error.message);
      return Promise.reject(error);
    }

    // Skip interceptor for logout calls to prevent infinite loops
    if (originalRequest.url?.includes('/api/auth/logout')) {
      if (__DEV__) console.log('🚪 Skipping interceptor for logout call');
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (token expired) using TokenManager
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (__DEV__) console.log('🚨 401 Unauthorized error for:', originalRequest.url);
      if (__DEV__) console.log('🔍 Error response:', error.response.data);

      originalRequest._retry = true;

      try {
        if (__DEV__) console.log('🔄 SecureTokenManager: Attempting to refresh token...');

        // Use SecureTokenManager to handle token refresh
        const refreshToken = await secureTokenManager.getRefreshToken();
        if (!refreshToken) {
          if (__DEV__) console.log('🔐 No refresh token available');
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint directly
        const refreshResponse = await apiClient.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        // Store new tokens
        await secureTokenManager.storeTokens({
          accessToken,
          refreshToken: newRefreshToken || refreshToken
        });

        const newToken = accessToken;

        if (newToken) {
          if (__DEV__) console.log('✅ SecureTokenManager: Token refreshed successfully');

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } else {
          if (__DEV__) console.log('❌ SecureTokenManager: Token refresh failed');

          // Clear all tokens and emit auth error
          await secureTokenManager.clearAll();

          // Emit logout event for the app to handle
          DeviceEventEmitter.emit('auth_error', {
            type: 'token_refresh_failed',
            message: 'Session expired. Please login again.'
          });
        }

        console.log('❌ No refresh token available or refresh failed');
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
      }

      // If refresh failed, clear all tokens and user data
      console.log('🧹 Clearing all auth tokens due to failed refresh');
      try {
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);

        // Emit a custom event to notify the app about auth failure
        DeviceEventEmitter.emit('auth:token-expired');
      } catch (clearError) {
        console.error('❌ Error clearing tokens:', clearError);
      }
    }

    return Promise.reject(error);
  }
);

// Common API methods
const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      });
      return response.data;
    },
    register: async (userData: RegisterRequest): Promise<LoginResponse> => {
      console.log('🌐 API Client: Making POST request to /api/auth/register');
      console.log('📤 Request URL:', `${API_BASE_URL}/api/auth/register`);
      console.log('📤 Request data:', userData);

      try {
        const response = await apiClient.post<LoginResponse>('/api/auth/register', userData);
        console.log('✅ API Response status:', response.status);
        console.log('✅ API Response data:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('❌ API Request failed:', error);
        if (error.response) {
          console.error('❌ Response status:', error.response.status);
          console.error('❌ Response data:', error.response.data);
        }
        throw error;
      }
    },
    changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
      await apiClient.post('/api/auth/change-password', {
        oldPassword,
        newPassword,
      });
    },
    logout: async (): Promise<void> => {
      try {
        await apiClient.post('/api/auth/logout');
      } catch (error) {
        // Logout should succeed even if API fails
        console.warn('Logout API call failed, but proceeding with local cleanup:', error);
      }
    },
    refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
      const response = await apiClient.post('/api/auth/refresh-token', { refreshToken });
      return response.data;
    },
    forgotPassword: async (email: string): Promise<void> => {
      await apiClient.post('/api/auth/forgot-password', { email });
    },
    resetPassword: async (token: string, newPassword: string): Promise<void> => {
      await apiClient.post('/api/auth/reset-password', { token, newPassword });
    },
  },

  // User endpoints
  user: {
    getProfile: async () => {
      const response = await apiClient.get('/users/profile');
      return response.data;
    },
    updateProfile: async (data: Partial<CustomerProfile>): Promise<CustomerProfile> => {
      const response = await apiClient.patch<CustomerProfile>('/users/profile', data);
      return response.data;
    },
  },

  // Customer endpoints
  customer: {
    getProfile: async (): Promise<CustomerProfile> => {
      const response = await apiClient.get<CustomerProfile>('/api/customers/profile');
      return response.data;
    },
    updateProfile: async (data: Partial<CustomerProfile>): Promise<CustomerProfile> => {
      const response = await apiClient.patch<CustomerProfile>('/api/customers/profile', data);
      return response.data;
    },
    getAddresses: async (): Promise<DeliveryAddress[]> => {
      const response = await apiClient.get<any[]>('/api/customers/addresses');
      console.log('🔍 Raw backend response:', response.data);
      // Transform backend response to frontend format
      const transformed = response.data.map((backendAddress: any) => {
        const transformedAddress = {
          id: backendAddress._id || backendAddress.id,
          address: backendAddress.addressLine1 || backendAddress.address,
          city: backendAddress.city,
          state: backendAddress.state,
          zipCode: backendAddress.postalCode || backendAddress.zipCode,
          landmark: backendAddress.landmark,
          phoneNumber: backendAddress.contactNumber || backendAddress.phoneNumber,
          type: backendAddress.label || backendAddress.type,
          displayName: backendAddress.label || backendAddress.type,
          isDefault: backendAddress.isDefault,
        };
        console.log('🔄 Transformed address:', transformedAddress);
        return transformedAddress;
      });
      return transformed;
    },
    addAddress: async (address: Omit<DeliveryAddress, 'id'>): Promise<DeliveryAddress> => {
      // Transform frontend address to backend format
      const backendAddress = {
        addressLine1: address.address,
        city: address.city,
        state: address.state,
        postalCode: address.zipCode,
        landmark: address.landmark || '',
        contactNumber: address.phoneNumber || '',
        label: address.type || 'Other',
        isDefault: address.isDefault,
      };

      const response = await apiClient.post<any>('/api/customers/addresses', backendAddress);
      // Transform backend response to frontend format
      const backendData = response.data;
      return {
        id: backendData._id || backendData.id,
        address: backendData.addressLine1 || backendData.address,
        city: backendData.city,
        state: backendData.state,
        zipCode: backendData.postalCode || backendData.zipCode,
        landmark: backendData.landmark,
        phoneNumber: backendData.contactNumber || backendData.phoneNumber,
        type: backendData.label || backendData.type,
        displayName: backendData.label || backendData.type,
        isDefault: backendData.isDefault,
      };
    },
    updateAddress: async (id: string, address: Partial<DeliveryAddress>): Promise<DeliveryAddress> => {
      // Transform frontend address to backend format
      const backendAddress = {
        addressLine1: address.address,
        city: address.city,
        state: address.state,
        postalCode: address.zipCode,
        landmark: address.landmark || '',
        contactNumber: address.phoneNumber || '',
        label: address.type || 'Other',
        isDefault: address.isDefault,
      };

      const response = await apiClient.patch<any>(`/api/customers/addresses/${id}`, backendAddress);
      // Transform backend response to frontend format
      const backendData = response.data;
      return {
        id: backendData._id || backendData.id,
        address: backendData.addressLine1 || backendData.address,
        city: backendData.city,
        state: backendData.state,
        zipCode: backendData.postalCode || backendData.zipCode,
        landmark: backendData.landmark,
        phoneNumber: backendData.contactNumber || backendData.phoneNumber,
        type: backendData.label || backendData.type,
        displayName: backendData.label || backendData.type,
        isDefault: backendData.isDefault,
      };
    },
    deleteAddress: async (id: string): Promise<void> => {
      console.log('🗑️ API Client: deleteAddress called with id:', id);
      console.log('🗑️ API Client: Making DELETE request to:', `/api/customers/addresses/${id}`);
      const response = await apiClient.delete(`/api/customers/addresses/${id}`);
      console.log('✅ API Client: Delete response:', response.status);
    },
    setDefaultAddress: async (id: string): Promise<void> => {
      await apiClient.patch(`/api/customers/addresses/${id}/default`);
    },
    // Additional methods that stores expect
    getOrders: async (): Promise<Order[]> => {
      const response = await apiClient.get<Order[]>('/api/customers/orders');
      return response.data;
    },
    getSubscriptions: async (): Promise<Subscription[]> => {
      const response = await apiClient.get<Subscription[]>('/api/customers/subscriptions');
      return response.data;
    },
  },

  // Order endpoints
  order: {
    create: async (orderData: OrderCreateData): Promise<Order> => {
      const response = await apiClient.post<Order>('/api/orders', orderData);
      return response.data;
    },
    getOrders: async (): Promise<Order[]> => {
      const response = await apiClient.get<Order[]>('/api/orders');
      return response.data;
    },
    getOrder: async (id: string): Promise<Order> => {
      const response = await apiClient.get<Order>(`/api/orders/${id}`);
      return response.data;
    },
    cancelOrder: async (id: string): Promise<void> => {
      await apiClient.patch(`/api/orders/${id}/cancel`);
    },
    trackOrder: async (id: string): Promise<OrderTracking> => {
      const response = await apiClient.get<OrderTracking>(`/api/orders/${id}/track`);
      return response.data;
    },
  },

  // Menu endpoints
  menu: {
    getMenu: async (): Promise<Menu> => {
      const response = await apiClient.get<Menu>('/api/menu');
      return response.data;
    },
    getCategories: async (): Promise<MenuCategory[]> => {
      const response = await apiClient.get<MenuCategory[]>('/api/menu/categories');
      return response.data;
    },
    getItemsByCategory: async (categoryId: string): Promise<MenuItem[]> => {
      const response = await apiClient.get<MenuItem[]>(`/api/menu/categories/${categoryId}/items`);
      return response.data;
    },
    // Additional methods that stores expect
    getAll: async (): Promise<Menu> => {
      const response = await apiClient.get<Menu>('/api/menu');
      return response.data;
    },
    getById: async (id: string): Promise<MenuItem> => {
      const response = await apiClient.get<MenuItem>(`/api/menu/${id}`);
      return response.data;
    },
    getByPartner: async (partnerId: string): Promise<Menu> => {
      const response = await apiClient.get<Menu>(`/api/menu/partner/${partnerId}`);
      return response.data;
    },
    getItemDetails: async (itemId: string): Promise<MenuItem> => {
      const response = await apiClient.get<MenuItem>(`/api/menu/item/${itemId}`);
      return response.data;
    },
  },

  // Reviews endpoints
  reviews: {
    getRestaurantReviews: async (restaurantId: string): Promise<Review[]> => {
      const response = await apiClient.get<Review[]>(`/api/reviews/restaurant/${restaurantId}`);
      return response.data;
    },
    getMenuItemReviews: async (itemId: string): Promise<Review[]> => {
      const response = await apiClient.get<Review[]>(`/api/reviews/menu-item/${itemId}`);
      return response.data;
    },
    createReview: async (data: any): Promise<Review> => {
      // Determine the correct endpoint based on data
      let endpoint = '/api/reviews';
      if (data.restaurantId) {
        endpoint = `/api/reviews/restaurant/${data.restaurantId}`;
      } else if (data.menuItemId) {
        endpoint = `/api/reviews/menu-item/${data.menuItemId}`;
      }

      console.log('🔍 API Client: Creating review at endpoint:', endpoint, 'with data:', data);

      const response = await apiClient.post<Review>(endpoint, {
        rating: data.rating,
        comment: data.comment,
        images: data.images,
      });
      return response.data;
    },
    markHelpful: async (reviewId: string): Promise<void> => {
      await apiClient.patch(`/api/reviews/${reviewId}/helpful`);
    },
    updateReview: async (id: string, data: any): Promise<any> => {
      const response = await apiClient.put(`/api/reviews/${id}`, data);
      return response.data;
    },
    deleteReview: async (id: string): Promise<void> => {
      await apiClient.delete(`/api/reviews/${id}`);
    },
  },

  // Meals endpoints
  meals: {
    getToday: async (): Promise<Meal[]> => {
      const response = await apiClient.get<Meal[]>('/api/meals/today');
      return response.data;
    },
    getHistory: async (): Promise<Meal[]> => {
      const response = await apiClient.get<Meal[]>('/api/meals/me/history');
      return response.data;
    },
    getUpcoming: async (): Promise<Meal[]> => {
      const response = await apiClient.get<Meal[]>('/api/meals/upcoming');
      return response.data;
    },
    getById: async (id: string): Promise<Meal> => {
      const response = await apiClient.get<Meal>(`/api/meals/${id}`);
      return response.data;
    },
    rateMeal: async (id: string, rating: number, comment?: string): Promise<void> => {
      await apiClient.post(`/api/meals/${id}/rate`, { rating, comment });
    },
    skipMeal: async (id: string, reason?: string): Promise<void> => {
      await apiClient.patch(`/api/meals/${id}/skip`, { reason });
    },
    updateStatus: async (id: string, status: string): Promise<void> => {
      await apiClient.patch(`/api/meals/${id}/status`, { status });
    },
    customizeMeal: async (id: string, customizations: MealCustomization): Promise<Meal> => {
      const response = await apiClient.post<Meal>(`/api/meals/${id}/customize`, customizations);
      return response.data;
    },
  },


  // Legacy orders endpoint for backward compatibility
  orders: {
    create: async (orderData: OrderCreateData): Promise<Order> => {
      const response = await apiClient.post<Order>('/api/orders', orderData);
      return response.data;
    },
    getAll: async (): Promise<Order[]> => {
      const response = await apiClient.get<Order[]>('/api/orders');
      return response.data;
    },
    getById: async (id: string): Promise<Order> => {
      const response = await apiClient.get<Order>(`/api/orders/${id}`);
      return response.data;
    },
    getByCustomer: async (): Promise<Order[]> => {
      // Use the correct endpoint that was already defined in order.getOrders
      const response = await apiClient.get<Order[]>('/api/orders/me');
      return response.data;
    },
    getMyOrders: async (): Promise<Order[]> => {
      // Alternative: get orders for current user
      const response = await apiClient.get<Order[]>('/api/orders/me');
      return response.data;
    },
    updateStatus: async (id: string, status: string): Promise<void> => {
      await apiClient.patch(`/api/orders/${id}/status`, { status });
    },
    addReview: async (id: string, rating: number, comment: string): Promise<void> => {
      await apiClient.patch(`/api/orders/${id}/review`, { rating, comment });
    },
  },

  // Legacy subscription endpoints for backward compatibility
  subscriptionPlans: {
    getAll: async (): Promise<SubscriptionPlan[]> => {
      const response = await apiClient.get<SubscriptionPlan[]>('/api/subscription-plans');
      return response.data;
    },
    getActive: async (): Promise<SubscriptionPlan[]> => {
      const response = await apiClient.get<SubscriptionPlan[]>('/api/subscription-plans/active');
      return response.data;
    },
    getById: async (id: string): Promise<SubscriptionPlan> => {
      const response = await apiClient.get<SubscriptionPlan>(`/api/subscription-plans/${id}`);
      return response.data;
    },
  },


  // Payment endpoints
  payment: {
    getMethods: async (): Promise<PaymentMethod[]> => {
      const response = await apiClient.get<PaymentMethod[]>('/api/payments/methods');
      return response.data;
    },
    addMethod: async (methodData: PaymentMethodData): Promise<PaymentMethod> => {
      const response = await apiClient.post<PaymentMethod>('/api/payments/methods', methodData);
      return response.data;
    },
    removeMethod: async (id: string): Promise<void> => {
      await apiClient.delete(`/api/payments/methods/${id}`);
    },
    setDefaultMethod: async (id: string): Promise<void> => {
      await apiClient.patch(`/api/payments/methods/${id}/default`);
    },
    processPayment: async (paymentData: PaymentData): Promise<PaymentResult> => {
      const response = await apiClient.post<PaymentResult>('/api/payments/process', paymentData);
      return response.data;
    },
  },

  // Feedback endpoints
  feedback: {
    submit: async (feedbackData: FeedbackData): Promise<Feedback> => {
      const response = await apiClient.post<Feedback>('/api/feedback', feedbackData);
      return response.data;
    },
    getFeedback: async (): Promise<Feedback[]> => {
      const response = await apiClient.get<Feedback[]>('/api/feedback');
      return response.data;
    },
  },

  // Support endpoints
  support: {
    createTicket: async (ticketData: SupportTicketData): Promise<SupportTicket> => {
      const response = await apiClient.post<SupportTicket>('/api/support/tickets', ticketData);
      return response.data;
    },
    getTickets: async (): Promise<SupportTicket[]> => {
      const response = await apiClient.get<SupportTicket[]>('/api/support/tickets');
      return response.data;
    },
    getTicket: async (id: string): Promise<SupportTicket> => {
      const response = await apiClient.get<SupportTicket>(`/api/support/tickets/${id}`);
      return response.data;
    },
    updateTicket: async (id: string, updates: Partial<SupportTicket>): Promise<SupportTicket> => {
      const response = await apiClient.put<SupportTicket>(`/api/support/tickets/${id}`, updates);
      return response.data;
    },
  },

  // Marketing endpoints
  marketing: {
    createReferral: async (): Promise<Record<string, unknown>> => {
      const response = await apiClient.post('/api/referrals');
      return response.data;
    },
    getUserReferrals: async (userId: string): Promise<Record<string, unknown>[]> => {
      const response = await apiClient.get(`/api/referrals/user/${userId}`);
      return response.data;
    },
    getActivePromotions: async (): Promise<Record<string, unknown>[]> => {
      const response = await apiClient.get('/api/marketing/promotions/active');
      return response.data;
    },
    applyPromotion: async (code: string): Promise<Record<string, unknown>> => {
      const response = await apiClient.post('/api/marketing/apply-promotion', { code });
      return response.data;
    },
  },

  // Subscriptions endpoints
  subscriptions: {
    getCurrent: async (): Promise<Subscription | null> => {
      try {
        const response = await apiClient.get('/api/subscriptions/me/current');
        return response.data || null;
      } catch (error: any) {
        // Handle 404 as no subscription (not an error)
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    getAll: async (): Promise<Subscription[]> => {
      const response = await apiClient.get('/api/subscriptions/me/all');
      return response.data;
    },
    create: async (planId: string): Promise<Subscription> => {
      // Get current user ID from auth store
      const authStore = useAuthStore.getState();
      const userId = authStore.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Default to 1 month

      // Get plan details to calculate total amount
      const plan = await api.subscriptionPlans.getById(planId);

      const subscriptionData = {
        customer: userId,
        plan: planId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalAmount: plan.price || 0,
        autoRenew: false,
        paymentFrequency: 'monthly',
        discountAmount: 0,
        isPaid: false,
        customizations: [],
      };

      const response = await apiClient.post('/api/subscriptions', subscriptionData);
      return response.data;
    },
    cancel: async (id: string, reason: string): Promise<void> => {
      await apiClient.patch(`/api/subscriptions/${id}/cancel?reason=${encodeURIComponent(reason)}`);
    },
    pause: async (id: string): Promise<void> => {
      await apiClient.patch(`/api/subscriptions/${id}/pause`);
    },
    resume: async (id: string): Promise<void> => {
      await apiClient.patch(`/api/subscriptions/${id}/resume`);
    },
  },

  // Notifications endpoints
  notifications: {
    getUserNotifications: async (userId: string, page = 1, limit = 20): Promise<Record<string, unknown>[]> => {
      const response = await apiClient.get(`/api/notifications/history?page=${page}&limit=${limit}`);
      return response.data;
    },
    markAsRead: async (id: string): Promise<void> => {
      await apiClient.patch(`/api/notifications/${id}/read`);
    },
    getOrderStatusUpdates: (orderId: string): EventSource => {
      // Server-Sent Events endpoint for real-time updates
      return new EventSource(`${API_BASE_URL}/api/notifications/orders/${orderId}/status`);
    },
  },

  // Partners/Restaurants endpoints
  partners: {
    getAll: async (): Promise<Record<string, unknown>[]> => {
      const response = await apiClient.get('/api/partners');
      return response.data;
    },
    getById: async (id: string): Promise<Record<string, unknown>> => {
      const response = await apiClient.get(`/api/partners/${id}`);
      return response.data;
    },
    getMenu: async (id: string): Promise<Record<string, unknown>> => {
      const response = await apiClient.get(`/api/partners/${id}/menu`);
      return response.data;
    },
    getReviews: async (id: string): Promise<Record<string, unknown>[]> => {
      const response = await apiClient.get(`/api/partners/${id}/reviews`);
      return response.data;
    },
    getStats: async (id: string): Promise<Record<string, unknown>> => {
      const response = await apiClient.get(`/api/partners/${id}/stats`);
      return response.data;
    },
    getSubscriptionPlans: async (id: string): Promise<SubscriptionPlan[]> => {
      const response = await apiClient.get(`/api/partners/${id}/plans`);
      return response.data;
    },
  },


  // Upload endpoints
  upload: {
    uploadImage: async (file: FormData, type: string = 'general'): Promise<{ url: string; publicId: string; type: string }> => {
      const response = await apiClient.post(`/api/upload/image?type=${type}`, file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    deleteImage: async (publicId: string): Promise<{ deleted: boolean; publicId: string }> => {
      const response = await apiClient.delete(`/api/upload/image/${publicId}`);
      return response.data;
    },
  },

  // WebSocket real-time methods
  websocket: {
    connect: async (): Promise<void> => {
      const wsManager = getWebSocketManager(API_BASE_URL);
      await wsManager.connect();
    },

    disconnect: (): void => {
      const wsManager = getWebSocketManager(API_BASE_URL);
      wsManager.disconnect();
    },

    subscribe: (channel: string, callback: WebSocketCallback): string => {
      const wsManager = getWebSocketManager(API_BASE_URL);
      return wsManager.subscribe(channel, callback);
    },

    unsubscribe: (subscriptionId: string): void => {
      const wsManager = getWebSocketManager(API_BASE_URL);
      wsManager.unsubscribe(subscriptionId);
    },

    send: (message: WebSocketMessage): void => {
      const wsManager = getWebSocketManager(API_BASE_URL);
      wsManager.send(message);
    },

    isConnected: (): boolean => {
      const wsManager = getWebSocketManager(API_BASE_URL);
      return wsManager.getState().isConnected;
    },

    getState: () => {
      const wsManager = getWebSocketManager(API_BASE_URL);
      return wsManager.getState();
    },
  },
};

export default api; 