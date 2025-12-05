import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface FormInputProps extends Omit<TextInputProps, 'onChange'> {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

export function FormInput({
    label,
    value,
    onChange,
    error,
    required,
    ...textInputProps
}: FormInputProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}
            <TextInput
                style={[styles.input, error && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholderTextColor={theme.colors.textTertiary}
                {...textInputProps}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
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
        required: {
            color: theme.colors.error,
        },
        input: {
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: theme.spacing.m,
            borderRadius: theme.borderRadius.s,
            fontSize: theme.typography.size.m,
            color: theme.colors.text,
            backgroundColor: theme.colors.card,
        },
        inputError: {
            borderColor: theme.colors.error,
        },
        errorText: {
            fontSize: theme.typography.size.s,
            color: theme.colors.error,
            marginTop: theme.spacing.xs,
        },
    });
