import * as React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useThemeStore } from '@/store/themeStore';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'scheduled' | 'active' | 'pending';
type BadgeSize = 'small' | 'medium' | 'large';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useThemeStore();

  const getVariantColors = (): { background: string; text: string } => {
    switch (variant) {
      case 'success':
      case 'delivered':
      case 'active':
        return { background: theme.colors.successLight, text: theme.colors.success };
      case 'warning':
      case 'preparing':
      case 'pending':
        return { background: theme.colors.primaryLight, text: theme.colors.primary };
      case 'error':
      case 'cancelled':
        return { background: theme.colors.errorLight, text: theme.colors.error };
      case 'info':
      case 'ready':
        return { background: theme.colors.infoLight, text: theme.colors.info };
      case 'scheduled':
        return { 
          background: theme.mode === 'dark' ? 'rgba(156, 163, 175, 0.2)' : '#F3F4F6', 
          text: theme.colors.textSecondary 
        };
      default:
        return { 
          background: theme.mode === 'dark' ? 'rgba(156, 163, 175, 0.2)' : '#F3F4F6', 
          text: theme.colors.textSecondary 
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
          text: { fontSize: 10, fontFamily: 'Poppins-SemiBold' },
        };
      case 'large':
        return {
          container: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
          text: { fontSize: 14, fontFamily: 'Poppins-SemiBold' },
        };
      default:
        return {
          container: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
          text: { fontSize: 12, fontFamily: 'Poppins-SemiBold' },
        };
    }
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: colors.background },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          sizeStyles.text,
          { color: colors.text },
          textStyle,
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default StatusBadge;
