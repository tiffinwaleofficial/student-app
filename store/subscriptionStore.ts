import { create } from 'zustand';
import { Subscription } from '@/types';
import { SubscriptionPlan } from '@/types/api';
import api from '@/utils/apiClient';
import { getErrorMessage } from '@/utils/errorHandler';

interface SubscriptionState {
  // Data
  currentSubscription: Subscription | null;
  allSubscriptions: Subscription[];
  availablePlans: SubscriptionPlan[];

  // Loading states
  isLoading: boolean;
  isLoadingPlans: boolean;
  error: string | null;

  // Cache management
  lastFetched: Date | null;
  lastPlansFetched: Date | null;

  // Actions
  fetchCurrentSubscription: (forceRefresh?: boolean) => Promise<void>;
  fetchAllSubscriptions: (forceRefresh?: boolean) => Promise<void>;
  fetchAvailablePlans: (forceRefresh?: boolean, partnerId?: string) => Promise<void>;
  createSubscription: (planId: string) => Promise<void>;
  cancelSubscription: (subscriptionId: string, reason: string) => Promise<void>;
  pauseSubscription: (subscriptionId: string) => Promise<void>;
  resumeSubscription: (subscriptionId: string) => Promise<void>;
  refreshSubscriptionData: () => Promise<void>;
  clearError: () => void;
}

const CACHE_DURATION = 1 * 60 * 1000; // 1 minute (reduced for better freshness)

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  currentSubscription: null,
  allSubscriptions: [],
  availablePlans: [],
  isLoading: false,
  isLoadingPlans: false,
  error: null,
  lastFetched: null,
  lastPlansFetched: null,

  fetchCurrentSubscription: async (forceRefresh = false) => {
    console.log('💳 SubscriptionStore: fetchCurrentSubscription called with forceRefresh:', forceRefresh);
    const { lastFetched, isLoading } = get();

    // Check cache validity
    if (!forceRefresh && lastFetched && isLoading) {
      console.log('🔄 SubscriptionStore: Already fetching current subscription');
      return;
    }

    if (!forceRefresh && lastFetched && Date.now() - lastFetched.getTime() < CACHE_DURATION) {
      console.log('📦 SubscriptionStore: Using cached current subscription');
      return;
    }

    set({ isLoading: true, error: null });
    try {
      console.log('🔔 SubscriptionStore: Fetching current subscription...');

      const apiSubscription = await api.subscriptions.getCurrent();
      console.log('✅ SubscriptionStore: Current subscription fetched:', apiSubscription);

      // Map API subscription to frontend type
      // Handle both _id and id fields from backend
      const currentSubscription = apiSubscription ? {
        _id: apiSubscription._id || apiSubscription.id || '',
        id: apiSubscription.id || apiSubscription._id || '',
        customer: typeof apiSubscription.customer === 'string'
          ? apiSubscription.customer
          : (apiSubscription.customer?._id || apiSubscription.customer?.id || ''),
        plan: apiSubscription.plan && typeof apiSubscription.plan === 'object' ? {
          _id: apiSubscription.plan._id || apiSubscription.plan.id || '',
          id: apiSubscription.plan.id || apiSubscription.plan._id || '',
          name: apiSubscription.plan.name || '',
          description: apiSubscription.plan.description || '',
          price: apiSubscription.plan.price || 0,
          features: apiSubscription.plan.features || [],
          mealsPerDay: apiSubscription.plan.mealsPerDay || 2,
        } : {
          _id: typeof apiSubscription.plan === 'string' ? apiSubscription.plan : '',
          id: typeof apiSubscription.plan === 'string' ? apiSubscription.plan : '',
          name: '',
          description: '',
          price: 0,
          features: [],
          mealsPerDay: 2,
        },
        status: (apiSubscription.status === 'canceled' ? 'cancelled' : apiSubscription.status || 'pending') as 'active' | 'pending' | 'cancelled' | 'paused',
        startDate: apiSubscription.startDate || new Date().toISOString(),
        endDate: apiSubscription.endDate || new Date().toISOString(),
        autoRenew: apiSubscription.autoRenew || false,
        paymentFrequency: 'monthly' as const, // Default value
        totalAmount: (apiSubscription.plan && typeof apiSubscription.plan === 'object' ? apiSubscription.plan.price : 0) || 0,
        discountAmount: 0,
        isPaid: true, // Default value
        customizations: [],
        createdAt: apiSubscription.createdAt || new Date().toISOString(),
        updatedAt: apiSubscription.updatedAt || new Date().toISOString(),
      } : null;

      set({
        currentSubscription,
        isLoading: false,
        lastFetched: new Date(),
      });
    } catch (error) {
      // Handle network errors gracefully
      const errorMessage = (error as any)?.message || '';

      // Only log non-network errors to reduce console noise
      if (__DEV__ && !errorMessage.includes('Network Error')) {
        console.error('❌ SubscriptionStore: Error fetching current subscription:', error);
      }

      if (errorMessage.includes('Network Error') || errorMessage.includes('404')) {
        if (__DEV__) console.log('🔄 SubscriptionStore: Subscription endpoint not available, setting null state');
        set({
          currentSubscription: null,
          isLoading: false,
          error: null // Don't show error to user for missing endpoints
        });
      } else {
        set({
          error: getErrorMessage(error),
          isLoading: false
        });
      }
    }
  },

  fetchAllSubscriptions: async (forceRefresh = false) => {
    const { lastFetched, isLoading } = get();

    // Check cache validity
    if (!forceRefresh && lastFetched && isLoading) {
      console.log('🔄 SubscriptionStore: Already fetching all subscriptions');
      return;
    }

    if (!forceRefresh && lastFetched && Date.now() - lastFetched.getTime() < CACHE_DURATION) {
      console.log('📦 SubscriptionStore: Using cached all subscriptions');
      return;
    }

    set({ isLoading: true, error: null });
    try {
      console.log('🔔 SubscriptionStore: Fetching all subscriptions...');

      const apiSubscriptions = await api.subscriptions.getAll();
      console.log('✅ SubscriptionStore: All subscriptions fetched:', apiSubscriptions);

      // Map API subscriptions to frontend types
      const allSubscriptions = apiSubscriptions.map((apiSub: any) => ({
        _id: apiSub.id,
        id: apiSub.id,
        customer: typeof apiSub.customer === 'string' ? apiSub.customer : apiSub.customer.id,
        plan: {
          _id: apiSub.plan.id,
          id: apiSub.plan.id,
          name: apiSub.plan.name,
          description: apiSub.plan.description,
          price: apiSub.plan.price,
          features: apiSub.plan.features,
          mealsPerDay: apiSub.plan.mealsPerDay,
        },
        status: (apiSub.status === 'canceled' ? 'cancelled' : apiSub.status) as 'active' | 'pending' | 'cancelled' | 'paused',
        startDate: apiSub.startDate,
        endDate: apiSub.endDate,
        autoRenew: apiSub.autoRenew,
        paymentFrequency: 'monthly' as const,
        totalAmount: apiSub.plan.price,
        discountAmount: 0,
        isPaid: true,
        customizations: [],
        createdAt: apiSub.createdAt || new Date().toISOString(),
        updatedAt: apiSub.updatedAt || new Date().toISOString(),
      }));

      // Find current active subscription from all subscriptions
      const currentSubscription = allSubscriptions.find(
        (sub: any) => sub.status === 'active' || sub.status === 'pending'
      ) || null;

      set({
        allSubscriptions,
        currentSubscription,
        isLoading: false,
        lastFetched: new Date(),
      });
    } catch (error) {
      console.error('❌ SubscriptionStore: Error fetching all subscriptions:', error);
      set({
        error: getErrorMessage(error),
        isLoading: false
      });
    }
  },

  fetchAvailablePlans: async (forceRefresh = false, partnerId) => {
    const { lastPlansFetched, isLoadingPlans } = get();

    // Check cache validity
    if (!forceRefresh && lastPlansFetched && isLoadingPlans) {
      console.log('🔄 SubscriptionStore: Already fetching available plans');
      return;
    }

    if (!forceRefresh && lastPlansFetched && Date.now() - lastPlansFetched.getTime() < CACHE_DURATION) {
      console.log('📦 SubscriptionStore: Using cached available plans');
      return;
    }

    set({ isLoadingPlans: true, error: null });
    try {
      console.log('🔔 SubscriptionStore: Fetching available plans...');

      // Use the existing subscription plan API
      const apiPlans = partnerId
        ? await api.partners.getSubscriptionPlans(partnerId)
        : await api.subscriptionPlans.getAll();
      console.log('✅ SubscriptionStore: Available plans fetched:', apiPlans);

      // Map API plans to frontend types
      const availablePlans: SubscriptionPlan[] = apiPlans.map((apiPlan: any) => ({
        _id: apiPlan.id,
        id: apiPlan.id,
        name: apiPlan.name,
        description: apiPlan.description,
        price: apiPlan.price,
        features: apiPlan.features,
        mealsPerDay: apiPlan.mealsPerDay,
        duration: apiPlan.duration || 30, // Default to 30 days if missing
        durationValue: apiPlan.durationValue || 30,
        durationType: apiPlan.durationType || 'day',
        isActive: apiPlan.isActive !== undefined ? apiPlan.isActive : true,
        createdAt: apiPlan.createdAt || new Date().toISOString(),
        updatedAt: apiPlan.updatedAt || new Date().toISOString(),
      }));

      set({
        availablePlans,
        isLoadingPlans: false,
        lastPlansFetched: new Date(),
      });
    } catch (error) {
      console.error('❌ SubscriptionStore: Error fetching available plans:', error);
      set({
        error: getErrorMessage(error),
        isLoadingPlans: false
      });
    }
  },

  createSubscription: async (planId: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔔 SubscriptionStore: Creating subscription for plan:', planId);

      const newSubscription = await api.subscriptions.create(planId);
      console.log('✅ SubscriptionStore: Subscription created:', newSubscription);

      // Refresh data after creation
      await get().refreshSubscriptionData();
    } catch (error) {
      console.error('❌ SubscriptionStore: Error creating subscription:', error);
      set({
        error: getErrorMessage(error),
        isLoading: false
      });
      throw error; // Re-throw for UI handling
    }
  },

  cancelSubscription: async (subscriptionId: string, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔔 SubscriptionStore: Cancelling subscription:', subscriptionId);

      await api.subscriptions.cancel(subscriptionId, reason);
      console.log('✅ SubscriptionStore: Subscription cancelled');

      // Refresh data after cancellation
      await get().refreshSubscriptionData();
    } catch (error) {
      console.error('❌ SubscriptionStore: Error cancelling subscription:', error);
      set({
        error: getErrorMessage(error),
        isLoading: false
      });
    }
  },

  pauseSubscription: async (subscriptionId: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔔 SubscriptionStore: Pausing subscription:', subscriptionId);

      await api.subscriptions.pause(subscriptionId);
      console.log('✅ SubscriptionStore: Subscription paused');

      // Refresh data after pausing
      await get().refreshSubscriptionData();
    } catch (error) {
      console.error('❌ SubscriptionStore: Error pausing subscription:', error);
      set({
        error: getErrorMessage(error),
        isLoading: false
      });
    }
  },

  resumeSubscription: async (subscriptionId: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔔 SubscriptionStore: Resuming subscription:', subscriptionId);

      await api.subscriptions.resume(subscriptionId);
      console.log('✅ SubscriptionStore: Subscription resumed');

      // Refresh data after resuming
      await get().refreshSubscriptionData();
    } catch (error) {
      console.error('❌ SubscriptionStore: Error resuming subscription:', error);
      set({
        error: getErrorMessage(error),
        isLoading: false
      });
    }
  },

  refreshSubscriptionData: async () => {
    console.log('🔄 SubscriptionStore: Refreshing all subscription data...');

    // Force refresh all data
    await Promise.all([
      get().fetchCurrentSubscription(true),
      get().fetchAllSubscriptions(true),
      get().fetchAvailablePlans(true),
    ]);

    console.log('✅ SubscriptionStore: All subscription data refreshed');
  },

  clearError: () => set({ error: null }),

  // Legacy methods for backward compatibility
  fetchUserSubscriptions: async () => {
    console.log('⚠️ SubscriptionStore: fetchUserSubscriptions is deprecated, use fetchAllSubscriptions');
    return get().fetchAllSubscriptions();
  },

  fetchPlans: async () => {
    console.log('⚠️ SubscriptionStore: fetchPlans is deprecated, use fetchAvailablePlans');
    return get().fetchAvailablePlans();
  },

  fetchActivePlans: async () => {
    console.log('⚠️ SubscriptionStore: fetchActivePlans is deprecated, use fetchAvailablePlans');
    return get().fetchAvailablePlans();
  },
}));