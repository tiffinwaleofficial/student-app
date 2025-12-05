import React from 'react';
import { createLazyComponent, LazyScreenWrapper } from '@/utils/lazyLoading';

/**
 * Lazy-loaded feature screens
 * These screens are loaded on-demand to reduce initial bundle size
 * All existing functionality is preserved
 */

// Lazy load feature screens
export const LazyCheckoutScreen = createLazyComponent(() => 
  import('@/app/checkout')
);

export const LazySubscriptionCheckoutScreen = createLazyComponent(() => 
  import('@/app/subscription-checkout')
);

export const LazyCustomizeMealScreen = createLazyComponent(() => 
  import('@/app/customize-meal')
);

export const LazyAddOrderScreen = createLazyComponent(() => 
  import('@/app/add-order')
);

export const LazyRateMealScreen = createLazyComponent(() => 
  import('@/app/rate-meal')
);

export const LazyRestaurantScreen = createLazyComponent(() => 
  import('@/app/restaurant/[id]')
);

export const LazyFoodItemScreen = createLazyComponent(() => 
  import('@/app/food-item/[id]')
);

export const LazyChangePasswordScreen = createLazyComponent(() => 
  import('@/app/change-password')
);

export const LazyForgotPasswordScreen = createLazyComponent(() => 
  import('@/app/forgot-password')
);

export const LazyPromotionsScreen = createLazyComponent(() => 
  import('@/app/promotions')
);

export const LazyActiveSubscriptionPlanScreen = createLazyComponent(() => 
  import('@/app/active-subscription-plan')
);

export const LazySubscriptionDetailsScreen = createLazyComponent(() => 
  import('@/app/subscription-details')
);

export const LazyCheckoutSuccessScreen = createLazyComponent(() => 
  import('@/app/checkout-success')
);

/**
 * Wrapped components with safe Suspense handling
 * No loading indicators - seamless transitions
 */
export const CheckoutScreen = () => (
  <LazyScreenWrapper>
    <LazyCheckoutScreen />
  </LazyScreenWrapper>
);

export const SubscriptionCheckoutScreen = () => (
  <LazyScreenWrapper>
    <LazySubscriptionCheckoutScreen />
  </LazyScreenWrapper>
);

export const CustomizeMealScreen = () => (
  <LazyScreenWrapper>
    <LazyCustomizeMealScreen />
  </LazyScreenWrapper>
);

export const AddOrderScreen = () => (
  <LazyScreenWrapper>
    <LazyAddOrderScreen />
  </LazyScreenWrapper>
);

export const RateMealScreen = () => (
  <LazyScreenWrapper>
    <LazyRateMealScreen />
  </LazyScreenWrapper>
);

export const RestaurantScreen = () => (
  <LazyScreenWrapper>
    <LazyRestaurantScreen />
  </LazyScreenWrapper>
);

export const FoodItemScreen = () => (
  <LazyScreenWrapper>
    <LazyFoodItemScreen />
  </LazyScreenWrapper>
);

export const ChangePasswordScreen = () => (
  <LazyScreenWrapper>
    <LazyChangePasswordScreen />
  </LazyScreenWrapper>
);

export const ForgotPasswordScreen = () => (
  <LazyScreenWrapper>
    <LazyForgotPasswordScreen />
  </LazyScreenWrapper>
);

export const PromotionsScreen = () => (
  <LazyScreenWrapper>
    <LazyPromotionsScreen />
  </LazyScreenWrapper>
);

export const ActiveSubscriptionPlanScreen = () => (
  <LazyScreenWrapper>
    <LazyActiveSubscriptionPlanScreen />
  </LazyScreenWrapper>
);

export const SubscriptionDetailsScreen = () => (
  <LazyScreenWrapper>
    <LazySubscriptionDetailsScreen />
  </LazyScreenWrapper>
);

export const CheckoutSuccessScreen = () => (
  <LazyScreenWrapper>
    <LazyCheckoutSuccessScreen />
  </LazyScreenWrapper>
);