/**
 * Notification Preferences Store
 * Manages user notification preferences with backend synchronization
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import apiClient from '@/utils/apiClient'
import { getErrorMessage } from '@/utils/errorHandler'

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
  }
  
  // Payment notifications
  paymentNotifications: {
    enabled: boolean
    paymentSuccess: boolean
    paymentFailed: boolean
    paymentPending: boolean
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
    planUpgraded: boolean
  }
  
  // Meal notifications
  mealNotifications: {
    enabled: boolean
    mealReminder: boolean
    mealReady: boolean
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
    serviceAnnouncements: boolean
  }
  
  // Delivery notifications
  deliveryNotifications: {
    enabled: boolean
    deliveryPartnerAssigned: boolean
    deliveryPartnerNearby: boolean
    deliveryCompleted: boolean
  }
  
  // Timing preferences
  timingPreferences: {
    quietHours: {
      enabled: boolean
      startTime: string // "22:00"
      endTime: string   // "08:00"
    }
  }
  
  // Delivery preferences
  deliveryPreferences: {
    sound: boolean
    vibration: boolean
    priority: 'low' | 'normal' | 'high'
  }
  
  // Metadata
  lastUpdated: string
  syncedWithBackend: boolean
}

interface NotificationPreferencesState {
  preferences: NotificationPreferences
  isLoading: boolean
  error: string | null
  lastSyncTime: string | null
  
  // Actions
  initializePreferences: () => Promise<void>
  updatePreference: (category: string, subcategory: string | null, enabled: boolean) => Promise<void>
  toggleMasterNotifications: (enabled: boolean) => Promise<void>
  toggleCategoryNotifications: (category: string, enabled: boolean) => Promise<void>
  syncWithBackend: () => Promise<void>
  fetchFromBackend: () => Promise<void>
  resetToDefaults: () => Promise<void>
  
  // Getters
  isNotificationEnabled: (category: string, subcategory?: string) => boolean
  shouldShowNotification: (category: string, subcategory: string) => boolean
  getNotificationCategories: () => NotificationCategory[]
  
  // Utility
  clearError: () => void
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
  critical?: boolean
}

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
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
  },
  
  paymentNotifications: {
    enabled: true,
    paymentSuccess: true,
    paymentFailed: true,
    paymentPending: true,
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
    planUpgraded: true,
  },
  
  mealNotifications: {
    enabled: true,
    mealReminder: true,
    mealReady: true,
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
    serviceAnnouncements: true,
  },
  
  deliveryNotifications: {
    enabled: true,
    deliveryPartnerAssigned: true,
    deliveryPartnerNearby: true,
    deliveryCompleted: true,
  },
  
  timingPreferences: {
    quietHours: {
      enabled: false,
      startTime: "22:00",
      endTime: "08:00",
    },
  },
  
  deliveryPreferences: {
    sound: true,
    vibration: true,
    priority: 'normal',
  },
  
  lastUpdated: new Date().toISOString(),
  syncedWithBackend: false,
}

export const useNotificationPreferencesStore = create<NotificationPreferencesState>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      isLoading: false,
      error: null,
      lastSyncTime: null,

      // Initialize preferences
      initializePreferences: async () => {
        set({ isLoading: true, error: null })
        
        try {
          // Try to fetch from backend first
          await get().fetchFromBackend()
        } catch (error) {
          console.warn('Failed to fetch preferences from backend, using local/default')
          // Use local preferences or defaults
        } finally {
          set({ isLoading: false })
        }
      },

      // Update a specific preference
      updatePreference: async (category: string, subcategory: string | null, enabled: boolean) => {
        const { preferences } = get()
        
        try {
          const updatedPreferences = { ...preferences }
          
          if (subcategory) {
            // Update subcategory
            if (updatedPreferences[category as keyof NotificationPreferences]) {
              const categoryPrefs = updatedPreferences[category as keyof NotificationPreferences] as any
              if (typeof categoryPrefs === 'object' && categoryPrefs !== null) {
                categoryPrefs[subcategory] = enabled
              }
            }
          } else {
            // Update category
            const categoryPrefs = updatedPreferences[category as keyof NotificationPreferences] as any
            if (typeof categoryPrefs === 'object' && categoryPrefs !== null && 'enabled' in categoryPrefs) {
              categoryPrefs.enabled = enabled
              
              // If disabling category, disable all subcategories
              if (!enabled) {
                Object.keys(categoryPrefs).forEach(key => {
                  if (key !== 'enabled') {
                    categoryPrefs[key] = false
                  }
                })
              }
            }
          }
          
          updatedPreferences.lastUpdated = new Date().toISOString()
          updatedPreferences.syncedWithBackend = false
          
          set({ preferences: updatedPreferences })
          
          // Sync with backend
          await get().syncWithBackend()
          
        } catch (error) {
          console.error('Failed to update preference:', error)
          set({ error: getErrorMessage(error) })
        }
      },

      // Toggle master notifications
      toggleMasterNotifications: async (enabled: boolean) => {
        const { preferences } = get()
        
        try {
          const updatedPreferences = { ...preferences, allNotifications: enabled }
          
          // If disabling all notifications, disable all categories
          if (!enabled) {
            Object.keys(updatedPreferences).forEach(key => {
              const categoryPrefs = updatedPreferences[key as keyof NotificationPreferences] as any
              if (typeof categoryPrefs === 'object' && categoryPrefs !== null && 'enabled' in categoryPrefs) {
                categoryPrefs.enabled = false
              }
            })
          }
          
          updatedPreferences.lastUpdated = new Date().toISOString()
          updatedPreferences.syncedWithBackend = false
          
          set({ preferences: updatedPreferences })
          
          // Sync with backend
          await get().syncWithBackend()
          
        } catch (error) {
          console.error('Failed to toggle master notifications:', error)
          set({ error: getErrorMessage(error) })
        }
      },

      // Toggle category notifications
      toggleCategoryNotifications: async (category: string, enabled: boolean) => {
        await get().updatePreference(category, null, enabled)
      },

      // Sync with backend
      syncWithBackend: async () => {
        const { preferences } = get()
        
        try {
          // Send preferences to backend
          await apiClient.post('/notifications/preferences', {
            preferences,
            deviceInfo: {
              platform: require('react-native').Platform.OS,
              version: require('react-native').Platform.Version,
            }
          })
          
          const updatedPreferences = {
            ...preferences,
            syncedWithBackend: true,
            lastUpdated: new Date().toISOString()
          }
          
          set({ 
            preferences: updatedPreferences,
            lastSyncTime: new Date().toISOString(),
            error: null 
          })
          
          console.log('✅ Notification preferences synced with backend')
          
        } catch (error) {
          console.error('❌ Failed to sync preferences with backend:', error)
          set({ error: getErrorMessage(error) })
        }
      },

      // Fetch from backend
      fetchFromBackend: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await apiClient.get('/notifications/preferences')
          
          if (response.data && response.data.preferences) {
            const backendPreferences = {
              ...DEFAULT_PREFERENCES,
              ...response.data.preferences,
              syncedWithBackend: true,
              lastUpdated: new Date().toISOString()
            }
            
            set({ 
              preferences: backendPreferences,
              lastSyncTime: new Date().toISOString(),
              error: null 
            })
            
            console.log('✅ Notification preferences fetched from backend')
          }
          
        } catch (error) {
          console.error('❌ Failed to fetch preferences from backend:', error)
          set({ error: getErrorMessage(error) })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      // Reset to defaults
      resetToDefaults: async () => {
        try {
          const defaultPreferences = {
            ...DEFAULT_PREFERENCES,
            lastUpdated: new Date().toISOString(),
            syncedWithBackend: false
          }
          
          set({ preferences: defaultPreferences })
          
          // Sync with backend
          await get().syncWithBackend()
          
        } catch (error) {
          console.error('Failed to reset preferences:', error)
          set({ error: getErrorMessage(error) })
        }
      },

      // Check if notification is enabled
      isNotificationEnabled: (category: string, subcategory?: string) => {
        const { preferences } = get()
        
        // Check master toggle first
        if (!preferences.allNotifications) return false
        
        const categoryPrefs = preferences[category as keyof NotificationPreferences] as any
        
        if (!categoryPrefs || typeof categoryPrefs !== 'object') return false
        
        // Check category toggle
        if (!categoryPrefs.enabled) return false
        
        // Check subcategory if provided
        if (subcategory) {
          return categoryPrefs[subcategory] === true
        }
        
        return categoryPrefs.enabled === true
      },

      // Should show notification (includes timing checks)
      shouldShowNotification: (category: string, subcategory: string) => {
        const { preferences } = get()
        
        // Check if notification is enabled
        if (!get().isNotificationEnabled(category, subcategory)) {
          return false
        }
        
        // Check quiet hours
        if (preferences.timingPreferences.quietHours.enabled) {
          const now = new Date()
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
          const { startTime, endTime } = preferences.timingPreferences.quietHours
          
          // Simple time range check (doesn't handle overnight ranges properly)
          if (startTime < endTime) {
            if (currentTime >= startTime && currentTime <= endTime) {
              return false // In quiet hours
            }
          } else {
            // Overnight range (e.g., 22:00 to 08:00)
            if (currentTime >= startTime || currentTime <= endTime) {
              return false // In quiet hours
            }
          }
        }
        
        return true
      },

      // Get notification categories for UI
      getNotificationCategories: () => {
        const { preferences } = get()
        
        return [
          {
            id: 'orderNotifications',
            title: 'Order Updates',
            description: 'Get notified about your order status',
            icon: '🍽️',
            enabled: preferences.orderNotifications.enabled,
            subcategories: [
              { id: 'orderPlaced', title: 'Order Placed', description: 'When your order is successfully placed', enabled: preferences.orderNotifications.orderPlaced },
              { id: 'orderConfirmed', title: 'Order Confirmed', description: 'When restaurant confirms your order', enabled: preferences.orderNotifications.orderConfirmed },
              { id: 'orderPreparing', title: 'Order Preparing', description: 'When your meal preparation starts', enabled: preferences.orderNotifications.orderPreparing },
              { id: 'orderCooking', title: 'Order Cooking', description: 'When your meal is being cooked', enabled: preferences.orderNotifications.orderCooking },
              { id: 'orderReady', title: 'Order Ready', description: 'When your meal is ready for pickup/delivery', enabled: preferences.orderNotifications.orderReady },
              { id: 'orderOutForDelivery', title: 'Out for Delivery', description: 'When your order is out for delivery', enabled: preferences.orderNotifications.orderOutForDelivery },
              { id: 'orderDelivered', title: 'Order Delivered', description: 'When your order is delivered', enabled: preferences.orderNotifications.orderDelivered },
              { id: 'orderCancelled', title: 'Order Cancelled', description: 'When your order is cancelled', enabled: preferences.orderNotifications.orderCancelled },
              { id: 'orderDelayed', title: 'Order Delayed', description: 'When your order is delayed', enabled: preferences.orderNotifications.orderDelayed },
            ]
          },
          {
            id: 'paymentNotifications',
            title: 'Payment Updates',
            description: 'Get notified about payment status',
            icon: '💳',
            enabled: preferences.paymentNotifications.enabled,
            subcategories: [
              { id: 'paymentSuccess', title: 'Payment Success', description: 'When payment is completed successfully', enabled: preferences.paymentNotifications.paymentSuccess },
              { id: 'paymentFailed', title: 'Payment Failed', description: 'When payment fails', enabled: preferences.paymentNotifications.paymentFailed },
              { id: 'paymentPending', title: 'Payment Pending', description: 'When payment is pending', enabled: preferences.paymentNotifications.paymentPending },
              { id: 'refundCompleted', title: 'Refund Completed', description: 'When refund is processed', enabled: preferences.paymentNotifications.refundCompleted },
              { id: 'walletTopup', title: 'Wallet Top-up', description: 'When wallet is topped up', enabled: preferences.paymentNotifications.walletTopup },
              { id: 'subscriptionPayment', title: 'Subscription Payment', description: 'When subscription payment is processed', enabled: preferences.paymentNotifications.subscriptionPayment },
            ]
          },
          {
            id: 'subscriptionNotifications',
            title: 'Subscription Updates',
            description: 'Get notified about your subscription',
            icon: '📅',
            enabled: preferences.subscriptionNotifications.enabled,
            subcategories: [
              { id: 'subscriptionActivated', title: 'Subscription Activated', description: 'When your subscription is activated', enabled: preferences.subscriptionNotifications.subscriptionActivated },
              { id: 'subscriptionExpiring', title: 'Subscription Expiring', description: 'When your subscription is about to expire', enabled: preferences.subscriptionNotifications.subscriptionExpiring },
              { id: 'subscriptionExpired', title: 'Subscription Expired', description: 'When your subscription has expired', enabled: preferences.subscriptionNotifications.subscriptionExpired },
              { id: 'subscriptionRenewed', title: 'Subscription Renewed', description: 'When your subscription is renewed', enabled: preferences.subscriptionNotifications.subscriptionRenewed },
              { id: 'subscriptionCancelled', title: 'Subscription Cancelled', description: 'When your subscription is cancelled', enabled: preferences.subscriptionNotifications.subscriptionCancelled },
              { id: 'planUpgraded', title: 'Plan Upgraded', description: 'When your plan is upgraded', enabled: preferences.subscriptionNotifications.planUpgraded },
            ]
          },
          {
            id: 'mealNotifications',
            title: 'Meal Reminders',
            description: 'Get reminded about your meals',
            icon: '🔔',
            enabled: preferences.mealNotifications.enabled,
            subcategories: [
              { id: 'mealReminder', title: 'Meal Reminder', description: 'Remind you about upcoming meals', enabled: preferences.mealNotifications.mealReminder },
              { id: 'mealReady', title: 'Meal Ready', description: 'When your meal is ready', enabled: preferences.mealNotifications.mealReady },
              { id: 'newMenuItems', title: 'New Menu Items', description: 'When new items are added to menu', enabled: preferences.mealNotifications.newMenuItems },
              { id: 'chefSpecial', title: 'Chef Special', description: 'When chef special meals are available', enabled: preferences.mealNotifications.chefSpecial },
              { id: 'nutritionTips', title: 'Nutrition Tips', description: 'Get healthy eating tips', enabled: preferences.mealNotifications.nutritionTips },
            ]
          },
          {
            id: 'promotionalNotifications',
            title: 'Offers & Promotions',
            description: 'Get notified about deals and offers',
            icon: '🎁',
            enabled: preferences.promotionalNotifications.enabled,
            subcategories: [
              { id: 'discountOffers', title: 'Discount Offers', description: 'Get discount and coupon notifications', enabled: preferences.promotionalNotifications.discountOffers },
              { id: 'flashSales', title: 'Flash Sales', description: 'Get notified about flash sales', enabled: preferences.promotionalNotifications.flashSales },
              { id: 'seasonalOffers', title: 'Seasonal Offers', description: 'Get seasonal and festival offers', enabled: preferences.promotionalNotifications.seasonalOffers },
              { id: 'referralRewards', title: 'Referral Rewards', description: 'Get notified about referral rewards', enabled: preferences.promotionalNotifications.referralRewards },
              { id: 'loyaltyPoints', title: 'Loyalty Points', description: 'Get updates about loyalty points', enabled: preferences.promotionalNotifications.loyaltyPoints },
              { id: 'newRestaurants', title: 'New Restaurants', description: 'Get notified about new restaurant partners', enabled: preferences.promotionalNotifications.newRestaurants },
            ]
          },
          {
            id: 'chatNotifications',
            title: 'Chat & Messages',
            description: 'Get notified about messages',
            icon: '💬',
            enabled: preferences.chatNotifications.enabled,
            subcategories: [
              { id: 'newMessage', title: 'New Messages', description: 'When you receive new chat messages', enabled: preferences.chatNotifications.newMessage },
              { id: 'supportReply', title: 'Support Replies', description: 'When support team replies to you', enabled: preferences.chatNotifications.supportReply },
              { id: 'restaurantMessage', title: 'Restaurant Messages', description: 'When restaurants send you messages', enabled: preferences.chatNotifications.restaurantMessage },
              { id: 'deliveryUpdates', title: 'Delivery Updates', description: 'Chat updates from delivery partners', enabled: preferences.chatNotifications.deliveryUpdates },
            ]
          },
          {
            id: 'deliveryNotifications',
            title: 'Delivery Updates',
            description: 'Get notified about delivery status',
            icon: '🚚',
            enabled: preferences.deliveryNotifications.enabled,
            subcategories: [
              { id: 'deliveryPartnerAssigned', title: 'Partner Assigned', description: 'When delivery partner is assigned', enabled: preferences.deliveryNotifications.deliveryPartnerAssigned },
              { id: 'deliveryPartnerNearby', title: 'Partner Nearby', description: 'When delivery partner is nearby', enabled: preferences.deliveryNotifications.deliveryPartnerNearby },
              { id: 'deliveryCompleted', title: 'Delivery Completed', description: 'When delivery is completed', enabled: preferences.deliveryNotifications.deliveryCompleted },
            ]
          },
          {
            id: 'systemNotifications',
            title: 'System Updates',
            description: 'Get important system notifications',
            icon: '⚙️',
            enabled: preferences.systemNotifications.enabled,
            subcategories: [
              { id: 'appUpdates', title: 'App Updates', description: 'When new app updates are available', enabled: preferences.systemNotifications.appUpdates },
              { id: 'maintenanceAlerts', title: 'Maintenance Alerts', description: 'When system is under maintenance', enabled: preferences.systemNotifications.maintenanceAlerts },
              { id: 'securityAlerts', title: 'Security Alerts', description: 'Important security notifications', enabled: preferences.systemNotifications.securityAlerts, critical: true },
              { id: 'serviceAnnouncements', title: 'Service Announcements', description: 'Important service announcements', enabled: preferences.systemNotifications.serviceAnnouncements },
            ]
          },
        ]
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'notification-preferences-storage',
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name)
        },
      },
    }
  )
)