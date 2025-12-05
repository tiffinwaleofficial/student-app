import * as React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '@/store/themeStore';
import { shadows } from '@/theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme } = useThemeStore();

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
          text: { fontSize: 12, fontFamily: 'Poppins-SemiBold' },
        };
      case 'large':
        return {
          container: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 20 },
          text: { fontSize: 16, fontFamily: 'Poppins-SemiBold' },
        };
      default:
        return {
          container: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16 },
          text: { fontSize: 14, fontFamily: 'Poppins-SemiBold' },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : '#FFFFFF'}
        />
      );
    }

    const textColor =
      variant === 'outline' || variant === 'ghost'
        ? theme.colors.primary
        : variant === 'danger'
        ? '#FFFFFF'
        : '#FFFFFF';

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
        <Text style={[styles.text, sizeStyles.text, { color: textColor }, textStyle]}>
          {title}
        </Text>
        {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
      </View>
    );
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={disabled ? ['#E5E7EB', '#E5E7EB'] : ['#FF9B42', '#FF8A2E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.container,
            sizeStyles.container,
            disabled && styles.disabled,
            !disabled && shadows.orange,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.primaryLight,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container,
        sizeStyles.container,
        getVariantStyles(),
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
});

export default GradientButton;
