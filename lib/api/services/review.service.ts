/**
 * Review API Service
 * All review-related API endpoints
 */

import { apiClient, handleApiError, retryRequest } from '../client';

export interface Review {
  _id: string;
  customer: string | {
    _id: string;
    name: string;
    email?: string;
    profilePicture?: string;
  };
  restaurant: string | {
    _id: string;
    businessName: string;
    logoUrl?: string;
  };
  order?: string;
  rating: number;
  comment?: string;
  images?: string[];
  partnerResponse?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewDto {
  restaurant: string;
  order?: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
  images?: string[];
}

export const reviewApi = {
  /**
   * Create a review for a partner
   */
  createReview: async (data: CreateReviewDto): Promise<Review> => {
    try {
      const response = await retryRequest(() =>
        apiClient.post<Review>('/reviews', data)
      );
      console.log('✅ Review submitted successfully');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'createReview');
    }
  },

  /**
   * Get all reviews by current user
   */
  getMyReviews: async (): Promise<Review[]> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Review[]>('/reviews/me')
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getMyReviews');
    }
  },

  /**
   * Get reviews for a specific partner
   */
  getPartnerReviews: async (partnerId: string, page = 1, limit = 10): Promise<{ reviews: Review[]; total: number; averageRating: number }> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Review[]>(`/reviews/partner/${partnerId}`, {
          params: { page, limit },
        })
      );
      
      const reviews = response.data;
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      
      return {
        reviews,
        total: reviews.length,
        averageRating,
      };
    } catch (error: any) {
      return handleApiError(error, 'getPartnerReviews');
    }
  },

  /**
   * Get review by ID
   */
  getReviewById: async (reviewId: string): Promise<Review> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Review>(`/reviews/${reviewId}`)
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getReviewById');
    }
  },

  /**
   * Update a review
   */
  updateReview: async (reviewId: string, data: UpdateReviewDto): Promise<Review> => {
    try {
      const response = await retryRequest(() =>
        apiClient.patch<Review>(`/reviews/${reviewId}`, data)
      );
      console.log('✅ Review updated successfully');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'updateReview');
    }
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    try {
      await retryRequest(() =>
        apiClient.delete(`/reviews/${reviewId}`)
      );
      console.log('✅ Review deleted successfully');
    } catch (error: any) {
      return handleApiError(error, 'deleteReview');
    }
  },

  /**
   * Check if user can review a partner (must have completed order)
   */
  canReviewPartner: async (partnerId: string): Promise<boolean> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<{ canReview: boolean }>(`/reviews/can-review/${partnerId}`)
      );
      return response.data.canReview;
    } catch (error: any) {
      console.error('❌ Failed to check review eligibility:', error);
      return false;
    }
  },
};

