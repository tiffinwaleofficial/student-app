import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigationTracking } from '@/hooks/useNavigationTracking';

interface BackButtonProps {
  onPress?: () => void;
  fallbackRoute?: string;
  color?: string;
  size?: number;
  style?: any;
  useSmartNavigation?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  fallbackRoute,
  color = '#333333',
  size = 24,
  style,
  useSmartNavigation = true
}) => {
  const router = useRouter();
  const { getSmartBackRoute, getFallbackRoute } = useNavigationTracking();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    try {
      if (useSmartNavigation) {
        // Use smart navigation based on history
        const smartBackRoute = getSmartBackRoute();
        console.log('🧭 BackButton: Smart back route:', smartBackRoute);
        
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push(smartBackRoute);
        }
      } else {
        // Use traditional navigation
        const targetRoute = fallbackRoute || getFallbackRoute();
        
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push(targetRoute);
        }
      }
    } catch (error) {
      console.error('❌ BackButton: Navigation error:', error);
      // Fallback to dashboard if everything fails
      router.push('/(tabs)');
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.backButton, style]}>
      <ArrowLeft size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
  },
});
