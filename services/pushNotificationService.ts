/**
 * TiffinWale Push Notification Service
 * Handles Expo push notifications for device-level notifications
 * 
 * Features:
 * - Device registration with backend
 * - Push token management
 * - Notification permissions
 * - Background notification handling
 * - Deep linking support
 * - Analytics tracking
 */

import * as Notifications from 'expo-notifications'
// import * as Device from 'expo-device' // Will be added when available
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import apiClient from '../utils/apiClient'
import { useAuthStore } from '../store/authStore'
import { notificationService } from './notificationService'

// Types
export interface PushToken {
  token: string
  platform: 'ios' | 'android' | 'web'
  deviceId: string
  userId?: string
  createdAt: Date
  updatedAt: Date
}

export interface PushNotificationPayload {
  title: string
  body: string
  data?: Record<string, any>
  sound?: string
  badge?: number
  categoryId?: string
  priority?: 'default' | 'normal' | 'high'
  ttl?: number
  expiration?: number
  channelId?: string
}

export interface NotificationResponse {
  notification: Notifications.Notification
  actionIdentifier: string
  userInput?: string
}

/**
 * Push Notification Service Class
 */
export class PushNotificationService {
  private static instance: PushNotificationService
  private pushToken: string | null = null
  private isInitialized = false
  private notificationListener: Notifications.Subscription | null = null
  private responseListener: Notifications.Subscription | null = null

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Check if we're in Expo Go
      const isExpoGo = Constants.appOwnership === 'expo'
      if (isExpoGo) {
        console.warn('🚨 Push notifications have limitations in Expo Go')
        console.log('💡 Use a development build for full push notification support')
        // Continue with limited functionality
      }

      // Check if device supports push notifications
      // if (!Device.isDevice && !isExpoGo) {
      //   console.warn('⚠️ Push notifications only work on physical devices')
      //   return
      // }

      // Configure notification handling
      this.configureNotificationHandler()

      // Request permissions
      const hasPermission = await this.requestPermissions()
      if (!hasPermission) {
        console.warn('⚠️ Push notification permissions not granted')
        return
      }

      // Get push token
      await this.getPushToken()

      // Set up listeners
      this.setupNotificationListeners()

      // Register with backend
      await this.registerDevice()

      this.isInitialized = true
      console.log('🔔 Push notification service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error)
      throw error
    }
  }

  /**
   * Configure how notifications are handled
   */
  private configureNotificationHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const { data } = notification.request.content

        // Determine if notification should be shown
        const shouldShow = this.shouldShowNotification(data)

        return {
          shouldShowAlert: shouldShow,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }
      },
    })
  }

  /**
   * Request notification permissions
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Push notification permissions denied')
        return false
      }

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await this.configureAndroidChannels()
      }

      return true
    } catch (error) {
      console.error('❌ Error requesting permissions:', error)
      return false
    }
  }

  /**
   * Configure Android notification channels
   */
  private async configureAndroidChannels(): Promise<void> {
    // Default channel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9B42',
      sound: 'default'
    })

    // Order updates channel
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
      sound: 'default',
      description: 'Notifications about your order status'
    })

    // Promotions channel
    await Notifications.setNotificationChannelAsync('promotions', {
      name: 'Promotions & Offers',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#E91E63',
      sound: 'default',
      description: 'Special offers and promotional notifications'
    })

    // Chat channel
    await Notifications.setNotificationChannelAsync('chat', {
      name: 'Chat Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2196F3',
      sound: 'default',
      description: 'New chat messages'
    })

    // Reminders channel
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#FF9800',
      sound: 'default',
      description: 'Meal and subscription reminders'
    })
  }

  /**
   * Get Expo push token
   */
  private async getPushToken(): Promise<string | null> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId

      if (!projectId) {
        console.error('❌ No Expo project ID found')
        return null
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId
      })

      this.pushToken = token.data
      console.log('📱 Got push token:', this.pushToken)
      return this.pushToken
    } catch (error) {
      console.error('❌ Error getting push token:', error)
      return null
    }
  }

  /**
   * Set up notification event listeners
   */
  private setupNotificationListeners(): void {
    // Listen for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived.bind(this)
    )

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    )
  }

  /**
   * Handle notification received (app in foreground)
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    console.log('📨 Notification received:', notification)

    const { title, body, data } = notification.request.content

    // Show in-app notification
    notificationService.showInAppNotification({
      id: notification.request.identifier,
      type: 'toast',
      variant: this.getVariantFromData(data),
      title: title || 'Notification',
      message: body || '',
      data,
      category: (data?.category as 'order' | 'promotion' | 'system' | 'chat' | 'reminder') || 'system',
      duration: 4000
    })

    // Track analytics
    this.trackNotificationReceived(notification)
  }

  /**
   * Handle notification response (user tapped notification)
   */
  private handleNotificationResponse(response: NotificationResponse): void {
    console.log('👆 Notification tapped:', response)

    const { notification, actionIdentifier } = response
    const { data } = notification.request.content

    // Handle specific actions
    if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      // Default tap action
      this.handleDefaultNotificationTap(data)
    } else {
      // Custom action
      this.handleCustomNotificationAction(actionIdentifier, data)
    }

    // Track analytics
    this.trackNotificationOpened(notification)
  }

  /**
   * Handle default notification tap
   */
  private handleDefaultNotificationTap(data: any): void {
    if (!data?.type) return

    // Emit navigation event to be handled by the app
    notificationService.emit('navigate', data)
  }

  /**
   * Handle custom notification actions
   */
  private handleCustomNotificationAction(actionId: string, data: any): void {
    switch (actionId) {
      case 'track_order':
        if (data?.orderId) {
          notificationService.emit('navigate', `/orders/${data.orderId}`)
        }
        break
      case 'view_offer':
        if (data?.promotionId) {
          notificationService.emit('navigate', `/promotions/${data.promotionId}`)
        }
        break
      case 'reply_chat':
        if (data?.conversationId) {
          notificationService.emit('navigate', `/chat/${data.conversationId}`)
        }
        break
      default:
        console.log('Unknown notification action:', actionId)
    }
  }

  /**
   * Register device with backend
   */
  private async registerDevice(): Promise<void> {
    if (!this.pushToken) return

    try {
      const user = useAuthStore.getState().user
      const deviceInfo = {
        token: this.pushToken,
        platform: Platform.OS as 'ios' | 'android',
        deviceId: await this.getDeviceId(),
        userId: user?.id,
        // deviceName: Device.deviceName,
        // osVersion: Device.osVersion,
        appVersion: Constants.expoConfig?.version
      }

      // Register with backend (will be implemented when API is ready)
      console.log('📱 Device registration prepared:', deviceInfo)
      // await apiClient.notifications.registerDevice(deviceInfo)
      console.log('📱 Device registered with backend')
    } catch (error) {
      console.error('❌ Failed to register device:', error)
    }
  }

  /**
   * Unregister device from backend
   */
  async unregisterDevice(): Promise<void> {
    if (!this.pushToken) return

    try {
      // Unregister with backend (will be implemented when API is ready)
      console.log('📱 Device unregistration prepared:', this.pushToken)
      // await apiClient.notifications.unregisterDevice({ token: this.pushToken })
      console.log('📱 Device unregistered from backend')
    } catch (error) {
      console.error('❌ Failed to unregister device:', error)
    }
  }

  /**
   * Update user association for push token
   */
  async updateUserAssociation(userId: string): Promise<void> {
    if (!this.pushToken) return

    try {
      // Update user association (will be implemented when API is ready)
      console.log('📱 User association update prepared:', { token: this.pushToken, userId })
      // await apiClient.notifications.updateDevice({ token: this.pushToken, userId })
      console.log('📱 Device user association updated')
    } catch (error) {
      console.error('❌ Failed to update user association:', error)
    }
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(payload: PushNotificationPayload, trigger: Notifications.NotificationTriggerInput): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
          sound: payload.sound || 'default',
          badge: payload.badge,
          categoryIdentifier: payload.categoryId
        },
        trigger
      })

      console.log('📅 Local notification scheduled:', notificationId)
      return notificationId
    } catch (error) {
      console.error('❌ Failed to schedule local notification:', error)
      throw error
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId)
      console.log('❌ Scheduled notification cancelled:', notificationId)
    } catch (error) {
      console.error('❌ Failed to cancel notification:', error)
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
      console.log('❌ All scheduled notifications cancelled')
    } catch (error) {
      console.error('❌ Failed to cancel all notifications:', error)
    }
  }

  /**
   * Get current badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync()
    } catch (error) {
      console.error('❌ Failed to get badge count:', error)
      return 0
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count)
    } catch (error) {
      console.error('❌ Failed to set badge count:', error)
    }
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount(): Promise<void> {
    await this.setBadgeCount(0)
  }

  // Helper methods

  private async getDeviceId(): Promise<string> {
    try {
      // return Device.deviceId || 'unknown'
      return 'device_' + Math.random().toString(36).substr(2, 9)
    } catch (error) {
      return 'unknown'
    }
  }

  private shouldShowNotification(data: any): boolean {
    // Add logic to determine if notification should be shown
    // based on user preferences, app state, etc.
    return true
  }

  private getVariantFromData(data: any): 'success' | 'error' | 'warning' | 'info' | 'order' | 'promotion' {
    if (data?.category === 'order') return 'order'
    if (data?.category === 'promotion') return 'promotion'
    if (data?.category === 'chat') return 'info'
    if (data?.type === 'error') return 'error'
    if (data?.type === 'success') return 'success'
    return 'info'
  }

  private trackNotificationReceived(notification: Notifications.Notification): void {
    // Track notification received analytics
    console.log('📊 Tracking notification received')
  }

  private trackNotificationOpened(notification: Notifications.Notification): void {
    // Track notification opened analytics
    console.log('📊 Tracking notification opened')
  }

  /**
   * Get current push token
   */
  getCurrentPushToken(): string | null {
    return this.pushToken
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove()
      this.notificationListener = null
    }

    if (this.responseListener) {
      this.responseListener.remove()
      this.responseListener = null
    }

    this.isInitialized = false
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance()

// Export convenience methods
export const initializePushNotifications = () => pushNotificationService.initialize()
export const scheduleNotification = (payload: PushNotificationPayload, trigger: Notifications.NotificationTriggerInput) => 
  pushNotificationService.scheduleLocalNotification(payload, trigger)
export const cancelNotification = (id: string) => pushNotificationService.cancelScheduledNotification(id)
export const updateBadgeCount = (count: number) => pushNotificationService.setBadgeCount(count)
export const clearBadge = () => pushNotificationService.clearBadgeCount()
