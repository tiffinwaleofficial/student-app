/**
 * Subscription Plan API Service
 * All subscription plan-related API endpoints
 */

import { apiClient, handleApiError, retryRequest } from '../client';

export enum DurationType {
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
}

export enum MealFrequency {
  DAILY = 'daily',
  WEEKDAYS = 'weekdays',
  WEEKENDS = 'weekends',
  CUSTOM = 'custom',
}

export interface MealSpecification {
  rotis?: number;
  sabzis?: Array<{
    name: string;
    quantity: string;
  }>;
  dal?: {
    type: string;
    quantity: string;
  };
  rice?: {
    quantity: string;
    type?: string;
  };
  extras?: Array<{
    name: string;
    included: boolean;
    cost?: number;
  }>;
  salad?: boolean;
  curd?: boolean;
}

export interface WeeklyMenu {
  monday?: { breakfast?: string[]; lunch?: string[]; dinner?: string[] };
  tuesday?: { breakfast?: string[]; lunch?: string[]; dinner?: string[] };
  wednesday?: { breakfast?: string[]; lunch?: string[]; dinner?: string[] };
  thursday?: { breakfast?: string[]; lunch?: string[]; dinner?: string[] };
  friday?: { breakfast?: string[]; lunch?: string[]; dinner?: string[] };
  saturday?: { breakfast?: string[]; lunch?: string[]; dinner?: string[] };
  sunday?: { breakfast?: string[]; lunch?: string[]; dinner?: string[] };
}

export interface DeliverySlots {
  morning?: { enabled: boolean; timeRange: string };
  afternoon?: { enabled: boolean; timeRange: string };
  evening?: { enabled: boolean; timeRange: string };
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  durationValue: number;
  durationType: DurationType;
  mealFrequency: MealFrequency;
  mealsPerDay: number;
  deliveryFee?: number;
  features?: string[];
  imageUrl?: string;
  images?: string[];
  mealSpecification?: MealSpecification;
  partner?: string | {
    _id: string;
    businessName: string;
    logoUrl?: string;
    averageRating?: number;
  };
  maxPauseCount?: number;
  maxSkipCount?: number;
  maxCustomizationsPerDay?: number;
  termsAndConditions?: string;
  isActive: boolean;
  weeklyMenu?: WeeklyMenu;
  operationalDays?: string[];
  deliverySlots?: DeliverySlots;
  monthlyMenuVariation?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const subscriptionPlanApi = {
  /**
   * Get all active subscription plans
   */
  getAllActivePlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<SubscriptionPlan[]>('/subscription-plans/active')
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getAllActivePlans');
    }
  },

  /**
   * Get all plans (including inactive)
   */
  getAllPlans: async (): Promise<SubscriptionPlan[]> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<SubscriptionPlan[]>('/subscription-plans')
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getAllPlans');
    }
  },

  /**
   * Get subscription plan by ID
   */
  getPlanById: async (planId: string): Promise<SubscriptionPlan> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<SubscriptionPlan>(`/subscription-plans/${planId}`)
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getPlanById');
    }
  },

  /**
   * Get all plans for a specific partner
   */
  getPartnerPlans: async (partnerId: string): Promise<SubscriptionPlan[]> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<SubscriptionPlan[]>(`/partners/${partnerId}/plans`)
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getPartnerPlans');
    }
  },

  /**
   * Filter plans by criteria
   */
  filterPlans: async (filters: {
    minPrice?: number;
    maxPrice?: number;
    mealFrequency?: MealFrequency;
    mealsPerDay?: number;
    partnerId?: string;
  }): Promise<SubscriptionPlan[]> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<SubscriptionPlan[]>('/subscription-plans', { params: filters })
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'filterPlans');
    }
  },
};

