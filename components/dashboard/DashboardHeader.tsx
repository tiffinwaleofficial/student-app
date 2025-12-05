import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { CustomerProfile } from '@/types/api';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { useRouter } from 'expo-router';

interface DashboardHeaderProps {
    user: CustomerProfile | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
    const { t } = useTranslation('common');
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const router = useRouter();

    // Get dynamic greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 12) {
            return t('goodMorning');
        } else if (hour >= 12 && hour < 17) {
            return t('goodAfternoon');
        } else if (hour >= 17 && hour < 21) {
            return t('goodEvening');
        } else {
            return t('goodNight');
        }
    };

    // Format date
    const formatDate = () => {
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <View style={styles.greetingContainer}>
                    <Text style={styles.greeting}>
                        {getGreeting()}, {user?.firstName || user?.name?.split(' ')[0] || t('there')}!
                    </Text>
                    <View style={styles.locationRow}>
                        <MapPin size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.locationText} numberOfLines={1}>
                            {user?.address || t('setYourLocation')}
                        </Text>
                        <Text style={styles.dateText}>• {formatDate()}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.bellContainer}
                    onPress={() => router.push('/notifications' as never)}
                >
                    <Bell size={22} color={theme.colors.text} strokeWidth={2} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    header: {
        marginBottom: 4, // Reduced from 12 to minimize spacing
        paddingHorizontal: 10,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    greetingContainer: {
        flex: 1,
        gap: 6,
    },
    greeting: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 22, // Increased from 20 to make it bigger
        color: theme.colors.text,
        lineHeight: 28,
    },
    bellContainer: {
        width: 44,
        height: 44,
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 13,
        color: theme.colors.textSecondary,
        maxWidth: 150,
    },
    dateText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 13,
        color: theme.colors.textSecondary,
        opacity: 0.7,
    },
});
