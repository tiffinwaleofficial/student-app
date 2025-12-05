import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, CreditCard, Utensils, Wallet } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';

type PaymentMethod = 'upi' | 'card' | 'wallet';

export default function SubscriptionCheckoutScreen() {
  const router = useRouter();
  const { t } = useTranslation('subscription');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');

  const handleSubscribe = () => {
    // Handle subscription payment
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('checkout')}</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.planSummary}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{t('premiumPlan')}</Text>
            <Text style={styles.planPrice}>₹3,999/month</Text>
          </View>

          <View style={styles.planDetails}>
            <View style={styles.detailRow}>
              <Utensils size={20} color="#666666" />
              <Text style={styles.detailText}>{t('twoMealsPerDay')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#666666" />
              <Text style={styles.detailText}>{t('thirtyDaysSubscription')}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('paymentMethod')}</Text>
          
          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'upi' && styles.selectedPayment]}
            onPress={() => setSelectedPayment('upi')}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.paymentIcon, { backgroundColor: '#E3F2FD' }]}>
                <Wallet size={20} color="#1E88E5" />
              </View>
              <View>
                <Text style={styles.paymentTitle}>UPI</Text>
                <Text style={styles.paymentSubtitle}>{t('payUsingAnyUpiApp')}</Text>
              </View>
            </View>
            <View style={[styles.radioButton, selectedPayment === 'upi' && styles.radioSelected]} />
          </TouchableOpacity>

          {selectedPayment === 'upi' && (
            <View style={styles.upiInput}>
              <TextInput
                style={styles.input}
                placeholder={t('enterUpiId')}
                value={upiId}
                onChangeText={setUpiId}
                autoCapitalize="none"
              />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'card' && styles.selectedPayment]}
            onPress={() => setSelectedPayment('card')}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.paymentIcon, { backgroundColor: '#FFF8EE' }]}>
                <CreditCard size={20} color="#FF9B42" />
              </View>
              <View>
                <Text style={styles.paymentTitle}>Card</Text>
                <Text style={styles.paymentSubtitle}>{t('creditOrDebitCard')}</Text>
              </View>
            </View>
            <View style={[styles.radioButton, selectedPayment === 'card' && styles.radioSelected]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, selectedPayment === 'wallet' && styles.selectedPayment]}
            onPress={() => setSelectedPayment('wallet')}
          >
            <View style={styles.paymentLeft}>
              <View style={[styles.paymentIcon, { backgroundColor: '#E8F5E9' }]}>
                <Wallet size={20} color="#43A047" />
              </View>
              <View>
                <Text style={styles.paymentTitle}>Wallet</Text>
                <Text style={styles.paymentSubtitle}>{t('payUsingDigitalWallet')}</Text>
              </View>
            </View>
            <View style={[styles.radioButton, selectedPayment === 'wallet' && styles.radioSelected]} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orderSummary')}</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('planPrice')}</Text>
              <Text style={styles.summaryValue}>₹3,999</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('gst')}</Text>
              <Text style={styles.summaryValue}>₹719.82</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('totalAmount')}</Text>
              <Text style={styles.totalValue}>₹4,718.82</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.subscribeButton}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeButtonText}>{t('paySubscribe')}</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  planSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#333333',
  },
  planPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#FF9B42',
  },
  planDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedPayment: {
    backgroundColor: '#FFF8EE',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
  },
  paymentSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
  },
  radioSelected: {
    borderColor: '#FF9B42',
    backgroundColor: '#FF9B42',
  },
  upiInput: {
    marginTop: -4,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
  },
  totalValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FF9B42',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 20,
    paddingBottom: 36,
  },
  subscribeButton: {
    backgroundColor: '#FF9B42',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});