import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface BadgeProps {
    children: string;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'default';
    size?: 'small' | 'medium';
}

export function Badge({ children, variant = 'default', size = 'medium' }: BadgeProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const variantStyles: Record<string, TextStyle> = {
        primary: styles.badgePrimary,
        success: styles.badgeSuccess,
        warning: styles.badgeWarning,
        error: styles.badgeError,
        default: styles.badgeDefault,
    };

    const sizeStyles = {
        small: styles.badgeSmall,
        medium: styles.badgeMedium,
    };

    return (
        <Text style={[styles.badge, variantStyles[variant], sizeStyles[size]]}>
            {children}
        </Text>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        badge: {
            fontWeight: theme.typography.weight.bold,
            textAlign: 'center',
            overflow: 'hidden',
        },
        badgeSmall: {
            fontSize: theme.typography.size.xs,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.borderRadius.m,
        },
        badgeMedium: {
            fontSize: theme.typography.size.s,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s - 2,
            borderRadius: theme.borderRadius.m,
        },
        badgePrimary: {
            backgroundColor: theme.colors.primary,
            color: theme.colors.card,
        },
        badgeSuccess: {
            backgroundColor: theme.colors.success,
            color: theme.colors.card,
        },
        badgeWarning: {
            backgroundColor: '#FFA500',
            color: theme.colors.card,
        },
        badgeError: {
            backgroundColor: theme.colors.error,
            color: theme.colors.card,
        },
        badgeDefault: {
            backgroundColor: theme.colors.border,
            color: theme.colors.text,
        },
    });
