/**
 * TiffinWale Enterprise Notification Service
 * Swiggy/Zomato level notification system with multiple providers
 * 
 * Features:
 * - Multiple notification types (Toast, Modal, Banner, Push)
 * - Provider pattern for easy swapping
 * - Theme system for consistent styling
 * - Configuration management
 * - Analytics integration
 * - Future-proof architecture
 */

import { Platform, DeviceEventEmitter } from 'react-native'
import Constants from 'expo-constants'

// Conditional import for expo-notifications to avoid Expo Go issues
let Notifications: any = null;
try {
  if (!Constants.appOwnership || Constants.appOwnership === 'expo') {
    console.log('🚨 Running in Expo Go - Push notifications have limitations');
    console.log('💡 For full push notification support, use a development build');
  } else {
    Notifications = require('expo-notifications');
  }
} catch (error) {
  console.log('⚠️ Expo notifications not available:', error instanceof Error ? error.message : 'Unknown error');
}
// Analytics will be imported when available
// import { analytics } from '../utils/analytics'

// Types
export interface NotificationData {
  id?: string
  type: 'toast' | 'modal' | 'banner' | 'push'
  variant: 'success' | 'error' | 'warning' | 'info' | 'order' | 'promotion'
  title: string
  message: string
  icon?: string
  image?: string
  duration?: number
  persistent?: boolean
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  category?: 'order' | 'promotion' | 'system' | 'chat' | 'reminder'
  data?: Record<string, any>
  actions?: NotificationAction[]
  sound?: string
  vibration?: number[]
  timestamp?: Date
}

export interface NotificationAction {
  id: string
  label: string
  action: () => void
  style?: 'default' | 'destructive' | 'cancel'
}

export interface NotificationConfig {
  maxNotifications: number
  defaultDuration: number
  enableSound: boolean
  enableVibration: boolean
  enablePush: boolean
  position: 'top' | 'bottom' | 'center'
  animationDuration: number
  theme: NotificationTheme
}

export interface NotificationTheme {
  colors: {
    success: string
    error: string
    warning: string
    info: string
    order: string
    promotion: string
    background: string
    text: string
    border: string
  }
  typography: {
    titleSize: number
    messageSize: number
    fontFamily: string
    fontWeight: string
  }
  spacing: {
    padding: number
    margin: number
    borderRadius: number
  }
  shadows: {
    elevation: number
    shadowColor: string
    shadowOffset: { width: number; height: number }
    shadowOpacity: number
    shadowRadius: number
  }
}

export interface NotificationProvider {
  show(notification: NotificationData): Promise<void>
  hide(id: string): Promise<void>
  clear(): Promise<void>
  configure(config: Partial<NotificationConfig>): void
}

// Default theme
const defaultTheme: NotificationTheme = {
  colors: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    order: '#FF6B35', // TiffinWale brand color
    promotion: '#E91E63',
    background: '#FFFFFF',
    text: '#333333',
    border: '#E0E0E0'
  },
  typography: {
    titleSize: 16,
    messageSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600'
  },
  spacing: {
    padding: 16,
    margin: 8,
    borderRadius: 12
  },
  shadows: {
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  }
}

// Default configuration
const defaultConfig: NotificationConfig = {
  maxNotifications: 5,
  defaultDuration: 4000,
  enableSound: true,
  enableVibration: true,
  enablePush: true,
  position: 'top',
  animationDuration: 300,
  theme: defaultTheme
}

/**
 * Main Notification Service Class
 * Manages all notification providers and provides unified API
 */
export class NotificationService {
  private static instance: NotificationService
  private providers: Map<string, NotificationProvider> = new Map()
  private config: NotificationConfig = defaultConfig
  private activeNotifications: Map<string, NotificationData> = new Map()
  private isInitialized = false

  private constructor() {
    // Initialize notification service
  }

  /**
   * Add event listener (compatibility method for DeviceEventEmitter)
   */
  on(event: string, listener: (...args: any[]) => void): void {
    DeviceEventEmitter.addListener(event, listener)
  }

  /**
   * Remove event listener (compatibility method for DeviceEventEmitter)
   */
  off(event: string, listener?: (...args: any[]) => void): void {
    if (listener) {
      // DeviceEventEmitter doesn't have removeListener, use removeAllListeners for specific event
      DeviceEventEmitter.removeAllListeners(event)
    } else {
      DeviceEventEmitter.removeAllListeners(event)
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      DeviceEventEmitter.removeAllListeners(event)
    } else {
      DeviceEventEmitter.removeAllListeners()
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Configure Expo notifications
      await this.configureExpoNotifications()
      
      // Set up notification handlers
      this.setupNotificationHandlers()
      
      // Register default providers
      this.registerDefaultProviders()
      
      this.isInitialized = true
      DeviceEventEmitter.emit('notification_service_initialized')
      
      console.log('🔔 NotificationService initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize NotificationService:', error)
      throw error
    }
  }

  /**
   * Configure Expo notifications with proper settings
   */
  private async configureExpoNotifications(): Promise<void> {
    // Check if we're in Expo Go or on web (which have limitations)
    const isExpoGo = Constants.appOwnership === 'expo'
    const isWeb = Platform.OS === 'web'
    
    if (isExpoGo) {
      console.warn('🚨 Running in Expo Go - Push notifications have limitations')
      console.log('💡 For full push notification support, use a development build')
    }
    
    if (isWeb) {
      console.warn('🌐 Running on web - Some notification features are not available')
      console.log('💡 Full notification support available on mobile platforms')
      return // Skip Expo notifications setup on web
    }

    // Set notification handler (only for mobile platforms)
    if (Notifications && Notifications.setNotificationHandler) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: this.config.enableSound,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      })
    }

    // Configure notification categories (for interactive notifications) - skip in Expo Go and web
    if (!isExpoGo && !isWeb && Notifications && Notifications.setNotificationCategoryAsync) {
      await Notifications.setNotificationCategoryAsync('order', [
        {
          identifier: 'track_order',
          buttonTitle: 'Track Order',
          options: { opensAppToForeground: true }
        },
        {
          identifier: 'contact_support',
          buttonTitle: 'Contact Support',
          options: { opensAppToForeground: true }
        }
      ])

      await Notifications.setNotificationCategoryAsync('promotion', [
        {
          identifier: 'view_offer',
          buttonTitle: 'View Offer',
          options: { opensAppToForeground: true }
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Dismiss',
          options: { opensAppToForeground: false }
        }
      ])
    } else {
      console.log('⚠️ Skipping notification categories setup in Expo Go')
    }
  }

  /**
   * Set up notification event handlers
   */
  private setupNotificationHandlers(): void {
    if (!Notifications) {
      console.log('⚠️ Notifications not available - skipping handler setup');
      return;
    }

    // Handle notification received (app in foreground)
    if (Notifications.addNotificationReceivedListener) {
      Notifications.addNotificationReceivedListener((notification: any) => {
        this.handleNotificationReceived(notification)
      })
    }

    // Handle notification response (user tapped notification)
    if (Notifications.addNotificationResponseReceivedListener) {
      Notifications.addNotificationResponseReceivedListener((response: any) => {
        this.handleNotificationResponse(response)
      })
    }
  }

  /**
   * Handle received notifications
   */
  private handleNotificationReceived(notification: any): void {
    const notificationData: NotificationData = {
      id: notification.request.identifier,
      type: 'toast',
      variant: 'info',
      title: notification.request.content.title || 'Notification',
      message: notification.request.content.body || '',
      data: notification.request.content.data,
      timestamp: new Date()
    }

    // Show in-app notification if app is active
    this.showInAppNotification(notificationData)
    
    // Track analytics
    this.trackNotification('received', notificationData)
  }

  /**
   * Handle notification responses (taps)
   */
  private handleNotificationResponse(response: any): void {
    const { notification, actionIdentifier } = response
    const notificationData = notification.request.content.data

    // Handle action-specific responses
    if (actionIdentifier === 'track_order' && notificationData?.orderId) {
      DeviceEventEmitter.emit('notification_navigate', `/orders/${notificationData.orderId}`)
    } else if (actionIdentifier === 'view_offer' && notificationData?.promotionId) {
      DeviceEventEmitter.emit('notification_navigate', `/promotions/${notificationData.promotionId}`)
    } else {
      // Default navigation
      this.handleDefaultNavigation(notificationData)
    }

    // Track analytics
    this.trackNotification('opened', {
      id: notification.request.identifier,
      data: notificationData
    } as NotificationData)
  }

  /**
   * Handle default navigation for notifications
   */
  private handleDefaultNavigation(data: any): void {
    if (!data?.type) return

    switch (data.type) {
      case 'order_update':
        DeviceEventEmitter.emit('notification_navigate', `/orders/${data.orderId}`)
        break
      case 'promotion':
        DeviceEventEmitter.emit('notification_navigate', `/promotions`)
        break
      case 'chat_message':
        DeviceEventEmitter.emit('notification_navigate', `/chat/${data.conversationId}`)
        break
      case 'subscription_reminder':
        DeviceEventEmitter.emit('notification_navigate', `/subscriptions`)
        break
      default:
        DeviceEventEmitter.emit('notification_navigate', '/notifications')
    }
  }

  /**
   * Register a notification provider
   */
  registerProvider(name: string, provider: NotificationProvider): void {
    this.providers.set(name, provider)
    provider.configure(this.config)
    console.log(`📱 Registered notification provider: ${name}`)
  }

  /**
   * Register default notification providers
   */
  private registerDefaultProviders(): void {
    try {
      // Import providers dynamically to avoid circular dependencies
      const { ToastProvider } = require('./providers/ToastProvider')
      const { ModalProvider } = require('./providers/ModalProvider')
      
      // Register toast provider
      this.registerProvider('toast', new ToastProvider())
      
      // Register modal provider  
      this.registerProvider('modal', new ModalProvider())
      
      // Set toast as default provider
      this.registerProvider('default', new ToastProvider())
      
      console.log('✅ Default notification providers registered')
    } catch (error) {
      console.error('❌ Failed to register default providers:', error)
    }
  }

  /**
   * Show a notification using the appropriate provider
   */
  async show(notification: NotificationData): Promise<string> {
    // Generate ID if not provided
    if (!notification.id) {
      notification.id = this.generateId()
    }

    // Set timestamp
    notification.timestamp = new Date()

    // Validate notification limits
    if (this.activeNotifications.size >= this.config.maxNotifications) {
      this.clearOldestNotification()
    }

    // Store active notification
    this.activeNotifications.set(notification.id, notification)

    // Get appropriate provider
    const provider = this.getProvider(notification.type)
    if (!provider) {
      console.warn(`⚠️ No provider found for notification type: ${notification.type}`)
      return notification.id
    }

    try {
      // Show notification
      await provider.show(notification)
      
      // Emit event
      DeviceEventEmitter.emit('notification_shown', notification)
      
      // Track analytics
      this.trackNotification('shown', notification)
      
      // Auto-dismiss if not persistent
      if (!notification.persistent && notification.duration !== 0) {
        const duration = notification.duration || this.config.defaultDuration
        setTimeout(() => {
          this.hide(notification.id!)
        }, duration)
      }

      return notification.id
    } catch (error) {
      console.error('❌ Failed to show notification:', error)
      this.activeNotifications.delete(notification.id)
      throw error
    }
  }

  /**
   * Show in-app notification (for real-time updates)
   */
  async showInAppNotification(notification: NotificationData): Promise<string> {
    return this.show({
      ...notification,
      type: 'toast',
      duration: notification.duration || 4000
    })
  }

  /**
   * Hide a specific notification
   */
  async hide(id: string): Promise<void> {
    const notification = this.activeNotifications.get(id)
    if (!notification) return

    const provider = this.getProvider(notification.type)
    if (provider) {
      await provider.hide(id)
    }

    this.activeNotifications.delete(id)
    DeviceEventEmitter.emit('notification_hidden', { id })
    
    // Track analytics
    this.trackNotification('dismissed', notification)
  }

  /**
   * Clear all notifications
   */
  async clear(): Promise<void> {
    for (const provider of this.providers.values()) {
      await provider.clear()
    }

    this.activeNotifications.clear()
    DeviceEventEmitter.emit('notifications_cleared')
  }

  /**
   * Update configuration
   */
  configure(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Update all providers with new config
    for (const provider of this.providers.values()) {
      provider.configure(this.config)
    }

    DeviceEventEmitter.emit('notification_config_updated', this.config)
  }

  /**
   * Get current configuration
   */
  getConfig(): NotificationConfig {
    return { ...this.config }
  }

  /**
   * Get active notifications
   */
  getActiveNotifications(): NotificationData[] {
    return Array.from(this.activeNotifications.values())
  }

  /**
   * Get notification by ID
   */
  getNotification(id: string): NotificationData | undefined {
    return this.activeNotifications.get(id)
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized
  }

  // Private helper methods

  private getProvider(type: string): NotificationProvider | undefined {
    return this.providers.get(type) || this.providers.get('default')
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private clearOldestNotification(): void {
    let oldestId: string | null = null
    let oldestTime = Date.now()

    for (const [id, notification] of this.activeNotifications) {
      const time = notification.timestamp?.getTime() || 0
      if (time < oldestTime) {
        oldestTime = time
        oldestId = id
      }
    }

    if (oldestId) {
      this.hide(oldestId)
    }
  }

  private trackNotification(event: string, notification: NotificationData): void {
    try {
      // Analytics will be implemented when available
      console.log(`📊 Notification ${event}:`, {
        notificationId: notification.id,
        type: notification.type,
        variant: notification.variant,
        category: notification.category,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.warn('⚠️ Failed to track notification analytics:', error)
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()

// Export convenience methods
export const showNotification = (data: NotificationData) => notificationService.show(data)
export const hideNotification = (id: string) => notificationService.hide(id)
export const clearNotifications = () => notificationService.clear()
export const configureNotifications = (config: Partial<NotificationConfig>) => 
  notificationService.configure(config)
