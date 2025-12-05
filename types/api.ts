// Common API response format
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'customer';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Customer profile types
export interface CustomerProfile {
  _id?: string;
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // for compatibility
  email: string;
  phone: string;
  addresses: DeliveryAddress[];
  address?: string; // for compatibility
  preferences: UserPreferences;
  subscriptionActive?: boolean;
  subscriptionEndDate?: string;
  subscriptionPlan?: SubscriptionPlan;
  profileImage?: string;
  dob?: string;
  city?: string;
  college?: string;
  branch?: string;
  graduationYear?: number;
  dietaryPreferences?: string[];
  favoriteCuisines?: string[];
  preferredPaymentMethods?: string[];
  deliveryAddresses?: DeliveryAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  dietaryRestrictions?: string[];
  allergies?: string[];
  spiceLevel?: 'mild' | 'medium' | 'spicy';
}

export interface DeliveryAddress {
  id?: string;
  address: string; // Main address field
  city: string;
  state: string;
  zipCode: string; // Changed from pincode to match backend
  landmark?: string; // Optional landmark field
  phoneNumber?: string; // Optional phone number for delivery
  isDefault: boolean;
  // Frontend-only fields for categorization (not sent to backend)
  type?: 'Home' | 'Office' | 'Other'; // Address type for categorization
  displayName?: string; // Display name for UI
}

export interface OrderCreateData {
  items: Array<{ itemId: string; quantity: number }>;
  type?: string;
  deliveryAddress?: DeliveryAddress;
}

// Menu types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  partnerId: string;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number;
  ingredients?: string[];
  dietaryInfo?: string[];
  ratings?: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface Order {
  id: string;
  customer: string | CustomerProfile;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  deliveryInstructions?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  menuItem: string | MenuItem;
  quantity: number;
  price: number;
  special_instructions?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'canceled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

// Subscription types
export interface Subscription {
  _id?: string;
  id: string;
  customer: string | CustomerProfile;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export type CustomerSubscription = Subscription;

export interface SubscriptionPlan {
  _id?: string;
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  durationValue?: number;
  durationType?: 'day' | 'month';
  duration?: number; // in days (fallback)
  mealFrequency?: string;
  mealsPerDay?: number;
  deliveryFee?: number;
  features: string[];
  maxPauseCount?: number;
  maxSkipCount?: number;
  maxCustomizationsPerDay?: number;
  averageRating?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'expired'
  | 'pending';

// Additional types needed for apiClient
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: CustomerProfile;
  roles?: UserRole[];
  expiresIn?: number;
  tokenType?: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface OrderTracking {
  orderId: string;
  status: OrderStatus;
  currentLocation?: string;
  estimatedDeliveryTime?: string;
  updates: Array<{
    status: OrderStatus;
    timestamp: string;
    message: string;
  }>;
}

export interface Menu {
  categories: MenuCategory[];
  featuredItems: MenuItem[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  items: MenuItem[];
}

export interface MealCustomization {
  preferences: string[];
  allergies: string[];
  specialInstructions?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export interface PaymentMethodData {
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  upiId?: string;
  bankName?: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  methodId: string;
  orderId: string;
}

export interface PaymentResult {
  id: string;
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  message: string;
}

export interface FeedbackData {
  type: 'general' | 'bug' | 'feature' | 'complaint' | 'suggestion';
  subject: string;
  message: string;
  rating?: number;
  category?: string;
}

export interface Feedback {
  id: string;
  type: string;
  subject: string;
  message: string;
  rating?: number;
  category?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketData {
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'delivery' | 'general';
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  priority: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionCreateData {
  planId: string;
  startDate: string;
  autoRenew: boolean;
  paymentMethodId: string;
} 