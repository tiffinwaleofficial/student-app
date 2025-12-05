import { create } from 'zustand';
import api from '@/utils/apiClient';
import { Review } from '@/types';
import { getErrorMessage } from '@/utils/errorHandler';
import { cloudinaryDeleteService } from '@/services/cloudinaryDeleteService';

interface ReviewState {
  restaurantReviews: Review[];
  menuItemReviews: Review[];
  isLoading: boolean;
  error: string | null;

  // Restaurant reviews
  fetchRestaurantReviews: (restaurantId: string) => Promise<void>;
  
  // Menu item reviews
  fetchMenuItemReviews: (itemId: string) => Promise<void>;
  
  // Create review
  createReview: (data: {
    rating: number;
    comment?: string;
    images?: string[];
    restaurantId?: string;
    menuItemId?: string;
  }) => Promise<void>;
  
  // Mark helpful
  markHelpful: (reviewId: string, isHelpful?: boolean) => Promise<void>;
  
  // Update review
  updateReview: (reviewId: string, data: any) => Promise<void>;
  
  // Delete review
  deleteReview: (reviewId: string) => Promise<void>;
  
  // Clear error
  clearError: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  restaurantReviews: [],
  menuItemReviews: [],
  isLoading: false,
  error: null,

  fetchRestaurantReviews: async (restaurantId: string) => {
    set({ isLoading: true, error: null });
    try {
      const reviews = await api.reviews.getRestaurantReviews(restaurantId);
      // Map backend review format to frontend format
      const mappedReviews = reviews.map((review: any) => ({
        ...review,
        id: review._id || review.id,
        user: {
          id: review.user._id || review.user.id,
          firstName: review.user.firstName,
          lastName: review.user.lastName,
          name: review.user.firstName && review.user.lastName 
            ? `${review.user.firstName} ${review.user.lastName}`
            : review.user.name,
        },
      }));
      set({ restaurantReviews: mappedReviews, isLoading: false });
      console.log('✅ ReviewStore: Fetched restaurant reviews:', mappedReviews.length);
    } catch (error) {
      console.error('❌ ReviewStore: Error fetching restaurant reviews:', error);
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  fetchMenuItemReviews: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const reviews = await api.reviews.getMenuItemReviews(itemId);
      // Map backend review format to frontend format
      const mappedReviews = reviews.map((review: any) => {
        const mappedReview = {
          ...review,
          id: review._id || review.id,
          user: {
            id: review.user._id || review.user.id,
            firstName: review.user.firstName,
            lastName: review.user.lastName,
            name: review.user.firstName && review.user.lastName 
              ? `${review.user.firstName} ${review.user.lastName}`
              : review.user.name,
          },
        };
        console.log('🔍 ReviewStore: Mapped review:', { original: review, mapped: mappedReview });
        return mappedReview;
      });
      set({ menuItemReviews: mappedReviews, isLoading: false });
      console.log('✅ ReviewStore: Fetched menu item reviews:', mappedReviews.length);
    } catch (error) {
      console.error('❌ ReviewStore: Error fetching menu item reviews:', error);
      set({ error: getErrorMessage(error), isLoading: false });
    }
  },

  createReview: async (data) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔍 ReviewStore: Creating review with data:', data);
      
      // Determine the correct endpoint based on review type
      let review;
      if (data.restaurantId) {
        review = await api.reviews.createReview({
          rating: data.rating,
          comment: data.comment,
          images: data.images,
          restaurantId: data.restaurantId,
        });
      } else if (data.menuItemId) {
        review = await api.reviews.createReview({
          rating: data.rating,
          comment: data.comment,
          images: data.images,
          menuItemId: data.menuItemId,
        });
      } else {
        throw new Error('Either restaurantId or menuItemId must be provided');
      }
      
      // Map backend review format to frontend format
      const mappedReview = {
        ...review,
        id: (review as any)._id || review.id,
        user: {
          id: (review.user as any)._id || review.user.id,
          firstName: (review.user as any).firstName,
          lastName: (review.user as any).lastName,
          name: (review.user as any).firstName && (review.user as any).lastName 
            ? `${(review.user as any).firstName} ${(review.user as any).lastName}`
            : review.user.name,
        },
      };
      
      // Update local state based on review type
      if (data.restaurantId) {
        set((state) => ({
          restaurantReviews: [...state.restaurantReviews, mappedReview],
          isLoading: false,
        }));
      } else if (data.menuItemId) {
        set((state) => ({
          menuItemReviews: [...state.menuItemReviews, mappedReview],
          isLoading: false,
        }));
      }
      
      console.log('✅ ReviewStore: Created review successfully:', review);
    } catch (error) {
      console.error('❌ ReviewStore: Error creating review:', error);
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  markHelpful: async (reviewId: string, isHelpful: boolean = true) => {
    try {
      console.log('🔍 ReviewStore: Toggling helpful for review:', reviewId, 'isHelpful:', isHelpful);
      
      if (!reviewId || reviewId === 'undefined') {
        throw new Error('Invalid review ID provided');
      }
      
      // For now, we'll just update local state since the backend doesn't have toggle functionality
      // In a real implementation, you'd call a toggle API endpoint
      
      // Update local state
      set((state) => ({
        restaurantReviews: state.restaurantReviews.map(review =>
          review.id === reviewId
            ? { 
                ...review, 
                helpfulCount: isHelpful 
                  ? review.helpfulCount + 1 
                  : Math.max(0, review.helpfulCount - 1)
              }
            : review
        ),
        menuItemReviews: state.menuItemReviews.map(review =>
          review.id === reviewId
            ? { 
                ...review, 
                helpfulCount: isHelpful 
                  ? review.helpfulCount + 1 
                  : Math.max(0, review.helpfulCount - 1)
              }
            : review
        ),
      }));
      
      console.log('✅ ReviewStore: Toggled helpful status');
    } catch (error) {
      console.error('❌ ReviewStore: Error toggling helpful status:', error);
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  updateReview: async (reviewId: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔍 ReviewStore: Updating review:', reviewId, data);
      
      // Find the existing review to compare images
      const { restaurantReviews, menuItemReviews } = get();
      const existingReview = [...restaurantReviews, ...menuItemReviews].find(review => review.id === reviewId);
      
      const updatedReview = await api.reviews.updateReview(reviewId, data);
      
      // Check for removed images and clean them up from Cloudinary
      if (existingReview?.images && data.images) {
        const removedImages = existingReview.images.filter(img => !data.images.includes(img));
        
        if (removedImages.length > 0) {
          console.log('🗑️ ReviewStore: Cleaning up', removedImages.length, 'removed Cloudinary assets');
          
          if (cloudinaryDeleteService.isConfigured()) {
            const { success, failed } = await cloudinaryDeleteService.deleteMultipleAssets(removedImages);
            console.log(`📊 ReviewStore: Cloudinary cleanup - ${success} successful, ${failed} failed`);
          } else {
            console.warn('⚠️ ReviewStore: Cloudinary delete service not configured, skipping asset cleanup');
          }
        }
      }
      
      // Map the response to match our frontend Review type
      const mappedReview: Review = {
        id: updatedReview._id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        images: updatedReview.images || [],
        helpfulCount: updatedReview.helpfulCount || 0,
        createdAt: updatedReview.createdAt,
        user: {
          id: updatedReview.user._id,
          firstName: updatedReview.user.firstName,
          lastName: updatedReview.user.lastName,
          name: updatedReview.user.firstName && updatedReview.user.lastName
            ? `${updatedReview.user.firstName} ${updatedReview.user.lastName}`
            : updatedReview.user.name,
        },
      };

      // Update local state
      set((state) => ({
        restaurantReviews: state.restaurantReviews.map(review =>
          review.id === reviewId ? mappedReview : review
        ),
        menuItemReviews: state.menuItemReviews.map(review =>
          review.id === reviewId ? mappedReview : review
        ),
        isLoading: false,
      }));
      
      console.log('✅ ReviewStore: Updated review successfully');
    } catch (error) {
      console.error('❌ ReviewStore: Error updating review:', error);
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  deleteReview: async (reviewId: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔍 ReviewStore: Deleting review:', reviewId);
      
      // Find the review to get its images before deletion
      const { restaurantReviews, menuItemReviews } = get();
      const reviewToDelete = [...restaurantReviews, ...menuItemReviews].find(review => review.id === reviewId);
      
      // Delete from backend first
      await api.reviews.deleteReview(reviewId);
      
      // Clean up Cloudinary assets if review had images
      if (reviewToDelete?.images && reviewToDelete.images.length > 0) {
        console.log('🗑️ ReviewStore: Cleaning up', reviewToDelete.images.length, 'Cloudinary assets');
        
        if (cloudinaryDeleteService.isConfigured()) {
          const { success, failed } = await cloudinaryDeleteService.deleteMultipleAssets(reviewToDelete.images);
          console.log(`📊 ReviewStore: Cloudinary cleanup - ${success} successful, ${failed} failed`);
        } else {
          console.warn('⚠️ ReviewStore: Cloudinary delete service not configured, skipping asset cleanup');
        }
      }
      
      // Remove from local state
      set((state) => ({
        restaurantReviews: state.restaurantReviews.filter(review => review.id !== reviewId),
        menuItemReviews: state.menuItemReviews.filter(review => review.id !== reviewId),
        isLoading: false,
      }));
      
      console.log('✅ ReviewStore: Deleted review successfully');
    } catch (error) {
      console.error('❌ ReviewStore: Error deleting review:', error);
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
