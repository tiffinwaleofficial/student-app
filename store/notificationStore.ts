/**
 * TiffinWale Notification Store
 * Zustand store for managing notification state across the app
 * 
 * Features:
 * - Centralized notification state
 * - Notification history
 * - User preferences
 * - Real-time updates
 * - Analytics integration
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NotificationData, NotificationConfig, NotificationTheme } from '../services/notificationService'

// Types
export interface NotificationHistory extends NotificationData {
  read: boolean
  opened: boolean
  dismissed: boolean
  openedAt?: Date
  dismissedAt?: Date
}

export interface NotificationSettings {
  pushEnabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  orderUpdates: boolean
  promotions: boolean
  reminders: boolean
  chatMessages: boolean
  subscriptionAlerts: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:MM format
    end: string   // HH:MM format
  }
  categories: {
    [key: string]: boolean
  }
}

export interface NotificationStats {
  totalSent: number
  totalOpened: number
  totalDismissed: number
  openRate: number
  lastNotificationAt?: Date
  categoryCounts: {
    [key: string]: number
  }
}

interface NotificationStore {
  // State
  notifications: NotificationData[]
  history: NotificationHistory[]
  settings: NotificationSettings
  config: NotificationConfig | null
  stats: NotificationStats
  isLoading: boolean
  error: string | null
  
  // Cache management
  lastFetched: Date | null
  
  // Actions
  addNotification: (notification: NotificationData) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  updateNotification: (id: string, updates: Partial<NotificationData>) => void
  
  // History management
  addToHistory: (notification: NotificationData) => void
  markAsRead: (id: string) => void
  markAsOpened: (id: string) => void
  markAsDismissed: (id: string) => void
  clearHistory: () => void
  getUnreadCount: () => number
  
  // Settings management
  updateSettings: (settings: Partial<NotificationSettings>) => void
  toggleCategory: (category: string) => void
  setQuietHours: (start: string, end: string) => void
  
  // Configuration
  setConfig: (config: NotificationConfig) => void
  updateTheme: (theme: Partial<NotificationTheme>) => void
  
  // Stats
  updateStats: (stats: Partial<NotificationStats>) => void
  incrementStat: (stat: keyof NotificationStats) => void
  
  // API with caching
  fetchNotifications: (userId: string, forceRefresh?: boolean) => Promise<void>
  
  // Utility
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

// Default settings
const defaultSettings: NotificationSettings = {
  pushEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  orderUpdates: true,
  promotions: true,
  reminders: true,
  chatMessages: true,
  subscriptionAlerts: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  categories: {
    order: true,
    promotion: true,
    system: true,
    chat: true,
    reminder: true
  }
}

// Default stats
const defaultStats: NotificationStats = {
  totalSent: 0,
  totalOpened: 0,
  totalDismissed: 0,
  openRate: 0,
  categoryCounts: {}
}

// Cache duration for notifications (1 minute)
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
  notifications: [],
      history: [],
      settings: defaultSettings,
      config: null,
      stats: defaultStats,
  isLoading: false,
  error: null,
      lastFetched: null,

      // Notification management
      addNotification: (notification) => {
        // Ensure notification has an ID (do this outside the set callback)
        const notificationWithId = {
          ...notification,
          id: notification.id || `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }

        set((state) => {
          // Check for duplicates
          const exists = state.notifications.find(n => n.id === notificationWithId.id)
          if (exists) return state

          // Add to notifications
          const newNotifications = [...state.notifications, notificationWithId]
          
          // Limit number of active notifications
          const maxNotifications = state.config?.maxNotifications || 5
          if (newNotifications.length > maxNotifications) {
            newNotifications.shift() // Remove oldest
          }

          return {
            notifications: newNotifications
          }
        })

        // Add to history (now notificationWithId is in scope)
        get().addToHistory(notificationWithId)
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      updateNotification: (id, updates) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, ...updates } : n
          )
        }))
      },

      // History management
      addToHistory: (notification) => {
        set((state) => {
          const historyItem: NotificationHistory = {
            ...notification,
            read: false,
            opened: false,
            dismissed: false,
            timestamp: notification.timestamp || new Date()
          }

          const newHistory = [historyItem, ...state.history]
          
          // Keep only last 100 notifications in history
          if (newHistory.length > 100) {
            newHistory.splice(100)
          }

          return { history: newHistory }
        })

        // Update stats
        get().incrementStat('totalSent')
        
        // Update category count
        const category = notification.category || 'other'
        set((state) => ({
          stats: {
            ...state.stats,
            categoryCounts: {
              ...state.stats.categoryCounts,
              [category]: (state.stats.categoryCounts[category] || 0) + 1
            },
            lastNotificationAt: new Date()
          }
        }))
      },

      markAsRead: (id) => {
        set((state) => ({
          history: state.history.map(item =>
            item.id === id ? { ...item, read: true } : item
          )
        }))
      },

      markAsOpened: (id) => {
        set((state) => ({
          history: state.history.map(item =>
            item.id === id 
              ? { ...item, opened: true, openedAt: new Date() } 
              : item
          )
        }))

        // Update stats
        get().incrementStat('totalOpened')
      },

      markAsDismissed: (id) => {
        set((state) => ({
          history: state.history.map(item =>
            item.id === id 
              ? { ...item, dismissed: true, dismissedAt: new Date() } 
              : item
          )
        }))

        // Update stats
        get().incrementStat('totalDismissed')
      },

      clearHistory: () => {
        set({ history: [] })
      },

      getUnreadCount: () => {
        return get().history.filter(item => !item.read).length
      },

      // Settings management
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      toggleCategory: (category) => {
        set((state) => ({
          settings: {
            ...state.settings,
            categories: {
              ...state.settings.categories,
              [category]: !state.settings.categories[category]
            }
          }
        }))
      },

      setQuietHours: (start, end) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quietHours: {
              ...state.settings.quietHours,
              start,
              end
            }
          }
        }))
      },

      // Configuration
      setConfig: (config) => {
        set({ config })
      },

      updateTheme: (themeUpdates) => {
        set((state) => ({
          config: state.config ? {
            ...state.config,
            theme: { ...state.config.theme, ...themeUpdates }
          } : null
        }))
      },

      // Stats management
      updateStats: (statsUpdates) => {
        set((state) => ({
          stats: { ...state.stats, ...statsUpdates }
        }))
      },

      incrementStat: (stat) => {
        set((state) => ({
          stats: {
            ...state.stats,
            [stat]: (state.stats[stat] as number) + 1
          }
        }))
        
        // Calculate open rate after incrementing
        const { stats } = get()
        const openRate = stats.totalSent > 0 
          ? Math.round((stats.totalOpened / stats.totalSent) * 100) 
          : 0
        
        set((state) => ({
          stats: { ...state.stats, openRate }
        }))
      },

      // Utility methods
      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      reset: () => {
        set({ 
          notifications: [],
          history: [],
          settings: defaultSettings,
          config: null,
          stats: defaultStats,
          isLoading: false,
          error: null
        })
      },

      // Fetch notifications from API with caching
      fetchNotifications: async (userId: string, forceRefresh = false) => {
        if (__DEV__) console.log('🔔 NotificationStore: fetchNotifications called with userId:', userId, 'forceRefresh:', forceRefresh);
        const { lastFetched, isLoading } = get();
        
        // Check cache validity
        if (!forceRefresh && lastFetched && isLoading) {
          console.log('🔄 NotificationStore: Already fetching notifications');
          return;
        }
        
        if (!forceRefresh && lastFetched && Date.now() - lastFetched.getTime() < CACHE_DURATION) {
          console.log('📦 NotificationStore: Using cached notifications');
          return;
        }

        set({ isLoading: true, error: null });
        try {
          if (__DEV__) console.log('🔔 NotificationStore: Fetching notifications for user:', userId);
          
          // Import API client dynamically to avoid circular dependency
          const api = await import('../utils/apiClient');
          
          // Fetch notifications from backend with pagination
          const notifications = await api.default.notifications.getUserNotifications(userId, 1, 50);
          if (__DEV__) console.log('✅ NotificationStore: Notifications fetched:', notifications.length);
          
          // Convert API response to NotificationData format
          const formattedNotifications: NotificationData[] = notifications.map((notification: any) => ({
            id: notification._id || notification.id,
            title: notification.title || 'Notification',
            message: notification.message || notification.content || '',
            type: notification.type || 'toast',
            variant: notification.variant || 'info',
            category: notification.category || 'system',
            timestamp: notification.createdAt || notification.timestamp || new Date().toISOString(),
            data: notification.data || {},
            actions: notification.actions || [],
            image: notification.imageUrl,
            duration: notification.duration || 5000,
            persistent: notification.persistent || false,
            priority: notification.priority || 'normal',
          }));
          
          set({ 
            notifications: formattedNotifications,
            isLoading: false,
            lastFetched: new Date(),
          });
          
          if (__DEV__) console.log('✅ NotificationStore: Notifications stored successfully');
      } catch (error) {
          // Handle network errors gracefully
          const errorMessage = (error as any)?.message || '';
          
          // Only log non-network errors to reduce console noise
          if (__DEV__ && !errorMessage.includes('Network Error')) {
            console.error('❌ NotificationStore: Failed to fetch notifications:', error);
          }
          
          if (errorMessage.includes('Network Error') || errorMessage.includes('404')) {
            if (__DEV__) console.log('🔄 NotificationStore: Notifications endpoint not available, setting empty state');
            set({ 
              notifications: [],
              isLoading: false,
              error: null // Don't show error to user for missing endpoints
            });
          } else {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to fetch notifications',
              isLoading: false
            });
          }
        }
      }
    }),
    {
      name: 'tiffinwale-notifications', // Storage key
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist certain parts of the state
        history: state.history,
        settings: state.settings,
        stats: state.stats
      })
    }
  )
)

// Helper function to calculate open rate - removed as it's now handled in incrementStat

// Selectors for better performance
export const selectActiveNotifications = (state: NotificationStore) => state.notifications
export const selectNotificationHistory = (state: NotificationStore) => state.history
export const selectUnreadNotifications = (state: NotificationStore) => 
  state.history.filter(item => !item.read)
export const selectNotificationSettings = (state: NotificationStore) => state.settings
export const selectNotificationStats = (state: NotificationStore) => state.stats
export const selectNotificationsByCategory = (category: string) => 
  (state: NotificationStore) => state.history.filter(item => item.category === category)

// Action creators for complex operations
export const notificationActions = {
  // Show notification with automatic history tracking
  showNotification: (notification: NotificationData) => {
    const { addNotification } = useNotificationStore.getState()
    addNotification(notification)
  },

  // Handle notification interaction
  handleNotificationTap: (id: string) => {
    const { markAsOpened, markAsRead } = useNotificationStore.getState()
    markAsOpened(id)
    markAsRead(id)
  },

  // Bulk operations
  markAllAsRead: () => {
    const { history } = useNotificationStore.getState()
    history.forEach(item => {
      if (!item.read) {
        useNotificationStore.getState().markAsRead(item.id!)
      }
    })
  },

  // Filter notifications by date range
  getNotificationsByDateRange: (startDate: Date, endDate: Date) => {
    const { history } = useNotificationStore.getState()
    return history.filter(item => {
      const itemDate = item.timestamp || new Date()
      return itemDate >= startDate && itemDate <= endDate
    })
  },

  // Get notifications by priority
  getNotificationsByPriority: (priority: 'low' | 'normal' | 'high' | 'urgent') => {
    const { history } = useNotificationStore.getState()
    return history.filter(item => item.priority === priority)
  },

  // Check if quiet hours are active
  isQuietHoursActive: (): boolean => {
    const { settings } = useNotificationStore.getState()
    if (!settings.quietHours.enabled) return false

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const { start, end } = settings.quietHours
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end
    }
    
    // Handle same-day quiet hours (e.g., 12:00 to 14:00)
    return currentTime >= start && currentTime <= end
  }
}

export default useNotificationStore