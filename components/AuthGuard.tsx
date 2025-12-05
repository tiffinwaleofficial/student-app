import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  fallback
}) => {
  const { t } = useTranslation('common');
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();

  // Show loading while authentication is being initialized
  if (!isInitialized || isLoading) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9B42" />
        <Text style={styles.loadingText}>{t('verifyingAuthentication')}</Text>
      </View>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Redirect href="/" />;
  }

  // If user is authenticated but trying to access auth pages (should redirect to main app)
  if (!requireAuth && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
};

// Specialized guards for different route types
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth={true}>
    {children}
  </AuthGuard>
);

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth={false}>
    {children}
  </AuthGuard>
);

export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation('common');
  const { isAuthenticated, isInitialized } = useAuthStore();
  
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9B42" />
        <Text style={styles.loadingText}>{t('verifyingPermissions')}</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <>{children}</>;
};

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
});
