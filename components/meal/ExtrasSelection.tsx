import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

export interface ExtraItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface ExtrasSelectionProps {
    extras: ExtraItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    t: (key: string) => string;
}

export const ExtrasSelection: React.FC<ExtrasSelectionProps> = ({ extras, onUpdateQuantity, t }) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    if (!extras || extras.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('addExtras')}</Text>
            {extras.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>₹{item.price}</Text>
                    </View>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={[styles.quantityButton, item.quantity === 0 && styles.quantityButtonDisabled]}
                            onPress={() => onUpdateQuantity(item.id, -1)}
                            disabled={item.quantity === 0}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => onUpdateQuantity(item.id, 1)}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.text,
        marginBottom: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: theme.typography.weight.semiBold,
        color: theme.colors.text,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        padding: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonDisabled: {
        backgroundColor: theme.colors.textTertiary,
    },
    quantityButtonText: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: theme.typography.weight.bold,
        lineHeight: 20,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: theme.typography.weight.semiBold,
        color: theme.colors.text,
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },
});
