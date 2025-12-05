import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, Dimensions, Platform } from 'react-native';
import { X, Check, Star, Clock, Utensils, Gift, Shield, Truck, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SubscriptionPlan } from '@/types/api';

const { width } = Dimensions.get('window');

interface PlanDetailModalProps {
  visible: boolean;
  plan: SubscriptionPlan | null;
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  isActive?: boolean;
}

export default function PlanDetailModal({
  visible,
  plan,
  onClose,
  onSubscribe,
  isActive = false
}: PlanDetailModalProps) {
  const { t } = useTranslation('subscription');
  if (!plan) return null;

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(0)}`;
  };

  const mealTypes = [
    {
      type: 'Breakfast',
      items: ['Poha with Jalebi', 'Upma with Chutney', 'Paratha with Curd', 'Idli Sambhar'],
      icon: '🌅'
    },
    {
      type: 'Lunch',
      items: ['Dal Chawal Combo', 'Rajma Rice', 'Chole Bhature', 'Paneer Curry with Roti'],
      icon: '🌞'
    },
    {
      type: 'Dinner',
      items: ['Biryani with Raita', 'Dal Tadka with Rice', 'Mixed Veg Curry', 'Butter Chicken'],
      icon: '🌙'
    }
  ];

  const additionalPerks = [
    { icon: <Gift size={20} color="#FF5722" />, text: 'Free dessert on weekends' },
    { icon: <Shield size={20} color="#4CAF50" />, text: '100% hygiene guaranteed' },
    { icon: <Truck size={20} color="#2196F3" />, text: 'Free delivery & packaging' },
    { icon: <Star size={20} color="#FFB800" />, text: 'Premium quality ingredients' },
    { icon: <Clock size={20} color="#9C27B0" />, text: 'Flexible delivery timing' },
    { icon: <Utensils size={20} color="#E91E63" />, text: 'Nutritionist approved meals' }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
          {/* Hero Section with Image */}
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
              style={styles.heroImage}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
              style={styles.heroOverlay}
            />

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <BlurView intensity={80} tint="dark" style={styles.closeButtonBlur}>
                <X size={20} color="#FFFFFF" />
              </BlurView>
            </TouchableOpacity>

            <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.heroContent}>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{plan.durationValue || 30} Days Plan</Text>
              </View>
              <Text style={styles.heroTitle}>{plan.name}</Text>
              <Text style={styles.heroSubtitle}>{plan.description}</Text>
            </Animated.View>
          </View>

          {/* Floating Price Card */}
          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.priceCardContainer}>
            <View style={styles.priceCard}>
              <View>
                <Text style={styles.priceLabel}>Total Price</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatPrice(plan.discountedPrice || plan.price)}</Text>
                  {plan.discountedPrice && (
                    <Text style={styles.originalPrice}>{formatPrice(plan.price)}</Text>
                  )}
                </View>
              </View>
              <View style={styles.pricePerMealContainer}>
                <Text style={styles.pricePerMeal}>
                  ₹{Math.round((plan.discountedPrice || plan.price) / ((plan.mealsPerDay || 2) * (plan.durationValue || 30)))}
                </Text>
                <Text style={styles.pricePerMealLabel}>/ meal</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.contentContainer}>
            {/* Stats Grid */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Utensils size={20} color="#FF9B42" />
                </View>
                <Text style={styles.statValue}>{plan.mealsPerDay || 3}</Text>
                <Text style={styles.statLabel}>Meals/Day</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Clock size={20} color="#2196F3" />
                </View>
                <Text style={styles.statValue}>{plan.durationValue || 30}</Text>
                <Text style={styles.statLabel}>Days</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Shield size={20} color="#4CAF50" />
                </View>
                <Text style={styles.statValue}>{plan.maxSkipCount || 5}</Text>
                <Text style={styles.statLabel}>Skips</Text>
              </View>
            </Animated.View>

            {/* What's Included */}
            <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
              <Text style={styles.sectionTitle}>{t('whatsIncluded')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealTypesScroll}>
                {mealTypes.map((meal, index) => (
                  <View key={index} style={styles.mealTypeCard}>
                    <Text style={styles.mealTypeIcon}>{meal.icon}</Text>
                    <Text style={styles.mealTypeName}>{meal.type}</Text>
                    <View style={styles.divider} />
                    {meal.items.slice(0, 2).map((item, idx) => (
                      <Text key={idx} style={styles.mealItemText} numberOfLines={1}>• {item}</Text>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Features List */}
            {plan.features && plan.features.length > 0 && (
              <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.section}>
                <Text style={styles.sectionTitle}>{t('planFeatures')}</Text>
                <View style={styles.featuresList}>
                  {plan.features.map((feature: string, index: number) => (
                    <View key={index} style={styles.featureRow}>
                      <View style={styles.checkCircle}>
                        <Check size={12} color="#FFFFFF" />
                      </View>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Additional Perks */}
            <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.section}>
              <Text style={styles.sectionTitle}>{t('additionalPerks')}</Text>
              <View style={styles.perksGrid}>
                {additionalPerks.map((perk, index) => (
                  <View key={index} style={styles.perkItem}>
                    {perk.icon}
                    <Text style={styles.perkText}>{perk.text}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Bottom Spacer */}
            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* Fixed Bottom Action */}
        <Animated.View entering={SlideInDown.duration(500)} style={styles.bottomActionContainer}>
          <BlurView intensity={80} tint="light" style={styles.bottomBlur}>
            {!isActive ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onSubscribe(plan.id)}
                style={styles.subscribeButtonWrapper}
              >
                <LinearGradient
                  colors={['#FF9B42', '#FF6B6B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscribeButton}
                >
                  <Text style={styles.subscribeButtonText}>{t('subscribeToThisPlan')}</Text>
                  <ChevronRight size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.activeButton}>
                <Check size={20} color="#FF9B42" />
                <Text style={styles.activeButtonText}>Currently Active Plan</Text>
              </View>
            )}
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
  },
  closeButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroContent: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
  },
  planBadge: {
    backgroundColor: 'rgba(255, 155, 66, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  priceCardContainer: {
    paddingHorizontal: 20,
    marginTop: -40,
    zIndex: 5,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#999999',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
  },
  originalPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  pricePerMealContainer: {
    alignItems: 'flex-end',
  },
  pricePerMeal: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#4CAF50',
  },
  pricePerMealLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999999',
  },
  contentContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999999',
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
  mealTypesScroll: {
    paddingRight: 20,
    gap: 12,
  },
  mealTypeCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  mealTypeName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  mealItemText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  featuresList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333333',
    flex: 1,
  },
  perksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  perkItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#333333',
    flex: 1,
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBlur: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  subscribeButtonWrapper: {
    shadowColor: '#FF9B42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  activeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFF5E0',
    borderRadius: 16,
    gap: 8,
  },
  activeButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FF9B42',
  },
});
