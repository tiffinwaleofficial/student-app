import React from 'react';
import { createLazyComponent, LazyScreenWrapper } from '@/utils/lazyLoading';

/**
 * Lazy-loaded onboarding screens
 * These screens are loaded on-demand to reduce initial bundle size
 * All existing functionality is preserved
 */

// Lazy load onboarding screens
export const LazyOnboardingWelcomeScreen = createLazyComponent(() => 
  import('@/app/(onboarding)/welcome')
);

export const LazyPersonalInfoScreen = createLazyComponent(() => 
  import('@/app/(onboarding)/personal-info')
);

export const LazyPhoneVerificationScreen = createLazyComponent(() => 
  import('@/app/(onboarding)/phone-verification')
);

export const LazyOTPVerificationScreen = createLazyComponent(() => 
  import('@/app/(onboarding)/otp-verification')
);

export const LazyDeliveryLocationScreen = createLazyComponent(() => 
  import('@/app/(onboarding)/delivery-location')
);

export const LazyFoodPreferencesScreen = createLazyComponent(() => 
  import('@/app/(onboarding)/food-preferences')
);

/**
 * Wrapped components with safe Suspense handling
 * No loading indicators - seamless transitions
 */
export const OnboardingWelcomeScreen = () => (
  <LazyScreenWrapper>
    <LazyOnboardingWelcomeScreen />
  </LazyScreenWrapper>
);

export const PersonalInfoScreen = () => (
  <LazyScreenWrapper>
    <LazyPersonalInfoScreen />
  </LazyScreenWrapper>
);

export const PhoneVerificationScreen = () => (
  <LazyScreenWrapper>
    <LazyPhoneVerificationScreen />
  </LazyScreenWrapper>
);

export const OTPVerificationScreen = () => (
  <LazyScreenWrapper>
    <LazyOTPVerificationScreen />
  </LazyScreenWrapper>
);

export const DeliveryLocationScreen = () => (
  <LazyScreenWrapper>
    <LazyDeliveryLocationScreen />
  </LazyScreenWrapper>
);

export const FoodPreferencesScreen = () => (
  <LazyScreenWrapper>
    <LazyFoodPreferencesScreen />
  </LazyScreenWrapper>
);