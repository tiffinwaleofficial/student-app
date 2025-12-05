import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';

interface BaseModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    variant?: 'default' | 'bottom-sheet' | 'center';
    children: React.ReactNode;
    showCloseButton?: boolean;
}

export function BaseModal({
    visible,
    onClose,
    title,
    size = 'medium',
    variant = 'center',
    children,
    showCloseButton = true,
}: BaseModalProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const sizeStyles = {
        small: { width: '80%', maxHeight: '50%' },
        medium: { width: '90%', maxHeight: '80%' },
        large: { width: '95%', maxHeight: '90%' },
        fullscreen: { width: '100%', height: '100%' },
    };

    const variantStyles = {
        default: styles.centerModal,
        'bottom-sheet': styles.bottomSheetModal,
        center: styles.centerModal,
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType={variant === 'bottom-sheet' ? 'slide' : 'fade'}
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable
                    style={[
                        styles.modalContent,
                        variantStyles[variant],
                        sizeStyles[size],
                    ]}
                    onPress={(e) => e.stopPropagation()}
                >
                    {title && (
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            {showCloseButton && (
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={styles.closeButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <X size={24} color={theme.colors.text} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {children}
                    </ScrollView>
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
        modalContent: {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.m,
            shadowColor: theme.colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        centerModal: {
            // Centered modal (default)
        },
        bottomSheetModal: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.l,
            paddingTop: theme.spacing.l,
            paddingBottom: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        title: {
            fontSize: theme.typography.size.xl,
            fontWeight: theme.typography.weight.bold,
            color: theme.colors.text,
            flex: 1,
        },
        closeButton: {
            padding: theme.spacing.xs,
            marginLeft: theme.spacing.m,
        },
        content: {
            padding: theme.spacing.l,
        },
    });
