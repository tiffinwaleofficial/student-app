import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface DividerProps {
    spacing?: 'xs' | 's' | 'm' | 'l' | 'xl';
    orientation?: 'horizontal' | 'vertical';
}

export function Divider({ spacing = 'm', orientation = 'horizontal' }: DividerProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const spacingValue = theme.spacing[spacing];

    return (
        <View
            style={[
                styles.divider,
                orientation === 'horizontal'
                    ? { marginVertical: spacingValue, height: 1 }
                    : { marginHorizontal: spacingValue, width: 1 },
            ]}
        />
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        divider: {
            backgroundColor: theme.colors.border,
        },
    });
