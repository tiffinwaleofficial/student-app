import React from 'react';
import { createLazyComponent, LazyScreenWrapper } from '@/utils/lazyLoading';

/**
 * Lazy-loaded support screens
 * These screens are loaded on-demand to reduce initial bundle size
 * All existing functionality is preserved
 */

// Lazy load support screens
export const LazyHelpSupportScreen = createLazyComponent(() => 
  import('@/app/help-support')
);

export const LazyTermsConditionsScreen = createLazyComponent(() => 
  import('@/app/terms-conditions')
);

export const LazyPrivacyPolicyScreen = createLazyComponent(() => 
  import('@/app/privacy-policy')
);

export const LazyFAQScreen = createLazyComponent(() => 
  import('@/app/faq')
);

/**
 * Wrapped components with safe Suspense handling
 * No loading indicators - seamless transitions
 */
export const HelpSupportScreen = () => (
  <LazyScreenWrapper>
    <LazyHelpSupportScreen />
  </LazyScreenWrapper>
);

export const TermsConditionsScreen = () => (
  <LazyScreenWrapper>
    <LazyTermsConditionsScreen />
  </LazyScreenWrapper>
);

export const PrivacyPolicyScreen = () => (
  <LazyScreenWrapper>
    <LazyPrivacyPolicyScreen />
  </LazyScreenWrapper>
);

export const FAQScreen = () => (
  <LazyScreenWrapper>
    <LazyFAQScreen />
  </LazyScreenWrapper>
);