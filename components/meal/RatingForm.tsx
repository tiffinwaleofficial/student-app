import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface RatingFormProps {
    rating: number;
    review: string;
    onRatingChange: (rating: number) => void;
    onReviewChange: (text: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    t: (key: string) => string;
}

export const RatingForm: React.FC<RatingFormProps> = ({
    rating,
    review,
    onRatingChange,
    onReviewChange,
    onSubmit,
    isSubmitting,
    t,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('rateMeal')}</Text>

            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onRatingChange(star)}
                        style={styles.starButton}
                    >
                        <Text style={[styles.starText, star <= rating && styles.starTextActive]}>
                            ★
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput
                style={styles.input}
                value={review}
                onChangeText={onReviewChange}
                placeholder={t('writeReviewPlaceholder')}
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                numberOfLines={4}
            />

            <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={onSubmit}
                disabled={isSubmitting}
            >
                <Text style={styles.submitButtonText}>
                    {isSubmitting ? t('submitting') : t('submitReview')}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: theme.typography.weight.bold,
        color: theme.colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    starButton: {
        padding: 8,
    },
    starText: {
        fontSize: 32,
        color: theme.colors.textTertiary,
    },
    starTextActive: {
        color: theme.colors.warningText, // Using the new warningText token (orange/gold)
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: theme.colors.textTertiary,
    },
    submitButtonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: theme.typography.weight.bold,
    },
});
