import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import authService from '@/utils/authService';
import { RegisterRequest } from '@/types/api';

export const useAuth = () => {
  const authStore = useAuthStore();
  const router = useRouter();

  // Initialize authentication on mount
  useEffect(() => {
    if (!authStore.isInitialized) {
      authStore.initializeAuth();
    }
  }, [authStore.isInitialized]);

  // Enhanced login function with better error handling
  const login = useCallback(async (email: string, password: string) => {
    try {
      await authStore.login(email, password);
      if (authStore.isAuthenticated) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [authStore, router]);

  // Enhanced register function with better error handling
  const register = useCallback(async (userData: RegisterRequest) => {
    console.log('🔧 useAuth: register function called with:', userData);
    try {
      await authStore.register(userData);
      console.log('✅ useAuth: authStore.register completed successfully');
      if (authStore.isAuthenticated) {
        console.log('✅ useAuth: User is authenticated, redirecting to tabs');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('❌ useAuth: Registration error:', error);
    }
  }, [authStore, router]);

  // Enhanced logout function
  const logout = useCallback(async () => {
    try {
      await authStore.logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login
      router.replace('/(auth)/login');
    }
  }, [authStore, router]);

  // Check if user can access a specific route
  const canAccess = useCallback((route: string) => {
    if (!authStore.isInitialized) return false;
    
    // Public routes that don't require authentication
    const publicRoutes = ['/(auth)', '/'];
    if (publicRoutes.some(publicRoute => route.includes(publicRoute))) {
      return true;
    }
    
    // Protected routes require authentication
    return authStore.isAuthenticated;
  }, [authStore.isAuthenticated, authStore.isInitialized]);

  // Force authentication check
  const checkAuth = useCallback(async () => {
    if (authStore.isAuthenticated) {
      const isValid = await authService.validateToken();
      if (!isValid) {
        await logout();
      }
    }
  }, [authStore.isAuthenticated, logout]);

  return {
    // State from authStore
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    isInitialized: authStore.isInitialized,
    // Functions from authStore
    fetchUserProfile: authStore.fetchUserProfile,
    updateUserProfile: authStore.updateUserProfile,
    clearError: authStore.clearError,
    initializeAuth: authStore.initializeAuth,
    // Override with local functions
    login,
    register,
    logout,
    canAccess,
    checkAuth,
  };
};
