import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Bell, Calendar, MapPin, Clock, Star, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import SplashScreen from '@/components/SplashScreen';

import { useAuth } from '@/auth/AuthProvider';
import { useMealStore } from '@/store/mealStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useNotificationStore } from '@/store/notificationStore';
import { ActiveSubscriptionDashboard } from '@/components/ActiveSubscriptionDashboard';
import { NoSubscriptionDashboard } from '@/components/NoSubscriptionDashboard';
import { useRestaurantStore } from '@/store/restaurantStore';
import { Restaurant } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isInitialized, isLoading: authLoading } = useAuth();
  const { t } = useTranslation('common');
  const {
    todayMeals,
    upcomingMeals,
    isLoading: mealsLoading,
    error: mealsError,
    fetchTodayMeals,
    fetchUpcomingMeals
  } = useMealStore();
  const {
    currentSubscription,
    isLoading: subscriptionLoading,
    fetchCurrentSubscription
  } = useSubscriptionStore();
  const {
    getUnreadCount,
    notifications,
    fetchNotifications
  } = useNotificationStore();
  const {
    restaurants,
    isLoading: restaurantsLoading,
    fetchRestaurants,
  } = useRestaurantStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Load initial data ONLY once when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      if (__DEV__) console.log('🔍 Dashboard: Initial load check:', {
        isInitialized,
        authLoading,
        userId: user?.id,
        isAuthenticated: !!user
      });

      if (!isInitialized || authLoading) {
        if (__DEV__) console.log('⏳ Dashboard: Waiting for auth initialization...');
        return;
      }

      const userId = user?.id || user?.id;
      if (userId) {
        if (__DEV__) console.log('🚀 Dashboard: Loading data for user:', userId);
        try {
          // Load subscription first to check if user has active subscription
          await fetchCurrentSubscription(false); // Use cache if available

          // Load all data in parallel - single call per resource
          const { currentSubscription } = useSubscriptionStore.getState();
          await Promise.all([
            fetchTodayMeals(false), // Use cache - avoid duplicate calls
            fetchUpcomingMeals(false), // Use cache - avoid duplicate calls
            fetchRestaurants(), // Use cache if available
            fetchNotifications(userId, false), // Use cache if available
          ]);

          if (__DEV__) console.log('✅ Dashboard: Data loaded');
        } catch (error) {
          if (__DEV__) console.error('❌ Dashboard: Error loading initial data:', error);
        }
      }
    };

    loadInitialData();
  }, [isInitialized, authLoading, user?.id]);

  // Hide splash screen when dashboard is ready AND subscription status is determined
  useEffect(() => {
    // Wait for auth to be initialized and subscription loading to complete
    const isAuthReady = isInitialized && !authLoading;
    const isSubscriptionReady = !subscriptionLoading;

    if (isAuthReady && isSubscriptionReady) {
      if (__DEV__) console.log('🎬 Splash: Auth and subscription ready, will hide splash after minimum time', {
        currentSubscription: !!currentSubscription,
        subscriptionLoading
      });

      // Ensure splash shows for minimum 2.5 seconds (handled by SplashScreen component)
      // No additional delay needed here
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 100); // Minimal delay for smooth state update
      return () => clearTimeout(timer);
    }
  }, [isInitialized, authLoading, subscriptionLoading, currentSubscription]);

  // Smart focus refresh - only refresh when screen comes back into focus (not on initial mount)
  const isInitialMount = React.useRef(true);
  useFocusEffect(
    React.useCallback(() => {
      const userId = user?.id || user?.id;
      if (!isInitialized || authLoading || !userId) return;

      // Skip refresh on initial mount (handled by useEffect)
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      if (__DEV__) console.log('👁️ Dashboard: Screen refocused, refreshing data');

      // Single refresh call when screen comes back into focus
      const timer = setTimeout(() => {
        Promise.all([
          fetchCurrentSubscription(true),
          fetchTodayMeals(true),
          fetchUpcomingMeals(true),
          fetchNotifications(userId, false),
        ]).catch(err => { if (__DEV__) console.error('Focus refresh error:', err); });
      }, 300); // Small delay to avoid duplicate calls

      return () => clearTimeout(timer);
    }, [isInitialized, authLoading, user?.id, fetchCurrentSubscription, fetchTodayMeals, fetchUpcomingMeals, fetchNotifications])
  );

  // Pull to refresh handler
  const onRefresh = async () => {
    const userId = user?.id || user?.id;
    if (!isInitialized || authLoading || !userId) {
      if (__DEV__) console.log('⚠️ Dashboard: Cannot refresh - auth not ready');
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      if (__DEV__) console.log('🔄 Dashboard: Manual refresh triggered');
      await Promise.all([
        fetchTodayMeals(true), // Force refresh meals
        fetchUpcomingMeals(true), // Force refresh upcoming meals
        fetchCurrentSubscription(true), // Force refresh current subscription
        fetchRestaurants(), // Fetch restaurants
        fetchNotifications(userId, true), // Force refresh notifications
      ]);
      if (__DEV__) console.log('✅ Dashboard: Manual refresh completed');
    } catch (error) {
      if (__DEV__) console.error('❌ Dashboard: Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return t('invalidTime');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return t('invalidDate');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'preparing': return '#FF9B42';
      case 'ready': return '#2196F3';
      case 'scheduled': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      case 'skipped': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return t('delivered');
      case 'preparing': return t('preparing');
      case 'ready': return t('ready');
      case 'scheduled': return t('scheduled');
      case 'cancelled': return t('cancelled');
      case 'skipped': return t('skipped');
      default: return status;
    }
  };

  // Always show splash screen first - no intermediate loading
  // The splash screen will handle all loading states

  return (
    <View style={styles.container}>
      {/* Splash Screen Overlay - Always visible during initial load */}
      <SplashScreen
        visible={showSplash}
        onComplete={() => setShowSplash(false)}
      />

      {/* Header - Only show when no active subscription */}
      {!currentSubscription && (
        <View style={{ paddingTop: 50 }}>
          <DashboardHeader user={user} />
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF9B42']}
            tintColor="#FF9B42"
          />
        }
      >
        {/* Subscription Status */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          {currentSubscription ? (
            <ActiveSubscriptionDashboard
              user={user}
              todayMeals={todayMeals}
              upcomingMeals={upcomingMeals || []}
              isLoading={mealsLoading && todayMeals.length === 0}
            />
          ) : (
            <NoSubscriptionDashboard />
          )}
        </Animated.View>

        {/* Today's Meals - Only show when no active subscription */}
        {!currentSubscription && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('todaysMeals')}</Text>
              <Text style={styles.sectionSubtitle}>
                {formatDate(new Date().toISOString())}
              </Text>
            </View>

            {mealsError ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{mealsError}</Text>
                <TouchableOpacity
                  onPress={() => fetchTodayMeals()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryButtonText}>{t('retry')}</Text>
                </TouchableOpacity>
              </View>
            ) : todayMeals.length === 0 ? (
              <View style={styles.emptyCard}>
                <Calendar size={48} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>{t('noMealsScheduled')}</Text>
                <Text style={styles.emptyDescription}>
                  {t('subscribeToGetStarted')}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/plans')}
                  style={styles.exploreButton}
                >
                  <Text style={styles.exploreButtonText}>{t('explorePlans')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mealsContainer}>
                {todayMeals.map((meal) => (
                  <TouchableOpacity
                    key={meal.id}
                    style={styles.mealCard}
                    onPress={() => router.push(`/track?id=${meal.id}`)}
                  >
                    <View style={styles.mealHeader}>
                      <View>
                        <Text style={styles.mealType}>
                          {(meal.mealType || meal.deliverySlot || 'lunch')
                            .charAt(0)
                            .toUpperCase() +
                            (meal.mealType || meal.deliverySlot || 'lunch').slice(1)}
                        </Text>
                        <Text style={styles.mealRestaurant}>
                          {meal.partnerName || meal.restaurantName || 'Restaurant'}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(meal.status || 'pending') }
                      ]}>
                        <Text style={styles.statusText}>
                          {getStatusText(meal.status || 'pending')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.mealContent}>
                      <Text style={styles.mealName}>
                        {meal.items?.[0]?.name || meal.menu?.[0]?.name || t('meal')}
                      </Text>
                      <Text style={styles.mealDescription}>
                        {meal.items?.[0]?.description || meal.menu?.[0]?.description || t('deliciousMealPrepared')}
                      </Text>
                    </View>

                    <View style={styles.mealFooter}>
                      <View style={styles.timeContainer}>
                        <Clock size={14} color="#666666" />
                        <Text style={styles.timeText}>
                          {meal.deliveryTime || meal.deliveryTimeRange || formatTime(String(meal.deliveryDate || meal.date || new Date()))}
                        </Text>
                      </View>
                      <Text style={styles.trackText}>{t('track')}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.quickActionsSection}>
          <View style={styles.quickActionsHeader}>
            <Text style={styles.quickActionsTitle}>{t('quickActions')}</Text>
            <Text style={styles.quickActionsSubtitle}>Access key features quickly</Text>
          </View>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/(tabs)/orders')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Calendar size={24} color="#2196F3" strokeWidth={2.5} />
              </View>
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>{t('orderHistory')}</Text>
                <Text style={styles.quickActionDescription}>{t('viewPastOrders')}</Text>
              </View>
              <View style={styles.arrowContainer}>
                <ChevronRight size={16} color="#CCCCCC" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/help-support')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Bell size={24} color="#FF9B42" strokeWidth={2.5} />
              </View>
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>{t('support')}</Text>
                <Text style={styles.quickActionDescription}>{t('getHelpFaq')}</Text>
              </View>
              <View style={styles.arrowContainer}>
                <ChevronRight size={16} color="#CCCCCC" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF9B42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#FF9B42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  mealsContainer: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    marginBottom: 2,
  },
  mealRestaurant: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  mealContent: {
    marginBottom: 12,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    lineHeight: 16,
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  trackText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#FF9B42',
    fontWeight: '600',
  },
  // New Quick Actions Styles
  quickActionsSection: {
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  quickActionsHeader: {
    marginBottom: 20,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  quickActionsSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  quickActionsGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginBottom: 2,
  },
  quickActionDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999999',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantList: {
    marginTop: 10,
    paddingHorizontal: -10,
  },
  restaurantCard: {
    width: 150,
    marginHorizontal: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  restaurantInfo: {
    padding: 10,
  },
  restaurantName: {
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  restaurantRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  restaurantRatingText: {
    marginLeft: 5,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
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