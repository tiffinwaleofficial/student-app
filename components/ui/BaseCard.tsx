import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface BaseCardProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'outlined' | 'flat';
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

interface CardHeaderProps {
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    badge?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

interface CardContentProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

interface CardFooterProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

function BaseCard({ children, variant = 'elevated', onPress, style }: BaseCardProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[
                styles.card,
                variant === 'elevated' && styles.elevated,
                variant === 'outlined' && styles.outlined,
                variant === 'flat' && styles.flat,
                style,
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            {children}
        </Container>
    );
}

function CardHeader({ title, subtitle, icon, action, badge, style }: CardHeaderProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    if (!title && !icon && !action && !badge) return null;

    return (
        <View style={[styles.header, style]}>
            <View style={styles.headerLeft}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <View>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            </View>
            <View style={styles.headerRight}>
                {badge && <View style={styles.badgeContainer}>{badge}</View>}
                {action}
            </View>
        </View>
    );
}

function CardContent({ children, style }: CardContentProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    return <View style={[styles.content, style]}>{children}</View>;
}

function CardFooter({ children, style }: CardFooterProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    return <View style={[styles.footer, style]}>{children}</View>;
}

BaseCard.Header = CardHeader;
BaseCard.Content = CardContent;
BaseCard.Footer = CardFooter;

const makeStyles = (theme: Theme) => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
        overflow: 'hidden',
    },
    elevated: {
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    outlined: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: 'transparent',
    },
    flat: {
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.m,
        paddingBottom: theme.spacing.xs,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
    },
    iconContainer: {
        marginRight: theme.spacing.s,
    },
    title: {
        fontSize: theme.typography.size.l,
        fontWeight: theme.typography.weight.semiBold,
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: theme.typography.size.s,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    badgeContainer: {
        marginRight: theme.spacing.xs,
    },
    content: {
        padding: theme.spacing.m,
    },
    footer: {
        padding: theme.spacing.m,
        paddingTop: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: theme.spacing.s,
    },
});

export { BaseCard };
