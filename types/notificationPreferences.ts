/**
 * Notification Preferences Types
 * Comprehensive type definitions for user notification preferences
 */

export interface NotificationPreferences {
  // Master toggle
  allNotifications: boolean
  
  // Order notifications
  orderNotifications: {
    enabled: boolean
    orderPlaced: boolean
    orderConfirmed: boolean
    orderPreparing: boolean
    orderCooking: boolean
    orderReady: boolean
    orderOutForDelivery: boolean
    orderDelivered: boolean
    orderCancelled: boolean
    orderDelayed: boolean
    orderRescheduled: boolean
  }
  
  // Payment notifications
  paymentNotifications: {
    enabled: boolean
    paymentSuccess: boolean
    paymentFailed: boolean
    paymentPending: boolean
    refundInitiated: boolean
    refundCompleted: boolean
    walletTopup: boolean
    subscriptionPayment: boolean
  }
  
  // Subscription notifications
  subscriptionNotifications: {
    enabled: boolean
    subscriptionActivated: boolean
    subscriptionExpiring: boolean
    subscriptionExpired: boolean
    subscriptionRenewed: boolean
    subscriptionCancelled: boolean
    subscriptionPaused: boolean
    subscriptionResumed: boolean
    planUpgraded: boolean
    planDowngraded: boolean
  }
  
  // Meal notifications
  mealNotifications: {
    enabled: boolean
    mealReminder: boolean
    mealReady: boolean
    mealSkipped: boolean
    mealCustomized: boolean
    newMenuItems: boolean
    chefSpecial: boolean
    nutritionTips: boolean
  }
  
  // Promotional notifications
  promotionalNotifications: {
    enabled: boolean
    discountOffers: boolean
    flashSales: boolean
    seasonalOffers: boolean
    referralRewards: boolean
    loyaltyPoints: boolean
    newRestaurants: boolean
    festivalOffers: boolean
  }
  
  // Chat notifications
  chatNotifications: {
    enabled: boolean
    newMessage: boolean
    supportReply: boolean
    restaurantMessage: boolean
    deliveryUpdates: boolean
  }
  
  // System notifications
  systemNotifications: {
    enabled: boolean
    appUpdates: boolean
    maintenanceAlerts: boolean
    securityAlerts: boolean
    policyUpdates: boolean
    serviceAnnouncements: boolean
  }
  
  // Delivery notifications
  deliveryNotifications: {
    enabled: boolean
    deliveryPartnerAssigned: boolean
    deliveryPartnerNearby: boolean
    deliveryAttempted: boolean
    deliveryCompleted: boolean
    deliveryFeedback: boolean
  }
  
  // Review notifications
  reviewNotifications: {
    enabled: boolean
    reviewReminder: boolean
    reviewReply: boolean
    reviewLiked: boolean
    reviewFeatured: boolean
  }
  
  // Social notifications
  socialNotifications: {
    enabled: boolean
    friendActivity: boolean
    groupOrders: boolean
    sharedMeals: boolean
    recommendations: boolean
  }
  
  // Timing preferences
  timingPreferences: {
    quietHours: {
      enabled: boolean
      startTime: string // "22:00"
      endTime: string   // "08:00"
    }
    weekendSettings: {
      differentSettings: boolean
      quietHours: {
        enabled: boolean
        startTime: string
        endTime: string
      }
    }
  }
  
  // Delivery preferences
  deliveryPreferences: {
    sound: boolean
    vibration: boolean
    led: boolean
    priority: 'low' | 'normal' | 'high'
  }
  
  // Metadata
  lastUpdated: string
  syncedWithBackend: boolean
  version: number
}

export interface NotificationCategory {
  id: string
  title: string
  description: string
  icon: string
  enabled: boolean
  subcategories: NotificationSubcategory[]
}

export interface NotificationSubcategory {
  id: string
  title: string
  description: string
  enabled: boolean
  critical?: boolean // Cannot be disabled
}

export interface NotificationPreferenceUpdate {
  category: string
  subcategory?: string
  enabled: boolean
  userId: string
}

export interface BackendNotificationPreferences {
  userId: string
  preferences: NotificationPreferences
  deviceTokens: string[]
  timezone: string
  locale: string
  createdAt: string
  updatedAt: string
}

// Default notification preferences
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  allNotifications: true,
  
  orderNotifications: {
    enabled: true,
    orderPlaced: true,
    orderConfirmed: true,
    orderPreparing: true,
    orderCooking: true,
    orderReady: true,
    orderOutForDelivery: true,
    orderDelivered: true,
    orderCancelled: true,
    orderDelayed: true,
    orderRescheduled: true,
  },
  
  paymentNotifications: {
    enabled: true,
    paymentSuccess: true,
    paymentFailed: true,
    paymentPending: true,
    refundInitiated: true,
    refundCompleted: true,
    walletTopup: true,
    subscriptionPayment: true,
  },
  
  subscriptionNotifications: {
    enabled: true,
    subscriptionActivated: true,
    subscriptionExpiring: true,
    subscriptionExpired: true,
    subscriptionRenewed: true,
    subscriptionCancelled: true,
    subscriptionPaused: true,
    subscriptionResumed: true,
    planUpgraded: true,
    planDowngraded: true,
  },
  
  mealNotifications: {
    enabled: true,
    mealReminder: true,
    mealReady: true,
    mealSkipped: false,
    mealCustomized: true,
    newMenuItems: true,
    chefSpecial: true,
    nutritionTips: false,
  },
  
  promotionalNotifications: {
    enabled: true,
    discountOffers: true,
    flashSales: true,
    seasonalOffers: true,
    referralRewards: true,
    loyaltyPoints: true,
    newRestaurants: true,
    festivalOffers: true,
  },
  
  chatNotifications: {
    enabled: true,
    newMessage: true,
    supportReply: true,
    restaurantMessage: true,
    deliveryUpdates: true,
  },
  
  systemNotifications: {
    enabled: true,
    appUpdates: true,
    maintenanceAlerts: true,
    securityAlerts: true,
    policyUpdates: false,
    serviceAnnouncements: true,
  },
  
  deliveryNotifications: {
    enabled: true,
    deliveryPartnerAssigned: true,
    deliveryPartnerNearby: true,
    deliveryAttempted: true,
    deliveryCompleted: true,
    deliveryFeedback: false,
  },
  
  reviewNotifications: {
    enabled: true,
    reviewReminder: false,
    reviewReply: true,
    reviewLiked: true,
    reviewFeatured: true,
  },
  
  socialNotifications: {
    enabled: false,
    friendActivity: false,
    groupOrders: false,
    sharedMeals: false,
    recommendations: false,
  },
  
  timingPreferences: {
    quietHours: {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00",
    },
    weekendSettings: {
      differentSettings: false,
      quietHours: {
        enabled: false,
        startTime: "23:00",
        endTime: "09:00",
      },
    },
  },
  
  deliveryPreferences: {
    sound: true,
    vibration: true,
    led: true,
    priority: 'normal',
  },
  
  lastUpdated: new Date().toISOString(),
  syncedWithBackend: false,
  version: 1,
}