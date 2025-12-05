import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface ReviewRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
}

export const ReviewRating: React.FC<ReviewRatingProps> = ({ rating, onRatingChange }) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => (
            <TouchableOpacity
                key={index}
                onPress={() => onRatingChange(index + 1)}
                style={styles.starButton}
            >
                <Star
                    size={32}
                    color={index < rating ? "#FFD700" : theme.colors.border}
                    fill={index < rating ? "#FFD700" : "transparent"}
                />
            </TouchableOpacity>
        ));
    };

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rate your experience</Text>
            <View style={styles.starsContainer}>
                {renderStars()}
            </View>
            <Text style={styles.ratingText}>
                {rating === 0 ? 'Select a rating' : `${rating} out of 5 stars`}
            </Text>
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    section: {
        marginVertical: theme.spacing.m,
    },
    sectionTitle: {
        fontSize: theme.typography.size.m,
        fontWeight: theme.typography.weight.semiBold,
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
        fontFamily: theme.typography.fontFamily.semiBold,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: theme.spacing.s,
    },
    starButton: {
        padding: 4,
    },
    ratingText: {
        textAlign: 'center',
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
    },
});
