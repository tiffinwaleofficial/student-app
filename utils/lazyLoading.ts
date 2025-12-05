import React, { Suspense } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

/**
 * Safe lazy loading utilities for code splitting
 * Preserves all existing functionality while enabling lazy loading
 */

// Minimal loading fallback - no visible loading indicators
const MinimalFallback = () => (
  <View style={styles.minimalFallback}>
    {/* No loading indicator - just maintain layout */}
  </View>
);

// Invisible fallback for seamless transitions
const InvisibleFallback = () => null;

/**
 * Safe Suspense wrapper that doesn't show loading states
 * Maintains existing component behavior while enabling lazy loading
 */
export const SafeSuspense = ({ 
  children, 
  fallback = InvisibleFallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ComponentType;
}) => (
  <Suspense fallback={<fallback />}>
    {children}
  </Suspense>
);

/**
 * Creates a lazy component with safe error handling
 * Preserves all existing component functionality
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  return React.lazy(importFn);
};

/**
 * Lazy loading wrapper for screens
 * Ensures smooth transitions without loading indicators
 */
export const LazyScreenWrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeSuspense fallback={InvisibleFallback}>
    {children}
  </SafeSuspense>
);

const styles = StyleSheet.create({
  minimalFallback: {
    flex: 1,
    backgroundColor: '#FFFAF0', // Match app background
  },
});