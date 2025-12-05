import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, ThumbsUp, Play } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Review } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { BaseCard } from '../ui/BaseCard';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface ReviewCardProps {
    review: Review;
    onMarkHelpful?: (reviewId: string, isHelpful: boolean) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onMarkHelpful }) => {
    const { user } = useAuthStore();
    const { t } = useTranslation('common');
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const [isHelpful, setIsHelpful] = useState(false);
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleMarkHelpful = () => {
        if (!review.id || review.id === 'undefined') {
            console.error('❌ ReviewCard: Invalid review ID:', review.id);
            return;
        }

        const newIsHelpful = !isHelpful;
        const newCount = newIsHelpful ? helpfulCount + 1 : helpfulCount - 1;

        setIsHelpful(newIsHelpful);
        setHelpfulCount(newCount);

        console.log('🔍 ReviewCard: Marking helpful for review:', review.id, 'isHelpful:', newIsHelpful);
        onMarkHelpful?.(review.id, newIsHelpful);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                size={14}
                color={index < rating ? "#FFD700" : theme.colors.border}
                fill={index < rating ? "#FFD700" : "transparent"}
            />
        ));
    };

    return (
        <BaseCard style={styles.container} variant="elevated">
            {/* User Info */}
            <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {(review.user?.firstName || review.user?.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                        {review.user?.firstName && review.user?.lastName
                            ? `${review.user.firstName} ${review.user.lastName}`
                            : review.user?.name || t('anonymousUser')
                        }
                    </Text>
                    <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                    {renderStars(review.rating)}
                </View>
                <Text style={styles.ratingText}>{review.rating}/5</Text>
            </View>

            {/* Comment */}
            {review.comment && (
                <Text style={styles.comment}>{review.comment}</Text>
            )}

            {/* Review Media */}
            {review.images && review.images.length > 0 && (
                <View style={styles.mediaContainer}>
                    {review.images.slice(0, 3).map((mediaUrl, index) => {
                        // Simple check if it's a video (could be enhanced with better detection)
                        const isVideo = mediaUrl.includes('video') || mediaUrl.includes('.mp4') || mediaUrl.includes('.mov');

                        return (
                            <View key={index} style={styles.mediaItem}>
                                <Image source={{ uri: mediaUrl }} style={styles.reviewMedia} />
                                {isVideo && (
                                    <View style={styles.videoOverlay}>
                                        <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Helpful Button */}
            <TouchableOpacity
                style={styles.helpfulButton}
                onPress={handleMarkHelpful}
            >
                <ThumbsUp
                    size={16}
                    color={isHelpful ? theme.colors.primary : theme.colors.textSecondary}
                    fill={isHelpful ? theme.colors.primary : "transparent"}
                />
                <Text style={[styles.helpfulText, isHelpful && styles.helpfulTextActive]}>
                    {t('helpful')} ({helpfulCount})
                </Text>
            </TouchableOpacity>
        </BaseCard>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        marginBottom: theme.spacing.m,
        padding: theme.spacing.l,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    avatarText: {
        color: '#FFFFFF', // Keep white for contrast
        fontSize: 16,
        fontWeight: theme.typography.weight.semiBold,
        fontFamily: theme.typography.fontFamily.semiBold,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: theme.typography.weight.semiBold,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.semiBold,
    },
    reviewDate: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: theme.typography.weight.semiBold,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.semiBold,
    },
    comment: {
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
        marginBottom: theme.spacing.m,
        fontFamily: theme.typography.fontFamily.regular,
    },
    mediaContainer: {
        flexDirection: 'row',
        marginBottom: theme.spacing.m,
    },
    mediaItem: {
        position: 'relative',
        marginRight: 8,
    },
    reviewMedia: {
        width: 60,
        height: 60,
        borderRadius: theme.borderRadius.s,
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: theme.borderRadius.s,
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpfulButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    helpfulText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginLeft: 4,
        fontFamily: theme.typography.fontFamily.regular,
    },
    helpfulTextActive: {
        color: theme.colors.primary,
        fontWeight: theme.typography.weight.semiBold,
    },
});
