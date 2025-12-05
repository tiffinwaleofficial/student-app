import * as React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeStore } from '@/store/themeStore';
import { shadows } from '@/theme/spacing';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
  onPress?: () => void;
  animated?: boolean;
  animationDelay?: number;
  disabled?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  onPress,
  animated = false,
  animationDelay = 0,
  disabled = false,
  padding = 'medium',
}) => {
  const { theme } = useThemeStore();

  const getVariantStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.cardElevated,
          ...shadows.large,
        };
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'glass':
        return {
          ...baseStyles,
          backgroundColor: theme.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1,
          borderColor: theme.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)',
        };
      default:
        return {
          ...baseStyles,
          ...shadows.medium,
        };
    }
  };

  const getPaddingStyles = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: 12 };
      case 'large':
        return { padding: 24 };
      default:
        return { padding: 16 };
    }
  };

  const cardContent = (
    <View style={[getVariantStyles(), getPaddingStyles(), style]}>
      {children}
    </View>
  );

  if (onPress) {
    const PressableContent = (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        {cardContent}
      </Pressable>
    );

    if (animated) {
      return (
        <Animated.View entering={FadeInDown.delay(animationDelay).duration(400)}>
          {PressableContent}
        </Animated.View>
      );
    }

    return PressableContent;
  }

  if (animated) {
    return (
      <Animated.View entering={FadeInDown.delay(animationDelay).duration(400)}>
        {cardContent}
      </Animated.View>
    );
  }

  return cardContent;
};

export const GlassCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="glass" />
);

export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="elevated" />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="outlined" />
);

export default Card;
