import { create } from 'zustand';
import api from '@/utils/apiClient';

interface FeedbackData {
  type: 'bug' | 'suggestion' | 'complaint' | 'general';
  subject: string;
  message: string;
  category?: 'app' | 'service' | 'food' | 'delivery';
  rating?: number;
}

interface FeedbackState {
  isLoading: boolean;
  error: string | null;
  submitSuccess: boolean;
  
  // Actions
  submitFeedback: (feedbackData: FeedbackData) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  isLoading: false,
  error: null,
  submitSuccess: false,
  
  submitFeedback: async (feedbackData: FeedbackData) => {
    set({ isLoading: true, error: null, submitSuccess: false });
    try {
      await api.feedback.submit(feedbackData);
      
      set({ 
        isLoading: false,
        submitSuccess: true 
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit feedback', 
        isLoading: false,
        submitSuccess: false
      });
    }
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  clearSuccess: () => {
    set({ submitSuccess: false });
  },
})); 