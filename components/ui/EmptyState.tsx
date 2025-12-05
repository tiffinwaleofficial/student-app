import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <Icon size={64} color={theme.colors.textTertiary} />
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
            {action && <View style={styles.actionContainer}>{action}</View>}
        </View>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl - theme.spacing.xs,
        },
        title: {
            fontSize: theme.typography.size.xxl,
            fontWeight: theme.typography.weight.bold,
            marginTop: theme.spacing.xl - theme.spacing.xs,
            color: theme.colors.text,
            textAlign: 'center',
        },
        description: {
            fontSize: theme.typography.size.l,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.m - 2,
            textAlign: 'center',
            maxWidth: 300,
        },
        actionContainer: {
            marginTop: theme.spacing.xl,
        },
    });
