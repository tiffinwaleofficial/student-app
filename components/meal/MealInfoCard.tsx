import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Order } from '@/lib/api/services/order.service';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface MealInfoCardProps {
    order: Order;
    t: (key: string) => string;
}

export const MealInfoCard: React.FC<MealInfoCardProps> = ({ order, t }) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    // Safe access to properties that might be missing in the strict Order type
    // or are nested in subscriptionPlan
    const orderAny = order as any;
    const mealName = orderAny.mealName || orderAny.subscriptionPlan?.name || order.items?.[0]?.name || t('meal');
    const mealImage = orderAny.mealImage || orderAny.subscriptionPlan?.imageUrl || 'https://via.placeholder.com/400x200';
    const mealDescription = orderAny.mealDescription || orderAny.description || order.specialInstructions || t('deliciousMeal');

    const calories = orderAny.calories || orderAny.nutritionalInfo?.calories;
    const protein = orderAny.protein || orderAny.nutritionalInfo?.protein;
    const carbs = orderAny.carbs || orderAny.nutritionalInfo?.carbs;
    const fats = orderAny.fats || orderAny.nutritionalInfo?.fats;

    return (
        <View style={styles.card}>
            <Image source={{ uri: mealImage }} style={styles.mealImage} />
            <View style={styles.content}>
                <Text style={styles.mealName}>{mealName}</Text>
                <Text style={styles.mealDescription}>{mealDescription}</Text>

                <View style={styles.macrosContainer}>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{calories || 'N/A'}</Text>
                        <Text style={styles.macroLabel}>{t('calories')}</Text>
                    </View>
                    <View style={styles.macroDivider} />
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{protein ? `${protein}g` : 'N/A'}</Text>
                        <Text style={styles.macroLabel}>{t('protein')}</Text>
                    </View>
                    <View style={styles.macroDivider} />
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{carbs ? `${carbs}g` : 'N/A'}</Text>
                        <Text style={styles.macroLabel}>{t('carbs')}</Text>
                    </View>
                    <View style={styles.macroDivider} />
                    <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>{fats ? `${fats}g` : 'N/A'}</Text>
                        <Text style={styles.macroLabel}>{t('fats')}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mealImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    content: {
        padding: 16,
    },
    mealName: {
        fontSize: 20,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.text,
        marginBottom: 8,
    },
    mealDescription: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    macrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 12,
        borderRadius: 12,
    },
    macroItem: {
        alignItems: 'center',
        flex: 1,
    },
    macroValue: {
        fontSize: 16,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.primary,
        marginBottom: 4,
    },
    macroLabel: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    macroDivider: {
        width: 1,
        height: 24,
        backgroundColor: theme.colors.border,
    },
});
