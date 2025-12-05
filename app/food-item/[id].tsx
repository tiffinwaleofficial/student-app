import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Star, Clock, Utensils, AlertTriangle, ShoppingCart, Edit, Trash2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import api from '@/utils/apiClient';
import { useReviewStore } from '@/store/reviewStore';
import { ReviewCard } from '@/components/cards/ReviewCard';
import { ReviewModal } from '@/components/ReviewModal';
import { BackButton } from '@/components/BackButton';
import { MenuItem, Review } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/hooks/useTranslation';

const { width } = Dimensions.get('window');

export default function FoodItemDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation('orders');
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { showError, success } = useNotification();

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const {
    menuItemReviews,
    fetchMenuItemReviews,
    markHelpful,
    updateReview,
    deleteReview: deleteReviewFromStore,
    isLoading: reviewsLoading
  } = useReviewStore();

  useEffect(() => {
    if (id) {
      fetchMenuItemDetails();
      fetchMenuItemReviews(id);
    }
  }, [id]);

  // Check if current user has already reviewed this item
  const getUserReview = () => {
    if (!user?.id) return null;
    const userId = user.id;
    return menuItemReviews.find(review =>
      review.user?.id === userId
    );
  };

  const hasUserReviewed = () => {
    return !!getUserReview();
  };

  const handleWriteReview = () => {
    const userReview = getUserReview();
    if (userReview) {
      showError('You have already reviewed this item. You can edit or delete your existing review.');
      return;
    }
    setEditingReview(null);
    setShowReviewModal(true);
  };

  const handleEditReview = () => {
    const userReview = getUserReview();
    if (userReview) {
      setEditingReview(userReview);
      setShowReviewModal(true);
    }
  };

  const handleDeleteReview = () => {
    const userReview = getUserReview();
    if (!userReview) return;

    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete your review? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReview(userReview.id)
        }
      ]
    );
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await deleteReviewFromStore(reviewId);
      success('Review deleted successfully');

      // Refresh reviews
      if (id) {
        fetchMenuItemReviews(id);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showError('Failed to delete review. Please try again.');
    }
  };

  const fetchMenuItemDetails = async () => {
    try {
      setIsLoading(true);
      const item = await api.menu.getItemDetails(id!);
      // Ensure the item has required fields
      const menuItem: MenuItem = {
        ...item,
        imageUrl: item.imageUrl || item.images?.[0] || '',
        businessPartner: item.businessPartner || '',
      };
      setMenuItem(menuItem);
    } catch (err) {
      setError('Failed to load menu item details');
      console.error('Error fetching menu item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? "#FFD700" : "#E0E0E0"}
        fill={index < rating ? "#FFD700" : "transparent"}
      />
    ));
  };

  const renderRatingBreakdown = () => {
    if (!menuItem?.averageRating || !menuItem?.totalReviews) return null;

    return (
      <View style={styles.ratingBreakdown}>
        <View style={styles.ratingSummary}>
          <Text style={styles.ratingNumber}>{menuItem.averageRating.toFixed(1)}</Text>
          <View style={styles.starsContainer}>
            {renderStars(Math.round(menuItem.averageRating))}
          </View>
          <Text style={styles.reviewCount}>{menuItem.totalReviews} {t('reviews')}</Text>
        </View>
      </View>
    );
  };

  const renderImageGallery = () => {
    const images = menuItem?.images || [];
    if (images.length === 0) return null;

    return (
      <View style={styles.imageGallery}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setSelectedImageIndex(index);
          }}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.galleryImage} />
          )}
          keyExtractor={(_, index) => index.toString()}
        />

        {/* Image indicators */}
        {images.length > 1 && (
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === selectedImageIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderNutritionalInfo = () => {
    if (!menuItem?.nutritionalInfo) return null;

    const { calories, protein, carbs, fat } = menuItem.nutritionalInfo;

    return (
      <View style={styles.nutritionSection}>
        <Text style={styles.sectionTitle}>Nutritional Information</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{calories}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{protein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{carbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{fat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTagsAndAllergens = () => {
    const tags = menuItem?.tags || [];
    const allergens = menuItem?.allergens || [];

    if (tags.length === 0 && allergens.length === 0) return null;

    return (
      <View style={styles.tagsSection}>
        {tags.length > 0 && (
          <View style={styles.tagGroup}>
            <Text style={styles.tagGroupTitle}>Tags</Text>
            <View style={styles.tagContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {allergens.length > 0 && (
          <View style={styles.tagGroup}>
            <Text style={styles.tagGroupTitle}>Allergens</Text>
            <View style={styles.tagContainer}>
              {allergens.map((allergen, index) => (
                <View key={index} style={[styles.tag, styles.allergenTag]}>
                  <AlertTriangle size={12} color="#FF6B6B" />
                  <Text style={[styles.tagText, styles.allergenText]}>{allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderReviews = () => {
    return (
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>{t('reviews')}</Text>
          {hasUserReviewed() ? (
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleEditReview}
              >
                <Edit size={16} color="#FF9B42" />
                <Text style={styles.editButtonText}>{t('edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteReview}
              >
                <Trash2 size={16} color="#FF6B6B" />
                <Text style={styles.deleteButtonText}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.writeReviewButton}
              onPress={handleWriteReview}
            >
              <Text style={styles.writeReviewText}>{t('writeReview')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {reviewsLoading ? (
          <ActivityIndicator size="small" color="#FF9B42" />
        ) : menuItemReviews.length > 0 ? (
          menuItemReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onMarkHelpful={(reviewId, isHelpful) => markHelpful(reviewId)}
            />
          ))
        ) : (
          <Text style={styles.noReviewsText}>{t('noReviewsYet')}</Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9B42" />
        <Text style={styles.loadingText}>Loading menu item...</Text>
      </View>
    );
  }

  if (error || !menuItem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Menu item not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMenuItemDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Menu Item</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {renderImageGallery()}

        {/* Item Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.itemName}>{menuItem.name}</Text>
          <Text style={styles.itemDescription}>{menuItem.description}</Text>

          {/* Rating */}
          {renderRatingBreakdown()}

          {/* Price */}
          <Text style={styles.price}>₹{menuItem.price.toFixed(2)}</Text>
        </View>

        {/* Nutritional Information */}
        {renderNutritionalInfo()}

        {/* Tags and Allergens */}
        {renderTagsAndAllergens()}

        {/* Reviews */}
        {renderReviews()}
      </ScrollView>

      {/* Order Button */}
      <View style={styles.orderSection}>
        <TouchableOpacity style={styles.orderButton}>
          <ShoppingCart size={20} color="#FFFFFF" />
          <Text style={styles.orderButtonText}>{t('addToCart')}</Text>
        </TouchableOpacity>
      </View>

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        menuItemId={id}
        editingReview={editingReview}
        onReviewSubmitted={() => {
          console.log('🔄 Review submitted, refreshing data...');
          fetchMenuItemReviews(id!);
          fetchMenuItemDetails();
          setEditingReview(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    backgroundColor: '#FF9B42',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    fontFamily: 'Poppins-SemiBold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  imageGallery: {
    height: 300,
    position: 'relative',
  },
  galleryImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
  },
  detailsSection: {
    padding: 20,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  itemDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  ratingBreakdown: {
    marginBottom: 16,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginRight: 8,
    fontFamily: 'Poppins-Bold',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF9B42',
    fontFamily: 'Poppins-Bold',
  },
  nutritionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  tagsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tagGroup: {
    marginBottom: 16,
  },
  tagGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  allergenTag: {
    backgroundColor: '#FFE8E8',
  },
  tagText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  allergenText: {
    color: '#FF6B6B',
    marginLeft: 4,
  },
  reviewsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewButton: {
    backgroundColor: '#FF9B42',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  writeReviewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#FFF5E8',
    borderWidth: 1,
    borderColor: '#FF9B42',
  },
  deleteButton: {
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  editButtonText: {
    color: '#FF9B42',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
  },
  orderSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  orderButton: {
    backgroundColor: '#FF9B42',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Poppins-SemiBold',
  },
});
