import { create } from 'zustand';
import { Meal } from '@/types';
import api from '@/utils/apiClient';
import { getErrorMessage } from '@/utils/errorHandler';

interface MealState {
  // Data
  todayMeals: Meal[];
  upcomingMeals: Meal[];
  mealHistory: Meal[];
  
  // Loading states
  isLoading: boolean;
  isLoadingToday: boolean;
  isLoadingUpcoming: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  
  // Cache management
  lastFetched: Date | null;
  lastTodayFetched: Date | null;
  lastUpcomingFetched: Date | null;
  lastHistoryFetched: Date | null;
  
  // Actions with smart caching
  fetchTodayMeals: (forceRefresh?: boolean) => Promise<void>;
  fetchUpcomingMeals: (forceRefresh?: boolean) => Promise<void>;
  fetchMealHistory: (forceRefresh?: boolean) => Promise<void>;
  refreshAllMealData: () => Promise<void>;
  
  // Meal actions
  rateMeal: (mealId: string, rating: number, comment?: string) => Promise<void>;
  skipMeal: (mealId: string, reason?: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const TODAY_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for today's meals (more frequent updates)

export const useMealStore = create<MealState>((set, get) => ({
  // Initial state
  todayMeals: [],
  upcomingMeals: [],
  mealHistory: [],
  isLoading: false,
  isLoadingToday: false,
  isLoadingUpcoming: false,
  isLoadingHistory: false,
  error: null,
  lastFetched: null,
  lastTodayFetched: null,
  lastUpcomingFetched: null,
  lastHistoryFetched: null,

  fetchTodayMeals: async (forceRefresh = false) => {
    console.log('🍽️ MealStore: fetchTodayMeals called with forceRefresh:', forceRefresh);
    const { lastTodayFetched, isLoadingToday } = get();
    
    // Check cache validity
    if (!forceRefresh && lastTodayFetched && isLoadingToday) {
      console.log('🔄 MealStore: Already fetching today\'s meals');
      return;
    }
    
    if (!forceRefresh && lastTodayFetched && Date.now() - lastTodayFetched.getTime() < TODAY_CACHE_DURATION) {
      console.log('📦 MealStore: Using cached today\'s meals');
      return;
    }

    set({ isLoadingToday: true, isLoading: true, error: null });
    try {
      console.log('🔔 MealStore: Fetching today\'s meals from orders...');
      
      // Fetch today's orders and convert to meals
      const { orderApi } = await import('@/lib/api/services/order.service');
      const todayOrders = await orderApi.getTodaysOrders(forceRefresh);
      console.log('✅ MealStore: Today\'s orders fetched:', todayOrders.length, todayOrders);
      
      // Convert orders to meals format
      const todayMeals: Meal[] = todayOrders.map((order: any) => ({
        id: order._id || order.id,
        orderId: order._id || order.id,
        mealType: order.mealType || order.deliverySlot || 'lunch',
        deliverySlot: order.deliverySlot || 'afternoon',
        deliveryTime: order.scheduledDeliveryTime || order.deliveryTimeRange,
        deliveryDate: order.deliveryDate || order.scheduledDeliveryTime,
        status: order.status || 'pending',
        partnerId: typeof order.businessPartner === 'string' ? order.businessPartner : (order.businessPartner?._id || order.businessPartner?.id),
        partnerName: typeof order.businessPartner === 'object' && order.businessPartner ? (order.businessPartner.businessName || order.businessPartner.name) : 'Partner',
        items: order.items || [],
        totalAmount: order.totalAmount || 0,
        rating: order.rating,
        review: order.review,
      }));
      
      console.log('✅ MealStore: Today\'s meals converted:', todayMeals.length);
      
      set({ 
        todayMeals,
        isLoadingToday: false,
        isLoading: false,
        lastTodayFetched: new Date(),
      });
    } catch (error) {
      // Handle network errors gracefully
      const errorMessage = (error as any)?.message || '';
      
      // Only log non-network errors to reduce console noise
      if (__DEV__ && !errorMessage.includes('Network Error')) {
        console.error('❌ MealStore: Error fetching today\'s meals:', error);
      }
      
      if (errorMessage.includes('Network Error') || errorMessage.includes('404')) {
        if (__DEV__) console.log('🔄 MealStore: Orders endpoint not available, setting empty state');
        set({ 
          todayMeals: [],
          isLoadingToday: false,
          isLoading: false,
          error: null // Don't show error to user for missing endpoints
        });
      } else {
        set({ 
          error: getErrorMessage(error), 
          isLoadingToday: false,
          isLoading: false,
        });
      }
    }
  },

  fetchUpcomingMeals: async (forceRefresh = false) => {
    const { lastUpcomingFetched, isLoadingUpcoming } = get();
    
    // Check cache validity
    if (!forceRefresh && lastUpcomingFetched && isLoadingUpcoming) {
      console.log('🔄 MealStore: Already fetching upcoming meals');
      return;
    }
    
    if (!forceRefresh && lastUpcomingFetched && Date.now() - lastUpcomingFetched.getTime() < CACHE_DURATION) {
      console.log('📦 MealStore: Using cached upcoming meals');
      return;
    }

    set({ isLoadingUpcoming: true, isLoading: true, error: null });
    try {
      console.log('🔔 MealStore: Fetching upcoming meals from orders...');
      
      // Fetch upcoming orders and convert to meals
      const { orderApi } = await import('@/lib/api/services/order.service');
      const upcomingOrders = await orderApi.getUpcomingOrders(forceRefresh);
      console.log('✅ MealStore: Upcoming orders fetched:', upcomingOrders.length, upcomingOrders);
      
      // Convert orders to meals format
      const upcomingMeals: Meal[] = upcomingOrders.map((order: any) => ({
        id: order._id || order.id,
        orderId: order._id || order.id,
        mealType: order.mealType || order.deliverySlot || 'lunch',
        deliverySlot: order.deliverySlot || 'afternoon',
        deliveryTime: order.scheduledDeliveryTime || order.deliveryTimeRange,
        deliveryDate: order.deliveryDate || order.scheduledDeliveryTime,
        status: order.status || 'pending',
        partnerId: typeof order.businessPartner === 'string' ? order.businessPartner : (order.businessPartner?._id || order.businessPartner?.id),
        partnerName: typeof order.businessPartner === 'object' && order.businessPartner ? (order.businessPartner.businessName || order.businessPartner.name) : 'Partner',
        items: order.items || [],
        totalAmount: order.totalAmount || 0,
        rating: order.rating,
        review: order.review,
      }));
      
      console.log('✅ MealStore: Upcoming meals converted:', upcomingMeals.length);
      
      set({ 
        upcomingMeals,
        isLoadingUpcoming: false,
        isLoading: false,
        lastUpcomingFetched: new Date(),
      });
    } catch (error) {
      const errorMessage = (error as any)?.message || '';
      if (__DEV__ && !errorMessage.includes('Network Error')) {
        console.error('❌ MealStore: Error fetching upcoming meals:', error);
      }
      set({ 
        error: getErrorMessage(error), 
        isLoadingUpcoming: false,
        isLoading: false,
      });
    }
  },

  fetchMealHistory: async (forceRefresh = false) => {
    const { lastHistoryFetched, isLoadingHistory } = get();
    
    // Check cache validity
    if (!forceRefresh && lastHistoryFetched && isLoadingHistory) {
      console.log('🔄 MealStore: Already fetching meal history');
      return;
    }
    
    if (!forceRefresh && lastHistoryFetched && Date.now() - lastHistoryFetched.getTime() < CACHE_DURATION) {
      console.log('📦 MealStore: Using cached meal history');
      return;
    }

    set({ isLoadingHistory: true, isLoading: true, error: null });
    try {
      console.log('🔔 MealStore: Fetching meal history...');
      
      const mealHistory = await api.meals.getHistory();
      console.log('✅ MealStore: Meal history fetched:', mealHistory);
      
      set({ 
        mealHistory,
        isLoadingHistory: false,
        isLoading: false,
        lastHistoryFetched: new Date(),
      });
    } catch (error) {
      const errorMessage = (error as any)?.message || '';
      if (__DEV__ && !errorMessage.includes('Network Error')) {
        console.error('❌ MealStore: Error fetching meal history:', error);
      }
      set({ 
        error: getErrorMessage(error), 
        isLoadingHistory: false,
        isLoading: false,
      });
    }
  },

  refreshAllMealData: async () => {
    console.log('🔄 MealStore: Refreshing all meal data...');
    
    // Force refresh all data
    await Promise.all([
      get().fetchTodayMeals(true),
      get().fetchUpcomingMeals(true),
      get().fetchMealHistory(true),
    ]);
    
    console.log('✅ MealStore: All meal data refreshed');
  },

  rateMeal: async (mealId: string, rating: number, comment?: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔔 MealStore: Rating meal:', mealId, 'with rating:', rating);
      
      await api.meals.rateMeal(mealId, rating, comment);
      console.log('✅ MealStore: Meal rated successfully');
      
      // Update local state to reflect the rating
      const { todayMeals, upcomingMeals, mealHistory } = get();
      
      const updateMealRating = (meal: Meal) => {
        if (meal.id === mealId) {
          return {
            ...meal,
            userRating: rating,
            userReview: comment
          };
        }
        return meal;
      };
      
      set({
        todayMeals: todayMeals.map(updateMealRating),
        upcomingMeals: upcomingMeals.map(updateMealRating),
        mealHistory: mealHistory.map(updateMealRating),
        isLoading: false
      });
    } catch (error) {
      console.error('❌ MealStore: Error rating meal:', error);
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error; // Re-throw for UI handling
    }
  },

  skipMeal: async (mealId: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔔 MealStore: Skipping meal:', mealId, 'with reason:', reason);
      
      await api.meals.skipMeal(mealId, reason);
      console.log('✅ MealStore: Meal skipped successfully');
      
      // Update local state to reflect the skip
      const { todayMeals, upcomingMeals, mealHistory } = get();
      
      const updateMealStatus = (meal: Meal) => {
        if (meal.id === mealId) {
          return {
            ...meal,
            status: 'skipped' as const
          };
        }
        return meal;
      };
      
      set({
        todayMeals: todayMeals.map(updateMealStatus),
        upcomingMeals: upcomingMeals.map(updateMealStatus),
        mealHistory: mealHistory.map(updateMealStatus),
        isLoading: false
      });
    } catch (error) {
      console.error('❌ MealStore: Error skipping meal:', error);
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error; // Re-throw for UI handling
    }
  },

  clearError: () => set({ error: null }),

  // Legacy methods for backward compatibility
  fetchMeals: async () => {
    console.log('⚠️ MealStore: fetchMeals is deprecated, use fetchMealHistory');
    return get().fetchMealHistory();
  },
}));