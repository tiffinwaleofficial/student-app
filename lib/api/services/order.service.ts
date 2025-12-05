/**
 * Order API Service
 * All order-related API endpoints
 */

import { apiClient, handleApiError, retryRequest } from '../client';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Order {
  _id: string;
  customer: string | {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  businessPartner: string | {
    _id: string;
    businessName: string;
    logoUrl?: string;
    phoneNumber?: string;
  };
  subscription?: string;
  subscriptionPlan?: string | {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  status: OrderStatus;
  orderDate: string;
  deliveryDate: string;
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
  mealType?: 'breakfast' | 'lunch' | 'dinner';
  deliverySlot?: 'morning' | 'afternoon' | 'evening';
  deliveryTimeRange?: string;
  scheduledDeliveryTime?: string;
  deliveryInstructions?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  specialInstructions?: string;
  rating?: number;
  review?: string;
  preparedAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  businessPartner: string;
  subscriptionPlan?: string;
  deliveryDate: string;
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
  mealType?: 'breakfast' | 'lunch' | 'dinner';
  deliverySlot?: 'morning' | 'afternoon' | 'evening';
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod?: string;
  specialInstructions?: string;
}

// Simple in-memory cache to prevent duplicate API calls
let ordersCache: { data: Order[]; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 1000; // 30 seconds

export const orderApi = {
  /**
   * Get all orders for current user
   */
  getMyOrders: async (status?: OrderStatus, forceRefresh = false): Promise<Order[]> => {
    try {
      // Check cache first
      if (!forceRefresh && ordersCache && Date.now() - ordersCache.timestamp < CACHE_DURATION) {
        console.log('📦 Using cached orders');
        let cachedData = ordersCache.data;
        
        // Filter by status if requested
        if (status) {
          cachedData = cachedData.filter(order => order.status === status);
        }
        
        return cachedData;
      }

      const params: any = {};
      if (status) params.status = status;
      
      const response = await retryRequest(() =>
        apiClient.get<Order[]>('/orders/customer/my-orders', { params })
      );
      
      // Update cache
      ordersCache = {
        data: response.data,
        timestamp: Date.now()
      };
      
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getMyOrders');
    }
  },
  
  /**
   * Clear orders cache (call when orders are created/updated)
   */
  clearCache: () => {
    ordersCache = null;
  },

  /**
   * Get today's orders (client-side filtered)
   */
  getTodaysOrders: async (forceRefresh = false): Promise<Order[]> => {
    try {
      // Check cache first
      if (!forceRefresh && ordersCache && Date.now() - ordersCache.timestamp < CACHE_DURATION) {
        console.log('📦 Using cached orders for today filter');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return ordersCache.data.filter((order) => {
          const dateSource = order.deliveryDate || order.scheduledDeliveryTime;
          if (!dateSource) return false;
          const deliveryDate = new Date(dateSource);
          deliveryDate.setHours(0, 0, 0, 0);
          return deliveryDate >= today && deliveryDate < tomorrow;
        });
      }

      const response = await retryRequest(() =>
        apiClient.get<Order[]>('/orders/customer/my-orders')
      );
      
      // Update cache
      ordersCache = {
        data: response.data,
        timestamp: Date.now()
      };
      
      // Filter for today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return response.data.filter((order) => {
        // Use deliveryDate if available, otherwise fallback to scheduledDeliveryTime
        const dateSource = order.deliveryDate || order.scheduledDeliveryTime;
        if (!dateSource) return false;
        const deliveryDate = new Date(dateSource);
        deliveryDate.setHours(0, 0, 0, 0);
        return deliveryDate >= today && deliveryDate < tomorrow;
      });
    } catch (error: any) {
      return handleApiError(error, 'getTodaysOrders');
    }
  },

  /**
   * Get upcoming orders (client-side filtered)
   */
  getUpcomingOrders: async (forceRefresh = false): Promise<Order[]> => {
    try {
      // Check cache first
      if (!forceRefresh && ordersCache && Date.now() - ordersCache.timestamp < CACHE_DURATION) {
        console.log('📦 Using cached orders for upcoming filter');
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return ordersCache.data.filter((order) => {
          const dateSource = order.deliveryDate || order.scheduledDeliveryTime;
          if (!dateSource) return false;
          const deliveryDate = new Date(dateSource);
          deliveryDate.setHours(0, 0, 0, 0);
          return deliveryDate >= tomorrow;
        }).sort((a, b) => {
          const dateA = new Date(a.deliveryDate || a.scheduledDeliveryTime || 0);
          const dateB = new Date(b.deliveryDate || b.scheduledDeliveryTime || 0);
          return dateA.getTime() - dateB.getTime();
        });
      }

      const response = await retryRequest(() =>
        apiClient.get<Order[]>('/orders/customer/my-orders')
      );
      
      // Update cache
      ordersCache = {
        data: response.data,
        timestamp: Date.now()
      };
      
      // Filter for future orders (after today)
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return response.data.filter((order) => {
        // Use deliveryDate if available, otherwise fallback to scheduledDeliveryTime
        const dateSource = order.deliveryDate || order.scheduledDeliveryTime;
        if (!dateSource) return false;
        const deliveryDate = new Date(dateSource);
        deliveryDate.setHours(0, 0, 0, 0);
        return deliveryDate >= tomorrow;
      }).sort((a, b) => {
        const dateA = new Date(a.deliveryDate || a.scheduledDeliveryTime || 0);
        const dateB = new Date(b.deliveryDate || b.scheduledDeliveryTime || 0);
        return dateA.getTime() - dateB.getTime();
      });
    } catch (error: any) {
      return handleApiError(error, 'getUpcomingOrders');
    }
  },

  /**
   * Get past orders (client-side filtered and paginated)
   */
  getPastOrders: async (page = 1, limit = 10, forceRefresh = false): Promise<{ orders: Order[]; total: number; page: number; limit: number }> => {
    try {
      // Check cache first
      if (!forceRefresh && ordersCache && Date.now() - ordersCache.timestamp < CACHE_DURATION) {
        console.log('📦 Using cached orders for past filter');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const pastOrders = ordersCache.data.filter((order) => {
          const dateSource = order.deliveryDate || order.scheduledDeliveryTime;
          if (!dateSource) return false;
          const deliveryDate = new Date(dateSource);
          deliveryDate.setHours(0, 0, 0, 0);
          return deliveryDate < today || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED;
        }).sort((a, b) => {
          const dateA = new Date(a.deliveryDate || a.scheduledDeliveryTime || 0);
          const dateB = new Date(b.deliveryDate || b.scheduledDeliveryTime || 0);
          return dateB.getTime() - dateA.getTime();
        });
        
        const skip = (page - 1) * limit;
        return {
          orders: pastOrders.slice(skip, skip + limit),
          total: pastOrders.length,
          page,
          limit,
        };
      }

      const response = await retryRequest(() =>
        apiClient.get<Order[]>('/orders/customer/my-orders')
      );
      
      // Update cache
      ordersCache = {
        data: response.data,
        timestamp: Date.now()
      };
      
      // Filter for past orders (before today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const pastOrders = response.data.filter((order) => {
        const dateSource = order.deliveryDate || order.scheduledDeliveryTime;
        if (!dateSource) return false;
        const deliveryDate = new Date(dateSource);
        deliveryDate.setHours(0, 0, 0, 0);
        return deliveryDate < today || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED;
      }).sort((a, b) => {
        const dateA = new Date(a.deliveryDate || a.scheduledDeliveryTime || 0);
        const dateB = new Date(b.deliveryDate || b.scheduledDeliveryTime || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Client-side pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        orders: pastOrders.slice(startIndex, endIndex),
        total: pastOrders.length,
        page,
        limit,
      };
    } catch (error: any) {
      return handleApiError(error, 'getPastOrders');
    }
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId: string): Promise<Order> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Order>(`/orders/${orderId}`)
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'getOrderById');
    }
  },

  /**
   * Create a new order (one-time meal)
   */
  createOrder: async (data: CreateOrderDto): Promise<Order> => {
    try {
      const response = await retryRequest(() =>
        apiClient.post<Order>('/orders', data)
      );
      console.log('✅ Order created successfully');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'createOrder');
    }
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    try {
      const response = await retryRequest(() =>
        apiClient.patch<Order>(`/orders/${orderId}/cancel`, {
          cancellationReason: reason,
        })
      );
      console.log('✅ Order cancelled');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'cancelOrder');
    }
  },

  /**
   * Rate and review an order
   */
  rateOrder: async (orderId: string, rating: number, review?: string): Promise<Order> => {
    try {
      const response = await retryRequest(() =>
        apiClient.patch<Order>(`/orders/${orderId}/rate`, {
          rating,
          review,
        })
      );
      console.log('✅ Order rated successfully');
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'rateOrder');
    }
  },

  /**
   * Track order real-time status
   */
  trackOrder: async (orderId: string): Promise<Order> => {
    try {
      const response = await retryRequest(() =>
        apiClient.get<Order>(`/orders/${orderId}/track`)
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, 'trackOrder');
    }
  },
};

