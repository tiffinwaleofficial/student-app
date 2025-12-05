 /**
 * Partner API Service
 * All partner-related API endpoints for students
 */

import { apiClient, handleApiError, retryRequest } from '../client';

export interface Partner {
  _id: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  cuisineTypes?: string[];
  dietaryOptions?: string[];
  isVegetarian?: boolean;
  averageRating?: number;
  totalReviews?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  isAcceptingOrders?: boolean;
  deliveryRadius?: number;
  businessHours?: {
    open: string;
    close: string;
    days: string[];
  };
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PartnerStats {
  totalOrders: number;
  activeSubscriptions: number;
  totalCustomers: number;
  averageRating: number;
  totalReviews: number;
  totalRevenue: number;
}

export interface PartnerReview {
  _id: string;
  customer: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  rating: number;
  comment?: string;
  partnerResponse?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface SearchPartnersParams {
  city?: string;
  state?: string;
  cuisineType?: string;
  dietaryOption?: string;
  minRating?: number;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export const partnerApi = {
  /**
   * Get all active partners (for browsing)
   */
  getAllPartners: async (params?: SearchPartnersParams): Promise<{ partners: Partner[]; total: number }> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Partner[]>('/partners', { params })
      );
      return {
        partners: response.data,
        total: response.data.length,
      };
    } catch (error: any) {
      return handleApiError(error, 'getAllPartners');
    }
  },

  /**
   * Get partner details by ID
   */
  getPartnerById: async (partnerId: string): Promise<Partner> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Partner>(`/partners/${partnerId}`)
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getPartnerById');
    }
  },

  /**
   * Get partner statistics
   */
  getPartnerStats: async (partnerId: string): Promise<PartnerStats> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<PartnerStats>(`/partners/${partnerId}/stats`)
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getPartnerStats');
    }
  },

  /**
   * Get partner reviews
   */
  getPartnerReviews: async (partnerId: string, page = 1, limit = 10): Promise<{ reviews: PartnerReview[]; total: number }> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<PartnerReview[]>(`/partners/${partnerId}/reviews`, {
          params: { page, limit },
        })
      );
      return {
        reviews: response.data,
        total: response.data.length,
      };
    } catch (error: any) {
      return handleApiError(error, 'getPartnerReviews');
    }
  },

  /**
   * Search partners by location (city/state)
   */
  searchPartnersByLocation: async (city?: string, state?: string): Promise<Partner[]> => {
    try {
      const params: any = {};
      if (city) params.city = city;
      if (state) params.state = state;
      
      const response = await retryRequest(() =>
        apiClient.get<Partner[]>('/partners', { params })
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'searchPartnersByLocation');
    }
  },

  /**
   * Get nearby partners based on coordinates
   */
  getNearbyPartners: async (latitude: number, longitude: number, radiusKm = 10): Promise<Partner[]> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Partner[]>('/partners', {
          params: { latitude, longitude, radius: radiusKm },
        })
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getNearbyPartners');
    }
  },
};

