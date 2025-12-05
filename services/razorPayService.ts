import RazorpayCheckout from 'react-native-razorpay';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RazorPayOptions {
  description: string;
  image?: string;
  currency: string;
  key: string;
  amount: string;
  name: string;
  order_id?: string;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
  notes?: Record<string, string>;
}

export interface PaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface PaymentError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
}

class RazorPayService {
  private keyId: string;
  private keySecret: string;

  constructor() {
    // These will be loaded from environment variables
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  }

  /**
   * Initialize payment with RazorPay
   */
  async initiatePayment(options: Omit<RazorPayOptions, 'key'>): Promise<PaymentResult> {
    try {
      const paymentOptions: RazorPayOptions = {
        ...options,
        key: this.keyId,
        theme: {
          color: '#6366F1', // Default theme color
          ...options.theme,
        },
      };

      const result = await RazorpayCheckout.open(paymentOptions);
      
      return {
        razorpay_payment_id: result.razorpay_payment_id,
        razorpay_order_id: result.razorpay_order_id,
        razorpay_signature: result.razorpay_signature,
      };
    } catch (error) {
      const paymentError = error as PaymentError;
      
      // Handle user cancellation
      if (paymentError.code === 'BAD_REQUEST_ERROR' && paymentError.description === 'User cancelled the payment') {
        throw new Error('Payment cancelled by user');
      }
      
      // Handle other errors
      console.error('RazorPay payment error:', paymentError);
      throw new Error(paymentError.description || 'Payment failed');
    }
  }

  /**
   * Create order on backend before initiating payment
   */
  async createOrder(amount: number, currency: string = 'INR', receipt?: string): Promise<string> {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency,
          receipt: receipt || `receipt_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      return data.order_id;
    } catch (error) {
      console.error('Error creating RazorPay order:', error);
      throw error;
    }
  }

  /**
   * Verify payment signature
   */
  async verifyPayment(paymentData: PaymentResult): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      return data.verified;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  /**
   * Process subscription payment
   */
  async processSubscriptionPayment(
    planId: string,
    amount: number,
    userDetails: {
      email: string;
      name: string;
      contact?: string;
    }
  ): Promise<PaymentResult> {
    try {
      // Create order first
      const orderId = await this.createOrder(amount, 'INR', `subscription_${planId}_${Date.now()}`);

      const options: Omit<RazorPayOptions, 'key'> = {
        description: `Subscription payment for plan ${planId}`,
        currency: 'INR',
        amount: (amount * 100).toString(), // Convert to paise
        name: 'TiffinWale',
        order_id: orderId,
        prefill: {
          email: userDetails.email,
          name: userDetails.name,
          contact: userDetails.contact,
        },
        notes: {
          plan_id: planId,
          type: 'subscription',
        },
      };

      return await this.initiatePayment(options);
    } catch (error) {
      console.error('Subscription payment error:', error);
      throw error;
    }
  }

  /**
   * Process order payment
   */
  async processOrderPayment(
    orderId: string,
    amount: number,
    userDetails: {
      email: string;
      name: string;
      contact?: string;
    }
  ): Promise<PaymentResult> {
    try {
      // Create RazorPay order
      const razorpayOrderId = await this.createOrder(amount, 'INR', `order_${orderId}`);

      const options: Omit<RazorPayOptions, 'key'> = {
        description: `Payment for order ${orderId}`,
        currency: 'INR',
        amount: (amount * 100).toString(), // Convert to paise
        name: 'TiffinWale',
        order_id: razorpayOrderId,
        prefill: {
          email: userDetails.email,
          name: userDetails.name,
          contact: userDetails.contact,
        },
        notes: {
          order_id: orderId,
          type: 'order',
        },
      };

      return await this.initiatePayment(options);
    } catch (error) {
      console.error('Order payment error:', error);
      throw error;
    }
  }

  /**
   * Process wallet top-up payment
   */
  async processWalletTopUp(
    amount: number,
    userDetails: {
      email: string;
      name: string;
      contact?: string;
    }
  ): Promise<PaymentResult> {
    try {
      // Create order first
      const orderId = await this.createOrder(amount, 'INR', `wallet_topup_${Date.now()}`);

      const options: Omit<RazorPayOptions, 'key'> = {
        description: `Wallet top-up of ₹${amount}`,
        currency: 'INR',
        amount: (amount * 100).toString(), // Convert to paise
        name: 'TiffinWale',
        order_id: orderId,
        prefill: {
          email: userDetails.email,
          name: userDetails.name,
          contact: userDetails.contact,
        },
        notes: {
          type: 'wallet_topup',
        },
      };

      return await this.initiatePayment(options);
    } catch (error) {
      console.error('Wallet top-up error:', error);
      throw error;
    }
  }

  /**
   * Get authentication token from storage
   */
  private async getAuthToken(): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }

  /**
   * Show payment success message
   */
  showPaymentSuccess(paymentId: string): void {
    Alert.alert(
      'Payment Successful',
      `Payment completed successfully!\nPayment ID: ${paymentId}`,
      [{ text: 'OK' }]
    );
  }

  /**
   * Show payment error message
   */
  showPaymentError(error: string): void {
    Alert.alert(
      'Payment Failed',
      error,
      [{ text: 'OK' }]
    );
  }

  /**
   * Show payment cancellation message
   */
  showPaymentCancelled(): void {
    Alert.alert(
      'Payment Cancelled',
      'Payment was cancelled by user',
      [{ text: 'OK' }]
    );
  }
}

// Export singleton instance
export const razorPayService = new RazorPayService();
export default razorPayService;
