import React from 'react';
import { createLazyComponent, LazyScreenWrapper } from '@/utils/lazyLoading';

/**
 * Lazy-loaded authentication screens
 * These screens are loaded on-demand to reduce initial bundle size
 * All existing functionality is preserved
 */

// Lazy load auth screens
export const LazyAuthWelcomeScreen = createLazyComponent(() => 
  import('@/app/(auth)/welcome')
);

/**
 * Wrapped components with safe Suspense handling
 * No loading indicators - seamless transitions
 */
export const AuthWelcomeScreen = () => (
  <LazyScreenWrapper>
    <LazyAuthWelcomeScreen />
  </LazyScreenWrapper>
);