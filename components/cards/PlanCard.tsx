import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Calendar, Utensils, Clock, Tag, TrendingDown } from 'lucide-react-native';
import { SubscriptionPlan, MealFrequency } from '@/lib/api';
import { useRouter } from 'expo-router';
import { BaseCard } from '../ui/BaseCard';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

// Calculate card width based on screen dimensions
// Account for 16px padding on each side from parent container
const getCardWidth = () => {
    const { width } = Dimensions.get('window');
    return width - 32; // 16px padding * 2
};

const CARD_WIDTH = getCardWidth();

interface PlanCardProps {
    plan: SubscriptionPlan;
    onPress?: () => void;
    variant?: 'default' | 'compact';
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onPress, variant = 'default' }) => {
    const router = useRouter();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/pages/plan-detail?id=${plan._id}`);
        }
    };

    const formatDuration = () => {
        // Normalize durationType to handle both singular and plural from API
        const normalizedType = typeof plan.durationType === 'string'
            ? plan.durationType.toLowerCase().replace(/s$/, '') // Remove trailing 's' if present
            : plan.durationType;

        const typeMap: Record<string, string> = {
            'day': plan.durationValue === 1 ? 'Day' : 'Days',
            'days': plan.durationValue === 1 ? 'Day' : 'Days',
            'week': plan.durationValue === 1 ? 'Week' : 'Weeks',
            'weeks': plan.durationValue === 1 ? 'Week' : 'Weeks',
            'month': plan.durationValue === 1 ? 'Month' : 'Months',
            'months': plan.durationValue === 1 ? 'Month' : 'Months',
        };

        const displayType = typeMap[normalizedType as string] ||
            (plan.durationValue === 1 ? 'Day' : 'Days'); // Fallback

        return `${plan.durationValue} ${displayType}`;
    };

    const formatFrequency = () => {
        const frequencyMap: Record<MealFrequency, string> = {
            [MealFrequency.DAILY]: 'Daily',
            [MealFrequency.WEEKDAYS]: 'Weekdays Only',
            [MealFrequency.WEEKENDS]: 'Weekends Only',
            [MealFrequency.CUSTOM]: 'Custom',
        };
        return frequencyMap[plan.mealFrequency];
    };

    const hasDiscount = plan.discountedPrice && plan.discountedPrice < plan.price;
    const discountPercentage = hasDiscount
        ? Math.round(((plan.price - plan.discountedPrice!) / plan.price) * 100)
        : 0;

    if (variant === 'compact') {
        return (
            <BaseCard
                onPress={handlePress}
                style={styles.compactCard}
                variant="elevated"
            >
                <View style={styles.compactContent}>
                    <Text style={styles.compactName} numberOfLines={1}>{plan.name}</Text>
                    <View style={styles.compactRow}>
                        <Text style={styles.compactPrice}>
                            ₹{hasDiscount ? plan.discountedPrice : plan.price}
                        </Text>
                        <Text style={styles.compactDuration}>/ {formatDuration()}</Text>
                    </View>
                </View>
            </BaseCard>
        );
    }

    return (
        <BaseCard
            style={styles.card}
            onPress={handlePress}
            variant="elevated"
        >
            {/* Plan Image */}
            {plan.imageUrl && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: plan.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    {hasDiscount && (
                        <View style={styles.discountBadge}>
                            <TrendingDown size={12} color="#FFF" />
                            <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Plan Details */}
            <View style={styles.content}>
                {/* Plan Name */}
                <Text style={styles.planName} numberOfLines={2}>{plan.name}</Text>

                {/* Description */}
                {plan.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {plan.description}
                    </Text>
                )}

                {/* Key Info Grid */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Calendar size={16} color={theme.colors.primary} />
                        <Text style={styles.infoLabel}>Duration</Text>
                        <Text style={styles.infoValue}>{formatDuration()}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Clock size={16} color={theme.colors.primary} />
                        <Text style={styles.infoLabel}>Frequency</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>{formatFrequency()}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Utensils size={16} color={theme.colors.primary} />
                        <Text style={styles.infoLabel}>Meals/Day</Text>
                        <Text style={styles.infoValue}>{plan.mealsPerDay}</Text>
                    </View>
                </View>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                    <View style={styles.featuresContainer}>
                        {plan.features.slice(0, 2).map((feature, index) => (
                            <View key={index} style={styles.featureTag}>
                                <Tag size={10} color={theme.colors.success} />
                                <Text style={styles.featureText} numberOfLines={1}>{feature}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Meal Specification Preview */}
                {plan.mealSpecification && (
                    <View style={styles.mealSpecRow}>
                        {plan.mealSpecification.rotis && (
                            <View style={styles.specTag}>
                                <Text style={styles.specText}>{plan.mealSpecification.rotis} Rotis</Text>
                            </View>
                        )}
                        {plan.mealSpecification.sabzis && plan.mealSpecification.sabzis.length > 0 && (
                            <View style={styles.specTag}>
                                <Text style={styles.specText}>{plan.mealSpecification.sabzis.length} Sabzi</Text>
                            </View>
                        )}
                        {plan.mealSpecification.dal && (
                            <View style={styles.specTag}>
                                <Text style={styles.specText}>Dal</Text>
                            </View>
                        )}
                        {plan.mealSpecification.rice && (
                            <View style={styles.specTag}>
                                <Text style={styles.specText}>Rice</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Price Section */}
                <View style={styles.priceContainer}>
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
                        <Text style={styles.deliveryFee}>+ ₹{plan.deliveryFee} delivery</Text>
                    )}
                </View>

                {/* CTA Button */}
                <TouchableOpacity style={styles.ctaButton} onPress={handlePress}>
                    <Text style={styles.ctaText}>View Details</Text>
                </TouchableOpacity>
            </View>
        </BaseCard>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    card: {
        marginHorizontal: 0,
        marginBottom: theme.spacing.l,
        width: CARD_WIDTH,
        maxWidth: CARD_WIDTH,
        alignSelf: 'stretch',
        padding: 0,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 160,
        overflow: 'hidden',
        borderTopLeftRadius: theme.borderRadius.m,
        borderTopRightRadius: theme.borderRadius.m,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    discountBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: theme.colors.error,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.s,
    },
    discountText: {
        fontSize: 12,
        fontWeight: theme.typography.weight.bold,
        color: '#FFF', // Keep white for contrast on error color
        marginLeft: 4,
    },
    content: {
        padding: theme.spacing.l,
        width: '100%',
    },
    planName: {
        fontSize: theme.typography.size.xl,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.text,
        marginBottom: 6,
    },
    description: {
        fontSize: theme.typography.size.s,
        color: theme.colors.textSecondary,
        lineHeight: 20,
        marginBottom: theme.spacing.m,
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.m,
        paddingVertical: theme.spacing.m,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 11,
        color: theme.colors.textTertiary,
        marginTop: 4,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.text,
    },
    featuresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.m,
    },
    featureTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.success + '20', // 20% opacity
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.s,
        marginRight: theme.spacing.s,
        marginBottom: 6,
    },
    featureText: {
        fontSize: 12,
        color: theme.colors.success,
        fontWeight: theme.typography.weight.semiBold,
        marginLeft: 4,
        maxWidth: 120,
    },
    mealSpecRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.m,
    },
    specTag: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.s,
        marginRight: theme.spacing.s,
        marginBottom: 6,
    },
    specText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: theme.typography.weight.semiBold,
    },
    priceContainer: {
        marginBottom: theme.spacing.m,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
        flexWrap: 'wrap',
    },
    originalPrice: {
        fontSize: theme.typography.size.m,
        color: theme.colors.textTertiary,
        textDecorationLine: 'line-through',
        marginRight: theme.spacing.s,
    },
    price: {
        fontSize: 28,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.primary,
    },
    pricePeriod: {
        fontSize: theme.typography.size.s,
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
    deliveryFee: {
        fontSize: 12,
        color: theme.colors.textTertiary,
        fontStyle: 'italic',
    },
    ctaButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        width: '100%',
    },
    ctaText: {
        fontSize: theme.typography.size.m,
        fontWeight: theme.typography.weight.bold,
        color: '#FFF', // Keep white for contrast on primary color
    },
    // Compact variant styles
    compactCard: {
        padding: theme.spacing.m,
        marginRight: theme.spacing.m,
        minWidth: 160,
    },
    compactContent: {
        gap: 6,
    },
    compactName: {
        fontSize: theme.typography.size.s,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.text,
    },
    compactRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    compactPrice: {
        fontSize: theme.typography.size.l,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.primary,
    },
    compactDuration: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
});
