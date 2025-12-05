import React from 'react';
import { createLazyComponent, LazyScreenWrapper } from '@/utils/lazyLoading';

/**
 * Lazy-loaded settings screens
 * These screens are loaded on-demand to reduce initial bundle size
 * All existing functionality is preserved
 */

// Lazy load settings screens
export const LazyAccountInformationScreen = createLazyComponent(() => 
  import('@/app/account-information')
);

export const LazyDeliveryAddressesScreen = createLazyComponent(() => 
  import('@/app/delivery-addresses')
);

export const LazyPaymentMethodsScreen = createLazyComponent(() => 
  import('@/app/payment-methods')
);

export const LazyNotificationPreferencesScreen = createLazyComponent(() => 
  import('@/app/notification-preferences')
);

/**
 * Wrapped components with safe Suspense handling
 * No loading indicators - seamless transitions
 */
export const AccountInformationScreen = () => (
  <LazyScreenWrapper>
    <LazyAccountInformationScreen />
  </LazyScreenWrapper>
);

export const DeliveryAddressesScreen = () => (
  <LazyScreenWrapper>
    <LazyDeliveryAddressesScreen />
  </LazyScreenWrapper>
);

export const PaymentMethodsScreen = () => (
  <LazyScreenWrapper>
    <LazyPaymentMethodsScreen />
  </LazyScreenWrapper>
);

export const NotificationPreferencesScreen = () => (
  <LazyScreenWrapper>
    <LazyNotificationPreferencesScreen />
  </LazyScreenWrapper>
);