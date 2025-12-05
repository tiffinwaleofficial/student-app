import { create } from 'zustand';
import api from '@/utils/apiClient';

interface Promotion {
  id: string;
  code: string;
  description: string;
  discount: number;
}

interface MarketingState {
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;
  fetchPromotions: () => Promise<void>;
  applyPromotion: (code: string) => Promise<void>;
}

export const useMarketingStore = create<MarketingState>((set) => ({
  promotions: [],
  isLoading: false,
  error: null,

  fetchPromotions: async () => {
    set({ isLoading: true, error: null });
    try {
      const promotions = await api.marketing.getActivePromotions();
      set({ promotions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch promotions',
        isLoading: false,
      });
    }
  },

  applyPromotion: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.marketing.applyPromotion(code);
      set({ isLoading: false });
      // Optionally, you might want to refetch user data or subscription status
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to apply promotion',
        isLoading: false,
      });
      throw error; // re-throw to be caught in the component
    }
  },
})); 