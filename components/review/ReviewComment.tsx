import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface ReviewCommentProps {
    comment: string;
    onCommentChange: (comment: string) => void;
}

export const ReviewComment: React.FC<ReviewCommentProps> = ({ comment, onCommentChange }) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Share your thoughts</Text>
            <TextInput
                style={styles.commentInput}
                placeholder="Tell others about your experience..."
                placeholderTextColor={theme.colors.textSecondary}
                value={comment}
                onChangeText={onCommentChange}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />
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
    commentInput: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        fontSize: theme.typography.size.s,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.regular,
        minHeight: 100,
        backgroundColor: theme.colors.background,
    },
});
