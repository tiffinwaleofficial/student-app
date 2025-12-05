import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  Utensils,
  Clock,
  Tag,
  TrendingDown,
  Check,
  MapPin,
  CreditCard,
  Info,
} from 'lucide-react-native';
import { BackButton } from '../../components/BackButton';
import {
  api,
  SubscriptionPlan,
  DurationType,
  MealFrequency,
} from '@/lib/api';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { secureTokenManager } from '@/auth/SecureTokenManager';
import { useFirebaseNotification } from '@/hooks/useFirebaseNotification';
import { notificationActions } from '@/store/notificationStore';

const { width } = Dimensions.get('window');

export default function PlanDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const planId = params.id as string;
  const { user, isAuthenticated, isInitialized } = useAuth();
  const { fetchCurrentSubscription } = useSubscriptionStore();
  const { showSuccess, showError } = useFirebaseNotification();

  // Debug: Log user state on mount and when it changes
  useEffect(() => {
    console.log('👤 PlanDetail: User state from useAuth():', { 
      hasUser: !!user, 
      userId: user?.id,
      isAuthenticated,
      isInitialized
    });
  }, [user, isAuthenticated, isInitialized]);

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchPlanDetails();
    }
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const planData = await api.plans.getPlanById(planId);
      setPlan(planData);
    } catch (error: any) {
      console.error('Failed to fetch plan details:', error);
      showError('Error', error.message || 'Failed to load plan details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    console.log('🔔 Subscribe button clicked!', { 
      hasPlan: !!plan, 
      subscribing, 
      hasUser: !!user, 
      userId: user?.id,
      isAuthenticated,
      isInitialized
    });

    if (!plan) {
      console.error('❌ No plan available');
      showError('Error', 'Plan information is missing. Please try again.');
      return;
    }

    if (subscribing) {
      console.log('⏳ Already subscribing, ignoring click');
      return;
    }

    // Wait for auth to initialize if not ready
    if (!isInitialized) {
      console.log('⏳ Auth not initialized, waiting...');
      // Wait a moment for auth to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Re-check from secureTokenManager after delay
      try {
        const storedUser = await secureTokenManager.getUser();
        const authState = await secureTokenManager.getAuthState();
        
        if (!authState || !storedUser || !storedUser.id) {
          showError(
            'Authentication Required',
            'Please login to subscribe to a plan'
          );
          // Navigate to login after a short delay
          setTimeout(() => {
            router.push('/(onboarding)/phone-verification' as any);
          }, 1500);
          return;
        }
      } catch (error) {
        console.error('❌ Error checking auth state:', error);
        showError(
          'Authentication Required',
          'Please login to subscribe to a plan'
        );
        // Navigate to login after a short delay
        setTimeout(() => {
          router.push('/(onboarding)/phone-verification' as any);
        }, 1500);
        return;
      }
    }

    // Check if user is authenticated - try multiple sources
    let currentUser = user;
    let userId: string | undefined = user?.id;

    // If user not from hook, try secureTokenManager
    if (!currentUser || !userId) {
      console.log('⚠️ User not from hook, trying secureTokenManager...');
      try {
        const storedUser = await secureTokenManager.getUser();
        if (storedUser && storedUser.id) {
          currentUser = storedUser;
          userId = storedUser.id;
          console.log('✅ Got user from secureTokenManager:', userId);
        }
      } catch (error) {
        console.error('❌ Error getting user from secureTokenManager:', error);
      }
    }

    if (!currentUser || !userId) {
      console.log('⚠️ User not authenticated', { 
        hasUser: !!user, 
        userId: user?.id,
        isAuthenticated,
        isInitialized
      });
      showError(
        'Authentication Required',
        'Please login to subscribe to a plan'
      );
      // Navigate to login after a short delay
      setTimeout(() => {
        router.push('/(onboarding)/phone-verification' as any);
      }, 1500);
      return;
    }

    // Check if user has delivery address (optional check - we'll use placeholder if missing)
    const deliveryAddress = (currentUser as any).address || (currentUser as any).deliveryAddress;
    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode) {
      console.log('⚠️ No delivery address found, proceeding with placeholder');
      // Don't block subscription - backend can use placeholder
      // User can update address later
    }

    try {
      console.log('🚀 Starting subscription creation process...');
      setSubscribing(true);

      // Calculate subscription dates based on plan duration
      const startDate = new Date();
      const endDate = new Date();
      
      // Calculate end date based on durationType and durationValue
      const durationValue = plan.durationValue || 30;
      const durationType = typeof plan.durationType === 'string' 
        ? plan.durationType.toLowerCase()
        : String(plan.durationType || 'days').toLowerCase();
      
      console.log('📅 Calculating dates:', { durationValue, durationType });

      if (durationType === 'days' || durationType === 'day') {
        endDate.setDate(endDate.getDate() + durationValue);
      } else if (durationType === 'weeks' || durationType === 'week') {
        endDate.setDate(endDate.getDate() + (durationValue * 7));
      } else if (durationType === 'months' || durationType === 'month') {
        endDate.setMonth(endDate.getMonth() + durationValue);
      } else {
        // Default to days if unknown
        endDate.setDate(endDate.getDate() + durationValue);
      }

      // Get delivery slot (use first enabled slot if available)
      let deliverySlot: string | undefined;
      if (plan.deliverySlots) {
        if (plan.deliverySlots.morning?.enabled) {
          deliverySlot = 'morning';
        } else if (plan.deliverySlots.afternoon?.enabled) {
          deliverySlot = 'afternoon';
        } else if (plan.deliverySlots.evening?.enabled) {
          deliverySlot = 'evening';
        }
      }

      // Get plan details to calculate total amount
      const planPrice = plan.discountedPrice || plan.price || 0;
      const totalAmount = planPrice + (plan.deliveryFee || 0);

      // Prepare subscription data matching backend DTO format
      // Backend expects: customer, plan, startDate, endDate, totalAmount
      const subscriptionData = {
        customer: userId!,
        plan: plan._id, // Backend expects 'plan' not 'subscriptionPlan'
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalAmount: totalAmount,
        discountAmount: plan.discountedPrice ? (plan.price - plan.discountedPrice) : 0,
        autoRenew: false,
        paymentFrequency: 'monthly' as const,
        status: 'pending' as const,
        isPaid: false,
        customizations: [],
      };

      console.log('📝 Creating subscription with data:', subscriptionData);

      // Create subscription - using apiClient directly to match backend DTO format
      // Note: The backend expects customer, plan, startDate, endDate, totalAmount
      // But subscriptionApi.createSubscription expects different format, so use apiClient directly
      const { apiClient } = await import('@/lib/api/client');
      console.log('📡 Calling API to create subscription...');
      
      const subscriptionResponse = await apiClient.post('/subscriptions', subscriptionData);
      const subscription = subscriptionResponse.data;

      console.log('✅ Subscription created successfully:', subscription);
      const subscriptionId = subscription._id;

      // Wait a moment for backend to process order generation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for order generation

      // Force refresh subscription store with fresh data
      await fetchCurrentSubscription(true);

      // Wait another moment to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 300));

      // Show success notification
      notificationActions.showNotification({
        id: `subscription-success-${Date.now()}`,
        type: 'toast',
        variant: 'success',
        title: 'Subscription Successful! 🎉',
        message: `You have successfully subscribed to ${plan.name}. Your meals will be delivered as per the plan schedule.`,
        duration: 5000,
      });

      // Show additional success toast
      showSuccess(
        'Subscription Active!',
        `Welcome to ${plan.name}! Your meals will be delivered as scheduled.`
      );

      // Navigate to dashboard after showing notification
      setTimeout(() => {
        // Force another refresh when navigating
        fetchCurrentSubscription(true);
        router.replace('/(tabs)' as any);
      }, 1000);
    } catch (error: any) {
      console.error('❌ Failed to create subscription:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Failed to create subscription. Please try again.';
      
      // Show error notification
      notificationActions.showNotification({
        id: `subscription-error-${Date.now()}`,
        type: 'toast',
        variant: 'error',
        title: 'Subscription Failed',
        message: errorMessage,
        duration: 5000,
      });

      // Also show error toast
      showError(
        'Subscription Failed',
        errorMessage
      );
    } finally {
      setSubscribing(false);
      console.log('🔄 Subscription process finished, subscribing state reset');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9F43" />
        <Text style={styles.loadingText}>Loading plan details...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Plan not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const partner = typeof plan.partner === 'object' ? plan.partner : null;
  const hasDiscount = plan.discountedPrice && plan.discountedPrice < plan.price;
  const discountPercentage = hasDiscount
    ? Math.round(((plan.price - plan.discountedPrice!) / plan.price) * 100)
    : 0;

  const formatDuration = () => {
    if (!plan || plan.durationValue === undefined || !plan.durationType) {
      return 'N/A';
    }

    // Normalize durationType to handle both string values and enum
    let normalizedType: string;
    
    if (typeof plan.durationType === 'string') {
      normalizedType = plan.durationType.toLowerCase().replace(/s$/, ''); // Remove trailing 's' if present
    } else {
      // Handle enum values - convert to string first
      normalizedType = String(plan.durationType).toLowerCase();
    }
    
    const typeMap: Record<string, string> = {
      'day': plan.durationValue === 1 ? 'Day' : 'Days',
      'days': plan.durationValue === 1 ? 'Day' : 'Days',
      'week': plan.durationValue === 1 ? 'Week' : 'Weeks',
      'weeks': plan.durationValue === 1 ? 'Week' : 'Weeks',
      'month': plan.durationValue === 1 ? 'Month' : 'Months',
      'months': plan.durationValue === 1 ? 'Month' : 'Months',
      // Handle enum values if they're different
      ...(typeof DurationType !== 'undefined' && {
        [String(DurationType.DAYS).toLowerCase()]: plan.durationValue === 1 ? 'Day' : 'Days',
        [String(DurationType.WEEKS).toLowerCase()]: plan.durationValue === 1 ? 'Week' : 'Weeks',
        [String(DurationType.MONTHS).toLowerCase()]: plan.durationValue === 1 ? 'Month' : 'Months',
      }),
    };
    
    const displayType = typeMap[normalizedType] || 
      (plan.durationValue === 1 ? 'Day' : 'Days'); // Fallback
    
    return `${plan.durationValue} ${displayType}`;
  };

  const formatFrequency = () => {
    const frequencyMap: Record<MealFrequency, string> = {
      [MealFrequency.DAILY]: 'Daily',
      [MealFrequency.WEEKDAYS]: 'Weekdays Only',
      [MealFrequency.WEEKENDS]: 'Weekends Only',
      [MealFrequency.CUSTOM]: 'Custom Days',
    };
    return frequencyMap[plan.mealFrequency];
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Plan Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Plan Image */}
        {plan.imageUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: plan.imageUrl }} style={styles.image} resizeMode="cover" />
            {hasDiscount && (
              <View style={styles.discountBadge}>
                <TrendingDown size={14} color="#FFF" />
                <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
              </View>
            )}
          </View>
        )}

        {/* Plan Header */}
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          {partner && (
            <View style={styles.partnerRow}>
              <Text style={styles.partnerLabel}>by</Text>
              <Text style={styles.partnerName}>{partner.businessName}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {plan.description && (
          <View style={styles.section}>
            <Text style={styles.description}>{plan.description}</Text>
          </View>
        )}

        {/* Price Section */}
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{plan.price}</Text>
            )}
            <Text style={styles.price}>
              ₹{hasDiscount ? plan.discountedPrice : plan.price}
            </Text>
            <Text style={styles.pricePeriod}>/ {formatDuration()}</Text>
          </View>
          {plan.deliveryFee && plan.deliveryFee > 0 && (
            <Text style={styles.deliveryFee}>+ ₹{plan.deliveryFee} delivery fee</Text>
          )}
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Overview</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Calendar size={20} color="#FF9F43" />
              </View>
              <Text style={styles.featureLabel}>Duration</Text>
              <Text style={styles.featureValue}>{formatDuration()}</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Clock size={20} color="#FF9F43" />
              </View>
              <Text style={styles.featureLabel}>Frequency</Text>
              <Text style={styles.featureValue}>{formatFrequency()}</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Utensils size={20} color="#FF9F43" />
              </View>
              <Text style={styles.featureLabel}>Meals/Day</Text>
              <Text style={styles.featureValue}>{plan.mealsPerDay}</Text>
            </View>
          </View>
        </View>

        {/* Meal Specification */}
        {plan.mealSpecification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.mealSpec}>
              {plan.mealSpecification.rotis && (
                <View style={styles.specRow}>
                  <Check size={18} color="#10B981" />
                  <Text style={styles.specText}>
                    {plan.mealSpecification.rotis} Rotis
                  </Text>
                </View>
              )}
              {plan.mealSpecification.sabzis?.map((sabzi, index) => (
                <View key={index} style={styles.specRow}>
                  <Check size={18} color="#10B981" />
                  <Text style={styles.specText}>
                    {sabzi.name} ({sabzi.quantity})
                  </Text>
                </View>
              ))}
              {plan.mealSpecification.dal && (
                <View style={styles.specRow}>
                  <Check size={18} color="#10B981" />
                  <Text style={styles.specText}>
                    Dal ({plan.mealSpecification.dal.type}) - {plan.mealSpecification.dal.quantity}
                  </Text>
                </View>
              )}
              {plan.mealSpecification.rice && (
                <View style={styles.specRow}>
                  <Check size={18} color="#10B981" />
                  <Text style={styles.specText}>
                    Rice {plan.mealSpecification.rice.type ? `(${plan.mealSpecification.rice.type})` : ''} - {plan.mealSpecification.rice.quantity}
                  </Text>
                </View>
              )}
              {plan.mealSpecification.salad && (
                <View style={styles.specRow}>
                  <Check size={18} color="#10B981" />
                  <Text style={styles.specText}>Fresh Salad</Text>
                </View>
              )}
              {plan.mealSpecification.curd && (
                <View style={styles.specRow}>
                  <Check size={18} color="#10B981" />
                  <Text style={styles.specText}>Curd</Text>
                </View>
              )}
              {plan.mealSpecification.extras?.filter((e) => e.included).map((extra, index) => (
                <View key={index} style={styles.specRow}>
                  <Check size={18} color="#10B981" />
                  <Text style={styles.specText}>{extra.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Weekly Menu */}
        {plan.weeklyMenu && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Menu</Text>
            {days.map((day) => {
              const dayKey = day.toLowerCase() as keyof typeof plan.weeklyMenu;
              const dayMenu = plan.weeklyMenu?.[dayKey];
              if (!dayMenu) return null;

              return (
                <View key={day} style={styles.menuDay}>
                  <Text style={styles.menuDayName}>{day}</Text>
                  {dayMenu.breakfast && dayMenu.breakfast.length > 0 && (
                    <View style={styles.menuMeal}>
                      <Text style={styles.menuMealType}>Breakfast:</Text>
                      <Text style={styles.menuMealItems}>{dayMenu.breakfast.join(', ')}</Text>
                    </View>
                  )}
                  {dayMenu.lunch && dayMenu.lunch.length > 0 && (
                    <View style={styles.menuMeal}>
                      <Text style={styles.menuMealType}>Lunch:</Text>
                      <Text style={styles.menuMealItems}>{dayMenu.lunch.join(', ')}</Text>
                    </View>
                  )}
                  {dayMenu.dinner && dayMenu.dinner.length > 0 && (
                    <View style={styles.menuMeal}>
                      <Text style={styles.menuMealType}>Dinner:</Text>
                      <Text style={styles.menuMealItems}>{dayMenu.dinner.join(', ')}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Delivery Slots */}
        {plan.deliverySlots && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Timings</Text>
            <View style={styles.slotsContainer}>
              {plan.deliverySlots.morning?.enabled && (
                <View style={styles.slotCard}>
                  <Text style={styles.slotTitle}>Morning</Text>
                  <Text style={styles.slotTime}>{plan.deliverySlots.morning.timeRange}</Text>
                </View>
              )}
              {plan.deliverySlots.afternoon?.enabled && (
                <View style={styles.slotCard}>
                  <Text style={styles.slotTitle}>Afternoon</Text>
                  <Text style={styles.slotTime}>{plan.deliverySlots.afternoon.timeRange}</Text>
                </View>
              )}
              {plan.deliverySlots.evening?.enabled && (
                <View style={styles.slotCard}>
                  <Text style={styles.slotTitle}>Evening</Text>
                  <Text style={styles.slotTime}>{plan.deliverySlots.evening.timeRange}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan Features</Text>
            <View style={styles.featuresListContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureListItem}>
                  <Tag size={16} color="#FF9F43" />
                  <Text style={styles.featureListText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Flexibility Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flexibility</Text>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Info size={16} color="#666" />
              <Text style={styles.infoText}>
                Pause up to {plan.maxPauseCount || 0} times
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Info size={16} color="#666" />
              <Text style={styles.infoText}>
                Skip up to {plan.maxSkipCount || 0} deliveries
              </Text>
            </View>
            {plan.maxCustomizationsPerDay && plan.maxCustomizationsPerDay > 0 && (
              <View style={styles.infoRow}>
                <Info size={16} color="#666" />
                <Text style={styles.infoText}>
                  {plan.maxCustomizationsPerDay} customizations per day allowed
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Terms and Conditions */}
        {plan.termsAndConditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{plan.termsAndConditions}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomBar} pointerEvents="box-none">
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPrice}>
            ₹{hasDiscount ? plan.discountedPrice : plan.price}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.subscribeButton, subscribing && styles.subscribeButtonDisabled]}
          onPress={() => {
            console.log('🔘 Button pressed!', { 
              plan: !!plan, 
              user: !!user, 
              subscribing,
              planId: plan?._id,
              userId: user?.id
            });
            handleSubscribe();
          }}
          disabled={subscribing || !plan}
          activeOpacity={0.7}
        >
          {subscribing ? (
            <>
            <ActivityIndicator size="small" color="#FFF" />
              <Text style={styles.subscribeButtonText}>Subscribing...</Text>
            </>
          ) : (
            <>
              <CreditCard size={20} color="#FFF" />
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  planHeader: {
    backgroundColor: '#FFF',
    padding: 16,
    gap: 8,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partnerLabel: {
    fontSize: 14,
    color: '#999',
  },
  partnerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9F43',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 16,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  priceSection: {
    backgroundColor: '#FFF8E6',
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF9F43',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#666',
    marginLeft: 6,
  },
  deliveryFee: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: 12,
    color: '#999',
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  mealSpec: {
    gap: 12,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  specText: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  menuDay: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuDayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  menuMeal: {
    marginBottom: 6,
  },
  menuMealType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  menuMealItems: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  slotsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  slotCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 4,
  },
  slotTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  slotTime: {
    fontSize: 12,
    color: '#666',
  },
  featuresListContainer: {
    gap: 12,
  },
  featureListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureListText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  termsText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomPriceContainer: {
    justifyContent: 'center',
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF9F43',
  },
  subscribeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF9F43',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 32,
    gap: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  backButton: {
    backgroundColor: '#FF9F43',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});

