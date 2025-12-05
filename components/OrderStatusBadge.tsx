import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, CheckCircle2, Package, Truck, Ban } from 'lucide-react-native';
import { OrderStatus } from '@/lib/api';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'small' | 'medium' | 'large';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'medium' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          label: 'Pending',
          icon: Clock,
          bgColor: '#FEF3C7',
          textColor: '#92400E',
          iconColor: '#F59E0B',
        };
      case OrderStatus.CONFIRMED:
        return {
          label: 'Confirmed',
          icon: CheckCircle2,
          bgColor: '#DBEAFE',
          textColor: '#1E40AF',
          iconColor: '#3B82F6',
        };
      case OrderStatus.PREPARING:
        return {
          label: 'Preparing',
          icon: Package,
          bgColor: '#FCE7F3',
          textColor: '#9F1239',
          iconColor: '#EC4899',
        };
      case OrderStatus.READY:
        return {
          label: 'Ready',
          icon: CheckCircle2,
          bgColor: '#D1FAE5',
          textColor: '#065F46',
          iconColor: '#10B981',
        };
      case OrderStatus.OUT_FOR_DELIVERY:
        return {
          label: 'Out for Delivery',
          icon: Truck,
          bgColor: '#E0E7FF',
          textColor: '#3730A3',
          iconColor: '#6366F1',
        };
      case OrderStatus.DELIVERED:
        return {
          label: 'Delivered',
          icon: CheckCircle2,
          bgColor: '#D1FAE5',
          textColor: '#065F46',
          iconColor: '#10B981',
        };
      case OrderStatus.CANCELLED:
        return {
          label: 'Cancelled',
          icon: Ban,
          bgColor: '#FEE2E2',
          textColor: '#991B1B',
          iconColor: '#EF4444',
        };
      default:
        return {
          label: 'Unknown',
          icon: Clock,
          bgColor: '#F3F4F6',
          textColor: '#6B7280',
          iconColor: '#9CA3AF',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      icon: 12,
      text: styles.textSmall,
    },
    medium: {
      container: styles.containerMedium,
      icon: 14,
      text: styles.textMedium,
    },
    large: {
      container: styles.containerLarge,
      icon: 16,
      text: styles.textLarge,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.container,
        currentSize.container,
        { backgroundColor: config.bgColor },
      ]}
    >
      <Icon size={currentSize.icon} color={config.iconColor} strokeWidth={2.5} />
      <Text
        style={[
          styles.text,
          currentSize.text,
          { color: config.textColor },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  containerMedium: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  containerLarge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
});

