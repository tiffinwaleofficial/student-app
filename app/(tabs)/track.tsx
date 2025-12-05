import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import {
  MapPin,
  Phone,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react-native';
import { api, Order, OrderStatus } from '@/lib/api';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { nativeWebSocketService } from '@/services/nativeWebSocketService';
import { BackButton } from '@/components/BackButton';

const STATUS_STEPS = [
  { 
    status: OrderStatus.PENDING, 
    label: 'Order Placed', 
    description: 'Your order has been confirmed',
    icon: CheckCircle2,
  },
  { 
    status: OrderStatus.CONFIRMED, 
    label: 'Confirmed', 
    description: 'Partner accepted your order',
    icon: CheckCircle2,
  },
  { 
    status: OrderStatus.PREPARING, 
    label: 'Preparing', 
    description: 'Your meal is being prepared',
    icon: Package,
  },
  { 
    status: OrderStatus.READY, 
    label: 'Ready', 
    description: 'Your meal is ready for delivery',
    icon: CheckCircle2,
  },
  { 
    status: OrderStatus.OUT_FOR_DELIVERY, 
    label: 'Out for Delivery', 
    description: 'On the way to you!',
    icon: Truck,
  },
  { 
    status: OrderStatus.DELIVERED, 
    label: 'Delivered', 
    description: 'Enjoy your meal!',
    icon: CheckCircle2,
  },
];

export default function TrackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Define fetchOrderData function
  const fetchOrderData = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const orderData = await api.orders.getOrderById(orderId);
      setOrder(orderData);
    } catch (error: any) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create ref for fetchOrderData to use in useEffect
  const fetchOrderDataRef = useRef(fetchOrderData);
  useEffect(() => {
    fetchOrderDataRef.current = fetchOrderData;
  }, [orderId]);

  // Fetch order data
  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    } else {
      // No order ID, fetch today's first active order
      fetchTodayActiveOrder();
    }
  }, [orderId]);
  
  // Setup WebSocket for real-time updates
  useEffect(() => {
    if (!order?._id) return;

    // Subscribe to order updates via WebSocket
    const handleOrderUpdate = (data: any) => {
      // Handle both direct orderId and nested data.orderId
      const orderId = data.orderId || data.data?.orderId;
      const status = data.status || data.data?.status;
      
      // Check if this update is for the current order (support both string and ObjectId comparison)
      const currentOrderId = typeof order._id === 'string' ? order._id : String(order._id);
      const updateOrderId = orderId ? (typeof orderId === 'string' ? orderId : String(orderId)) : null;
      
      if (updateOrderId && updateOrderId === currentOrderId) {
        console.log('📡 Track page: Real-time order update received:', { orderId: updateOrderId, status });
        // Update order status immediately
        setOrder((prev) => {
          if (!prev) return prev;
          return { ...prev, status: (status || data.status) as OrderStatus };
        });
        
        // Also refresh order data from API to ensure we have latest state
        fetchOrderDataRef.current().catch((err: any) => console.error('Failed to refresh order:', err));
      } else {
        console.log('📡 Track page: Ignoring update for different order:', { updateOrderId, currentOrderId });
      }
    };

    nativeWebSocketService.on('order_update', handleOrderUpdate);
    nativeWebSocketService.joinOrderRoom(order._id);

    return () => {
      nativeWebSocketService.off('order_update', handleOrderUpdate);
      nativeWebSocketService.leaveOrderRoom(order._id);
    };
  }, [order?._id]);

  // Pulse animation for active status
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      if (orderId) {
        fetchOrderData();
      } else {
        fetchTodayActiveOrder();
      }
    }, [orderId])
  );

  const fetchTodayActiveOrder = async () => {
    try {
      setLoading(true);
      const todayOrders = await api.orders.getTodaysOrders();
      
      // Find first active order (not delivered/cancelled)
      const activeOrder = todayOrders.find(
        (o) => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED
      );
      
      if (activeOrder) {
        setOrder(activeOrder);
      } else if (todayOrders.length > 0) {
        // Show first today order if no active
        setOrder(todayOrders[0]);
      }
    } catch (error: any) {
      console.error('Failed to fetch today orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (orderId) {
      await fetchOrderData();
    } else {
      await fetchTodayActiveOrder();
    }
    setRefreshing(false);
  };
  
  const getStepStatus = (stepStatus: OrderStatus): 'completed' | 'active' | 'pending' => {
    if (!order) return 'pending';
    
    const statusOrder = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
    ];

    const currentIndex = statusOrder.indexOf(order.status as OrderStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getEstimatedTime = (): string => {
    if (!order) return '';
    
    switch (order.status) {
      case OrderStatus.PENDING:
        return 'Waiting for confirmation';
      case OrderStatus.CONFIRMED:
        return 'Starting preparation soon';
      case OrderStatus.PREPARING:
        return '15-20 minutes';
      case OrderStatus.READY:
        return 'Ready for pickup';
      case OrderStatus.OUT_FOR_DELIVERY:
        return order.deliveryTimeRange || '10-15 minutes';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9F43" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Track Order</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <AlertCircle size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No Active Orders</Text>
          <Text style={styles.emptyText}>
            You don't have any orders to track right now
            </Text>
              <TouchableOpacity 
            style={styles.browsePlansButton}
            onPress={() => router.push('/plans')}
          >
            <Text style={styles.browsePlansText}>Browse Plans</Text>
              </TouchableOpacity>
        </View>
      </View>
    );
  }

  const partner = typeof order.businessPartner === 'object' ? order.businessPartner : null;
  const plan = typeof order.subscriptionPlan === 'object' ? order.subscriptionPlan : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF9F43']} />
        }
      >
        {/* Order Summary Card */}
        <View style={styles.orderCard}>
          {plan?.imageUrl && (
            <Image source={{ uri: plan.imageUrl }} style={styles.orderImage} resizeMode="cover" />
          )}
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>{plan?.name || 'Meal Order'}</Text>
              <Text style={styles.partnerName}>{partner?.businessName || 'Tiffin Service'}</Text>
              <Text style={styles.orderIdText}>Order #{order._id.slice(-8)}</Text>
            </View>
            <OrderStatusBadge status={order.status} size="large" />
          </View>

          {/* Estimated Time */}
          <View style={styles.estimatedTimeContainer}>
            <Clock size={18} color="#FF9F43" />
            <Text style={styles.estimatedTimeText}>{getEstimatedTime()}</Text>
          </View>
        </View>

        {/* Progress Tracker */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Order Progress</Text>
          <View style={styles.stepsContainer}>
            {STATUS_STEPS.map((step, index) => {
              const stepStatus = getStepStatus(step.status);
              const isActive = stepStatus === 'active';
              const isCompleted = stepStatus === 'completed';
              const isLast = index === STATUS_STEPS.length - 1;
              const Icon = step.icon;
              
              return (
                <View key={step.status} style={styles.stepWrapper}>
                  <View style={styles.stepRow}>
                    {/* Bullet/Icon */}
                    <Animated.View 
                      style={[
                        styles.stepBullet,
                        isCompleted && styles.stepBulletCompleted,
                        isActive && styles.stepBulletActive,
                        isActive && { transform: [{ scale: pulseAnim }] },
                      ]}
                    >
                      {isCompleted || isActive ? (
                        <Icon size={16} color="#FFF" strokeWidth={2.5} />
                      ) : (
                        <View style={styles.stepBulletEmpty} />
                      )}
                    </Animated.View>
                    
                    {/* Step Content */}
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepLabel, (isActive || isCompleted) && styles.stepLabelActive]}>
                        {step.label}
                      </Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                      {isActive && (
                        <Text style={styles.stepActiveIndicator}>● In Progress</Text>
                      )}
                    </View>
                  </View>
                  
                  {/* Connecting Line */}
                  {!isLast && (
                    <View
                      style={[
                        styles.stepLine,
                        isCompleted && styles.stepLineCompleted,
                      ]} 
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Delivery Details</Text>

          {/* Delivery Address */}
          <View style={styles.detailRow}>
            <MapPin size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Delivery Address</Text>
              <Text style={styles.detailValue}>
                {order.deliveryAddress.street}, {order.deliveryAddress.city}
              </Text>
            </View>
          </View>

          {/* Delivery Time */}
          {order.deliveryTimeRange && (
            <View style={styles.detailRow}>
              <Clock size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Delivery Time</Text>
                <Text style={styles.detailValue}>{order.deliveryTimeRange}</Text>
              </View>
            </View>
          )}

          {/* Meal Type */}
          {order.mealType && (
            <View style={styles.detailRow}>
              <Package size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Meal Type</Text>
                <Text style={styles.detailValue}>
                  {order.mealType.charAt(0).toUpperCase() + order.mealType.slice(1)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Partner Contact */}
        {partner && (
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Need Help?</Text>
            <Text style={styles.contactSubtitle}>Contact {partner.businessName}</Text>

            <View style={styles.contactButtons}>
              {partner.phoneNumber && (
                <TouchableOpacity style={styles.contactButton}>
                  <Phone size={20} color="#FF9F43" />
                  <Text style={styles.contactButtonText}>Call Partner</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.contactButton, styles.chatButton]}
                onPress={() =>
                  router.push(
                    `/help-support?recipientId=${partner._id}&recipientName=${partner.businessName}&conversationType=support`
                  )
                }
              >
                <MessageSquare size={20} color="#FFF" />
                <Text style={[styles.contactButtonText, styles.chatButtonText]}>Chat</Text>
            </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order Items - Base Meal and Extras */}
        {(() => {
          // Separate base meal items from extras
          const baseItems = order.items?.filter((item: any) => {
            const isExtra = item.specialInstructions?.toLowerCase().includes('extra') ||
                           item.mealId?.toLowerCase().includes('extra') ||
                           item.name?.toLowerCase().includes('extra');
            const isDeliveryFee = item.mealId?.includes('delivery-fee') || item.name?.toLowerCase().includes('delivery');
            return !isExtra && !isDeliveryFee;
          }) || [];
          
          const extraItems = order.items?.filter((item: any) => {
            return item.specialInstructions?.toLowerCase().includes('extra') ||
                   item.mealId?.toLowerCase().includes('extra') ||
                   item.name?.toLowerCase().includes('extra');
          }) || [];

          const deliveryFee = order.items?.find((item: any) => 
            item.mealId?.includes('delivery-fee') || item.name?.toLowerCase().includes('delivery')
          );

          // Get meal name from subscription plan if available
          const getItemName = (item: any) => {
            if (item.name && item.name !== 'plan-rotis' && !item.name.startsWith('plan-')) {
              return item.name;
            }
            // Format placeholder IDs
            if (item.mealId?.startsWith('plan-rotis')) {
              return `${item.quantity} Rotis`;
            }
            if (item.mealId?.startsWith('plan-sabzi')) {
              return item.specialInstructions?.replace('Subscription meal - ', '').replace(/\(.*\)/, '').trim() || 'Sabzi';
            }
            if (item.mealId?.startsWith('plan-meal')) {
              return 'Meal';
            }
            return item.mealId?.replace('plan-', '').replace(/-/g, ' ') || 'Meal Item';
          };

          if (baseItems.length === 0 && extraItems.length === 0) return null;

          return (
            <View style={styles.itemsCard}>
              <Text style={styles.itemsTitle}>Order Details</Text>
              
              {/* Base Meal Items */}
              {baseItems.length > 0 && (
                <>
                  <Text style={styles.itemsSectionTitle}>Base Meal</Text>
                  {baseItems.map((item: any, index: number) => (
                    <View key={`base-${index}`} style={styles.itemRow}>
                      <Text style={styles.itemName}>{getItemName(item)}</Text>
                      {item.quantity > 1 && <Text style={styles.itemQty}>x{item.quantity}</Text>}
                      {item.price > 0 && <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>}
                    </View>
                  ))}
                </>
              )}

              {/* Extra Items */}
              {extraItems.length > 0 && (
                <>
                  <Text style={styles.extraItemsTitle}>✨ Extra Items</Text>
                  {extraItems.map((item: any, index: number) => (
                    <View key={`extra-${index}`} style={styles.extraItemRow}>
                      <Text style={styles.extraItemName}>• {getItemName(item)}</Text>
                      {item.quantity > 1 && <Text style={styles.itemQty}>x{item.quantity}</Text>}
                      {item.price > 0 && (
                        <Text style={styles.extraItemPrice}>+₹{item.price * item.quantity}</Text>
                      )}
                    </View>
                  ))}
                </>
              )}

              {/* Delivery Fee */}
              {deliveryFee && deliveryFee.price > 0 && (
                <View style={styles.deliveryFeeRow}>
                  <Text style={styles.deliveryFeeLabel}>Delivery Fee</Text>
                  <Text style={styles.deliveryFeeAmount}>₹{deliveryFee.price}</Text>
                </View>
              )}

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
              </View>
            </View>
          );
        })()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  browsePlansButton: {
    backgroundColor: '#FF9F43',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  browsePlansText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 12,
    color: '#999',
  },
  estimatedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  estimatedTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },
  progressCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  stepsContainer: {
    paddingLeft: 8,
  },
  stepWrapper: {
    position: 'relative',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 24,
  },
  stepBullet: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepBulletActive: {
    backgroundColor: '#FF9F43',
  },
  stepBulletCompleted: {
    backgroundColor: '#10B981',
  },
  stepBulletEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  stepLabelActive: {
    color: '#1F2937',
  },
  stepDescription: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  stepActiveIndicator: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF9F43',
    marginTop: 6,
  },
  stepLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  stepLineCompleted: {
    backgroundColor: '#10B981',
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E6',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  chatButton: {
    backgroundColor: '#FF9F43',
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9F43',
  },
  chatButtonText: {
    color: '#FFF',
  },
  itemsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 16,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF9F43',
  },
  itemsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  extraItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9F43',
    marginTop: 12,
    marginBottom: 8,
  },
  extraItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 8,
  },
  extraItemName: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  extraItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9F43',
    marginLeft: 8,
  },
  deliveryFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  deliveryFeeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  deliveryFeeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
