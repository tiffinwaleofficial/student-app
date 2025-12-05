import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, Utensils, Clock, Award, Calendar } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { CustomerSubscription } from '@/types/api';

interface PlanOverviewCardProps {
    activeSubscription: CustomerSubscription | undefined;
    onViewDetails?: () => void;
}

export const PlanOverviewCard: React.FC<PlanOverviewCardProps> = ({
    activeSubscription,
    onViewDetails,
}) => {
    const { t } = useTranslation('common');
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysRemaining = () => {
        if (!activeSubscription) return 0;
        const end = new Date(activeSubscription.endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const daysRemaining = getDaysRemaining();
    const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

    return (
        <TouchableOpacity activeOpacity={0.95} onPress={onViewDetails}>
            <View style={styles.planCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.planBadge}>
                        <Award size={14} color="#FF9B42" fill="#FFF5E0" />
                        <Text style={styles.planBadgeText}>{t('activePlan')}</Text>
                    </View>
                    <TouchableOpacity style={styles.viewDetailsContainer} onPress={onViewDetails}>
                        <Text style={styles.viewDetailsText}>{t('details')}</Text>
                        <ChevronRight size={16} color="#666666" />
                    </TouchableOpacity>
                </View>

                {/* Plan Name */}
                <View style={styles.planContent}>
                    <Text style={styles.planName}>
                        {activeSubscription?.plan?.name || t('noActivePlan')}
                    </Text>
                    <Text style={styles.planDescription} numberOfLines={2}>
                        {activeSubscription?.plan?.description || t('noActiveSubscription')}
                    </Text>
                </View>

                {/* Plan Stats */}
                {activeSubscription && (
                    <>
                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <View style={[styles.statIconContainer, { backgroundColor: '#FFF5E0' }]}>
                                    <Utensils size={18} color="#FF9B42" />
                                </View>
                                <View>
                                    <Text style={styles.statValue}>{activeSubscription.plan?.mealsPerDay || 1}</Text>
                                    <Text style={styles.statLabel}>Meals/Day</Text>
                                </View>
                            </View>

                            <View style={styles.statItem}>
                                <View style={[styles.statIconContainer, { backgroundColor: isExpiringSoon ? '#FEF3C7' : '#ECFDF5' }]}>
                                    <Calendar size={18} color={isExpiringSoon ? '#F59E0B' : '#10B981'} />
                                </View>
                                <View>
                                    <Text style={[styles.statValue, isExpiringSoon && styles.statValueWarning]}>
                                        {daysRemaining}
                                    </Text>
                                    <Text style={styles.statLabel}>Days Left</Text>
                                </View>
                            </View>
                        </View>

                        {/* Expiry Info */}
                        <View style={[
                            styles.expiryInfo,
                            { backgroundColor: isExpiringSoon ? '#FEF3C7' : '#F3F4F6' }
                        ]}>
                            <Clock size={14} color={isExpiringSoon ? '#F59E0B' : '#999999'} />
                            <Text style={[styles.expiryText, isExpiringSoon && styles.expiryTextWarning]}>
                                {isExpiringSoon
                                    ? `Expiring soon on ${formatDate(activeSubscription.endDate)}`
                                    : `Valid until ${formatDate(activeSubscription.endDate)}`
                                }
                            </Text>
                        </View>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    planCard: {
        marginHorizontal: 10, // Exactly 10px left and right
        marginVertical: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: '#FF9B42',
        shadowColor: '#FF9B42',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5E0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    planBadgeText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 11,
        color: '#FF9B42',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    viewDetailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    viewDetailsText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 13,
        color: '#666666',
    },
    planContent: {
        marginBottom: 16,
    },
    planName: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 22,
        color: '#333333',
        marginBottom: 4,
    },
    planDescription: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 13,
        color: '#666666',
        lineHeight: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 18,
        color: '#333333',
        lineHeight: 22,
    },
    statValueWarning: {
        color: '#F59E0B',
    },
    statLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 11,
        color: '#999999',
    },
    expiryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    expiryText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        color: '#666666',
        flex: 1,
    },
    expiryTextWarning: {
        color: '#92400E',
    },
});
