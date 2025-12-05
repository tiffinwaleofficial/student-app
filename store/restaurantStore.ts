import { create } from 'zustand';
import { Restaurant, MenuItem } from '@/types';
import api from '@/utils/apiClient';

interface RestaurantState {
  restaurants: Restaurant[];
  featuredRestaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  currentRestaurantMenu: MenuItem[] | null;
  isLoading: boolean;
  error: string | null;
  
  fetchRestaurants: () => Promise<void>;
  fetchFeaturedRestaurants: () => Promise<void>;
  fetchRestaurantById: (id: string) => Promise<void>;
  fetchMenuForRestaurant: (partnerId: string) => Promise<void>;
  searchRestaurants: (query: string) => Promise<void>;
  filterRestaurants: (cuisineType?: string, rating?: number) => Promise<void>;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurants: [],
  featuredRestaurants: [],
  currentRestaurant: null,
  currentRestaurantMenu: null,
  isLoading: false,
  error: null,
  
  fetchRestaurants: async () => {
    console.log('🏪 RestaurantStore: fetchRestaurants called');
    set({ isLoading: true, error: null });
    try {
      // Fetch restaurants from real API
      const partners = await api.partners.getAll() as any[];
      
      // Map Partner data to Restaurant interface
      const restaurants: Restaurant[] = partners.map((partner: any) => ({
        ...partner,
        id: partner._id, // Map MongoDB _id to id field
        name: partner.businessName,
        rating: partner.averageRating || 0,
        reviewCount: partner.totalReviews || 0,
        image: partner.logoUrl || partner.bannerUrl || 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
        formattedAddress: `${partner.address.street}, ${partner.address.city}, ${partner.address.state}`,
        cuisineType: partner.cuisineTypes || [],
      }));
      
      set({ 
        restaurants,
        isLoading: false 
      });
    } catch (error) {
      // Handle network errors gracefully
      const errorMessage = (error as any)?.message || '';
      
      // Only log non-network errors to reduce console noise
      if (__DEV__ && !errorMessage.includes('Network Error')) {
        console.error('Error fetching restaurants:', error);
      }
      
      if (errorMessage.includes('Network Error') || errorMessage.includes('404')) {
        if (__DEV__) console.log('🔄 RestaurantStore: Partners endpoint not available, setting empty state');
        set({ 
          restaurants: [],
          isLoading: false,
          error: null // Don't show error to user for missing endpoints
        });
      } else {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch restaurants', 
          isLoading: false 
        });
      }
    }
  },
  
  fetchFeaturedRestaurants: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all restaurants and select featured ones
      const allRestaurants = await api.partners.getAll() as any[];
      
      // Select top restaurants by rating as featured
      const featured: Restaurant[] = [...allRestaurants]
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 2)
        .map((partner: any) => ({
          ...partner,
          id: partner._id, // Map MongoDB _id to id field
          name: partner.businessName,
          rating: partner.averageRating || 0,
          reviewCount: partner.totalReviews || 0,
          image: partner.logoUrl || partner.bannerUrl || 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
          formattedAddress: `${partner.address.street}, ${partner.address.city}, ${partner.address.state}`,
          cuisineType: partner.cuisineTypes || [],
        }));
      
      set({ 
        featuredRestaurants: featured,
        isLoading: false 
      });
    } catch (error) {
      if (__DEV__) console.error('Error fetching featured restaurants:', error);
      
      // Handle network errors gracefully
      const errorMessage = (error as any)?.message || '';
      if (errorMessage.includes('Network Error') || errorMessage.includes('404')) {
        if (__DEV__) console.log('🔄 RestaurantStore: Featured partners endpoint not available, setting empty state');
        set({ 
          featuredRestaurants: [],
          isLoading: false,
          error: null
        });
      } else {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch featured restaurants', 
          isLoading: false 
        });
      }
    }
  },
  
  fetchRestaurantById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch restaurant details from real API
      const partner = await api.partners.getById(id) as any;
      
      const restaurant: Restaurant = {
        ...partner,
        id: partner._id, // Map MongoDB _id to id field
        name: partner.businessName,
        rating: partner.averageRating || 0,
        reviewCount: partner.totalReviews || 0,
        image: partner.logoUrl || partner.bannerUrl || 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
        formattedAddress: `${partner.address.street}, ${partner.address.city}, ${partner.address.state}`,
        cuisineType: partner.cuisineTypes || [],
      };
      
      set({ 
        currentRestaurant: restaurant,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch restaurant', 
        isLoading: false 
      });
    }
  },
  
  fetchMenuForRestaurant: async (partnerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const menuData = await api.menu.getByPartner(partnerId) as any;
      // Convert menu data to MenuItem array format
      const rawMenuItems = Array.isArray(menuData) ? menuData : (menuData.items || []);
      
      // Map MongoDB _id to id field for each menu item
      const menuItems: MenuItem[] = rawMenuItems.map((item: any) => ({
        ...item,
        id: item._id || item.id, // Use _id if available, fallback to id
      }));
      
      set({
        currentRestaurantMenu: menuItems,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching menu for restaurant:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch menu',
        isLoading: false,
      });
    }
  },
  
  searchRestaurants: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all restaurants and filter locally
      // In a real implementation, you might want to add a search endpoint to the backend
      const allPartners = await api.partners.getAll() as any[];
      
      const normalizedQuery = query.toLowerCase();
      
      const results: Restaurant[] = allPartners
        .filter((partner: any) => 
          partner.businessName?.toLowerCase().includes(normalizedQuery) ||
          partner.cuisineTypes?.some((cuisine: string) => cuisine.toLowerCase().includes(normalizedQuery)) ||
          `${partner.address.street}, ${partner.address.city}, ${partner.address.state}`.toLowerCase().includes(normalizedQuery)
        )
        .map((partner: any) => ({
          ...partner,
          id: partner._id, // Map MongoDB _id to id field
          name: partner.businessName,
          rating: partner.averageRating || 0,
          reviewCount: partner.totalReviews || 0,
          image: partner.logoUrl || partner.bannerUrl || 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
          formattedAddress: `${partner.address.street}, ${partner.address.city}, ${partner.address.state}`,
          cuisineType: partner.cuisineTypes || [],
        }));
      
      set({ 
        restaurants: results,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error searching restaurants:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search restaurants', 
        isLoading: false 
      });
    }
  },
  
  filterRestaurants: async (cuisineType?: string, rating?: number) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all restaurants and filter locally
      const allPartners = await api.partners.getAll() as any[];
      
      let results = [...allPartners];
      
      if (cuisineType) {
        results = results.filter((partner: any) => 
          partner.cuisineTypes?.some((cuisine: string) => 
            cuisine.toLowerCase() === cuisineType.toLowerCase()
          )
        );
      }
      
      if (rating) {
        results = results.filter((partner: any) => (partner.averageRating || 0) >= rating);
      }
      
      // Map filtered partners to Restaurant interface
      const restaurants: Restaurant[] = results.map((partner: any) => ({
        ...partner,
        id: partner._id, // Map MongoDB _id to id field
        name: partner.businessName,
        rating: partner.averageRating || 0,
        reviewCount: partner.totalReviews || 0,
        image: partner.logoUrl || partner.bannerUrl || 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
        formattedAddress: `${partner.address.street}, ${partner.address.city}, ${partner.address.state}`,
        cuisineType: partner.cuisineTypes || [],
      }));
      
      set({ 
        restaurants,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error filtering restaurants:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to filter restaurants', 
        isLoading: false 
      });
    }
  }
}));
