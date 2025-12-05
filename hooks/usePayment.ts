import { useCallback } from 'react';
import { usePaymentStore } from '../store/paymentStore';
import { PaymentResult } from '../services/razorPayService';

export interface UserDetails {
  email: string;
  name: string;
  contact?: string;
}

export const usePayment = () => {
  const {
    isLoading,
    isProcessing,
    error,
    walletBalance,
    transactions,
    currentTransaction,
    paymentMethods,
    defaultPaymentMethod,
    
    // Actions
    fetchPaymentMethods,
    addPaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    fetchTransactions,
    fetchWalletBalance,
    topUpWallet,
    processOrderPayment,
    processSubscriptionPayment,
    clearError,
  } = usePaymentStore();

  // Wallet operations
  const handleWalletTopUp = useCallback(async (
    amount: number,
    userDetails: UserDetails
  ): Promise<PaymentResult> => {
    return await topUpWallet(amount, userDetails);
  }, [topUpWallet]);

  // Order payment
  const handleOrderPayment = useCallback(async (
    orderId: string,
    amount: number,
    userDetails: UserDetails
  ): Promise<PaymentResult> => {
    return await processOrderPayment(orderId, amount, userDetails);
  }, [processOrderPayment]);

  // Subscription payment
  const handleSubscriptionPayment = useCallback(async (
    planId: string,
    amount: number,
    userDetails: UserDetails
  ): Promise<PaymentResult> => {
    return await processSubscriptionPayment(planId, amount, userDetails);
  }, [processSubscriptionPayment]);

  // Payment method operations
  const handleAddPaymentMethod = useCallback(async (
    paymentMethod: Omit<import('../store/paymentStore').PaymentMethod, 'id'>
  ) => {
    await addPaymentMethod(paymentMethod);
  }, [addPaymentMethod]);

  const handleSetDefaultPaymentMethod = useCallback(async (methodId: string) => {
    await setDefaultPaymentMethod(methodId);
  }, [setDefaultPaymentMethod]);

  const handleRemovePaymentMethod = useCallback(async (methodId: string) => {
    await removePaymentMethod(methodId);
  }, [removePaymentMethod]);

  // Data fetching
  const loadPaymentData = useCallback(async () => {
    await Promise.all([
      fetchPaymentMethods(),
      fetchTransactions(),
      fetchWalletBalance(),
    ]);
  }, [fetchPaymentMethods, fetchTransactions, fetchWalletBalance]);

  return {
    // State
    isLoading,
    isProcessing,
    error,
    walletBalance,
    transactions,
    currentTransaction,
    paymentMethods,
    defaultPaymentMethod,
    
    // Actions
    loadPaymentData,
    handleWalletTopUp,
    handleOrderPayment,
    handleSubscriptionPayment,
    handleAddPaymentMethod,
    handleSetDefaultPaymentMethod,
    handleRemovePaymentMethod,
    clearError,
  };
};

export default usePayment;
