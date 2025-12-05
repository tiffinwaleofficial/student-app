import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Package, 
  Calendar, 
  Clock, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  X
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/hooks/useTranslation';

export default function SubscriptionDetailsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentSubscription, fetchUserSubscriptions, isLoading } = useSubscriptionStore();
  const { success, showError } = useNotification();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSubscriptions();
    }
  }, [user, fetchUserSubscriptions]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserSubscriptions();
    } catch (error) {
      showError('Failed to refresh subscription details');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9B42';
      case 'paused': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#666666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <CheckCircle size={20} color="#4CAF50" />;
      case 'pending': return <Clock size={20} color="#FF9B42" />;
      case 'paused': return <Pause size={20} color="#9E9E9E" />;
      case 'cancelled': return <X size={20} color="#F44336" />;
      default: return <AlertCircle size={20} color="#666666" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toFixed(0)}`;
  };

  if (!currentSubscription) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Subscription Details</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Package size={64} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>No Active Subscription</Text>
          <Text style={styles.emptyText}>
            You don't have any active subscription. Browse our plans to get started!
          </Text>
          <TouchableOpacity 
            style={styles.browsePlansButton}
            onPress={() => router.push('/(tabs)/plans')}
          >
            <Text style={styles.browsePlansText}>Browse Plans</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const subscription = currentSubscription as any;
  const plan = subscription.plan;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Subscription Details</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Card */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.statusCard, { borderLeftColor: getStatusColor(subscription.status) }]}
        >
          <View style={styles.statusHeader}>
            {getStatusIcon(subscription.status)}
            <Text style={[styles.statusText, { color: getStatusColor(subscription.status) }]}>
              {subscription.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {subscription.status === 'active' && 'Your subscription is active and meals are being delivered'}
            {subscription.status === 'pending' && 'Your subscription is being processed'}
            {subscription.status === 'paused' && 'Your subscription is temporarily paused'}
            {subscription.status === 'cancelled' && 'Your subscription has been cancelled'}
          </Text>
        </Animated.View>

        {/* Plan Details */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.detailCard}
        >
          <Text style={styles.cardTitle}>Plan Information</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Package size={20} color="#FF9B42" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Plan Name</Text>
              <Text style={styles.detailValue}>{plan?.name || 'Subscription Plan'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <CreditCard size={20} color="#4CAF50" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValue}>{formatPrice(subscription.totalAmount)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={20} color="#2196F3" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{formatDate(subscription.startDate)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={20} color="#FF5722" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>End Date</Text>
              <Text style={styles.detailValue}>{formatDate(subscription.endDate)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Plan Features */}
        {plan?.features && plan.features.length > 0 && (
          <Animated.View 
            entering={FadeInDown.delay(600).duration(600)}
            style={styles.detailCard}
          >
            <Text style={styles.cardTitle}>Plan Features</Text>
            {plan.features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureRow}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Contact Information */}
        <Animated.View 
          entering={FadeInDown.delay(800).duration(600)}
          style={styles.detailCard}
        >
          <Text style={styles.cardTitle}>Need Help?</Text>
          
          <TouchableOpacity style={styles.contactRow}>
            <View style={styles.detailIcon}>
              <Phone size={20} color="#4CAF50" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Call Support</Text>
              <Text style={styles.detailValue}>+91 98765 43210</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactRow}>
            <View style={styles.detailIcon}>
              <Mail size={20} color="#2196F3" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email Support</Text>
              <Text style={styles.detailValue}>support@tiffinwale.com</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInDown.delay(1000).duration(600)}
          style={styles.actionContainer}
        >
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/plans')}
          >
            <Text style={styles.secondaryButtonText}>Browse Other Plans</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    lineHeight: 20,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#FF9B42',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF9B42',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FF9B42',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  browsePlansButton: {
    backgroundColor: '#FF9B42',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  browsePlansText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
});
