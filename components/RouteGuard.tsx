import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/auth/AuthProvider';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  permissions?: string[];
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requireAuth = true, 
  fallback,
  permissions = []
}) => {
  const { t } = useTranslation('common');
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();

  // Show loading while authentication is being initialized
  if (!isInitialized || isLoading) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9B42" />
        <Text style={styles.loadingText}>{t('verifyingAccess')}</Text>
      </View>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('🔒 RouteGuard: User not authenticated, redirecting to welcome');
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // If user is authenticated but trying to access auth pages (should redirect to main app)
  if (!requireAuth && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Check permissions if specified (simplified for now)
  if (requireAuth && permissions.length > 0 && user) {
    // For now, we'll just check if user exists - you can enhance this later
    // based on your actual user role/permission system
    const hasPermission = true; // Simplified permission check

    if (!hasPermission) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{t('accessDenied')}</Text>
          <Text style={styles.errorText}>{t('noPermissionToAccess')}</Text>
        </View>
      );
    }
  }

  return <>{children}</>;
};

// Specialized route guards
export const ProtectedRoute: React.FC<{ children: React.ReactNode; permissions?: string[] }> = ({ 
  children, 
  permissions = [] 
}) => (
  <RouteGuard requireAuth={true} permissions={permissions}>
    {children}
  </RouteGuard>
);

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requireAuth={false}>
    {children}
  </RouteGuard>
);

export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requireAuth={true} permissions={['customer']}>
    {children}
  </RouteGuard>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requireAuth={true} permissions={['admin']}>
    {children}
  </RouteGuard>
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
