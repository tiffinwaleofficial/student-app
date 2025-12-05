import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Utensils, Star, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { Meal } from '@/types';
import { CustomerSubscription } from '@/types/api';

interface StatsOverviewProps {
    activeSubscription: CustomerSubscription | undefined;
    todayMeals: Meal[];
    upcomingMeals?: Meal[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
    activeSubscription,
    todayMeals,
    upcomingMeals = [],
}) => {
    const { t } = useTranslation('common');
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const calculateDaysLeft = () => {
        if (!activeSubscription) return '0';
        return Math.max(0, Math.ceil((new Date(activeSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))).toString();
    };

    const calculateMealsLeft = () => {
        if (!activeSubscription) return '0';
        const daysLeft = Math.max(0, Math.ceil((new Date(activeSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
        return ((activeSubscription.plan?.mealsPerDay || 1) * daysLeft).toString();
    };

    const calculateRating = () => {
        if (!activeSubscription) return '0.0';
        const allMeals = [...todayMeals, ...(upcomingMeals || [])];
        const ratedMeals = allMeals.filter(m => m.rating && m.rating > 0);
        if (ratedMeals.length === 0) {
            return activeSubscription.plan?.averageRating?.toFixed(1) || '0.0';
        }
        const avgRating = ratedMeals.reduce((sum, m) => sum + (m.rating || 0), 0) / ratedMeals.length;
        return avgRating.toFixed(1);
    };

    const calculateSavings = () => {
        if (!activeSubscription) return '0';
        const plan = activeSubscription.plan;
        if (!plan) return '0';

        const discountAmount = activeSubscription.discountAmount || 0;
        const discountedPrice = plan.discountedPrice || plan.price;
        const regularPrice = plan.price;
        const discountPerOrder = regularPrice - discountedPrice;

        const daysLeft = Math.max(0, Math.ceil((new Date(activeSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
        const mealsLeft = (plan.mealsPerDay || 1) * daysLeft;
        const totalSavings = discountAmount > 0
            ? discountAmount
            : discountPerOrder * mealsLeft;

        return Math.max(0, Math.round(totalSavings)).toString();
    };

    return (
        <View style={styles.container}>
            {/* Stats Cards - First Row */}
            <View style={styles.statsRow}>
                <View style={[styles.statsCard, { backgroundColor: '#EBF5FF' }]}>
                    <View style={[styles.statsIconContainer, { backgroundColor: '#FFFFFF' }]}>
                        <Calendar size={20} color="#3B82F6" strokeWidth={2.5} />
                    </View>
                    <View>
                        <Text style={styles.statsNumber}>{calculateDaysLeft()}</Text>
                        <Text style={styles.statsLabel}>{t('daysLeft')}</Text>
                    </View>
                </View>
                <View style={[styles.statsCard, { backgroundColor: '#FFF5E8' }]}>
                    <View style={[styles.statsIconContainer, { backgroundColor: '#FFFFFF' }]}>
                        <Utensils size={20} color="#FF9B42" strokeWidth={2.5} />
                    </View>
                    <View>
                        <Text style={styles.statsNumber}>{calculateMealsLeft()}</Text>
                        <Text style={styles.statsLabel}>{t('mealsLeft')}</Text>
                    </View>
                </View>
            </View>

            {/* Stats Cards - Second Row */}
            <View style={styles.statsRow}>
                <View style={[styles.statsCard, { backgroundColor: '#E6F7EF' }]}>
                    <View style={[styles.statsIconContainer, { backgroundColor: '#FFFFFF' }]}>
                        <Star size={20} color="#4CB944" strokeWidth={2.5} />
                    </View>
                    <View>
                        <Text style={styles.statsNumber}>{calculateRating()}</Text>
                        <Text style={styles.statsLabel}>{t('rating')}</Text>
                    </View>
                </View>
                <View style={[styles.statsCard, { backgroundColor: '#F0EAFF' }]}>
                    <View style={[styles.statsIconContainer, { backgroundColor: '#FFFFFF' }]}>
                        <Wallet size={20} color="#7C3AED" strokeWidth={2.5} />
                    </View>
                    <View>
                        <Text style={styles.statsNumber}>₹{calculateSavings()}</Text>
                        <Text style={styles.statsLabel}>{t('savings')}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        paddingHorizontal: 10, // Exactly 10px left and right
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        gap: 10,
    },
    statsCard: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statsIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    statsNumber: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 18,
        color: theme.colors.text,
        lineHeight: 22,
    },
    statsLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 11,
        color: theme.colors.textSecondary,
        opacity: 0.8,
    },
});
