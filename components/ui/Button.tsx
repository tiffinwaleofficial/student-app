import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
    fullWidth = false,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const getVariantStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryButton;
            case 'secondary':
                return styles.secondaryButton;
            case 'outline':
                return styles.outlineButton;
            case 'ghost':
                return styles.ghostButton;
            case 'danger':
                return styles.dangerButton;
            default:
                return styles.primaryButton;
        }
    };

    const getVariantTextStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryText;
            case 'secondary':
                return styles.secondaryText;
            case 'outline':
                return styles.outlineText;
            case 'ghost':
                return styles.ghostText;
            case 'danger':
                return styles.dangerText;
            default:
                return styles.primaryText;
        }
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'small':
                return styles.smallButton;
            case 'medium':
                return styles.mediumButton;
            case 'large':
                return styles.largeButton;
            default:
                return styles.mediumButton;
        }
    };

    const getSizeTextStyle = () => {
        switch (size) {
            case 'small':
                return styles.smallText;
            case 'medium':
                return styles.mediumText;
            case 'large':
                return styles.largeText;
            default:
                return styles.mediumText;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getVariantStyle(),
                getSizeStyle(),
                fullWidth && styles.fullWidth,
                disabled && styles.disabledButton,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : '#FFFFFF'}
                />
            ) : (
                <>
                    {icon && icon}
                    <Text
                        style={[
                            styles.text,
                            getVariantTextStyle(),
                            getSizeTextStyle(),
                            icon && styles.textWithIcon,
                            disabled && styles.disabledText,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.borderRadius.m,
    },
    fullWidth: {
        width: '100%',
    },
    disabledButton: {
        opacity: 0.5,
    },
    text: {
        fontWeight: theme.typography.weight.bold,
        fontFamily: theme.typography.fontFamily.bold,
    },
    textWithIcon: {
        marginLeft: theme.spacing.s,
    },
    disabledText: {
        // color: theme.colors.textTertiary, // Usually opacity handles this
    },

    // Variants
    primaryButton: {
        backgroundColor: theme.colors.primary,
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryButton: {
        backgroundColor: theme.colors.primaryLight,
    },
    secondaryText: {
        color: theme.colors.primary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    outlineText: {
        color: theme.colors.primary,
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    ghostText: {
        color: theme.colors.primary,
    },
    dangerButton: {
        backgroundColor: theme.colors.error,
    },
    dangerText: {
        color: '#FFFFFF',
    },

    // Sizes
    smallButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    smallText: {
        fontSize: theme.typography.size.xs,
    },
    mediumButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    mediumText: {
        fontSize: theme.typography.size.s,
    },
    largeButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    largeText: {
        fontSize: theme.typography.size.m,
    },
});
