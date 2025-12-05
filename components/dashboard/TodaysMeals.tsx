import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight, Utensils, Star, ThumbsUp } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { Meal } from '@/types';
import { BaseCard } from '../ui/BaseCard';

interface TodaysMealsProps {
    todayMeals: Meal[];
    isLoading: boolean;
    onViewAll: () => void;
    onMealPress: (mealId: string, action?: 'extras' | 'rate') => void;
}

export const TodaysMeals: React.FC<TodaysMealsProps> = ({
    todayMeals,
    isLoading,
    onViewAll,
    onMealPress,
}) => {
    const { t } = useTranslation('common');
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const renderMealCard = (meal: Meal, type: string) => {
        const mealTitle = getMealTitle(meal, type);

        return (
            <BaseCard
                key={meal.id || meal.orderId}
                style={styles.mealCard}
                onPress={() => {
                    if (meal.orderId) {
                        onMealPress(meal.orderId);
                    }
                }}
                variant="elevated"
            >
                <View style={styles.mealCardHeader}>
                    <Text style={styles.mealTypeLabel}>
                        {meal.deliveryTimeRange || 'Scheduled'}
                    </Text>
                    <View style={[styles.statusBadge, getStatusBadgeStyle(meal.status, theme, styles)]}>
                        <Text style={[styles.statusBadgeText, getStatusTextStyle(meal.status, theme, styles)]}>
                            {meal.status ? meal.status.charAt(0).toUpperCase() + meal.status.slice(1).replace('_', ' ') : 'Scheduled'}
                        </Text>
                    </View>
                </View>

                <View style={styles.mealCardContent}>
                    <View style={styles.mealInfo}>
                        <Text style={styles.mealName}>{mealTitle}</Text>
                        <Text style={styles.vendorName}>{meal.partnerName || 'Your Plan'}</Text>

                        {meal.items && meal.items.length > 0 && (
                            <View style={styles.mealItemsContainer}>
                                {meal.items
                                    .filter((item: any) => item.mealId !== 'delivery-fee')
                                    .slice(0, 4)
                                    .map((item: any, itemIndex: number) => (
                                        <View key={itemIndex} style={styles.mealItemTag}>
                                            <Text style={styles.mealItemText}>{getItemName(item)}</Text>
                                        </View>
                                    ))}
                                {meal.items.filter((item: any) => item.mealId !== 'delivery-fee').length > 4 && (
                                    <Text style={styles.mealItemMoreText}>
                                        +{meal.items.filter((item: any) => item.mealId !== 'delivery-fee').length - 4} more
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    {renderActionButtons(meal)}
                </View>
            </BaseCard>
        );
    };

    const renderActionButtons = (meal: Meal) => {
        if (meal.rating) {
            return (
                <View style={styles.ratingContainer}>
                    <Star size={14} color="#FFB800" fill="#FFB800" />
                    <Text style={styles.ratingText}>{meal.rating}</Text>
                </View>
            );
        }

        if (meal.status === 'delivered') {
            return (
                <TouchableOpacity
                    style={styles.rateButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        if (meal.orderId || meal.id) {
                            onMealPress(meal.orderId || meal.id || '', 'rate');
                        }
                    }}
                >
                    <ThumbsUp size={14} color={theme.colors.primary} />
                    <Text style={styles.rateButtonText}>{t('rate')}</Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={styles.addExtrasButton}
                onPress={(e) => {
                    e.stopPropagation();
                    if (meal.orderId || meal.id) {
                        onMealPress(meal.orderId || meal.id || '', 'extras');
                    }
                }}
            >
                <Text style={styles.addExtrasText}>+ Add Extras</Text>
            </TouchableOpacity>
        );
    };

    // Helper functions
    const getMealTitle = (meal: Meal, type: string) => {
        if (meal.items && meal.items.length > 0) {
            const mealItems = meal.items.filter((item: any) => item.mealId !== 'delivery-fee');
            const itemNames: string[] = [];
            mealItems.forEach((item: any) => {
                const name = getItemName(item);
                if (name && !itemNames.includes(name)) {
                    itemNames.push(name);
                }
            });
            return itemNames.length > 0
                ? itemNames.slice(0, 3).join(' • ') + (itemNames.length > 3 ? ' • ...' : '')
                : `${type.charAt(0).toUpperCase() + type.slice(1)} Meal`;
        }
        return `${type.charAt(0).toUpperCase() + type.slice(1)} Meal`;
    };

    const getItemName = (item: any) => {
        let itemName = `${item.quantity || 1}x Item`;
        if (item.specialInstructions) {
            const instructions = item.specialInstructions;
            if (instructions.includes('Roti')) itemName = `${item.quantity || 4} Rotis`;
            else if (instructions.includes('Allo')) itemName = 'Allo';
            else if (instructions.includes('Chawal')) itemName = 'Chawal';
            else if (instructions.includes('Dal')) itemName = 'Dal';
            else if (instructions.includes('Rice')) itemName = 'Rice';
            else if (instructions.includes('Salad')) itemName = 'Salad';
            else {
                const parts = instructions.split(' - ');
                itemName = parts[0].replace(/Subscription meal|breakfast|lunch|dinner|Delivery fee/gi, '').trim() || itemName;
            }
        } else if (item.mealId) {
            if (item.mealId.includes('roti')) itemName = `${item.quantity || 4} Rotis`;
            else if (item.mealId.includes('sabzi')) itemName = 'Sabzi';
            else if (item.mealId.includes('dal')) itemName = 'Dal';
            else if (item.mealId.includes('rice')) itemName = 'Rice';
            else if (item.mealId.includes('salad')) itemName = 'Salad';
        }
        return itemName;
    };

    const getStatusBadgeStyle = (status: string | undefined, theme: Theme, styles: any) => {
        switch (status) {
            case 'delivered': return styles.statusBadgeDelivered;
            case 'preparing': return styles.statusBadgePreparing;
            case 'confirmed': return styles.statusBadgeConfirmed;
            case 'ready': return styles.statusBadgeReady;
            case 'pending': return styles.statusBadgePending;
            default: return {};
        }
    };

    const getStatusTextStyle = (status: string | undefined, theme: Theme, styles: any) => {
        switch (status) {
            case 'delivered': return styles.statusBadgeTextDelivered;
            case 'preparing': return styles.statusBadgeTextPreparing;
            case 'confirmed': return styles.statusBadgeTextConfirmed;
            case 'ready': return styles.statusBadgeTextReady;
            default: return {};
        }
    };

    // Grouping Logic
    const uniqueMealsMap = new Map<string, Meal>();
    todayMeals?.forEach(meal => {
        const mealId = meal.orderId || meal.id;
        const mealType = (meal.mealType || meal.deliverySlot || 'lunch').toLowerCase();
        const deliveryKey = `${mealId}-${mealType}`;
        if (mealId && !uniqueMealsMap.has(deliveryKey)) {
            uniqueMealsMap.set(deliveryKey, meal);
        }
    });
    const deduplicatedMeals = Array.from(uniqueMealsMap.values());

    const groupedMeals = deduplicatedMeals.reduce((acc, meal) => {
        const mealType = meal.mealType || meal.deliverySlot || 'lunch';
        const typeKey = mealType.toLowerCase();
        if (!acc[typeKey]) acc[typeKey] = [];
        acc[typeKey].push(meal);
        return acc;
    }, {} as Record<string, Meal[]>);

    const mealTypeOrder = ['breakfast', 'lunch', 'dinner'];
    const mealTypeLabels: Record<string, string> = {
        breakfast: '🌅 Breakfast',
        lunch: '🍽️ Lunch',
        dinner: '🌙 Dinner',
        morning: '🌅 Breakfast',
        afternoon: '🍽️ Lunch',
        evening: '🌙 Dinner',
    };

    return (
        <View style={styles.todaysMealsContainer}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('todaysMeals')}</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
                    <Text style={styles.viewAllText}>{t('viewAll')}</Text>
                    <ChevronRight size={16} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {todayMeals && todayMeals.length > 0 ? (
                mealTypeOrder.map((type) => {
                    const meals = groupedMeals[type] || [];
                    if (meals.length === 0) return null;

                    return (
                        <View key={type} style={styles.mealTypeGroup}>
                            <View style={styles.mealTypeGroupHeader}>
                                <Utensils size={18} color={theme.colors.primary} />
                                <Text style={styles.mealTypeGroupTitle}>
                                    {mealTypeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                            </View>
                            {meals.map((meal) => renderMealCard(meal, type))}
                        </View>
                    );
                })
            ) : isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading meals...</Text>
                </View>
            ) : (
                <View style={styles.noMealsContainer}>
                    <Utensils size={48} color="#CCCCCC" />
                    <Text style={styles.noMealsTitle}>{t('noMealsScheduled')}</Text>
                    <Text style={styles.noMealsText}>{t('mealsWillAppearHere')}</Text>
                </View>
            )}
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    todaysMealsContainer: {
        marginBottom: 8,
        paddingHorizontal: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontWeight: '700',
        fontSize: 18,
        color: theme.colors.text,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        color: theme.colors.primary,
        marginRight: 4,
    },
    mealTypeGroup: {
        marginBottom: 16,
    },
    mealTypeGroupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    mealTypeGroupTitle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 16,
        color: theme.colors.text,
        marginLeft: 8,
    },
    mealCard: {
        padding: 0, // BaseCard adds padding, but we want custom content structure
        marginBottom: 16,
        overflow: 'hidden',
    },
    mealCardHeader: {
        backgroundColor: theme.colors.primaryLight + '40', // Light orange
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.primaryLight,
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mealTypeLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        color: theme.colors.text,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: theme.colors.border,
    },
    statusBadgeText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    statusBadgeDelivered: { backgroundColor: theme.colors.success + '20' },
    statusBadgePreparing: { backgroundColor: theme.colors.info + '20' },
    statusBadgeConfirmed: { backgroundColor: theme.colors.primary + '20' },
    statusBadgeReady: { backgroundColor: theme.colors.success + '20' },
    statusBadgePending: { backgroundColor: theme.colors.border },

    statusBadgeTextDelivered: { color: theme.colors.success },
    statusBadgeTextPreparing: { color: theme.colors.info },
    statusBadgeTextConfirmed: { color: theme.colors.primary },
    statusBadgeTextReady: { color: theme.colors.success },

    mealCardContent: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mealInfo: {
        flex: 1,
        marginRight: 12,
    },
    mealName: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 4,
    },
    vendorName: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    mealItemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    mealItemTag: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    mealItemText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
    },
    mealItemMoreText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.medium,
        alignSelf: 'center',
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 12,
        fontFamily: theme.typography.fontFamily.semiBold,
        color: '#B45309',
    },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    rateButtonText: {
        marginLeft: 4,
        fontSize: 14,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.primary,
    },
    addExtrasButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 20,
    },
    addExtrasText: {
        fontSize: 12,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.primary,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
    },
    noMealsContainer: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: theme.colors.card,
        borderRadius: 16,
    },
    noMealsTitle: {
        marginTop: 16,
        fontSize: 18,
        fontFamily: theme.typography.fontFamily.semiBold,
        color: theme.colors.text,
    },
    noMealsText: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
