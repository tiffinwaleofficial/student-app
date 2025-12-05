/**
 * TiffinWale Notification Hook
 * Easy-to-use React hook for notifications across the app
 * 
 * Features:
 * - Simple API for common notification types
 * - Advanced API for custom notifications
 * - Configuration management
 * - Analytics integration
 * - Type safety
 */

import { useCallback, useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { notificationService, NotificationData, NotificationConfig } from '../services/notificationService'
import { useNotificationStore, notificationActions } from '../store/notificationStore'

// Types for hook options
export interface NotificationOptions {
  duration?: number
  persistent?: boolean
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  category?: 'order' | 'promotion' | 'system' | 'chat' | 'reminder'
  data?: Record<string, any>
  actions?: Array<{
    id: string
    label: string
    action: () => void
    style?: 'default' | 'destructive' | 'cancel'
  }>
  sound?: string
  vibration?: number[]
  icon?: string
  image?: string
}

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm?: () => void
  onCancel?: () => void
}

export interface UseNotificationReturn {
  // Simple notification methods
  success: (message: string, options?: NotificationOptions) => Promise<string>
  showError: (message: string, options?: NotificationOptions) => Promise<string>
  warning: (message: string, options?: NotificationOptions) => Promise<string>
  info: (message: string, options?: NotificationOptions) => Promise<string>
  
  // Specialized notification methods
  orderUpdate: (orderData: any) => Promise<string>
  promotion: (promoData: any) => Promise<string>
  reminder: (reminderData: any) => Promise<string>
  chatMessage: (messageData: any) => Promise<string>
  
  // Modal methods
  confirm: (options: ConfirmOptions) => Promise<boolean>
  alert: (title: string, message: string) => Promise<void>
  
  // Advanced methods
  show: (notification: NotificationData) => Promise<string>
  hide: (id: string) => Promise<void>
  clear: () => Promise<void>
  
  // Configuration methods
  configure: (config: Partial<NotificationConfig>) => void
  updateSettings: (settings: any) => void
  
  // State access
  notifications: NotificationData[]
  history: any[]
  unreadCount: number
  settings: any
  isLoading: boolean
  notificationError: string | null
  
  // Utility methods
  isQuietHours: () => boolean
  canShowNotification: (category: string) => boolean
}

/**
 * Main notification hook
 */
export const useNotification = (): UseNotificationReturn => {
  const store = useNotificationStore()
  const appState = useRef(AppState.currentState)

  // Initialize notification service on first use
  useEffect(() => {
    const initializeService = async () => {
      try {
        if (!notificationService.isReady()) {
          await notificationService.initialize()
        }
      } catch (error) {
        console.error('Failed to initialize notification service:', error)
        store.setError('Failed to initialize notifications')
      }
    }

    initializeService()
  }, [])

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - refresh notifications if needed
        console.log('App came to foreground - refreshing notifications')
      }
      appState.current = nextAppState
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => subscription?.remove()
  }, [])

  // Listen to notification service events
  useEffect(() => {
    const handleNotificationShown = (notification: NotificationData) => {
      store.addNotification(notification)
    }

    const handleNotificationHidden = ({ id }: { id: string }) => {
      store.removeNotification(id)
    }

    const handleConfigUpdated = (config: NotificationConfig) => {
      store.setConfig(config)
    }

    notificationService.on('notification_shown', handleNotificationShown)
    notificationService.on('notification_hidden', handleNotificationHidden)
    notificationService.on('config_updated', handleConfigUpdated)

    return () => {
      notificationService.off('notification_shown', handleNotificationShown)
      notificationService.off('notification_hidden', handleNotificationHidden)
      notificationService.off('config_updated', handleConfigUpdated)
    }
  }, [store])

  // Simple notification methods
  const success = useCallback(async (message: string, options: NotificationOptions = {}) => {
    return notificationService.show({
      type: 'toast',
      variant: 'success',
      title: 'Success',
      message,
      icon: 'check-circle',
      duration: 3000,
      ...options
    })
  }, [])

  const showError = useCallback(async (message: string, options: NotificationOptions = {}) => {
    return notificationService.show({
      type: 'toast',
      variant: 'error',
      title: 'Error',
      message,
      icon: 'alert-circle',
      duration: 5000,
      ...options
    })
  }, [])

  const warning = useCallback(async (message: string, options: NotificationOptions = {}) => {
    return notificationService.show({
      type: 'toast',
      variant: 'warning',
      title: 'Warning',
      message,
      icon: 'alert-triangle',
      duration: 4000,
      ...options
    })
  }, [])

  const info = useCallback(async (message: string, options: NotificationOptions = {}) => {
    return notificationService.show({
      type: 'toast',
      variant: 'info',
      title: 'Info',
      message,
      icon: 'info',
      duration: 4000,
      ...options
    })
  }, [])

  // Specialized notification methods
  const orderUpdate = useCallback(async (orderData: any) => {
    const statusMessages = {
      placed: '🎉 Order placed successfully!',
      confirmed: '👨‍🍳 Restaurant confirmed your order',
      preparing: '🔥 Your meal is being prepared',
      ready: '✅ Order ready for pickup',
      out_for_delivery: '🚗 Your order is on the way',
      delivered: '🎉 Order delivered successfully!'
    }

    const message = statusMessages[orderData.status as keyof typeof statusMessages] || 
                   `Order status updated: ${orderData.status}`

    return notificationService.show({
      type: 'banner',
      variant: 'order',
      title: `Order #${orderData.id}`,
      message,
      icon: 'shopping-bag',
      category: 'order',
      persistent: true,
      data: { 
        type: 'order_update',
        orderId: orderData.id,
        status: orderData.status
      },
      actions: [
        {
          id: 'track_order',
          label: 'Track Order',
          action: () => {
            // Navigation will be handled by the service
            notificationService.emit('navigate', `/orders/${orderData.id}`)
          }
        },
        {
          id: 'dismiss',
          label: 'Dismiss',
          action: () => {
            notificationService.hide(orderData.id)
          },
          style: 'cancel'
        }
      ]
    })
  }, [])

  const promotion = useCallback(async (promoData: any) => {
    return notificationService.show({
      type: 'banner',
      variant: 'promotion',
      title: promoData.title || '🎁 Special Offer!',
      message: promoData.message || 'Limited time offer just for you!',
      icon: 'gift',
      image: promoData.image,
      category: 'promotion',
      persistent: false,
      duration: 8000,
      data: {
        type: 'promotion',
        promotionId: promoData.id,
        code: promoData.code
      },
      actions: [
        {
          id: 'view_offer',
          label: 'View Offer',
          action: () => {
            notificationService.emit('navigate', `/promotions/${promoData.id}`)
          }
        }
      ]
    })
  }, [])

  const reminder = useCallback(async (reminderData: any) => {
    return notificationService.show({
      type: 'toast',
      variant: 'info',
      title: reminderData.title || '⏰ Reminder',
      message: reminderData.message,
      icon: 'clock',
      category: 'reminder',
      duration: 6000,
      data: {
        type: 'reminder',
        reminderId: reminderData.id
      }
    })
  }, [])

  const chatMessage = useCallback(async (messageData: any) => {
    return notificationService.show({
      type: 'toast',
      variant: 'info',
      title: `💬 ${messageData.senderName}`,
      message: messageData.message,
      icon: 'message-circle',
      category: 'chat',
      duration: 5000,
      data: {
        type: 'chat_message',
        conversationId: messageData.conversationId,
        messageId: messageData.id
      },
      actions: [
        {
          id: 'reply',
          label: 'Reply',
          action: () => {
            notificationService.emit('navigate', `/chat/${messageData.conversationId}`)
          }
        }
      ]
    })
  }, [])

  // Modal methods
  const confirm = useCallback(async (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      notificationService.show({
        type: 'modal',
        variant: options.variant === 'destructive' ? 'error' : 'info',
        title: options.title,
        message: options.message,
        persistent: true,
        actions: [
          {
            id: 'confirm',
            label: options.confirmText || 'Confirm',
            action: () => {
              options.onConfirm?.()
              resolve(true)
            },
            style: options.variant === 'destructive' ? 'destructive' : 'default'
          },
          {
            id: 'cancel',
            label: options.cancelText || 'Cancel',
            action: () => {
              options.onCancel?.()
              resolve(false)
            },
            style: 'cancel'
          }
        ]
      })
    })
  }, [])

  const alert = useCallback(async (title: string, message: string): Promise<void> => {
    return new Promise((resolve) => {
      notificationService.show({
        type: 'modal',
        variant: 'info',
        title,
        message,
        persistent: true,
        actions: [
          {
            id: 'ok',
            label: 'OK',
            action: () => resolve(),
            style: 'default'
          }
        ]
      })
    })
  }, [])

  // Advanced methods
  const show = useCallback(async (notification: NotificationData) => {
    return notificationService.show(notification)
  }, [])

  const hide = useCallback(async (id: string) => {
    return notificationService.hide(id)
  }, [])

  const clear = useCallback(async () => {
    return notificationService.clear()
  }, [])

  // Configuration methods
  const configure = useCallback((config: Partial<NotificationConfig>) => {
    notificationService.configure(config)
  }, [])

  const updateSettings = useCallback((settings: any) => {
    store.updateSettings(settings)
  }, [store])

  // Utility methods
  const isQuietHours = useCallback(() => {
    return notificationActions.isQuietHoursActive()
  }, [])

  const canShowNotification = useCallback((category: string) => {
    const { settings } = store
    
    // Check if category is enabled
    if (!settings.categories[category]) {
      return false
    }
    
    // Check quiet hours
    if (isQuietHours()) {
      return false
    }
    
    // Check global settings
    if (!settings.pushEnabled) {
      return false
    }
    
    return true
  }, [store, isQuietHours])

  return {
    // Simple methods
    success,
    showError,
    warning,
    info,
    
    // Specialized methods
    orderUpdate,
    promotion,
    reminder,
    chatMessage,
    
    // Modal methods
    confirm,
    alert,
    
    // Advanced methods
    show,
    hide,
    clear,
    
    // Configuration
    configure,
    updateSettings,
    
    // State
    notifications: store.notifications,
    history: store.history,
    unreadCount: store.getUnreadCount(),
    settings: store.settings,
    isLoading: store.isLoading,
    notificationError: store.error,
    
    // Utility
    isQuietHours,
    canShowNotification
  }
}

// Convenience hooks for specific use cases
export const useOrderNotifications = () => {
  const { orderUpdate } = useNotification()
  
  const notifyOrderStatus = useCallback((order: any) => {
    return orderUpdate(order)
  }, [orderUpdate])
  
  return { notifyOrderStatus }
}

export const usePromotionNotifications = () => {
  const { promotion } = useNotification()
  
  const notifyPromotion = useCallback((promo: any) => {
    return promotion(promo)
  }, [promotion])
  
  return { notifyPromotion }
}

export const useChatNotifications = () => {
  const { chatMessage } = useNotification()
  
  const notifyNewMessage = useCallback((message: any) => {
    return chatMessage(message)
  }, [chatMessage])
  
  return { notifyNewMessage }
}

export default useNotification
