import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: 'primary' | 'secondary';
}

export function LoadingSpinner({ size = 'large', color = 'primary' }: LoadingSpinnerProps) {
    const { theme } = useTheme();

    const spinnerColor = color === 'primary' ? theme.colors.primary : theme.colors.textSecondary;

    return <ActivityIndicator size={size} color={spinnerColor} />;
}
