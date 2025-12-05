import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';
import { secureTokenManager } from '@/auth/SecureTokenManager';

export default function Root() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      setIsChecking(true);
      
      // Wait a moment for auth state to settle
      await new Promise(resolve => setTimeout(resolve, 300));
  
      // Double-check token exists
      const tokens = await secureTokenManager.getTokens();
      const userData = await secureTokenManager.getUser();
      const authState = await secureTokenManager.getAuthState();
      
      console.log('🔐 Auth check:', { 
        hasTokens: !!tokens?.accessToken, 
        hasUser: !!userData?.id, 
        authState,
        isAuthenticated,
        isInitialized
      });
      
      if (tokens?.accessToken && userData?.id && (authState || isAuthenticated)) {
        console.log('✅ User is authenticated, redirecting to dashboard');
        router.replace('/(tabs)');
      } else {
        console.log('❌ User is not authenticated, redirecting to welcome');
        router.replace('/(onboarding)/welcome');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      router.replace('/(onboarding)/welcome');
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading screen while checking authentication
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9B42" />
      <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
}

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