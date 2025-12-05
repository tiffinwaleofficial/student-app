/**
 * Unified API Export for Student App
 * Single entry point for all API services
 * 
 * Usage:
 * ```typescript
 * import { api } from '@/lib/api';
 * 
 * // Partners
 * const partners = await api.partners.getAllPartners();
 * 
 * // Subscription Plans
 * const plans = await api.plans.getAllActivePlans();
 * 
 * // Orders
 * const todayOrders = await api.orders.getTodaysOrders();
 * 
 * // Reviews
 * await api.reviews.createReview({ restaurant: id, rating: 5 });
 * ```
 */

import { partnerApi } from './services/partner.service';
import { subscriptionPlanApi } from './services/subscription-plan.service';
import { subscriptionApi } from './services/subscription.service';
import { orderApi } from './services/order.service';
import { reviewApi } from './services/review.service';

/**
 * Unified API Object
 * Use this for all API calls throughout the app
 */
export const api = {
  partners: partnerApi,
  plans: subscriptionPlanApi,
  subscriptions: subscriptionApi,
  orders: orderApi,
  reviews: reviewApi,
};

// Export individual service APIs
export { partnerApi } from './services/partner.service';
export { subscriptionPlanApi } from './services/subscription-plan.service';
export { subscriptionApi } from './services/subscription.service';
export { orderApi } from './services/order.service';
export { reviewApi } from './services/review.service';

// Export all types
export type {
  Partner,
  PartnerStats,
  PartnerReview,
  SearchPartnersParams,
} from './services/partner.service';

export type {
  SubscriptionPlan,
  MealSpecification,
  WeeklyMenu,
  DeliverySlots,
} from './services/subscription-plan.service';

export type {
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './services/subscription.service';

export type {
  Order,
  CreateOrderDto,
} from './services/order.service';

export type {
  Review,
  CreateReviewDto,
  UpdateReviewDto,
} from './services/review.service';

// Export enums as values (not types) so they can be used in runtime code
export { DurationType, MealFrequency } from './services/subscription-plan.service';
export { SubscriptionStatus } from './services/subscription.service';
export { OrderStatus } from './services/order.service';

// Export client utilities
export { 
  apiClient, 
  handleApiError, 
  retryRequest, 
  isNetworkError, 
  isAuthError, 
  isServerError 
} from './client';

// Backward compatibility with old services/api imports
export const partnerService = partnerApi;
export const subscriptionPlanService = subscriptionPlanApi;
export const subscriptionService = subscriptionApi;
export const orderService = orderApi;
export const reviewService = reviewApi;

export default api;

