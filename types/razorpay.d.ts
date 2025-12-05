declare module 'react-native-razorpay' {
  interface RazorPayOptions {
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

  interface RazorPayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  interface RazorPayError {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  }

  const RazorpayCheckout: {
    open(options: RazorPayOptions): Promise<RazorPayResponse>;
  };

  export default RazorpayCheckout;
}






















