/**
 * Subscription API Service
 * All subscription management API endpoints
 */

import { apiClient, handleApiError, retryRequest } from '../client';
import { SubscriptionPlan } from './subscription-plan.service';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface Subscription {
  _id: string;
  customer: string | {
    _id: string;
    name: string;
    email: string;
  };
  subscriptionPlan: string | SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  nextDeliveryDate?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  deliverySlot?: string;
  deliveryTimeRange?: string;
  pausedDates?: string[];
  skippedDates?: string[];
  customizations?: Array<{
    date: string;
    customization: string;
  }>;
  paymentDetails?: {
    method: string;
    transactionId: string;
    amount: number;
    paidAt: string;
  };
  autoRenewal?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDto {
  subscriptionPlan: string;
  startDate: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  deliverySlot?: string;
  paymentDetails?: {
    method: string;
    transactionId: string;
    amount: number;
  };
  autoRenewal?: boolean;
}

export interface UpdateSubscriptionDto {
  status?: SubscriptionStatus;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  deliverySlot?: string;
  autoRenewal?: boolean;
}

export const subscriptionApi = {
  /**
   * Create a new subscription
   */
  createSubscription: async (data: CreateSubscriptionDto): Promise<Subscription> => {
    try {
      const response = await retryRequest(() =>
        apiClient.post<Subscription>('/subscriptions', data)
      );
      console.log('✅ Subscription created successfully');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'createSubscription');
    }
  },

  /**
   * Get current user's active subscriptions
   */
  getMyActiveSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Subscription[]>('/subscriptions/me/current')
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getMyActiveSubscriptions');
    }
  },

  /**
   * Get all user's subscriptions (active + past)
   */
  getMySubscriptions: async (): Promise<Subscription[]> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Subscription[]>('/subscriptions/me/all')
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getMySubscriptions');
    }
  },

  /**
   * Get subscription by ID
   */
  getSubscriptionById: async (subscriptionId: string): Promise<Subscription> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Subscription>(`/subscriptions/${subscriptionId}`)
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getSubscriptionById');
    }
  },

  /**
   * Update subscription
   */
  updateSubscription: async (subscriptionId: string, data: UpdateSubscriptionDto): Promise<Subscription> => {
    try {
      const response = await retryRequest(() =>
        apiClient.patch<Subscription>(`/subscriptions/${subscriptionId}`, data)
      );
      console.log('✅ Subscription updated successfully');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'updateSubscription');
    }
  },

  /**
   * Pause subscription
   */
  pauseSubscription: async (subscriptionId: string): Promise<Subscription> => {
    try {
      const response = await retryRequest(() =>
        apiClient.patch<Subscription>(`/subscriptions/${subscriptionId}/pause`)
      );
      console.log('✅ Subscription paused');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'pauseSubscription');
    }
  },

  /**
   * Resume subscription
   */
  resumeSubscription: async (subscriptionId: string): Promise<Subscription> => {
    try {
      const response = await retryRequest(() =>
        apiClient.patch<Subscription>(`/subscriptions/${subscriptionId}/resume`)
      );
      console.log('✅ Subscription resumed');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'resumeSubscription');
    }
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (subscriptionId: string): Promise<Subscription> => {
    try {
      const response = await retryRequest(() =>
        apiClient.patch<Subscription>(`/subscriptions/${subscriptionId}/cancel`)
      );
      console.log('✅ Subscription cancelled');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'cancelSubscription');
    }
  },

  /**
   * Add a pause date
   */
  addPauseDate: async (subscriptionId: string, date: string): Promise<Subscription> => {
    try {
      const response = await retryRequest(() =>
        apiClient.post<Subscription>(`/subscriptions/${subscriptionId}/pause-date`, { date })
      );
      console.log('✅ Pause date added');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'addPauseDate');
    }
  },

  /**
   * Skip a delivery date
   */
  skipDelivery: async (subscriptionId: string, date: string): Promise<Subscription> => {
    try {
      const response = await retryRequest(() =>
        apiClient.post<Subscription>(`/subscriptions/${subscriptionId}/skip`, { date })
      );
      console.log('✅ Delivery skipped');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'skipDelivery');
    }
  },

  /**
   * Regenerate orders for an existing subscription
   */
  regenerateOrders: async (subscriptionId: string): Promise<{ success: boolean; ordersCreated: number; errors: number }> => {
    try {
      const response = await retryRequest(() =>
        apiClient.post<{ success: boolean; ordersCreated: number; errors: number }>(
          `/subscriptions/${subscriptionId}/regenerate-orders`
        )
      );
      console.log('✅ Orders regeneration completed');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'regenerateOrders');
    }
  },
};

