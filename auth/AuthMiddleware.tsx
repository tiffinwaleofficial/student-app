import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from './AuthProvider';
import { useTranslation } from 'react-i18next';

interface AuthMiddlewareProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Centralized authentication middleware
 * Handles all route protection automatically
 */
export const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({
  children,
  requireAuth = true,
  fallback,
  redirectTo,
}) => {
  const { isAuthenticated, isInitialized, isLoading, error } = useAuth();
  const { t } = useTranslation('common');

  // Show loading while authentication is being initialized
  if (!isInitialized || isLoading) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9B42" />
        <Text style={styles.loadingText}>{t('verifyingAccess')}</Text>
      </View>
    );
  }

  // Show error state if there's an auth error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{t('authenticationError')}</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Handle authentication requirements
  if (requireAuth && !isAuthenticated) {
    console.log('🔒 AuthMiddleware: User not authenticated, redirecting to welcome');
    return <Redirect href={redirectTo as any || "/(onboarding)/welcome" as any} />;
  }

  // Handle authenticated users trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    console.log('🔒 AuthMiddleware: User authenticated, redirecting to dashboard');
    return <Redirect href={"/(tabs)" as any} />;
  }

  // User has proper access, render children
  return <>{children}</>;
};

/**
 * Protected route wrapper - requires authentication
 */
export const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
  redirectTo?: string;
}> = ({ children, fallback, redirectTo }) => (
  <AuthMiddleware requireAuth={true} fallback={fallback} redirectTo={redirectTo}>
    {children}
  </AuthMiddleware>
);

/**
 * Public route wrapper - redirects authenticated users
 */
export const PublicRoute: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <AuthMiddleware requireAuth={false} fallback={fallback}>
    {children}
  </AuthMiddleware>
);

/**
 * Guest route wrapper - only for non-authenticated users
 */
export const GuestRoute: React.FC<{ 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <AuthMiddleware requireAuth={false} fallback={fallback}>
    {children}
  </AuthMiddleware>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAF0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAF0',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
