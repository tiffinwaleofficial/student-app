import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/theme/types';
import { BaseModal } from '../BaseModal';

export interface SelectOption {
    label: string;
    value: string | number;
}

interface FormSelectProps {
    label?: string;
    value?: string | number;
    placeholder?: string;
    options: SelectOption[];
    onChange: (value: string | number) => void;
    error?: string;
    disabled?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
    label,
    value,
    placeholder = 'Select an option',
    options,
    onChange,
    error,
    disabled = false,
}) => {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
                style={[
                    styles.input,
                    error && styles.inputError,
                    disabled && styles.inputDisabled,
                ]}
                onPress={() => !disabled && setModalVisible(true)}
                activeOpacity={0.7}
                disabled={disabled}
            >
                <Text
                    style={[
                        styles.value,
                        !selectedOption && styles.placeholder,
                        disabled && styles.textDisabled,
                    ]}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <ChevronDown
                    size={20}
                    color={disabled ? theme.colors.textTertiary : theme.colors.textSecondary}
                />
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <BaseModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={label || placeholder}
                variant="bottom-sheet"
            >
                <FlatList
                    data={options}
                    keyExtractor={(item) => String(item.value)}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.optionItem,
                                item.value === value && styles.optionItemSelected,
                            ]}
                            onPress={() => handleSelect(item.value)}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    item.value === value && styles.optionTextSelected,
                                ]}
                            >
                                {item.label}
                            </Text>
                            {item.value === value && (
                                <Check size={20} color={theme.colors.primary} />
                            )}
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.optionsList}
                />
            </BaseModal>
        </View>
    );
};

const makeStyles = (theme: Theme) => StyleSheet.create({
    container: {
        marginBottom: theme.spacing.m,
    },
    label: {
        fontSize: theme.typography.size.s,
        fontWeight: theme.typography.weight.medium,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
        fontFamily: theme.typography.fontFamily.medium,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.m,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: 12,
        backgroundColor: theme.colors.background,
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    inputDisabled: {
        backgroundColor: theme.colors.background, // Or a disabled background color if defined
        borderColor: theme.colors.border,
        opacity: 0.6,
    },
    value: {
        fontSize: theme.typography.size.m,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.regular,
        flex: 1,
    },
    placeholder: {
        color: theme.colors.textTertiary,
    },
    textDisabled: {
        color: theme.colors.textTertiary,
    },
    errorText: {
        fontSize: theme.typography.size.xs,
        color: theme.colors.error,
        marginTop: 4,
        fontFamily: theme.typography.fontFamily.regular,
    },
    optionsList: {
        paddingBottom: theme.spacing.xl,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    optionItemSelected: {
        backgroundColor: theme.colors.primaryLight + '20', // Slight highlight
    },
    optionText: {
        fontSize: theme.typography.size.m,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.regular,
    },
    optionTextSelected: {
        color: theme.colors.primary,
        fontWeight: theme.typography.weight.semiBold,
        fontFamily: theme.typography.fontFamily.semiBold,
    },
});
