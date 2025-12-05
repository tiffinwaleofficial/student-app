import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface TagOption {
    value: string;
    label: string;
    icon?: LucideIcon;
}

interface FormTagGroupProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: TagOption[];
}

export function FormTagGroup({
    label,
    value,
    onChange,
    options,
}: FormTagGroupProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.tagContainer}>
                {options.map((option) => {
                    const isSelected = value === option.value;
                    const Icon = option.icon;

                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.tagButton,
                                isSelected && styles.tagButtonActive,
                            ]}
                            onPress={() => onChange(option.value)}
                            activeOpacity={0.7}
                        >
                            {Icon && (
                                <Icon
                                    size={16}
                                    color={
                                        isSelected ? theme.colors.card : theme.colors.primary
                                    }
                                />
                            )}
                            <Text
                                style={[
                                    styles.tagButtonText,
                                    isSelected && styles.tagButtonTextActive,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            fontSize: theme.typography.size.m,
            fontWeight: theme.typography.weight.semiBold,
            color: theme.colors.text,
            marginBottom: theme.spacing.s,
        },
        tagContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.s,
        },
        tagButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.s - 2,
            paddingHorizontal: theme.spacing.m,
            borderRadius: theme.borderRadius.l,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.card,
            gap: theme.spacing.xs,
        },
        tagButtonActive: {
            backgroundColor: theme.colors.primary,
        },
        tagButtonText: {
            fontSize: theme.typography.size.s,
            fontWeight: theme.typography.weight.medium,
            color: theme.colors.primary,
        },
        tagButtonTextActive: {
            color: theme.colors.card,
        },
    });
