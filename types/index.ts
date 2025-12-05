export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  subscriptionActive: boolean;
  subscriptionEndDate?: string;
  subscriptionPlan?: SubscriptionPlan;
  profileImage?: string;
  dob?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  mealsPerDay: number;
  daysPerWeek: number;
  features: string[];
}

export interface Restaurant {
  _id: string;
  id: string;
  user: string;
  businessName: string;
  description: string;
  cuisineTypes: string[];
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  businessHours: {
    open: string;
    close: string;
    days: string[];
  };
  logoUrl: string;
  bannerUrl: string;
  isAcceptingOrders: boolean;
  isFeatured: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;

  // Business details
  gstNumber?: string;
  licenseNumber?: string;
  establishedYear?: number;

  // Contact information
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;

  // Delivery information
  deliveryRadius?: number;
  minimumOrderAmount?: number;
  deliveryFee?: number;
  estimatedDeliveryTime?: number;

  // Financial information
  commissionRate?: number;

  // Social media
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };

  // Operational details
  isVegetarian?: boolean;
  hasDelivery?: boolean;
  hasPickup?: boolean;
  acceptsCash?: boolean;
  acceptsCard?: boolean;
  acceptsUPI?: boolean;

  // Computed properties for UI
  name?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  formattedAddress?: string;
  cuisineType?: string[];
  featuredDish?: string;
  distance?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  category: string;
  averageRating?: number;
  totalReviews?: number;
  isAvailable: boolean;
  tags?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  businessPartner?: string;
}

export interface Review {
  id: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string; // Fallback for compatibility
    avatar?: string;
  };
  rating: number;
  comment?: string;
  images?: string[];
  helpfulCount: number;
  createdAt: string;
  restaurantId?: string;
  menuItemId?: string;
}

export interface Menu {
  id: string;
  name: string;
  description: string;
  restaurant: string;
  images?: string[];
  items: MenuItem[];
  availableFrom?: string;
  availableTo?: string;
}

export interface Meal {
  id: string;
  orderId?: string; // Link to order if meal comes from subscription order
  name?: string;
  image?: string;
  type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealType?: 'breakfast' | 'lunch' | 'dinner'; // From order
  deliverySlot?: 'morning' | 'afternoon' | 'evening'; // From order
  deliveryTime?: string; // Delivery time from order
  deliveryTimeRange?: string; // Time range like "8-10 AM"
  deliveryDate?: string | Date; // Delivery date for filtering
  date?: string;
  menu?: MenuItem[];
  items?: any[]; // Order items
  status?: 'scheduled' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'skipped' | 'pending' | 'confirmed' | 'out_for_delivery';
  restaurantId?: string;
  partnerId?: string; // Business partner ID from order
  partnerName?: string; // Business partner name from order
  restaurantName?: string;
  userRating?: number;
  rating?: number; // From order
  review?: string; // From order
  userReview?: string;
}

export interface OrderAdditional {
  id: string;
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  date: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
}


export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  date: string;
  actionLink?: string;
}

export interface Plan {
  _id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  mealsPerDay?: number;
}

export interface Subscription {
  _id: string;
  id: string;
  customer: string;
  plan: Plan;
  status: 'active' | 'pending' | 'cancelled' | 'paused';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
  totalAmount: number;
  discountAmount: number;
  isPaid: boolean;
  customizations: any[];
  createdAt: string;
  updatedAt: string;
}