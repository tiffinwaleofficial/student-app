import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePayment } from '../hooks/usePayment';
import { UserDetails } from '../hooks/usePayment';
import { useNotification } from '../hooks/useNotification';

interface PaymentButtonProps {
  amount: number;
  orderId?: string;
  planId?: string;
  paymentType: 'order' | 'subscription' | 'wallet_topup';
  userDetails: UserDetails;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
  onPaymentCancelled?: () => void;
  buttonText?: string;
  disabled?: boolean;
  style?: any;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  orderId,
  planId,
  paymentType,
  userDetails,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancelled,
  buttonText,
  disabled = false,
  style,
}) => {
  const { t } = useTranslation('common');
  const {
    isProcessing,
    error,
    handleOrderPayment,
    handleSubscriptionPayment,
    handleWalletTopUp,
    clearError,
  } = usePayment();

  const { warning } = useNotification();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (error) {
      onPaymentError?.(error);
      clearError();
    }
  }, [error, onPaymentError, clearError]);

  const handlePayment = async () => {
    if (disabled || isProcessing || isLoading) return;

    setIsLoading(true);

    try {
      let result;

      switch (paymentType) {
        case 'order':
          if (!orderId) {
            throw new Error(t('orderIdRequired'));
          }
          result = await handleOrderPayment(orderId, amount, userDetails);
          break;

        case 'subscription':
          if (!planId) {
            throw new Error(t('planIdRequired'));
          }
          result = await handleSubscriptionPayment(planId, amount, userDetails);
          break;

        case 'wallet_topup':
          result = await handleWalletTopUp(amount, userDetails);
          break;

        default:
          throw new Error(t('invalidPaymentType'));
      }

      onPaymentSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('paymentFailed');
      
      if (errorMessage === t('paymentCancelledByUser')) {
        onPaymentCancelled?.();
      } else {
        onPaymentError?.(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (buttonText) return buttonText;
    
    switch (paymentType) {
      case 'order':
        return `${t('pay')} ₹${amount}`;
      case 'subscription':
        return `${t('subscribe')} ₹${amount}`;
      case 'wallet_topup':
        return `${t('topUp')} ₹${amount}`;
      default:
        return `${t('pay')} ₹${amount}`;
    }
  };

  const isDisabled = disabled || isProcessing || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.paymentButton,
        isDisabled && styles.paymentButtonDisabled,
        style,
      ]}
      onPress={handlePayment}
      disabled={isDisabled}
    >
      {isProcessing || isLoading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.paymentButtonText}>{getButtonText()}</Text>
      )}
    </TouchableOpacity>
  );
};

interface WalletTopUpFormProps {
  onTopUp: (amount: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const WalletTopUpForm: React.FC<WalletTopUpFormProps> = ({
  onTopUp,
  isLoading = false,
  disabled = false,
}) => {
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const predefinedAmounts = [100, 250, 500, 1000, 2000, 5000];

  const handleTopUp = () => {
    const topUpAmount = selectedAmount || parseFloat(amount);
    
    if (topUpAmount && topUpAmount > 0) {
      onTopUp(topUpAmount);
    } else {
      warning(t('pleaseEnterValidAmount'));
    }
  };

  return (
    <View style={styles.walletForm}>
      <Text style={styles.formTitle}>{t('topUpWallet')}</Text>
      
      <View style={styles.predefinedAmounts}>
        {predefinedAmounts.map((predefinedAmount) => (
          <TouchableOpacity
            key={predefinedAmount}
            style={[
              styles.amountButton,
              selectedAmount === predefinedAmount && styles.amountButtonSelected,
            ]}
            onPress={() => {
              setSelectedAmount(predefinedAmount);
              setAmount('');
            }}
          >
            <Text
              style={[
                styles.amountButtonText,
                selectedAmount === predefinedAmount && styles.amountButtonTextSelected,
              ]}
            >
              ₹{predefinedAmount}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.orText}>{t('or')}</Text>

      <TextInput
        style={styles.amountInput}
        placeholder={t('enterCustomAmount')}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        editable={!disabled}
      />

      <TouchableOpacity
        style={[
          styles.topUpButton,
          (isLoading || disabled) && styles.topUpButtonDisabled,
        ]}
        onPress={handleTopUp}
        disabled={isLoading || disabled}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.topUpButtonText}>
            {t('topUp')} ₹{selectedAmount || amount || '0'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

interface PaymentStatusProps {
  transaction: any;
  onRetry?: () => void;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  transaction,
  onRetry,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      case 'processing':
        return '#3B82F6';
      case 'cancelled':
        return '#6B7280';
      case 'refunded':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Payment Successful';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return t('paymentPending');
      case 'processing':
        return t('processingPayment');
      case 'cancelled':
        return t('paymentCancelled');
      case 'refunded':
        return 'Payment Refunded';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <View style={styles.paymentStatus}>
      <View style={styles.statusHeader}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(transaction.status) },
          ]}
        />
        <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
      </View>

      <View style={styles.transactionDetails}>
        <Text style={styles.detailLabel}>Amount:</Text>
        <Text style={styles.detailValue}>₹{transaction.amount}</Text>
      </View>

      {transaction.razorpayPaymentId && (
        <View style={styles.transactionDetails}>
          <Text style={styles.detailLabel}>Payment ID:</Text>
          <Text style={styles.detailValue}>{transaction.razorpayPaymentId}</Text>
        </View>
      )}

      {transaction.failureReason && (
        <View style={styles.transactionDetails}>
          <Text style={styles.detailLabel}>Reason:</Text>
          <Text style={[styles.detailValue, styles.errorText]}>
            {transaction.failureReason}
          </Text>
        </View>
      )}

      {transaction.status === 'failed' && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  paymentButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  paymentButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  walletForm: {
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  predefinedAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  amountButtonSelected: {
    backgroundColor: '#6366F1',
  },
  amountButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  amountButtonTextSelected: {
    color: '#FFFFFF',
  },
  orText: {
    textAlign: 'center',
    color: '#6B7280',
    marginVertical: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  topUpButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  topUpButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  topUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentStatus: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginVertical: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  errorText: {
    color: '#EF4444',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PaymentButton;













