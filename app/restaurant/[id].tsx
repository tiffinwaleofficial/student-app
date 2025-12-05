import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Twitter, 
  Truck, 
  CreditCard, 
  DollarSign,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock3,
  Users,
  Award,
  Heart
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function RestaurantDetails() {
  const router = useRouter();
  const { t } = useTranslation('orders');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    currentRestaurant, 
    currentRestaurantMenu, 
    isLoading, 
    error, 
    fetchRestaurantById, 
    fetchMenuForRestaurant 
  } = useRestaurantStore();

  const {
    availablePlans,
    isLoading: plansLoading,
    error: plansError,
    fetchAvailablePlans,
  } = useSubscriptionStore();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRestaurantById(id);
      fetchMenuForRestaurant(id);
      fetchAvailablePlans(true, id);
    }
  }, [id, fetchRestaurantById, fetchMenuForRestaurant]);

  // Create image gallery array
  const imageGallery = currentRestaurant ? [
    currentRestaurant.bannerUrl || currentRestaurant.image,
    currentRestaurant.logoUrl,
    currentRestaurant.bannerUrl || currentRestaurant.image,
  ].filter((url): url is string => Boolean(url)) : [];

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <Image source={{ uri: item }} style={styles.galleryImage} />
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {imageGallery.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentImageIndex && styles.activeDot
          ]}
        />
      ))}
    </View>
  );

  if (isLoading && !currentRestaurant) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9B42" />
        <Text style={styles.loadingText}>Loading Restaurant...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => {
          if (id) {
            fetchRestaurantById(id);
            fetchMenuForRestaurant(id);
          }
        }} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentRestaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Restaurant not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button and Favorite */}
      <View style={styles.header}>
        <BackButton color="#FFFFFF" />
        <TouchableOpacity 
          onPress={() => setIsFavorite(!isFavorite)} 
          style={styles.favoriteButton}
        >
          <Heart size={24} color={isFavorite ? "#FF6B6B" : "#FFFFFF"} fill={isFavorite ? "#FF6B6B" : "transparent"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.galleryContainer}>
          <FlatList
            data={imageGallery}
            renderItem={renderImageItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            style={styles.gallery}
          />
          {renderDots()}
        </Animated.View>

        {/* Restaurant Info */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.restaurantName}>{currentRestaurant.name}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {currentRestaurant.status === 'approved' ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Star size={18} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{currentRestaurant.rating}</Text>
              <Text style={styles.reviewCount}>({currentRestaurant.reviewCount} reviews)</Text>
            </View>
            <View style={styles.featuredBadge}>
              {currentRestaurant.isFeatured && (
                <View style={styles.featuredContainer}>
                  <Award size={16} color="#FF9B42" />
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.description}>{currentRestaurant.description}</Text>

          {/* Cuisine Types */}
          <View style={styles.cuisineContainer}>
            {(currentRestaurant.cuisineType || currentRestaurant.cuisineTypes || []).map((cuisine, index) => (
              <View key={index} style={styles.cuisineTag}>
                <Text style={styles.cuisineText}>{cuisine}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Modern Information Sections */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.infoSections}>
          
          {/* Location Section */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <MapPin size={22} color="#FF9B42" />
              <Text style={styles.sectionTitle}>{t('location')}</Text>
            </View>
            <Text style={styles.sectionContent}>{currentRestaurant.formattedAddress}</Text>
            <Text style={styles.sectionSubContent}>
              {currentRestaurant.address?.postalCode}, {currentRestaurant.address?.country}
            </Text>
          </View>

          {/* Business Hours Section */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Clock size={22} color="#4CAF50" />
              <Text style={styles.sectionTitle}>{t('businessHours')}</Text>
            </View>
            <Text style={styles.sectionContent}>
              {currentRestaurant.businessHours?.open} - {currentRestaurant.businessHours?.close}
            </Text>
            <Text style={styles.sectionSubContent}>
              {currentRestaurant.businessHours?.days?.join(', ')}
            </Text>
          </View>

          {/* Delivery Information */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Truck size={22} color="#2196F3" />
              <Text style={styles.sectionTitle}>Delivery Information</Text>
            </View>
            <View style={styles.deliveryInfoRow}>
              <View style={styles.deliveryInfoItem}>
                <Text style={styles.deliveryInfoLabel}>Delivery Radius</Text>
                <Text style={styles.deliveryInfoValue}>{currentRestaurant.deliveryRadius}km</Text>
              </View>
              <View style={styles.deliveryInfoItem}>
                <Text style={styles.deliveryInfoLabel}>Delivery Fee</Text>
                <Text style={styles.deliveryInfoValue}>₹{currentRestaurant.deliveryFee}</Text>
              </View>
            </View>
            <View style={styles.deliveryInfoRow}>
              <View style={styles.deliveryInfoItem}>
                <Text style={styles.deliveryInfoLabel}>Minimum Order</Text>
                <Text style={styles.deliveryInfoValue}>₹{currentRestaurant.minimumOrderAmount}</Text>
              </View>
              <View style={styles.deliveryInfoItem}>
                <Text style={styles.deliveryInfoLabel}>Estimated Time</Text>
                <Text style={styles.deliveryInfoValue}>{currentRestaurant.estimatedDeliveryTime}min</Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Phone size={22} color="#9C27B0" />
              <Text style={styles.sectionTitle}>{t('contactInformation')}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactDetail}>{currentRestaurant.contactPhone}</Text>
              <Text style={styles.contactDetail}>{currentRestaurant.contactEmail}</Text>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{t('call')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Mail size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{t('email')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <CreditCard size={22} color="#FF5722" />
              <Text style={styles.sectionTitle}>Payment Methods</Text>
            </View>
            <View style={styles.paymentMethods}>
              {currentRestaurant.acceptsCash && (
                <View style={styles.paymentMethodItem}>
                  <DollarSign size={18} color="#4CAF50" />
                  <Text style={styles.paymentMethodText}>Cash</Text>
                </View>
              )}
              {currentRestaurant.acceptsCard && (
                <View style={styles.paymentMethodItem}>
                  <CreditCard size={18} color="#2196F3" />
                  <Text style={styles.paymentMethodText}>Card</Text>
                </View>
              )}
              {currentRestaurant.acceptsUPI && (
                <View style={styles.paymentMethodItem}>
                  <CheckCircle size={18} color="#FF9B42" />
                  <Text style={styles.paymentMethodText}>UPI</Text>
                </View>
              )}
            </View>
          </View>

          {/* Business Details */}
          <View style={styles.infoSection}>
            <View style={styles.sectionHeader}>
              <Shield size={22} color="#607D8B" />
              <Text style={styles.sectionTitle}>Business Details</Text>
            </View>
            <View style={styles.businessDetails}>
              <View style={styles.businessDetailItem}>
                <Text style={styles.businessDetailLabel}>Established</Text>
                <Text style={styles.businessDetailValue}>{currentRestaurant.establishedYear}</Text>
              </View>
              <View style={styles.businessDetailItem}>
                <Text style={styles.businessDetailLabel}>GST Number</Text>
                <Text style={styles.businessDetailValue}>{currentRestaurant.gstNumber}</Text>
              </View>
              <View style={styles.businessDetailItem}>
                <Text style={styles.businessDetailLabel}>License</Text>
                <Text style={styles.businessDetailValue}>{currentRestaurant.licenseNumber}</Text>
              </View>
            </View>
          </View>

          {/* Social Media */}
          {currentRestaurant.socialMedia && (
            <View style={styles.infoSection}>
              <View style={styles.sectionHeader}>
                <Instagram size={22} color="#E91E63" />
                <Text style={styles.sectionTitle}>Follow Us</Text>
              </View>
              <View style={styles.socialMedia}>
                {currentRestaurant.socialMedia.instagram && (
                  <TouchableOpacity style={styles.socialMediaItem}>
                    <Instagram size={18} color="#E91E63" />
                    <Text style={styles.socialMediaText}>{currentRestaurant.socialMedia.instagram}</Text>
                  </TouchableOpacity>
                )}
                {currentRestaurant.socialMedia.twitter && (
                  <TouchableOpacity style={styles.socialMediaItem}>
                    <Twitter size={18} color="#1DA1F2" />
                    <Text style={styles.socialMediaText}>{currentRestaurant.socialMedia.twitter}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </Animated.View>

        {/* Menu Section */}
        <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.menuContainer}>
          <Text style={styles.menuTitle}>{t('menu')}</Text>
          {isLoading && !currentRestaurantMenu ? (
            <View style={styles.menuLoading}>
              <ActivityIndicator size="small" color="#FF9B42" />
              <Text style={styles.menuLoadingText}>{t('loadingMenu')}</Text>
            </View>
          ) : currentRestaurantMenu && currentRestaurantMenu.length > 0 ? (
            currentRestaurantMenu.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInUp.delay(index * 100).duration(500)}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    if (!item.id) {
                      console.error('❌ Menu item ID is undefined:', item);
                      return;
                    }
                    router.push(`/food-item/${item.id}` as any);
                  }}
                >
                  <Image 
                    source={{ uri: item.images?.[0] || item.imageUrl }} 
                    style={styles.menuItemImage} 
                  />
                  <View style={styles.menuItemDetails}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                    
                    {/* Rating Display */}
                    <View style={styles.menuItemRatingRow}>
                      <Star size={14} color="#FFD700" fill="#FFD700" />
                      <Text style={styles.menuItemRatingText}>
                        {item.averageRating?.toFixed(1) || 'No ratings'}
                      </Text>
                      <Text style={styles.menuItemReviewCount}>
                        ({item.totalReviews || 0} reviews)
                      </Text>
                    </View>
                    
                    {/* Nutritional Info Pills */}
                    {item.nutritionalInfo && (
                      <View style={styles.nutritionRow}>
                        <View style={styles.nutritionPill}>
                          <Text style={styles.nutritionText}>
                            {item.nutritionalInfo.calories} cal
                          </Text>
                        </View>
                        <View style={styles.nutritionPill}>
                          <Text style={styles.nutritionText}>
                            {item.nutritionalInfo.protein}g protein
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    <Text style={styles.menuItemPrice}>₹{item.price.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View style={styles.noMenuContainer}>
              <Text style={styles.noMenuText}>{t('noMenuItemsAvailable')}</Text>
            </View>
          )}
        </Animated.View>

        {/* Subscription Plans Section */}
        <Animated.View entering={FadeInUp.delay(800).duration(600)} style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Subscription Plans</Text>
          {plansLoading ? (
            <ActivityIndicator size="small" color="#FF9B42" />
          ) : plansError ? (
            <Text style={styles.errorText}>{plansError}</Text>
          ) : availablePlans.length > 0 ? (
            availablePlans.map((plan, index) => (
              <Animated.View key={plan.id} entering={FadeInUp.delay(index * 100).duration(500)}>
                <TouchableOpacity
                  style={styles.planCard}
                  onPress={() => router.push(`/checkout?planId=${plan.id}` as any)}
                >
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                  <View style={styles.planPricing}>
                    <Text style={styles.planPrice}>₹{plan.price}</Text>
                    <Text style={styles.planDuration}>/month</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View style={styles.noMenuContainer}>
              <Text style={styles.noMenuText}>No subscription plans available.</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    backgroundColor: '#FF9B42',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  
  // Header Styles
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    padding: 12,
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 25,
    padding: 12,
  },

  // Gallery Styles
  galleryContainer: {
    height: 300,
    position: 'relative',
  },
  gallery: {
    flex: 1,
  },
  galleryImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF9B42',
    width: 12,
    height: 8,
    borderRadius: 4,
  },

  // Info Container Styles
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    zIndex: 5,
    marginBottom: 30, // Added more space between restaurant info and location section
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-Bold',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
    fontFamily: 'Poppins-SemiBold',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  featuredText: {
    color: '#FF9B42',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  cuisineTag: {
    backgroundColor: '#FF9B42',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  cuisineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },

  // Modern Information Sections Styles
  infoSections: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoSection: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
  },
  sectionSubContent: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },

  // Delivery Information Styles
  deliveryInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deliveryInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  deliveryInfoLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  deliveryInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },

  // Contact Information Styles
  contactInfo: {
    marginBottom: 16,
  },
  contactDetail: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FF9B42',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'Poppins-SemiBold',
  },

  // Payment Methods Styles
  paymentMethods: {
    flexDirection: 'row',
    gap: 16,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontFamily: 'Poppins-Regular',
  },

  // Business Details Styles
  businessDetails: {
    gap: 12,
  },
  businessDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  businessDetailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  businessDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },

  // Social Media Styles
  socialMedia: {
    flexDirection: 'row',
    gap: 12,
  },
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  socialMediaText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontFamily: 'Poppins-Regular',
  },

  // Menu Styles
  menuContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: 10,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
  },
  menuLoading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  menuLoadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  menuItemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9B42',
    fontFamily: 'Poppins-Bold',
  },
  noMenuContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noMenuText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },

  // Enhanced Menu Item Styles
  menuItemRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  menuItemReviewCount: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  nutritionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  nutritionPill: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  nutritionText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9B42',
    fontFamily: 'Poppins-Bold',
  },
  planDuration: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
}); 