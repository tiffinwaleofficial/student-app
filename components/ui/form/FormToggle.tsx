import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface FormToggleProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    description?: string;
}

export function FormToggle({
    label,
    value,
    onChange,
    description,
}: FormToggleProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={styles.label}>{label}</Text>
                    {description && (
                        <Text style={styles.description}>{description}</Text>
                    )}
                </View>
                <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{
                        false: theme.colors.border,
                        true: theme.colors.primary,
                    }}
                    thumbColor={theme.colors.card}
                />
            </View>
        </View>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            marginBottom: theme.spacing.m,
        },
        content: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: theme.spacing.s,
        },
        textContainer: {
            flex: 1,
            marginRight: theme.spacing.m,
        },
        label: {
            fontSize: theme.typography.size.m,
            fontWeight: theme.typography.weight.medium,
            color: theme.colors.text,
        },
        description: {
            fontSize: theme.typography.size.s,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
        },
    });
