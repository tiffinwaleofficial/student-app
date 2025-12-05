import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChevronRight, Utensils, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { Meal } from '@/types';
import { BaseCard } from '../ui/BaseCard';

interface UpcomingMealsProps {
    todayMeals: Meal[];
    onViewAll: () => void;
    onMealPress: (mealId: string, action?: 'extras' | 'rate') => void;
}

export const UpcomingMeals: React.FC<UpcomingMealsProps> = ({
    todayMeals,
    onViewAll,
    onMealPress,
}) => {
    const { t } = useTranslation('common');
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    // "Coming Up Next" should show only TODAY's meals that are yet to occur
    const getUpcomingMeals = () => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        // Get all today's meals (from todayMeals) that are still pending/preparing/confirmed
        const todayUpcomingMeals = todayMeals.filter((meal: Meal) => {
            // Must be for today
            const deliveryDate = meal.deliveryDate ? new Date(meal.deliveryDate) : null;
            const scheduledTime = meal.deliveryTime ? new Date(meal.deliveryTime) : null;

            // Check if it's today
            let isToday = false;
            if (deliveryDate) {
                const mealDate = new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate());
                isToday = mealDate >= todayStart && mealDate < todayEnd;
            } else if (scheduledTime) {
                const mealDate = new Date(scheduledTime.getFullYear(), scheduledTime.getMonth(), scheduledTime.getDate());
                isToday = mealDate >= todayStart && mealDate < todayEnd;
            }

            if (!isToday) return false;

            // Must be in the future (scheduled time hasn't passed yet)
            if (scheduledTime) {
                if (scheduledTime <= now) return false;
            }

            // Must be pending, preparing, confirmed, or ready (not delivered/cancelled)
            const status = (meal.status || '').toLowerCase();
            if (status === 'delivered' || status === 'cancelled') return false;

            return true;
        });

        // Sort by scheduled time and take only the next one(s) - limit to 3-5 upcoming meals for today
        const sortedTodayUpcoming = todayUpcomingMeals.sort((a, b) => {
            const timeA = a.deliveryTime ? new Date(a.deliveryTime).getTime() : 0;
            const timeB = b.deliveryTime ? new Date(b.deliveryTime).getTime() : 0;
            return timeA - timeB; // Earliest first
        });

        return sortedTodayUpcoming.slice(0, 5); // Show max 5 upcoming meals for today
    };

    const upcomingMealsList = getUpcomingMeals();

    const renderMealCard = (meal: Meal) => {
        const mealType = meal.mealType || meal.deliverySlot || 'lunch';
        const mealTitle = getMealTitle(meal, mealType);
        const statusColor = getStatusColor(meal.status, theme);

        return (
            <TouchableOpacity
                key={meal.id || meal.orderId}
                activeOpacity={0.9}
                onPress={() => {
                    if (meal.orderId) {
                        onMealPress(meal.orderId);
                    }
                }}
            >
                <View style={styles.mealCard}>
                    <View style={styles.mealImageContainer}>
                        <Image
                            source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
                            style={styles.mealImage}
                        />
                        <View style={styles.mealTypeTag}>
                            <Text style={styles.mealTypeText}>
                                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.mealContent}>
                        <View style={styles.mealHeader}>
                            <Text style={styles.mealName} numberOfLines={1}>{mealTitle}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                                <Text style={[styles.statusText, { color: statusColor }]}>
                                    {meal.status ? meal.status.charAt(0).toUpperCase() + meal.status.slice(1).replace('_', ' ') : 'Scheduled'}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.vendorName}>{meal.partnerName || 'Your Plan'}</Text>

                        <View style={styles.mealFooter}>
                            <View style={styles.timeContainer}>
                                <Clock size={14} color={theme.colors.textSecondary} />
                                <Text style={styles.timeText}>
                                    {meal.deliveryTimeRange || 'Scheduled'}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.addExtrasButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    if (meal.orderId) {
                                        onMealPress(meal.orderId, 'extras');
                                    }
                                }}
                            >
                                <Text style={styles.addExtrasText}>+ Extras</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Helper functions (duplicated from TodaysMeals, could be shared util but keeping self-contained for now)
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

    const getStatusColor = (status: string | undefined, theme: Theme) => {
        switch (status) {
            case 'delivered': return theme.colors.success;
            case 'preparing': return theme.colors.info;
            case 'confirmed': return theme.colors.primary;
            case 'ready': return theme.colors.success;
            case 'pending': return theme.colors.textSecondary;
            default: return theme.colors.textSecondary;
        }
    };

    return (
        <View style={styles.comingUpContainer}>
            <View style={styles.sectionHeader}>
                <Text style={styles.comingUpTitle}>{t('comingUpNext')}</Text>
                <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
                    <Text style={styles.viewAllText}>{t('viewAll')}</Text>
                    <ChevronRight size={16} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {upcomingMealsList.length > 0 ? (
                <View style={styles.listContainer}>
                    {upcomingMealsList.map((meal) => renderMealCard(meal))}
                </View>
            ) : (
                <View style={styles.noUpcomingMealsContainer}>
                    <Utensils size={48} color="#CCCCCC" />
                    <Text style={styles.noUpcomingMealsTitle}>{t('noUpcomingMeals')}</Text>
                    <Text style={styles.noUpcomingMealsText}>{t('upcomingMealsWillAppearHere')}</Text>
                </View>
            )}
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    comingUpContainer: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    comingUpTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 20,
        color: theme.colors.text,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary + '10',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    viewAllText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        color: theme.colors.primary,
        marginRight: 4,
    },
    listContainer: {
        gap: 16,
    },
    mealCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    mealImageContainer: {
        height: 140,
        width: '100%',
        position: 'relative',
    },
    mealImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    mealTypeTag: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    mealTypeText: {
        color: '#FFFFFF',
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: 12,
    },
    mealContent: {
        padding: 16,
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    mealName: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 16,
        color: theme.colors.text,
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    vendorName: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        color: theme.colors.primary,
        marginBottom: 12,
    },
    mealFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    addExtrasButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    addExtrasText: {
        color: '#FFFFFF',
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: 12,
    },
    noUpcomingMealsContainer: {
        alignItems: 'center',
        padding: 32,
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    noUpcomingMealsTitle: {
        marginTop: 16,
        fontSize: 18,
        fontFamily: theme.typography.fontFamily.semiBold,
        color: theme.colors.text,
    },
    noUpcomingMealsText: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
