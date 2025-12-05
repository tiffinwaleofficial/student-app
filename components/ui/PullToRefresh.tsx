import * as React from 'react';
import { useState, useCallback, ReactNode } from 'react';
import {
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
  FlatListProps,
  Platform,
} from 'react-native';
import { useThemeStore } from '@/store/themeStore';

interface PullToRefreshScrollViewProps extends Omit<ScrollViewProps, 'refreshControl'> {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  disabled?: boolean;
  contentContainerStyle?: ViewStyle;
}

interface PullToRefreshFlatListProps<T> extends Omit<FlatListProps<T>, 'refreshControl'> {
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  disabled?: boolean;
}

export const PullToRefreshScrollView: React.FC<PullToRefreshScrollViewProps> = ({
  children,
  onRefresh,
  refreshing: externalRefreshing,
  disabled = false,
  contentContainerStyle,
  ...scrollViewProps
}) => {
  const { theme } = useThemeStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshing = externalRefreshing !== undefined ? externalRefreshing : isRefreshing;

  const handleRefresh = useCallback(async () => {
    if (disabled || refreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      if (__DEV__) {
        console.error('PullToRefresh: Error during refresh:', error);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, disabled, refreshing]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
          progressBackgroundColor={theme.colors.card}
          enabled={!disabled}
          title={Platform.OS === 'ios' ? 'Pull to refresh' : undefined}
          titleColor={theme.colors.textSecondary}
        />
      }
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );
};

export function PullToRefreshFlatList<T>({
  onRefresh,
  refreshing: externalRefreshing,
  disabled = false,
  ...flatListProps
}: PullToRefreshFlatListProps<T>) {
  const { theme } = useThemeStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshing = externalRefreshing !== undefined ? externalRefreshing : isRefreshing;

  const handleRefresh = useCallback(async () => {
    if (disabled || refreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      if (__DEV__) {
        console.error('PullToRefresh: Error during refresh:', error);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, disabled, refreshing]);

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
          progressBackgroundColor={theme.colors.card}
          enabled={!disabled}
          title={Platform.OS === 'ios' ? 'Pull to refresh' : undefined}
          titleColor={theme.colors.textSecondary}
        />
      }
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

export default PullToRefreshScrollView;
