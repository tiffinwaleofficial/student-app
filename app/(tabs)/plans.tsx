import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Check, Crown, Zap, Shield, RefreshCw, Eye, Star, MapPin, Search, ArrowRight, Sparkles, Calendar, Package, TrendingUp } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { BlurView } from 'expo-blur';

import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useAuth } from '@/auth/AuthProvider';
import { SubscriptionPlan } from '@/types/api';
import PlanDetailModal from '@/components/PlanDetailModal';
import { useTranslation } from '@/hooks/useTranslation';
import { PartnerCard } from '@/components/PartnerCard';
import { api, Partner } from '@/lib/api';

const { width } = Dimensions.get('window');

export default function PlansScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation('subscription');
  const {
    availablePlans,
    currentSubscription,
    isLoading,
    error,
    fetchAvailablePlans,
    fetchCurrentSubscription,
    refreshSubscriptionData,
    createSubscription
  } = useSubscriptionStore();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [subscribingToPlan, setSubscribingToPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch partners on mount
  useEffect(() => {
    const initializePlans = async () => {
      if (__DEV__) console.log('🔔 Plans: Loading data');

      try {
        await Promise.all([
          fetchAvailablePlans(false),
          fetchCurrentSubscription(false),
          fetchPartners(),
        ]);

        if (__DEV__) console.log('✅ Plans: Data loaded');
      } catch (error) {
        if (__DEV__) console.error('❌ Plans: Error loading data:', error);
      }
    };

    initializePlans();
  }, []);

  const fetchPartners = async () => {
    try {
      setPartnersLoading(true);
      const data = await api.partners.getAllPartners();
      setPartners(data.partners || []);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setPartnersLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (__DEV__) console.log('👁️ Plans: Page focused - force refreshing subscription');
      setTimeout(() => {
        fetchAvailablePlans(false);
        fetchCurrentSubscription(true);
        fetchPartners();
      }, 100);
    }, [fetchAvailablePlans, fetchCurrentSubscription])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (__DEV__) console.log('🔄 Plans: Pull-to-refresh triggered');
      await Promise.all([
        fetchAvailablePlans(true),
        fetchCurrentSubscription(true),
        fetchPartners(),
      ]);
    } catch (error) {
      console.error('Error refreshing plans:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push('/(onboarding)/phone-verification' as any);
      return;
    }
    router.push(`/checkout?planId=${planId}` as any);
  };

  const handleViewPlanDetails = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  const handleModalSubscribe = (planId: string) => {
    setModalVisible(false);
    handleSubscribe(planId);
  };

  const handleViewAllPartners = () => {
    router.push('/pages/partners');
  };

  const isPlanActive = (planId: string) => {
    if (!currentSubscription) return false;
    const subscriptionPlanId = typeof currentSubscription.plan === 'string'
      ? currentSubscription.plan
      : currentSubscription.plan?.id;
    return subscriptionPlanId === planId &&
      (currentSubscription.status === 'active' || currentSubscription.status === 'pending');
  };

  // Filter available plans to exclude the active one if it exists
  const filteredAvailablePlans = availablePlans.filter(plan => !isPlanActive(plan.id));

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const renderActivePlanCard = () => {
    if (!currentSubscription || !currentSubscription.plan || typeof currentSubscription.plan !== 'object') {
      return null;
    }

    const plan = currentSubscription.plan as SubscriptionPlan;
    const daysRemaining = getDaysRemaining(currentSubscription.endDate);
    const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

    return (
      <Animated.View entering={FadeInDown.duration(400)} style={styles.activeSubscriptionCard}>
        {/* Header with Status Badge */}
        <View style={styles.activeCardHeader}>
          <View>
            <Text style={styles.activeCardTitle}>Your Active Plan</Text>
            <Text style={styles.activeCardPlanName}>{plan.name}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            currentSubscription.status === 'active' ? styles.statusBadgeActive : styles.statusBadgePending
          ]}>
            <View style={[
              styles.statusDot,
              currentSubscription.status === 'active' ? styles.statusDotActive : styles.statusDotPending
            ]} />
            <Text style={[
              styles.statusText,
              currentSubscription.status === 'active' ? styles.statusTextActive : styles.statusTextPending
            ]}>
              {currentSubscription.status === 'active' ? 'Active' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Plan Details Grid */}
        <View style={styles.activeCardGrid}>
          <View style={styles.activeCardGridItem}>
            <View style={styles.activeCardIconContainer}>
              <Package size={20} color="#FF9B42" />
            </View>
            <View style={styles.activeCardGridContent}>
              <Text style={styles.activeCardGridLabel}>Price</Text>
              <Text style={styles.activeCardGridValue}>₹{plan.price}/{plan.duration} days</Text>
            </View>
          </View>

          <View style={styles.activeCardGridItem}>
            <View style={styles.activeCardIconContainer}>
              <Calendar size={20} color="#FF9B42" />
            </View>
            <View style={styles.activeCardGridContent}>
              <Text style={styles.activeCardGridLabel}>Valid Until</Text>
              <Text style={styles.activeCardGridValue}>{formatDate(currentSubscription.endDate)}</Text>
            </View>
          </View>

          <View style={styles.activeCardGridItem}>
            <View style={styles.activeCardIconContainer}>
              <TrendingUp size={20} color={isExpiringSoon ? '#F59E0B' : '#10B981'} />
            </View>
            <View style={styles.activeCardGridContent}>
              <Text style={styles.activeCardGridLabel}>Days Remaining</Text>
              <Text style={[
                styles.activeCardGridValue,
                isExpiringSoon && styles.textWarning
              ]}>
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
              </Text>
            </View>
          </View>

          <View style={styles.activeCardGridItem}>
            <View style={styles.activeCardIconContainer}>
              <Sparkles size={20} color="#FF9B42" />
            </View>
            <View style={styles.activeCardGridContent}>
              <Text style={styles.activeCardGridLabel}>Meals/Day</Text>
              <Text style={styles.activeCardGridValue}>{plan.mealsPerDay || 2}</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <View style={styles.activeFeaturesSection}>
            <Text style={styles.activeFeaturesTitle}>Plan Benefits</Text>
            <View style={styles.activeFeaturesList}>
              {plan.features.slice(0, 4).map((feature, idx) => (
                <View key={idx} style={styles.activeFeatureItem}>
                  <View style={styles.activeFeatureIcon}>
                    <Check size={14} color="#10B981" strokeWidth={3} />
                  </View>
                  <Text style={styles.activeFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Expiry Warning */}
        {isExpiringSoon && (
          <View style={styles.expiryWarning}>
            <Shield size={16} color="#F59E0B" />
            <Text style={styles.expiryWarningText}>
              Your plan expires soon! Renew now to continue enjoying benefits.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.activeCardActions}>
          <TouchableOpacity
            style={styles.viewDetailsButtonSecondary}
            onPress={() => handleViewPlanDetails(plan)}
          >
            <Text style={styles.viewDetailsTextSecondary}>View Full Details</Text>
            <Eye size={16} color="#666666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.renewButton}
            onPress={() => handleSubscribe(plan.id)}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text style={styles.renewButtonText}>Renew Plan</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderPlanCard = (plan: SubscriptionPlan, index: number) => {
    const isPopular = index === 0; // First item in available list is popular

    return (
      <Animated.View
        key={plan.id}
        entering={FadeInDown.delay(index * 150).duration(400)}
        style={[
          styles.planCard,
          isPopular && styles.planCardPopular
        ]}
      >
        {/* Popular Badge */}
        {isPopular && (
          <View style={styles.popularBadge}>
            <Sparkles size={12} color="#FFFFFF" />
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        )}

        {/* Plan Header */}
        <View style={styles.planHeader}>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDescription} numberOfLines={2}>
              {plan.description}
            </Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.price}>{plan.price}</Text>
          </View>
          <Text style={styles.duration}>/ {plan.duration} days</Text>
        </View>

        {/* Metrics */}
        <View style={styles.planMetrics}>
          {plan.mealsPerDay && (
            <View style={styles.metricItem}>
              <View style={styles.metricIcon}>
                <Package size={16} color="#FF9B42" />
              </View>
              <Text style={styles.metricText}>{plan.mealsPerDay} meals/day</Text>
            </View>
          )}
          {plan.features && plan.features.length > 0 && (
            <View style={styles.metricItem}>
              <View style={styles.metricIcon}>
                <Sparkles size={16} color="#FF9B42" />
              </View>
              <Text style={styles.metricText}>{plan.features.length} benefits</Text>
            </View>
          )}
        </View>

        {/* Features Preview */}
        <View style={styles.featuresPreview}>
          {plan.features?.slice(0, 3).map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText} numberOfLines={1}>
                {feature}
              </Text>
            </View>
          ))}
          {plan.features && plan.features.length > 3 && (
            <Text style={styles.moreFeatures}>+{plan.features.length - 3} more benefits</Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.planActions}>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => handleViewPlanDetails(plan)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => handleSubscribe(plan.id)}
          >
            <Text style={styles.subscribeText}>Subscribe</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('subscriptionPlans')}</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              fetchAvailablePlans(true);
              fetchPartners();
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('subscriptionPlans')}</Text>
          <Text style={styles.headerSubtitle}>{t('choosePerfectPlan')}</Text>
        </View>
        <View style={styles.headerIconContainer}>
          <Crown size={24} color="#FF9B42" />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF9B42']}
            tintColor="#FF9B42"
          />
        }
      >
        {/* Active Subscription Section */}
        {currentSubscription && renderActivePlanCard()}

        {/* Available Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {currentSubscription ? 'Upgrade Your Plan' : 'Available Plans'}
          </Text>
          {filteredAvailablePlans.length === 0 && !currentSubscription && (
            <View style={styles.emptyContainer}>
              <Crown size={64} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>No Plans Available</Text>
              <Text style={styles.emptyDescription}>
                Check back later for new subscription plans
              </Text>
            </View>
          )}
          {filteredAvailablePlans.map((plan, index) => renderPlanCard(plan, index))}
        </View>

        {/* Partners Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('exploreTiffinCenters')}</Text>
            <TouchableOpacity onPress={handleViewAllPartners} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={16} color="#FF9B42" />
            </TouchableOpacity>
          </View>

          {partnersLoading && partners.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#FF9B42" />
          ) : partners.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MapPin size={64} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>{t('noTiffinCentersFound')}</Text>
              <Text style={styles.emptyDescription}>
                {t('checkBackLaterForTiffinCenters')}
              </Text>
            </View>
          ) : (
            <View style={styles.partnersList}>
              {partners.slice(0, 3).map((partner, index) => (
                <PartnerCard key={partner._id} partner={partner} />
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Plan Detail Modal */}
      <PlanDetailModal
        visible={modalVisible}
        plan={selectedPlan}
        onClose={() => setModalVisible(false)}
        onSubscribe={handleModalSubscribe}
        isActive={selectedPlan ? isPlanActive(selectedPlan.id) : false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFAF0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  // Active Subscription Card
  activeSubscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#FF9B42',
    shadowColor: '#FF9B42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  activeCardTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666666',
    marginBottom: 4,
  },
  activeCardPlanName: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#ECFDF5',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotPending: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextPending: {
    color: '#D97706',
  },
  activeCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  activeCardGridItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  activeCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF5E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeCardGridContent: {
    gap: 2,
  },
  activeCardGridLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#999999',
  },
  activeCardGridValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
  },
  textWarning: {
    color: '#F59E0B',
  },
  activeFeaturesSection: {
    marginBottom: 20,
  },
  activeFeaturesTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    marginBottom: 12,
  },
  activeFeaturesList: {
    gap: 10,
  },
  activeFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeFeatureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFeatureText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  expiryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  expiryWarningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#92400E',
  },
  activeCardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewDetailsButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  viewDetailsTextSecondary: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#666666',
  },
  renewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF9B42',
    gap: 6,
    shadowColor: '#FF9B42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  renewButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },

  // Plan Cards (No Gradients!)
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardPopular: {
    borderColor: '#FF9B42',
    borderWidth: 2,
    shadowColor: '#FF9B42',
    shadowOpacity: 0.1,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF9B42',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  popularBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  planHeader: {
    marginBottom: 16,
    paddingRight: 60,
  },
  planTitleContainer: {
    gap: 4,
  },
  planName: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
  },
  planDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    lineHeight: 20,
  },
  priceSection: {
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FF9B42',
    marginTop: 4,
    marginRight: 2,
  },
  price: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#FF9B42',
  },
  duration: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#999999',
  },
  planMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFF5E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#666666',
  },
  featuresPreview: {
    marginBottom: 20,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF9B42',
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  moreFeatures: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#FF9B42',
    marginTop: 4,
  },
  planActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#666666',
  },
  subscribeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF9B42',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#FF9B42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#FF9B42',
  },
  partnersList: {
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
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
    fontFamily: 'Poppins-SemiBold',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});