import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface IconButtonProps {
    icon: LucideIcon;
    onPress: () => void;
    variant?: 'default' | 'ghost' | 'primary';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
}

export function IconButton({
    icon: Icon,
    onPress,
    variant = 'default',
    size = 'medium',
    disabled = false,
}: IconButtonProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const variantStyles: Record<string, ViewStyle> = {
        default: styles.buttonDefault,
        ghost: styles.buttonGhost,
        primary: styles.buttonPrimary,
    };

    const sizeConfig = {
        small: { padding: theme.spacing.xs, iconSize: 16 },
        medium: { padding: theme.spacing.s - 2, iconSize: 20 },
        large: { padding: theme.spacing.s, iconSize: 24 },
    };

    const config = sizeConfig[size];
    const iconColor =
        variant === 'primary' ? theme.colors.card : theme.colors.text;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                variantStyles[variant],
                { padding: config.padding },
                disabled && styles.buttonDisabled,
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <Icon
                size={config.iconSize}
                color={disabled ? theme.colors.textTertiary : iconColor}
            />
        </TouchableOpacity>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        button: {
            borderRadius: theme.borderRadius.xs,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonDefault: {
            backgroundColor: theme.colors.background,
        },
        buttonGhost: {
            backgroundColor: 'transparent',
        },
        buttonPrimary: {
            backgroundColor: theme.colors.primary,
        },
        buttonDisabled: {
            opacity: 0.5,
        },
    });
