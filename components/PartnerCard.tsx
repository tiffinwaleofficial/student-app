import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { MapPin, Star, Clock, Check, ChevronRight, Leaf, Drumstick } from 'lucide-react-native';
import { Partner } from '@/lib/api';
import { useRouter } from 'expo-router';

interface PartnerCardProps {
  partner: Partner;
  onPress?: () => void;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({ partner, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/pages/partner-detail?id=${partner._id}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Top Section: Logo + Basic Info */}
      <View style={styles.topSection}>
        {/* Partner Logo - Larger & More Prominent */}
        <View style={styles.logoContainer}>
          {partner.logoUrl ? (
            <Image
              source={{ uri: partner.logoUrl }}
              style={styles.logo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderLogo}>
              <Text style={styles.placeholderText}>
                {partner.businessName.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          {partner.status === 'approved' && (
            <View style={styles.verifiedBadge}>
              <Check size={10} color="#FFF" strokeWidth={4} />
            </View>
          )}
        </View>

        {/* Partner Info */}
        <View style={styles.infoContainer}>
          {/* Name & Open Status */}
          <View style={styles.nameRow}>
            <Text style={styles.businessName} numberOfLines={1}>
              {partner.businessName}
            </Text>
            {partner.isAcceptingOrders && (
              <View style={styles.openBadge}>
                <View style={styles.openDot} />
                <Text style={styles.openText}>Open</Text>
              </View>
            )}
          </View>

          {/* Rating - Prominent Display */}
          <View style={styles.ratingContainer}>
            {partner.averageRating && partner.averageRating > 0 ? (
              <View style={styles.ratingBadge}>
                <Star size={12} color="#FFF" fill="#FFF" />
                <Text style={styles.ratingText}>{partner.averageRating.toFixed(1)}</Text>
              </View>
            ) : (
              <View style={styles.newPartnerBadge}>
                <Text style={styles.newPartnerText}>New</Text>
              </View>
            )}
            {partner.totalReviews && partner.totalReviews > 0 && (
              <Text style={styles.reviewsText}>
                ({partner.totalReviews} reviews)
              </Text>
            )}
          </View>

          {/* Location */}
          {partner.address && (
            <View style={styles.locationRow}>
              <MapPin size={14} color="#9CA3AF" />
              <Text style={styles.locationText} numberOfLines={1}>
                {partner.address.city}, {partner.address.state}
              </Text>
            </View>
          )}

          {/* Dietary Icons - Important Visual Indicators */}
          <View style={styles.dietaryIconsRow}>
            {partner.isVegetarian && (
              <View style={styles.vegBadge}>
                <View style={styles.vegDot} />
                <Text style={styles.vegText}>Pure Veg</Text>
              </View>
            )}
            {!partner.isVegetarian && (
              <View style={styles.nonVegBadge}>
                <View style={styles.nonVegDot} />
                <Text style={styles.nonVegText}>Non-Veg</Text>
              </View>
            )}
            {partner.dietaryOptions?.includes('vegan') && (
              <View style={styles.veganBadge}>
                <Leaf size={10} color="#10B981" />
                <Text style={styles.veganText}>Vegan</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Bottom Section: Cuisines & Hours */}
      <View style={styles.bottomSection}>
        {/* Cuisine Tags - Show Top 2 */}
        {partner.cuisineTypes && partner.cuisineTypes.length > 0 && (
          <View style={styles.cuisineContainer}>
            {partner.cuisineTypes.slice(0, 2).map((cuisine, index) => (
              <View
                key={index}
                style={[
                  styles.cuisineTag,
                  index === 0 && styles.primaryCuisineTag
                ]}
              >
                <Text
                  style={[
                    styles.cuisineText,
                    index === 0 && styles.primaryCuisineText
                  ]}
                >
                  {cuisine}
                </Text>
              </View>
            ))}
            {partner.cuisineTypes.length > 2 && (
              <View style={styles.moreTag}>
                <Text style={styles.moreText}>+{partner.cuisineTypes.length - 2}</Text>
              </View>
            )}
          </View>
        )}

        {/* Operating Hours */}
        {partner.businessHours && (
          <View style={styles.hoursContainer}>
            <Clock size={12} color="#10B981" />
            <Text style={styles.hoursText}>
              {partner.businessHours.open} - {partner.businessHours.close}
            </Text>
          </View>
        )}
      </View>

      {/* View Details Arrow */}
      <View style={styles.arrowContainer}>
        <ChevronRight size={20} color="#FF9B42" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginRight: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  placeholderLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFF5E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FF9B42',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  openText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: '#059669',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9B42',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  newPartnerBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  newPartnerText: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    color: '#6B7280',
  },
  reviewsText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  dietaryIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  vegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 4,
  },
  vegText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#16A34A',
  },
  nonVegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  nonVegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 4,
  },
  nonVegText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#DC2626',
  },
  veganBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  veganText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#059669',
    marginLeft: 4,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cuisineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  cuisineTag: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  primaryCuisineTag: {
    backgroundColor: '#FFF5E0',
  },
  cuisineText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  primaryCuisineText: {
    color: '#FF9B42',
    fontFamily: 'Poppins-SemiBold',
  },
  moreTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  moreText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hoursText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#059669',
    marginLeft: 6,
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
});

