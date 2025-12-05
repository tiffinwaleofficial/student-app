import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'danger' | 'success';
}

export function ConfirmDialog({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'primary',
}: ConfirmDialogProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const confirmButtonStyles = {
        primary: styles.confirmButtonPrimary,
        danger: styles.confirmButtonDanger,
        success: styles.confirmButtonSuccess,
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <Pressable style={styles.overlay} onPress={onCancel}>
                <Pressable
                    style={styles.dialogContent}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.confirmButton, confirmButtonStyles[confirmVariant]]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.confirmButtonText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const makeStyles = (theme: Theme) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.colors.modalOverlay,
            justifyContent: 'center',
            alignItems: 'center',
        },
        dialogContent: {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.m,
            padding: theme.spacing.xl,
            margin: theme.spacing.xl - theme.spacing.xs,
            alignItems: 'center',
            shadowColor: theme.colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            minWidth: 280,
        },
        title: {
            fontSize: theme.typography.size.xl,
            fontWeight: theme.typography.weight.bold,
            color: theme.colors.text,
            marginBottom: theme.spacing.s,
            textAlign: 'center',
        },
        message: {
            fontSize: theme.typography.size.l,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
            lineHeight: theme.typography.size.l * 1.5,
        },
        buttonContainer: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            width: '100%',
        },
        cancelButton: {
            flex: 1,
            backgroundColor: theme.colors.border,
            paddingHorizontal: theme.spacing.xl - theme.spacing.xs,
            paddingVertical: theme.spacing.m,
            borderRadius: theme.borderRadius.s,
            alignItems: 'center',
        },
        cancelButtonText: {
            color: theme.colors.text,
            fontSize: theme.typography.size.l,
            fontWeight: theme.typography.weight.medium,
        },
        confirmButton: {
            flex: 1,
            paddingHorizontal: theme.spacing.xl - theme.spacing.xs,
            paddingVertical: theme.spacing.m,
            borderRadius: theme.borderRadius.s,
            alignItems: 'center',
        },
        confirmButtonPrimary: {
            backgroundColor: theme.colors.primary,
        },
        confirmButtonDanger: {
            backgroundColor: theme.colors.error,
        },
        confirmButtonSuccess: {
            backgroundColor: theme.colors.success,
        },
        confirmButtonText: {
            color: theme.colors.card,
            fontSize: theme.typography.size.l,
            fontWeight: theme.typography.weight.medium,
        },
    });
