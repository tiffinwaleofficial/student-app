import * as React from 'react';
import { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useThemeStore } from '@/store/themeStore';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'rectangle' | 'circle' | 'text' | 'card';
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  variant = 'rectangle',
  lines = 1,
}) => {
  const { theme } = useThemeStore();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'circle':
        return {
          width: height,
          height,
          borderRadius: height / 2,
        };
      case 'text':
        return {
          width,
          height: 14,
          borderRadius: 4,
        };
      case 'card':
        return {
          width,
          height: height || 120,
          borderRadius: 16,
        };
      default:
        return {
          width,
          height,
          borderRadius,
        };
    }
  };

  const renderSkeleton = () => (
    <View
      style={[
        styles.skeleton,
        getVariantStyles(),
        { backgroundColor: theme.colors.skeleton },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          animatedStyle,
          { backgroundColor: theme.colors.skeletonHighlight },
        ]}
      />
    </View>
  );

  if (variant === 'text' && lines > 1) {
    return (
      <View style={styles.textContainer}>
        {Array.from({ length: lines }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.skeleton,
              styles.textLine,
              {
                backgroundColor: theme.colors.skeleton,
                width: index === lines - 1 ? '70%' : '100%',
              },
            ]}
          >
            <Animated.View
              style={[
                styles.shimmer,
                animatedStyle,
                { backgroundColor: theme.colors.skeletonHighlight },
              ]}
            />
          </View>
        ))}
      </View>
    );
  }

  return renderSkeleton();
};

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useThemeStore();
  
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }, style]}>
      <View style={styles.cardHeader}>
        <SkeletonLoader variant="circle" height={48} />
        <View style={styles.cardHeaderText}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width="40%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      <SkeletonLoader variant="text" lines={3} />
    </View>
  );
};

export const SkeletonMealCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useThemeStore();
  
  return (
    <View style={[styles.mealCard, { backgroundColor: theme.colors.card }, style]}>
      <View style={styles.mealCardHeader}>
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="50%" height={18} />
          <SkeletonLoader width="30%" height={12} style={{ marginTop: 6 }} />
        </View>
        <SkeletonLoader width={70} height={24} borderRadius={12} />
      </View>
      <SkeletonLoader width="80%" height={14} style={{ marginTop: 12 }} />
      <SkeletonLoader width="60%" height={12} style={{ marginTop: 8 }} />
      <View style={styles.mealCardFooter}>
        <SkeletonLoader width={80} height={14} />
        <SkeletonLoader width={50} height={14} />
      </View>
    </View>
  );
};

export const SkeletonListItem: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useThemeStore();
  
  return (
    <View style={[styles.listItem, { backgroundColor: theme.colors.card }, style]}>
      <SkeletonLoader variant="circle" height={40} />
      <View style={styles.listItemText}>
        <SkeletonLoader width="70%" height={14} />
        <SkeletonLoader width="50%" height={12} style={{ marginTop: 6 }} />
      </View>
      <SkeletonLoader width={20} height={20} borderRadius={4} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 200,
    opacity: 0.5,
  },
  textContainer: {
    gap: 8,
  },
  textLine: {
    height: 14,
    borderRadius: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  mealCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mealCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  listItemText: {
    flex: 1,
    marginLeft: 12,
  },
});

export default SkeletonLoader;
