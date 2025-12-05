import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    expanded?: boolean;
    onToggle?: () => void;
}

export const Accordion: React.FC<AccordionProps> = ({
    title,
    children,
    defaultExpanded = false,
    expanded: controlledExpanded,
    onToggle,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

    const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

    const handleToggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (onToggle) {
            onToggle();
        } else {
            setInternalExpanded(!internalExpanded);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.header, isExpanded && styles.headerExpanded]}
                onPress={handleToggle}
                activeOpacity={0.7}
            >
                <Text style={styles.title}>{title}</Text>
                {isExpanded ? (
                    <ChevronUp size={20} color={theme.colors.text} />
                ) : (
                    <ChevronDown size={20} color={theme.colors.text} />
                )}
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.content}>
                    {children}
                </View>
            )}
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.card,
    },
    headerExpanded: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: theme.typography.size.m,
        fontFamily: theme.typography.fontFamily.medium,
        color: theme.colors.text,
        flex: 1,
        marginRight: theme.spacing.s,
    },
    content: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.background,
    },
});
