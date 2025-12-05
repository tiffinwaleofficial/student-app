import * as React from 'react';
import { useState, useCallback, ReactNode } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface RefreshableScrollViewProps extends Omit<ScrollViewProps, 'refreshControl'> {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  tintColor?: string;
  backgroundColor?: string;
  contentContainerStyle?: ViewStyle;
  showPullIndicator?: boolean;
  disabled?: boolean;
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const RefreshableScrollView: React.FC<RefreshableScrollViewProps> = ({
  children,
  onRefresh,
  refreshing: externalRefreshing,
  tintColor = '#FF9B42',
  backgroundColor = '#FFFAF0',
  contentContainerStyle,
  showPullIndicator = true,
  disabled = false,
  ...scrollViewProps
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  const refreshing = externalRefreshing !== undefined ? externalRefreshing : isRefreshing;

  const handleRefresh = useCallback(async () => {
    if (disabled || refreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      if (__DEV__) {
        console.error('RefreshableScrollView: Refresh error:', error);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, disabled, refreshing]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const pullIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [-80, -40, 0],
      [1, 0.5, 0],
      'clamp'
    );
    const scale = interpolate(
      scrollY.value,
      [-80, -40, 0],
      [1, 0.8, 0.5],
      'clamp'
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <AnimatedScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={tintColor}
          colors={[tintColor]}
          progressBackgroundColor="#FFFFFF"
          enabled={!disabled}
          title={Platform.OS === 'ios' ? 'Pull to refresh' : undefined}
          titleColor={tintColor}
        />
      }
      {...scrollViewProps}
    >
      {children}
    </AnimatedScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default RefreshableScrollView;
