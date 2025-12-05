import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Restaurant } from '@/types';
import { Star, MapPin, Utensils } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BaseCard } from '../ui/BaseCard';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface RestaurantCardProps {
    restaurant: Restaurant;
    featured?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
    restaurant,
    featured = false,
}) => {
    const router = useRouter();
    const { t } = useTranslation('common');
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const {
        id,
        name,
        address,
        cuisineType,
        rating,
        reviewCount,
        image,
        featuredDish,
        distance,
    } = restaurant;

    const handlePress = () => {
        router.push(`/restaurant/${id}`);
    };

    return (
        <BaseCard
            style={[styles.card, featured && styles.featuredCard]}
            onPress={handlePress}
            variant="elevated"
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                />
                {featured && (
                    <View style={styles.featuredBadge}>
                        <Text style={styles.featuredText}>{t('featured')}</Text>
                    </View>
                )}
                {distance && (
                    <View style={styles.distanceBadge}>
                        <MapPin size={12} color={theme.colors.text} />
                        <Text style={styles.distanceText}>{distance}</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.name}>{name}</Text>

                <View style={styles.addressContainer}>
                    <MapPin size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.address} numberOfLines={1}>
                        {typeof address === 'string' ? address : address?.street || 'Address unavailable'}
                    </Text>
                </View>

                <View style={styles.cuisineContainer}>
                    {(cuisineType || []).map((cuisine, index) => (
                        <View key={index} style={styles.cuisineBadge}>
                            <Text style={styles.cuisineText}>{cuisine}</Text>
                        </View>
                    ))}
                </View>

                {featuredDish && (
                    <View style={styles.featuredDishContainer}>
                        <Utensils size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.featuredDishLabel}>{t('famousFor')} </Text>
                        <Text style={styles.featuredDish}>{featuredDish}</Text>
                    </View>
                )}

                <View style={styles.ratingContainer}>
                    <View style={styles.ratingBadge}>
                        <Star size={14} color={theme.colors.primary} fill={theme.colors.primary} />
                        <Text style={styles.ratingText}>{rating ? rating.toFixed(1) : 'N/A'}</Text>
                    </View>
                    <Text style={styles.reviewCount}>({reviewCount || 0} {t('reviews')})</Text>
                </View>
            </View>
        </BaseCard>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    card: {
        marginHorizontal: 0,
        marginBottom: theme.spacing.l,
        padding: 0,
        overflow: 'hidden',
    },
    featuredCard: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    imageContainer: {
        height: 160,
        position: 'relative',
        borderTopLeftRadius: theme.borderRadius.m,
        borderTopRightRadius: theme.borderRadius.m,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    featuredBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.s,
    },
    featuredText: {
        color: '#FFFFFF', // Keep white for contrast
        fontSize: 12,
        fontWeight: theme.typography.weight.semiBold,
    },
    distanceBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: theme.colors.card, // Use card background (usually white/dark grey)
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.s,
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    distanceText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: theme.typography.weight.medium,
        color: theme.colors.text,
    },
    content: {
        padding: theme.spacing.m,
    },
    name: {
        fontSize: theme.typography.size.l,
        fontWeight: theme.typography.weight.semiBold,
        marginBottom: 4,
        color: theme.colors.text,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    address: {
        marginLeft: 4,
        fontSize: 12,
        color: theme.colors.textSecondary,
        flex: 1,
    },
    cuisineContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    cuisineBadge: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.s,
        marginRight: 4,
        marginBottom: 4,
    },
    cuisineText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    featuredDishContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    featuredDishLabel: {
        marginLeft: 4,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    featuredDish: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: theme.typography.weight.medium,
        color: theme.colors.text,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.l,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: theme.typography.weight.semiBold,
        color: theme.colors.primary,
    },
    reviewCount: {
        marginLeft: 8,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
});
