import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, useWindowDimensions, FlatList } from 'react-native';
import { Calendar, ChevronRight, Package, Clock, Sun, History, CalendarClock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthProvider';
import { OrderCard } from '@/components/cards/OrderCard';
import { useTranslation } from '@/hooks/useTranslation';
import { api, Order, OrderStatus } from '@/lib/api';
import { nativeWebSocketService } from '@/services/nativeWebSocketService';
import { useTheme } from '@/hooks/useTheme';

export default function OrdersScreen() {
  const router = useRouter();
  useAuth();
  const { t } = useTranslation('orders');
  const { width } = useWindowDimensions();
  const { theme } = useTheme();

  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [upcomingOrders, setUpcomingOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');

  const flatListRef = useRef<FlatList>(null);

  // Tab definitions
  const tabs = [
    { key: 'today', title: 'Today', icon: Sun },
    { key: 'upcoming', title: 'Upcoming', icon: CalendarClock },
    { key: 'past', title: 'Past', icon: History },
  ];

  // Fetch orders on mount only
  useEffect(() => {
    fetchAllOrders(false);
  }, []);

  // Refresh only when screen comes into focus after being away
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        fetchAllOrders(true);
      }, 300);
      return () => clearTimeout(timer);
    }, [])
  );

  // Setup WebSocket for real-time order updates
  useEffect(() => {
    const handleOrderUpdate = (data: any) => {
      const orderIdString = typeof data.orderId === 'string' ? data.orderId : String(data.orderId);
      const updateOrder = (orders: Order[]) => orders.map(order => {
        const currentOrderId = typeof order._id === 'string' ? order._id : String(order._id);
        return currentOrderId === orderIdString ? { ...order, status: data.status as OrderStatus } : order;
      });

      setTodayOrders(prev => updateOrder(prev));
      setUpcomingOrders(prev => updateOrder(prev));
      setPastOrders(prev => updateOrder(prev));
    };

    nativeWebSocketService.on('order_update', handleOrderUpdate);
    return () => {
      nativeWebSocketService.off('order_update', handleOrderUpdate);
    };
  }, []);

  // Join order rooms
  useEffect(() => {
    const allOrderIds = [
      ...todayOrders, ...upcomingOrders, ...pastOrders
    ].map(o => typeof o._id === 'string' ? o._id : String(o._id)).filter(Boolean) as string[];

    allOrderIds.forEach(id => nativeWebSocketService.joinOrderRoom(id));
    return () => {
      allOrderIds.forEach(id => nativeWebSocketService.leaveOrderRoom(id));
    };
  }, [todayOrders, upcomingOrders, pastOrders]);

  const fetchAllOrders = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) setLoading(true);

      const [todayData, upcomingData, pastData] = await Promise.all([
        api.orders.getTodaysOrders(forceRefresh),
        api.orders.getUpcomingOrders(forceRefresh),
        api.orders.getPastOrders(1, 10, forceRefresh),
      ]);

      setTodayOrders(todayData);
      setUpcomingOrders(upcomingData);
      setPastOrders(pastData.orders);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      if (forceRefresh) Alert.alert('Error', 'Failed to refresh orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllOrders(true);
    setRefreshing(false);
  };

  const handleTabPress = (index: number) => {
    const tabKey = tabs[index].key as 'today' | 'upcoming' | 'past';
    setActiveTab(tabKey);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    const tabKey = tabs[index].key as 'today' | 'upcoming' | 'past';
    if (activeTab !== tabKey) {
      setActiveTab(tabKey);
    }
  };

  const renderEmptyState = (type: 'today' | 'upcoming' | 'past') => {
    const config = {
      today: {
        icon: <Sun size={64} color="#CCCCCC" />,
        title: 'No Orders Today',
        description: 'You have no scheduled deliveries for today',
      },
      upcoming: {
        icon: <CalendarClock size={64} color="#CCCCCC" />,
        title: 'No Upcoming Orders',
        description: 'Subscribe to a plan to see your upcoming deliveries',
      },
      past: {
        icon: <History size={64} color="#CCCCCC" />,
        title: 'No Past Orders',
        description: 'Your order history will appear here',
      },
    }[type];

    return (
      <View style={styles.emptyContainer}>
        {config.icon}
        <Text style={styles.emptyTitle}>{config.title}</Text>
        <Text style={styles.emptyDescription}>{config.description}</Text>
        {type !== 'past' && (
          <TouchableOpacity onPress={() => router.push('/plans')} style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Explore Plans</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderOrderList = (data: Order[], type: 'today' | 'upcoming' | 'past') => {
    if (loading && data.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF9B42" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      );
    }

    if (data.length === 0) {
      return <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF9B42']} tintColor="#FF9B42" />}
      >
        {renderEmptyState(type)}
      </ScrollView>;
    }

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => String(item._id)}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
            <OrderCard
              order={item}
              onRate={(id) => router.push(`/rate-meal?orderId=${id}`)}
              onTrack={(id) => router.push(`/track?orderId=${id}`)}
            />
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF9B42']} tintColor="#FF9B42" />}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('orderHistory')}</Text>
      </View>

      {/* Modern Tab Bar */}
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <Icon size={18} color={isActive ? '#FF9B42' : '#999'} strokeWidth={isActive ? 2.5 : 2} />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.title}
              </Text>
              {isActive && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Swipeable Content */}
      <FlatList
        ref={flatListRef}
        data={tabs}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width, height: '100%', flex: 1 }}>
            {renderOrderList(
              item.key === 'today' ? todayOrders : item.key === 'upcoming' ? upcomingOrders : pastOrders,
              item.key as 'today' | 'upcoming' | 'past'
            )}
          </View>
        )}
        initialScrollIndex={0}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFAF0',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#FF9B42' + '15', // 15% opacity orange
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#999999',
  },
  activeTabText: {
    color: '#FF9B42',
    fontFamily: 'Poppins-SemiBold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent', // Hidden for now, can be enabled if needed
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#FF9B42',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#FF9B42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});