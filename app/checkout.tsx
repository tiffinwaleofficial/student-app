import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, CreditCard, Calendar, Package, Receipt, Shield } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useAuth } from '@/auth/AuthProvider';
import { ProtectedRoute } from '@/auth/AuthMiddleware';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';

export default function CheckoutScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { user } = useAuth();
  const { t } = useTranslation('subscription');
  const { createSubscription } = useSubscriptionStore();
  
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tax and fee calculations
  const GST_RATE = 0.18; // 18% GST
  const PLATFORM_FEE_RATE = 0.02; // 2% platform fee

  useEffect(() => {
    // Check authentication first
    if (!user) {
      console.log('❌ User not authenticated, redirecting to login');
      router.replace('/(auth)/login');
      return;
    }
    console.log('✅ User authenticated:', user.id || user.email);
    fetchPlanDetails();
  }, [planId, user]);

  const fetchPlanDetails = async () => {
    if (!planId) {
      setError(t('noPlanSelected'));
      setIsLoading(false);
      return;
    }

    try {
      const { default: api } = await import('@/utils/apiClient');
      const planDetails = await api.subscriptionPlans.getById(planId);
      setPlan(planDetails);
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError(t('failedToLoadPlan'));
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!plan) return null;

    const basePrice = plan.price;
    const platformFee = basePrice * PLATFORM_FEE_RATE;
    const subtotal = basePrice + platformFee;
    const gst = subtotal * GST_RATE;
    const total = subtotal + gst;

    return {
      basePrice,
      platformFee,
      subtotal,
      gst,
      total,
    };
  };

  const handleConfirmSubscription = async () => {
    console.log('🔍 Checkout - User object:', user);
    console.log('🔍 Checkout - User ID:', user?.id);
    console.log('🔍 Checkout - Plan ID:', planId);

    if (!user) {
      console.error('❌ No user found in checkout');
      setError(t('pleaseLoginToContinue'));
      router.push('/(auth)/login');
      return;
    }

    if (!planId) {
      console.error('❌ No plan ID found');
      setError(t('noPlanSelected'));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🛒 Processing subscription checkout...');
      console.log('📋 User authenticated:', { id: user.id, email: user.email });
      
      await createSubscription(planId);
      
      console.log('✅ Subscription created successfully!');
      
      // Navigate to success screen
      router.replace('/checkout-success');
    } catch (err) {
      console.error('❌ Subscription creation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      setError(errorMessage);
      
      // If user not authenticated error, redirect to login
      if (errorMessage.toLowerCase().includes('not authenticated') || 
          errorMessage.toLowerCase().includes('unauthorized')) {
        setTimeout(() => {
          router.push('/(auth)/login');
        }, 2000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9B42" />
          <Text style={styles.loadingText}>{t('loadingCheckout')}</Text>
        </View>
      </View>
    );
  }

  if (error && !plan) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{t('goBack')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const pricing = calculatePricing();
  if (!pricing) return null;

  return (
    <ProtectedRoute>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('checkout')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Plan Card */}
        <Animated.View 
          entering={FadeInDown.duration(400)}
          style={styles.planCard}
        >
          <View style={styles.planHeader}>
            <Package size={24} color="#FF9B42" />
            <Text style={styles.planCardTitle}>{t('selectedPlan')}</Text>
          </View>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
          
          <View style={styles.planDetailsRow}>
            <View style={styles.planDetail}>
              <Calendar size={16} color="#666666" />
              <Text style={styles.planDetailText}>{plan.duration} {t('days')}</Text>
            </View>
            {plan.features && plan.features.length > 0 && (
              <View style={styles.planDetail}>
                <Check size={16} color="#4CAF50" />
                <Text style={styles.planDetailText}>{plan.features.length} {t('features')}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Features List */}
        {plan.features && plan.features.length > 0 && (
          <Animated.View 
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.featuresCard}
          >
            <Text style={styles.sectionTitle}>{t('whatsIncluded')}</Text>
            {plan.features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Check size={18} color="#4CAF50" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Pricing Breakdown */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.pricingCard}
        >
          <View style={styles.pricingHeader}>
            <Receipt size={24} color="#FF9B42" />
            <Text style={styles.sectionTitle}>{t('priceBreakdown')}</Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{t('planPrice')}</Text>
            <Text style={styles.pricingValue}>₹{pricing.basePrice.toFixed(2)}</Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{t('platformFee')}</Text>
            <Text style={styles.pricingValue}>₹{pricing.platformFee.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{t('subtotal')}</Text>
            <Text style={styles.pricingValue}>₹{pricing.subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{t('gst18')}</Text>
            <Text style={styles.pricingValue}>₹{pricing.gst.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.pricingRow}>
            <Text style={styles.totalLabel}>{t('totalAmount')}</Text>
            <Text style={styles.totalValue}>₹{pricing.total.toFixed(2)}</Text>
          </View>
        </Animated.View>

        {/* Payment Method Section (Showcase) */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.paymentCard}
        >
          <View style={styles.paymentHeader}>
            <CreditCard size={24} color="#FF9B42" />
            <Text style={styles.sectionTitle}>{t('paymentMethod')}</Text>
          </View>
          
          <View style={styles.paymentMethodItem}>
            <View style={styles.paymentMethodInfo}>
              <CreditCard size={20} color="#666666" />
              <View style={styles.paymentMethodText}>
                <Text style={styles.paymentMethodName}>{t('creditDebitCard')}</Text>
                <Text style={styles.paymentMethodDesc}>{t('securePaymentViaRazorpay')}</Text>
              </View>
            </View>
            <View style={styles.selectedBadge}>
              <Check size={16} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.securityNote}>
            <Shield size={16} color="#4CAF50" />
            <Text style={styles.securityText}>
              {t('paymentInfoSecure')}
            </Text>
          </View>
        </Animated.View>

        {/* Error Message */}
        {error && (
          <Animated.View 
            entering={FadeInDown.duration(400)}
            style={styles.errorBanner}
          >
            <Text style={styles.errorBannerText}>{error}</Text>
          </Animated.View>
        )}

        {/* Terms */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.termsContainer}
        >
          <Text style={styles.termsText}>
            {t('bySubscribingYouAgree')}
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomSummary}>
          <Text style={styles.bottomTotalLabel}>{t('total')}</Text>
          <Text style={styles.bottomTotalValue}>₹{pricing.total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.subscribeButton,
            isProcessing && styles.subscribeButtonDisabled
          ]}
          onPress={handleConfirmSubscription}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.subscribeButtonText}>{t('processing')}</Text>
            </>
          ) : (
            <>
              <CreditCard size={20} color="#FFFFFF" />
              <Text style={styles.subscribeButtonText}>{t('confirmSubscribe')}</Text>
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backIconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planCardTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666666',
    marginLeft: 8,
  },
  planName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  planDetailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  planDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planDetailText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666666',
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    marginLeft: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    flex: 1,
  },
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  pricingValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FF9B42',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF9B42',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentMethodText: {
    gap: 4,
  },
  paymentMethodName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
  },
  paymentMethodDesc: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F9F4',
    borderRadius: 8,
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4CAF50',
    flex: 1,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#DC2626',
    textAlign: 'center',
  },
  termsContainer: {
    marginBottom: 100,
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomTotalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#666666',
  },
  bottomTotalValue: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FF9B42',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9B42',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF9B42',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
});

