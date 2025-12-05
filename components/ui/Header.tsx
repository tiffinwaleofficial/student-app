import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    title,
    showBack = true,
    onBack,
    rightAction,
    transparent = false,
}) => {
    const router = useRouter();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, transparent && styles.transparent]}>
            <View style={[styles.container, transparent && styles.transparent]}>
                <View style={styles.leftContainer}>
                    {showBack && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                </View>

                <View style={styles.rightContainer}>
                    {rightAction}
                </View>
            </View>
        </SafeAreaView>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    safeArea: {
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    container: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        backgroundColor: theme.colors.card,
    },
    transparent: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
    },
    leftContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    backButton: {
        padding: 4,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: theme.typography.size.l,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.bold,
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
});
