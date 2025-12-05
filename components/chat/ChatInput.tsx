import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface ChatInputProps {
    inputText: string;
    isSending: boolean;
    onChangeText: (text: string) => void;
    onSend: () => void;
    placeholder: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    inputText,
    isSending,
    onChangeText,
    onSend,
    placeholder,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                maxLength={1000}
            />
            <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
                onPress={onSend}
                disabled={!inputText.trim() || isSending}
            >
                {isSending ? (
                    <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                    <Text style={styles.sendButtonText}>Send</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.card,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        maxHeight: 100,
        fontSize: 16,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
    },
    sendButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
    },
    sendButtonDisabled: {
        backgroundColor: theme.colors.textTertiary,
    },
    sendButtonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: theme.typography.weight.semiBold,
    },
});
