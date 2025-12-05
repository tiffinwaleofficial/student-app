import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { usePolicyContent } from '@/hooks/usePolicyContent';
import { LoadingSpinner } from '@/components/ui';
import { PolicyScreen } from '@/components/PolicyScreen';

export default function PolicyRoute() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const policy = usePolicyContent(slug);

    if (!policy) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <LoadingSpinner size="large" color="primary" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <PolicyScreen
            title={policy.title}
            data={policy}
            onBack={() => router.back()}
        />
    );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
