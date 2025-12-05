import { create } from 'zustand';
import { razorPayService, PaymentResult, PaymentError } from '../services/razorPayService';
import { useRealtimeStore } from './realtimeStore';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PaymentTransaction {
  id: string;
  orderId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

export interface WalletBalance {
  currentBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: string;
}

interface PaymentState {
  // Payment methods
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
  
  // Transactions
  transactions: PaymentTransaction[];
  currentTransaction: PaymentTransaction | null;
  
  // Wallet
  walletBalance: WalletBalance | null;
  
  // UI State
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  
  // Real-time subscriptions
  paymentSubscriptions: Map<string, string>; // transactionId -> subscriptionId
  
  // Actions
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id'>) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  
  // Transactions
  fetchTransactions: () => Promise<void>;
  createTransaction: (transaction: Omit<PaymentTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTransactionStatus: (transactionId: string, status: PaymentTransaction['status'], metadata?: Record<string, unknown>) => Promise<void>;
  subscribeToTransactionUpdates: (transactionId: string) => void;
  unsubscribeFromTransactionUpdates: (transactionId: string) => void;
  
  // Wallet
  fetchWalletBalance: () => Promise<void>;
  topUpWallet: (amount: number, userDetails: { email: string; name: string; contact?: string }) => Promise<PaymentResult>;
  
  // Payment processing
  processOrderPayment: (orderId: string, amount: number, userDetails: { email: string; name: string; contact?: string }) => Promise<PaymentResult>;
  processSubscriptionPayment: (planId: string, amount: number, userDetails: { email: string; name: string; contact?: string }) => Promise<PaymentResult>;
  
  // Real-time updates
  handleRealtimePaymentUpdate: (transactionId: string, data: Record<string, unknown>) => void;
  
  // Error handling
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  // Initial state
  paymentMethods: [],
  defaultPaymentMethod: null,
  transactions: [],
  currentTransaction: null,
  walletBalance: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  paymentSubscriptions: new Map(),
  
  // Payment methods
  fetchPaymentMethods: async () => {
    set({ isLoading: true, error: null });
    try {
      // This would typically fetch from your backend API
      // For now, we'll simulate with empty array
      set({ 
        paymentMethods: [],
        defaultPaymentMethod: null,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch payment methods',
        isLoading: false 
      });
    }
  },
  
  addPaymentMethod: async (paymentMethod) => {
    try {
      // This would typically save to your backend API
      const newMethod: PaymentMethod = {
        ...paymentMethod,
        id: `method_${Date.now()}`,
      };
      
      set(state => ({
        paymentMethods: [...state.paymentMethods, newMethod]
      }));
    } catch (error) {
      console.error('Error adding payment method:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add payment method'
      });
    }
  },
  
  setDefaultPaymentMethod: async (methodId: string) => {
    try {
      const { paymentMethods } = get();
      const method = paymentMethods.find(m => m.id === methodId);
      
      if (method) {
        // Update all methods to not be default
        const updatedMethods = paymentMethods.map(m => ({
          ...m,
          isDefault: m.id === methodId
        }));
        
        set({
          paymentMethods: updatedMethods,
          defaultPaymentMethod: method
        });
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to set default payment method'
      });
    }
  },
  
  removePaymentMethod: async (methodId: string) => {
    try {
      set(state => ({
        paymentMethods: state.paymentMethods.filter(m => m.id !== methodId),
        defaultPaymentMethod: state.defaultPaymentMethod?.id === methodId ? null : state.defaultPaymentMethod
      }));
    } catch (error) {
      console.error('Error removing payment method:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove payment method'
      });
    }
  },
  
  // Transactions
  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      // This would typically fetch from your backend API
      // For now, we'll simulate with empty array
      set({ 
        transactions: [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
        isLoading: false 
      });
    }
  },
  
  createTransaction: async (transaction) => {
    try {
      const newTransaction: PaymentTransaction = {
        ...transaction,
        id: `txn_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set(state => ({
        transactions: [newTransaction, ...state.transactions],
        currentTransaction: newTransaction
      }));
      
      return newTransaction.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create transaction'
      });
      throw error;
    }
  },
  
  updateTransactionStatus: async (transactionId: string, status: PaymentTransaction['status'], metadata?: Record<string, unknown>) => {
    try {
      set(state => ({
        transactions: state.transactions.map(txn =>
          txn.id === transactionId
            ? { 
                ...txn, 
                status, 
                updatedAt: new Date().toISOString(),
                ...(metadata && { metadata: { ...txn.metadata, ...metadata } })
              }
            : txn
        ),
        currentTransaction: state.currentTransaction?.id === transactionId
          ? { 
              ...state.currentTransaction, 
              status, 
              updatedAt: new Date().toISOString(),
              ...(metadata && { metadata: { ...state.currentTransaction.metadata, ...metadata } })
            }
          : state.currentTransaction
      }));
    } catch (error) {
      console.error('Error updating transaction status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update transaction status'
      });
    }
  },
  
  subscribeToTransactionUpdates: (transactionId: string) => {
    const { paymentSubscriptions } = get();
    
    // Don't create duplicate subscriptions
    if (paymentSubscriptions.has(transactionId)) {
      return;
    }
    
    const realtimeStore = useRealtimeStore.getState();
    if (realtimeStore.isConnected) {
      const subscriptionId = realtimeStore.subscribe(`payment_${transactionId}`, (data: Record<string, unknown>) => {
        get().handleRealtimePaymentUpdate(transactionId, data);
      });
      
      paymentSubscriptions.set(transactionId, subscriptionId);
      set({ paymentSubscriptions: new Map(paymentSubscriptions) });
    }
  },
  
  unsubscribeFromTransactionUpdates: (transactionId: string) => {
    const { paymentSubscriptions } = get();
    const subscriptionId = paymentSubscriptions.get(transactionId);
    
    if (subscriptionId) {
      const realtimeStore = useRealtimeStore.getState();
      realtimeStore.unsubscribe(subscriptionId);
      paymentSubscriptions.delete(transactionId);
      set({ paymentSubscriptions: new Map(paymentSubscriptions) });
    }
  },
  
  // Wallet
  fetchWalletBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      // This would typically fetch from your backend API
      // For now, we'll simulate with default values
      const walletBalance: WalletBalance = {
        currentBalance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: new Date().toISOString(),
      };
      
      set({ 
        walletBalance,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch wallet balance',
        isLoading: false 
      });
    }
  },
  
  topUpWallet: async (amount: number, userDetails: { email: string; name: string; contact?: string }) => {
    set({ isProcessing: true, error: null });
    
    try {
      // Create transaction
      const transactionId = await get().createTransaction({
        amount,
        currency: 'INR',
        status: 'pending',
        metadata: { type: 'wallet_topup' }
      });
      
      // Subscribe to real-time updates
      get().subscribeToTransactionUpdates(transactionId);
      
      // Process payment
      const result = await razorPayService.processWalletTopUp(amount, userDetails);
      
      // Update transaction with payment details
      await get().updateTransactionStatus(transactionId, 'completed', {
        razorpayPaymentId: result.razorpay_payment_id,
        razorpayOrderId: result.razorpay_order_id,
        razorpaySignature: result.razorpay_signature,
      });
      
      // Verify payment
      const isVerified = await razorPayService.verifyPayment(result);
      if (isVerified) {
        // Update wallet balance
        await get().fetchWalletBalance();
        razorPayService.showPaymentSuccess(result.razorpay_payment_id);
      } else {
        await get().updateTransactionStatus(transactionId, 'failed', {
          failureReason: 'Payment verification failed'
        });
        razorPayService.showPaymentError('Payment verification failed');
      }
      
      set({ isProcessing: false });
      return result;
    } catch (error) {
      console.error('Wallet top-up error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Wallet top-up failed',
        isProcessing: false 
      });
      
      if (error instanceof Error && error.message === 'Payment cancelled by user') {
        razorPayService.showPaymentCancelled();
      } else {
        razorPayService.showPaymentError(error instanceof Error ? error.message : 'Payment failed');
      }
      
      throw error;
    }
  },
  
  // Payment processing
  processOrderPayment: async (orderId: string, amount: number, userDetails: { email: string; name: string; contact?: string }) => {
    set({ isProcessing: true, error: null });
    
    try {
      // Create transaction
      const transactionId = await get().createTransaction({
        orderId,
        amount,
        currency: 'INR',
        status: 'pending',
        metadata: { type: 'order_payment' }
      });
      
      // Subscribe to real-time updates
      get().subscribeToTransactionUpdates(transactionId);
      
      // Process payment
      const result = await razorPayService.processOrderPayment(orderId, amount, userDetails);
      
      // Update transaction with payment details
      await get().updateTransactionStatus(transactionId, 'completed', {
        razorpayPaymentId: result.razorpay_payment_id,
        razorpayOrderId: result.razorpay_order_id,
        razorpaySignature: result.razorpay_signature,
      });
      
      // Verify payment
      const isVerified = await razorPayService.verifyPayment(result);
      if (isVerified) {
        razorPayService.showPaymentSuccess(result.razorpay_payment_id);
      } else {
        await get().updateTransactionStatus(transactionId, 'failed', {
          failureReason: 'Payment verification failed'
        });
        razorPayService.showPaymentError('Payment verification failed');
      }
      
      set({ isProcessing: false });
      return result;
    } catch (error) {
      console.error('Order payment error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Order payment failed',
        isProcessing: false 
      });
      
      if (error instanceof Error && error.message === 'Payment cancelled by user') {
        razorPayService.showPaymentCancelled();
      } else {
        razorPayService.showPaymentError(error instanceof Error ? error.message : 'Payment failed');
      }
      
      throw error;
    }
  },
  
  processSubscriptionPayment: async (planId: string, amount: number, userDetails: { email: string; name: string; contact?: string }) => {
    set({ isProcessing: true, error: null });
    
    try {
      // Create transaction
      const transactionId = await get().createTransaction({
        subscriptionId: planId,
        amount,
        currency: 'INR',
        status: 'pending',
        metadata: { type: 'subscription_payment' }
      });
      
      // Subscribe to real-time updates
      get().subscribeToTransactionUpdates(transactionId);
      
      // Process payment
      const result = await razorPayService.processSubscriptionPayment(planId, amount, userDetails);
      
      // Update transaction with payment details
      await get().updateTransactionStatus(transactionId, 'completed', {
        razorpayPaymentId: result.razorpay_payment_id,
        razorpayOrderId: result.razorpay_order_id,
        razorpaySignature: result.razorpay_signature,
      });
      
      // Verify payment
      const isVerified = await razorPayService.verifyPayment(result);
      if (isVerified) {
        razorPayService.showPaymentSuccess(result.razorpay_payment_id);
      } else {
        await get().updateTransactionStatus(transactionId, 'failed', {
          failureReason: 'Payment verification failed'
        });
        razorPayService.showPaymentError('Payment verification failed');
      }
      
      set({ isProcessing: false });
      return result;
    } catch (error) {
      console.error('Subscription payment error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Subscription payment failed',
        isProcessing: false 
      });
      
      if (error instanceof Error && error.message === 'Payment cancelled by user') {
        razorPayService.showPaymentCancelled();
      } else {
        razorPayService.showPaymentError(error instanceof Error ? error.message : 'Payment failed');
      }
      
      throw error;
    }
  },
  
  // Real-time updates
  handleRealtimePaymentUpdate: (transactionId: string, data: Record<string, unknown>) => {
    console.log(`Realtime payment update for transaction ${transactionId}:`, data);
    
    // Update transaction status based on real-time data
    if (data.status) {
      get().updateTransactionStatus(transactionId, data.status as PaymentTransaction['status'], data);
    }
    
    // Handle wallet balance updates
    if (data.walletBalance) {
      get().fetchWalletBalance();
    }
  },
  
  // Error handling
  clearError: () => {
    set({ error: null });
  },
}));






















