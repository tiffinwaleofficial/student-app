import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Clock as ClockIcon, Star, ThumbsUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Meal } from '@/types';
import { formatMealStatusText, getMealStatusColor } from '@/utils/mealUtils';
import { BaseCard } from '../ui/BaseCard';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface MealCardProps {
    meal: Meal;
    delay?: number;
}

export function MealCard({ meal, delay = 0 }: MealCardProps) {
    const router = useRouter();
    const { t } = useTranslation('common');
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const menuItem = meal.menu && meal.menu.length > 0 ? meal.menu[0] : null;

    const statusColor = getMealStatusColor(meal.status || 'pending');
    const statusText = formatMealStatusText(meal.status || 'pending');

    const handleTrackPress = () => {
        router.push({
            pathname: '/track',
            params: { id: meal.id }
        });
    };

    const handleRatePress = () => {
        router.push("/(tabs)");
        console.log('Rating functionality is coming soon!');
    };

    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
            <BaseCard style={styles.card}>
                {/* Type Header */}
                <View style={styles.typeContainer}>
                    <Text style={styles.typeText}>
                        {(meal.type || 'meal').charAt(0).toUpperCase() + (meal.type || 'meal').slice(1)}
                    </Text>
                </View>

                {menuItem ? (
                    <View style={styles.mealContent}>
                        <Image
                            source={{ uri: menuItem.imageUrl || (menuItem.images && menuItem.images[0]) }}
                            style={styles.mealImage}
                        />
                        <View style={styles.mealInfo}>
                            <Text style={styles.mealName}>{menuItem.name}</Text>
                            <Text style={styles.restaurantName}>{meal.restaurantName}</Text>

                            <View style={styles.mealDetails}>
                                <View style={styles.ratingContainer}>
                                    <Star size={14} color="#FFB800" fill="#FFB800" />
                                    <Text style={styles.ratingText}>{menuItem.averageRating || 'N/A'}</Text>
                                </View>

                                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                                </View>
                            </View>

                            <View style={styles.actionButtons}>
                                {meal.status === 'delivered' && (
                                    <TouchableOpacity
                                        style={styles.rateButton}
                                        onPress={handleRatePress}
                                    >
                                        <ThumbsUp size={14} color={theme.colors.primary} />
                                        <Text style={styles.rateButtonText}>{t('rate')}</Text>
                                    </TouchableOpacity>
                                )}
                                {(meal.status === 'preparing' || meal.status === 'ready') && (
                                    <TouchableOpacity
                                        style={styles.trackButton}
                                        onPress={handleTrackPress}
                                    >
                                        <ClockIcon size={14} color={theme.colors.card} />
                                        <Text style={styles.trackButtonText}>{t('track')}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyMealContent}>
                        <Text style={styles.emptyMealText}>{t('noMenuInfo')}</Text>
                    </View>
                )}
            </BaseCard>
        </Animated.View>
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    card: {
        marginBottom: theme.spacing.l,
        padding: 0, // Override default padding if any, though BaseCard doesn't have default padding on container
    },
    typeContainer: {
        backgroundColor: theme.colors.primaryLight,
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.primary + '20', // 20% opacity of primary
    },
    typeText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.size.s, // 14
        color: theme.colors.primary,
    },
    mealContent: {
        flexDirection: 'row',
        padding: theme.spacing.l,
        alignItems: 'center',
    },
    mealImage: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.s,
        marginRight: theme.spacing.l,
        resizeMode: 'cover',
    },
    mealInfo: {
        flex: 1,
    },
    mealName: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.size.l, // 16
        color: theme.colors.text,
        marginBottom: 4,
    },
    restaurantName: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.size.s, // 14
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.s,
    },
    mealDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    ratingText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.size.xs, // 12
        color: theme.colors.textSecondary,
        marginLeft: 4,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: theme.spacing.s,
        borderRadius: theme.borderRadius.xs,
    },
    statusText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.size.xs, // 12
    },
    actionButtons: {
        flexDirection: 'row',
    },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: theme.spacing.m,
        backgroundColor: theme.colors.primaryLight,
        borderRadius: theme.borderRadius.xs,
        borderWidth: 1,
        borderColor: theme.colors.primary + '20',
    },
    rateButtonText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.size.xs, // 12
        color: theme.colors.primary,
        marginLeft: 4,
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: theme.spacing.m,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.xs,
    },
    trackButtonText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.size.xs, // 12
        color: theme.colors.card,
        marginLeft: 4,
    },
    emptyMealContent: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyMealText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.size.s, // 14
        color: theme.colors.textTertiary,
    },
});
