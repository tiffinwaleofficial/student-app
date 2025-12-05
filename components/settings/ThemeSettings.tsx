import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Sun, Moon, Smartphone, Check } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';
import { useTheme } from '@/hooks/useTheme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeOptionProps {
  mode: ThemeMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
  };
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  label,
  description,
  icon,
  isSelected,
  onPress,
  colors,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.optionCard,
        {
          backgroundColor: isSelected ? `${colors.primary}15` : colors.card,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
        {icon}
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      {isSelected && (
        <View style={[styles.checkContainer, { backgroundColor: colors.primary }]}>
          <Check size={16} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const ThemeSettings: React.FC = () => {
  const { mode, setMode, resolvedMode } = useThemeStore();
  const { theme } = useTheme();
  
  const colors = {
    background: resolvedMode === 'dark' ? '#1A1A1A' : '#FFFAF0',
    card: resolvedMode === 'dark' ? '#2A2A2A' : '#FFFFFF',
    text: resolvedMode === 'dark' ? '#FFFFFF' : '#333333',
    textSecondary: resolvedMode === 'dark' ? '#AAAAAA' : '#666666',
    primary: '#FF9B42',
    border: resolvedMode === 'dark' ? '#3A3A3A' : '#E5E5E5',
  };

  const themeOptions: { mode: ThemeMode; label: string; description: string; icon: React.ReactNode }[] = [
    {
      mode: 'light',
      label: 'Light Mode',
      description: 'Bright and clean interface',
      icon: <Sun size={24} color={colors.primary} />,
    },
    {
      mode: 'dark',
      label: 'Dark Mode',
      description: 'Easy on the eyes at night',
      icon: <Moon size={24} color={colors.primary} />,
    },
    {
      mode: 'system',
      label: 'System',
      description: 'Follow device settings',
      icon: <Smartphone size={24} color={colors.primary} />,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Appearance</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose how TiffinWale looks for you
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => (
          <ThemeOption
            key={option.mode}
            mode={option.mode}
            label={option.label}
            description={option.description}
            icon={option.icon}
            isSelected={mode === option.mode}
            onPress={() => setMode(option.mode)}
            colors={colors}
          />
        ))}
      </View>

      <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.previewTitle, { color: colors.text }]}>Current Theme</Text>
        <View style={styles.previewRow}>
          <View style={[styles.colorSwatch, { backgroundColor: '#FF9B42' }]} />
          <Text style={[styles.previewText, { color: colors.textSecondary }]}>
            Primary: Orange (#FF9B42)
          </Text>
        </View>
        <View style={styles.previewRow}>
          <View style={[styles.colorSwatch, { backgroundColor: resolvedMode === 'dark' ? '#1A1A1A' : '#FFFAF0' }]} />
          <Text style={[styles.previewText, { color: colors.textSecondary }]}>
            Background: {resolvedMode === 'dark' ? 'Dark' : 'Cream (#FFFAF0)'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  previewText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
});

export default ThemeSettings;
