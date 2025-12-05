import { SubscriptionPlan } from ".";

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserPreferences {
  dietaryRestrictions?: string[];
  allergies?: string[];
  spiceLevel?: 'mild' | 'medium' | 'spicy';
}

export interface DeliveryAddress {
  id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface CustomerProfile {
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
  createdAt: string;
  updatedAt: string;
  // Enhanced profile data from backend
  currentSubscription?: any; // Will be populated with active subscription data
  deliveryAddresses?: DeliveryAddress[]; // Will be populated with user's addresses
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: CustomerProfile;
  roles: UserRole[];
  expiresIn: number;
  tokenType: string;
}

export interface AuthError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
} 