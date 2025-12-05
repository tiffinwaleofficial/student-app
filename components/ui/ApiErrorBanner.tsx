import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';
import { useThemeStore } from '@/store/themeStore';

type ErrorType = 'network' | 'server' | 'auth' | 'generic';

interface ApiErrorBannerProps {
  visible: boolean;
  message?: string;
  errorType?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
}

const ApiErrorBanner: React.FC<ApiErrorBannerProps> = ({
  visible,
  message,
  errorType = 'generic',
  onRetry,
  onDismiss,
  showRetry = true,
}) => {
  const { theme } = useThemeStore();

  if (!visible) return null;

  const getErrorConfig = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: <WifiOff size={20} color={theme.colors.error} />,
          title: 'No Internet Connection',
          description: message || 'Please check your internet connection and try again.',
        };
      case 'server':
        return {
          icon: <AlertTriangle size={20} color={theme.colors.warning} />,
          title: 'Server Error',
          description: message || 'Something went wrong on our end. Please try again later.',
        };
      case 'auth':
        return {
          icon: <AlertTriangle size={20} color={theme.colors.error} />,
          title: 'Session Expired',
          description: message || 'Please login again to continue.',
        };
      default:
        return {
          icon: <AlertTriangle size={20} color={theme.colors.error} />,
          title: 'Something went wrong',
          description: message || 'An unexpected error occurred. Please try again.',
        };
    }
  };

  const config = getErrorConfig();

  return (
    <Animated.View
      entering={SlideInUp.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.errorLight,
          borderColor: theme.colors.error,
        },
      ]}
    >
      <View style={styles.iconContainer}>{config.icon}</View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{config.title}</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {config.description}
        </Text>
      </View>
      {showRetry && onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.retryButton, { backgroundColor: theme.colors.error }]}
          activeOpacity={0.8}
        >
          <RefreshCw size={16} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    lineHeight: 16,
  },
  retryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});

export default ApiErrorBanner;
