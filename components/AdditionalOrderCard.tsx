import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Clock, DollarSign } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { OrderAdditional } from '@/types';
import { formatDate } from '@/utils/dateUtils';

interface AdditionalOrderCardProps {
  order: OrderAdditional;
  index: number;
}

export function AdditionalOrderCard({ order, index }: AdditionalOrderCardProps) {
  const { t } = useTranslation('common');
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CB944';
      case 'delivered': return '#1E88E5';
      case 'cancelled': return '#E53935';
      default: return '#FF9B42';
    }
  };
  
  const getPaymentStatusColor = (status: string) => {
    return status === 'paid' ? '#4CB944' : '#FF9B42';
  };
  
  return (
    <Animated.View 
      entering={FadeInDown.delay(100 + (index * 50)).duration(400)} 
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>{t('order')} #</Text>
          <Text style={styles.orderId}>{order.id.slice(-6)}</Text>
        </View>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(order.status) + '20' }
          ]}
        >
          <Text 
            style={[
              styles.statusText, 
              { color: getStatusColor(order.status) }
            ]}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderMeta}>
        <View style={styles.orderMetaItem}>
          <Clock size={16} color="#666666" />
          <Text style={styles.orderMetaText}>{formatDate(new Date(order.date))}</Text>
        </View>
        <View style={styles.orderMetaItem}>
          <DollarSign size={16} color="#666666" />
          <Text style={styles.orderMetaText}>₹{order.total.toFixed(2)}</Text>
        </View>
        <View 
          style={[
            styles.paymentStatusBadge, 
            { backgroundColor: getPaymentStatusColor(order.paymentStatus) + '20' }
          ]}
        >
          <Text 
            style={[
              styles.paymentStatusText, 
              { color: getPaymentStatusColor(order.paymentStatus) }
            ]}
          >
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </Text>
        </View>
      </View>
      
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>{t('items')}</Text>
        {order.items.map((item, idx) => (
          <View key={item.itemId} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>
      
      {order.status === 'pending' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>{t('cancelOrder')}</Text>
          </TouchableOpacity>
          {order.paymentStatus === 'pending' && (
            <TouchableOpacity style={styles.payButton}>
              <Text style={styles.payButtonText}>{t('payNow')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIdLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  orderId: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#333333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  orderMetaText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  paymentStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  paymentStatusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  itemsTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333333',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333333',
    marginRight: 8,
  },
  itemQuantity: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  itemPrice: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#E53935',
  },
  payButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF9B42',
    borderRadius: 8,
  },
  payButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
});