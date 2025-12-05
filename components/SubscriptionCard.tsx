import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Calendar, MapPin, Clock, Play, Pause, X } from 'lucide-react-native';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from '@/lib/api';
import { useRouter } from 'expo-router';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onPress?: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onPause,
  onResume,
  onCancel,
  onPress,
}) => {
  const router = useRouter();

  const plan = typeof subscription.subscriptionPlan === 'object'
    ? subscription.subscriptionPlan as SubscriptionPlan
    : null;

  const partner = plan && typeof plan.partner === 'object'
    ? plan.partner
    : null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/pages/subscription-detail?id=${subscription._id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusConfig = () => {
    switch (subscription.status) {
      case SubscriptionStatus.ACTIVE:
        return {
          label: 'Active',
          bgColor: '#D1FAE5',
          textColor: '#065F46',
        };
      case SubscriptionStatus.PAUSED:
        return {
          label: 'Paused',
          bgColor: '#FEF3C7',
          textColor: '#92400E',
        };
      case SubscriptionStatus.EXPIRED:
        return {
          label: 'Expired',
          bgColor: '#F3F4F6',
          textColor: '#6B7280',
        };
      case SubscriptionStatus.CANCELLED:
        return {
          label: 'Cancelled',
          bgColor: '#FEE2E2',
          textColor: '#991B1B',
        };
      default:
        return {
          label: 'Unknown',
          bgColor: '#F3F4F6',
          textColor: '#6B7280',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const isActive = subscription.status === SubscriptionStatus.ACTIVE;
  const isPaused = subscription.status === SubscriptionStatus.PAUSED;
  const canManage = isActive || isPaused;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header with Status */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {partner?.logoUrl && (
            <Image
              source={{ uri: partner.logoUrl }}
              style={styles.partnerLogo}
              resizeMode="cover"
            />
          )}
          <View style={styles.headerText}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {partner?.businessName || 'Tiffin Service'}
            </Text>
            <Text style={styles.planName} numberOfLines={1}>
              {plan?.name || 'Subscription Plan'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Subscription Details */}
      <View style={styles.details}>
        {/* Duration */}
        <View style={styles.detailRow}>
          <Calendar size={16} color="#666" />
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>
            {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
          </Text>
        </View>

        {/* Next Delivery */}
        {subscription.nextDeliveryDate && isActive && (
          <View style={styles.detailRow}>
            <Clock size={16} color="#666" />
            <Text style={styles.detailLabel}>Next Delivery:</Text>
            <Text style={styles.detailValue}>
              {formatDate(subscription.nextDeliveryDate)}
            </Text>
          </View>
        )}

        {/* Delivery Slot */}
        {subscription.deliverySlot && subscription.deliveryTimeRange && (
          <View style={styles.detailRow}>
            <Clock size={16} color="#666" />
            <Text style={styles.detailLabel}>Time Slot:</Text>
            <Text style={styles.detailValue}>
              {subscription.deliverySlot.charAt(0).toUpperCase() + subscription.deliverySlot.slice(1)} ({subscription.deliveryTimeRange})
            </Text>
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.detailRow}>
          <MapPin size={16} color="#666" />
          <Text style={styles.detailLabel}>Address:</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {subscription.deliveryAddress.street}, {subscription.deliveryAddress.city}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {canManage && (
        <View style={styles.actions}>
          {isActive && onPause && (
            <TouchableOpacity
              style={[styles.actionButton, styles.pauseButton]}
              onPress={() => onPause(subscription._id)}
            >
              <Pause size={16} color="#F59E0B" />
              <Text style={styles.pauseButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
          {isPaused && onResume && (
            <TouchableOpacity
              style={[styles.actionButton, styles.resumeButton]}
              onPress={() => onResume(subscription._id)}
            >
              <Play size={16} color="#10B981" />
              <Text style={styles.resumeButtonText}>Resume</Text>
            </TouchableOpacity>
          )}
          {onCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => onCancel(subscription._id)}
            >
              <X size={16} color="#EF4444" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={handlePress}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  partnerLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  planName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  details: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  pauseButton: {
    backgroundColor: '#FEF3C7',
  },
  pauseButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  resumeButton: {
    backgroundColor: '#D1FAE5',
  },
  resumeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  viewButton: {
    backgroundColor: '#FF9F43',
    flex: 1,
    justifyContent: 'center',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
});

