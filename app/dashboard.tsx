import { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/auth/AuthProvider';
import { useMealStore } from '@/store/mealStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { ActiveSubscriptionDashboard } from '@/components/ActiveSubscriptionDashboard';
import { Home, ClipboardList, MapPin, User, CreditCard } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { ProtectedRoute } from '@/auth/AuthMiddleware';
import { useTranslation } from 'react-i18next';

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { user, isAuthenticated, isInitialized } = useAuth();
  const { 
    todayMeals, 
    upcomingMeals, 
    fetchTodayMeals, 
    fetchUpcomingMeals, 
    refreshAllMealData,
    isLoading: mealsLoading 
  } = useMealStore();
  const { 
    currentSubscription, 
    fetchCurrentSubscription, 
    refreshSubscriptionData,
    isLoading: subscriptionLoading 
  } = useSubscriptionStore();

  // Initialize data on mount - auth is handled by AuthProvider
  useEffect(() => {
    const initializeDashboard = async () => {
      console.log('🔔 Dashboard: Initializing dashboard data...');
      
      // Auth middleware ensures user is authenticated before reaching here
      if (!user) {
        console.log('⚠️ Dashboard: No user data available yet');
        return;
      }
      
      try {
        // Fetch all data in parallel for better performance
        await Promise.all([
          fetchTodayMeals(),
          fetchUpcomingMeals(),
          fetchCurrentSubscription(),
        ]);
        
        console.log('✅ Dashboard: All data initialized successfully');
      } catch (error) {
        console.error('❌ Dashboard: Error initializing data:', error);
      }
    };
    
    initializeDashboard();
  }, [user, fetchTodayMeals, fetchUpcomingMeals, fetchCurrentSubscription]);

  // Refresh data when user changes (login/logout)
  useEffect(() => {
    if (user?.id) {
      const refreshUserData = async () => {
        console.log('🔔 Dashboard: User changed, refreshing data for user:', user.id);
        
        try {
          await Promise.all([
            refreshAllMealData(),
            refreshSubscriptionData(),
          ]);
          
          console.log('✅ Dashboard: User data refreshed successfully');
        } catch (error) {
          console.error('❌ Dashboard: Error refreshing user data:', error);
        }
      };
      
      refreshUserData();
    }
  }, [user?.id]);

  // Debug logging for data state
  useEffect(() => {
    console.log('🔔 Dashboard: Data state update:', {
      currentSubscription,
      userSubscription: (user as any)?.currentSubscription,
      todayMealsCount: todayMeals.length,
      upcomingMealsCount: upcomingMeals.length,
      isLoadingMeals: mealsLoading,
      isLoadingSubscription: subscriptionLoading,
    });
  }, [currentSubscription, user, todayMeals, upcomingMeals, mealsLoading, subscriptionLoading]);

  const navigateTo = (route: string) => {
    console.log('🔍 Dashboard navigateTo called with route:', route);
    console.log('📱 Router state:', router);
    console.log('👤 Current user:', { id: user?.id, email: user?.email });
    
    try {
      console.log('🚀 Attempting router.push...');
      router.push(route as any);
      console.log('✅ router.push completed successfully');
    } catch (error) {
      console.error('❌ Navigation error in navigateTo:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    }
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <ActiveSubscriptionDashboard 
          user={user} 
          todayMeals={todayMeals} 
          upcomingMeals={upcomingMeals}
          isLoading={mealsLoading || subscriptionLoading} 
        />
        
        {/* Bottom Navigation Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => navigateTo('/dashboard')}
          >
            <Home size={24} color="#FF9B42" />
            <Text style={[styles.tabLabel, styles.activeTabLabel]}>{t('home')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => navigateTo('/(tabs)/orders')}
          >
            <ClipboardList size={24} color="#999999" />
            <Text style={styles.tabLabel}>{t('orders')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => navigateTo('/(tabs)/track')}
          >
            <MapPin size={24} color="#999999" />
            <Text style={styles.tabLabel}>{t('track')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => navigateTo('/(tabs)/plans')}
          >
            <CreditCard size={24} color="#999999" />
            <Text style={styles.tabLabel}>{t('plans')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => {
              console.log('🔍 Profile tab clicked from dashboard');
              console.log('📍 Current route: dashboard');
              console.log('🎯 Navigating to: /(tabs)/profile');
              console.log('👤 User state:', { 
                id: user?.id, 
                email: user?.email, 
                firstName: user?.firstName 
              });
              console.log('📱 Router object:', router);
              
              try {
                navigateTo('/(tabs)/profile');
                console.log('✅ Navigation call completed');
              } catch (error) {
                console.error('❌ Navigation error:', error);
              }
            }}
          >
            <User size={24} color="#999999" />
            <Text style={styles.tabLabel}>{t('profile')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 64,
    paddingBottom: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#999999',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#FF9B42',
  },
}); 