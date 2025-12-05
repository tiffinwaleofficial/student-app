/**
 * Notification Preferences Service
 * Manages user notification preferences with backend synchronization
 * Integrates with Firebase notification system
 */

import { useNotificationPreferencesStore } from '@/store/notificationPreferencesStore'
import { firebaseNotificationService } from './firebaseNotificationService'
import { pushNotificationService } from './pushNotificationService'
import apiClient from '@/utils/apiClient'
import { getErrorMessage } from '@/utils/errorHandler'

export interface NotificationEvent {
  type: 'order' | 'payment' | 'subscription' | 'meal' | 'promotion' | 'chat' | 'system' | 'delivery'
  subtype: string
  title: string
  body: string
  data?: any
  userId?: string
  priority?: 'low' | 'normal' | 'high'
  scheduledFor?: string
  expiresAt?: string
}

export interface NotificationResult {
  sent: boolean
  reason?: string
  channels: {
    inApp: boolean
    push: boolean
    email?: boolean
    sms?: boolean
  }
}

/**
 * Notification Preferences Service Class
 */
export class NotificationPreferencesService {
  private static instance: NotificationPreferencesService

  private constructor() {}

  static getInstance(): NotificationPreferencesService {
    if (!NotificationPreferencesService.instance) {
      NotificationPreferencesService.instance = new NotificationPreferencesService()
    }
    return NotificationPreferencesService.instance
  }

  /**
   * Check if a notification should be sent based on user preferences
   */
  shouldSendNotification(event: NotificationEvent): boolean {
    const store = useNotificationPreferencesStore.getState()
    
    // Check if user has notifications enabled at all
    if (!store.preferences.allNotifications) {
      console.log(`🔕 Notification blocked: All notifications disabled for ${event.type}:${event.subtype}`)
      return false
    }

    // Check category-specific preferences
    const categoryEnabled = store.isNotificationEnabled(event.type + 'Notifications')
    if (!categoryEnabled) {
      console.log(`🔕 Notification blocked: Category ${event.type} disabled`)
      return false
    }

    // Check subcategory-specific preferences
    const subcategoryEnabled = store.shouldShowNotification(event.type + 'Notifications', event.subtype)
    if (!subcategoryEnabled) {
      console.log(`🔕 Notification blocked: Subcategory ${event.subtype} disabled or in quiet hours`)
      return false
    }

    console.log(`✅ Notification allowed: ${event.type}:${event.subtype}`)
    return true
  }

  /**
   * Send notification through appropriate channels
   */
  async sendNotification(event: NotificationEvent): Promise<NotificationResult> {
    const result: NotificationResult = {
      sent: false,
      channels: {
        inApp: false,
        push: false,
      }
    }

    // Check if notification should be sent
    if (!this.shouldSendNotification(event)) {
      result.reason = 'User preferences block this notification'
      return result
    }

    try {
      // Send in-app notification
      await this.sendInAppNotification(event)
      result.channels.inApp = true

      // Send push notification if app is in background
      if (this.shouldSendPushNotification(event)) {
        await this.sendPushNotification(event)
        result.channels.push = true
      }

      // Log to backend for analytics
      await this.logNotificationSent(event)

      result.sent = true
      console.log(`📱 Notification sent successfully: ${event.type}:${event.subtype}`)

    } catch (error) {
      console.error('❌ Failed to send notification:', error)
      result.reason = getErrorMessage(error)
    }

    return result
  }

  /**
   * Send in-app notification using Firebase service
   */
  private async sendInAppNotification(event: NotificationEvent): Promise<void> {
    switch (event.type) {
      case 'order':
        await this.sendOrderNotification(event)
        break
      case 'payment':
        await this.sendPaymentNotification(event)
        break
      case 'subscription':
        await this.sendSubscriptionNotification(event)
        break
      case 'meal':
        await this.sendMealNotification(event)
        break
      case 'promotion':
        await this.sendPromotionNotification(event)
        break
      case 'chat':
        await this.sendChatNotification(event)
        break
      case 'delivery':
        await this.sendDeliveryNotification(event)
        break
      case 'system':
        await this.sendSystemNotification(event)
        break
      default:
        // Generic notification
        firebaseNotificationService.showSuccess({
          title: event.title,
          body: event.body,
          data: event.data
        })
    }
  }

  /**
   * Send order-specific notification
   */
  private async sendOrderNotification(event: NotificationEvent): Promise<void> {
    const orderStatusMap: Record<string, 'placed' | 'cooking' | 'delivery' | 'delivered'> = {
      orderPlaced: 'placed',
      orderConfirmed: 'placed',
      orderPreparing: 'cooking',
      orderCooking: 'cooking',
      orderReady: 'cooking',
      orderOutForDelivery: 'delivery',
      orderDelivered: 'delivered',
    }

    const status = orderStatusMap[event.subtype] || 'placed'
    
    firebaseNotificationService.showOrderUpdate(status, {
      title: event.title,
      body: event.body,
      data: event.data
    })
  }

  /**
   * Send payment-specific notification
   */
  private async sendPaymentNotification(event: NotificationEvent): Promise<void> {
    const success = event.subtype === 'paymentSuccess' || event.subtype === 'refundCompleted'
    
    firebaseNotificationService.showPaymentUpdate(success, {
      title: event.title,
      body: event.body,
      data: event.data
    })
  }

  /**
   * Send subscription-specific notification
   */
  private async sendSubscriptionNotification(event: NotificationEvent): Promise<void> {
    if (event.subtype === 'subscriptionExpiring' || event.subtype === 'subscriptionExpired') {
      firebaseNotificationService.showSubscriptionReminder({
        title: event.title,
        body: event.body,
        data: event.data
      })
    } else {
      firebaseNotificationService.showSuccess({
        title: event.title,
        body: event.body,
        data: event.data
      })
    }
  }

  /**
   * Send meal-specific notification
   */
  private async sendMealNotification(event: NotificationEvent): Promise<void> {
    if (event.subtype === 'mealReminder') {
      firebaseNotificationService.showMealReminder({
        title: event.title,
        body: event.body,
        data: event.data
      })
    } else {
      firebaseNotificationService.showSuccess({
        title: event.title,
        body: event.body,
        data: event.data
      })
    }
  }

  /**
   * Send promotion-specific notification
   */
  private async sendPromotionNotification(event: NotificationEvent): Promise<void> {
    firebaseNotificationService.showPromotion({
      title: event.title,
      body: event.body,
      data: event.data
    })
  }

  /**
   * Send chat-specific notification
   */
  private async sendChatNotification(event: NotificationEvent): Promise<void> {
    firebaseNotificationService.showChatMessage({
      title: event.title,
      body: event.body,
      data: event.data
    })
  }

  /**
   * Send delivery-specific notification
   */
  private async sendDeliveryNotification(event: NotificationEvent): Promise<void> {
    firebaseNotificationService.showSuccess({
      title: event.title,
      body: event.body,
      data: event.data
    })
  }

  /**
   * Send system-specific notification
   */
  private async sendSystemNotification(event: NotificationEvent): Promise<void> {
    if (event.subtype.includes('error') || event.subtype.includes('alert')) {
      firebaseNotificationService.showError({
        title: event.title,
        body: event.body,
        data: event.data
      })
    } else {
      firebaseNotificationService.showSuccess({
        title: event.title,
        body: event.body,
        data: event.data
      })
    }
  }

  /**
   * Check if push notification should be sent
   */
  private shouldSendPushNotification(event: NotificationEvent): boolean {
    // Send push notification for high priority events or when app is in background
    return event.priority === 'high' || this.isAppInBackground()
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(event: NotificationEvent): Promise<void> {
    try {
      // Schedule local push notification
      await pushNotificationService.scheduleLocalNotification({
        title: event.title,
        body: event.body,
        data: event.data,
        priority: event.priority || 'normal'
      }, {
        seconds: 1 // Send immediately
      })

      console.log('📱 Push notification scheduled:', event.title)
    } catch (error) {
      console.error('❌ Failed to send push notification:', error)
    }
  }

  /**
   * Check if app is in background
   */
  private isAppInBackground(): boolean {
    // This would be implemented based on app state
    // For now, return false (assume app is in foreground)
    return false
  }

  /**
   * Log notification sent to backend for analytics
   */
  private async logNotificationSent(event: NotificationEvent): Promise<void> {
    try {
      await apiClient.post('/notifications/log', {
        type: event.type,
        subtype: event.subtype,
        title: event.title,
        userId: event.userId,
        timestamp: new Date().toISOString(),
        channels: {
          inApp: true,
          push: this.shouldSendPushNotification(event)
        }
      })
    } catch (error) {
      // Don't throw error for logging failures
      console.warn('⚠️ Failed to log notification to backend:', error)
    }
  }

  /**
   * Bulk send notifications
   */
  async sendBulkNotifications(events: NotificationEvent[]): Promise<NotificationResult[]> {
    const results: NotificationResult[] = []
    
    for (const event of events) {
      const result = await this.sendNotification(event)
      results.push(result)
    }
    
    return results
  }

  /**
   * Schedule notification for later
   */
  async scheduleNotification(event: NotificationEvent, scheduledFor: Date): Promise<void> {
    if (!this.shouldSendNotification(event)) {
      console.log('🔕 Scheduled notification blocked by user preferences')
      return
    }

    try {
      // Calculate delay
      const delay = scheduledFor.getTime() - Date.now()
      
      if (delay <= 0) {
        // Send immediately if scheduled time has passed
        await this.sendNotification(event)
        return
      }

      // Schedule push notification
      await pushNotificationService.scheduleLocalNotification({
        title: event.title,
        body: event.body,
        data: event.data,
        priority: event.priority || 'normal'
      }, {
        date: scheduledFor
      })

      console.log(`⏰ Notification scheduled for ${scheduledFor.toLocaleString()}:`, event.title)
    } catch (error) {
      console.error('❌ Failed to schedule notification:', error)
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await pushNotificationService.cancelScheduledNotification(notificationId)
      console.log('❌ Scheduled notification cancelled:', notificationId)
    } catch (error) {
      console.error('❌ Failed to cancel scheduled notification:', error)
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<{
    totalSent: number
    totalBlocked: number
    byCategory: Record<string, number>
    byChannel: Record<string, number>
  }> {
    try {
      const response = await apiClient.get('/notifications/stats')
      return response.data
    } catch (error) {
      console.error('❌ Failed to get notification stats:', error)
      return {
        totalSent: 0,
        totalBlocked: 0,
        byCategory: {},
        byChannel: {}
      }
    }
  }

  /**
   * Test notification system
   */
  async testNotificationSystem(): Promise<void> {
    console.log('🧪 Testing notification system with user preferences...')

    const testEvents: NotificationEvent[] = [
      {
        type: 'order',
        subtype: 'orderPlaced',
        title: 'Test Order Notification',
        body: 'This is a test order notification to verify your preferences!',
        data: { orderId: 'TEST_001', test: true }
      },
      {
        type: 'payment',
        subtype: 'paymentSuccess',
        title: 'Test Payment Notification',
        body: 'This is a test payment notification!',
        data: { paymentId: 'TEST_PAY_001', test: true }
      },
      {
        type: 'promotion',
        subtype: 'discountOffers',
        title: 'Test Promotion Notification',
        body: 'This is a test promotional notification!',
        data: { promotionId: 'TEST_PROMO_001', test: true }
      }
    ]

    for (let i = 0; i < testEvents.length; i++) {
      setTimeout(async () => {
        const result = await this.sendNotification(testEvents[i])
        console.log(`🧪 Test notification ${i + 1} result:`, result)
      }, i * 2000)
    }
  }
}

// Export singleton instance
export const notificationPreferencesService = NotificationPreferencesService.getInstance()

// Export convenience methods
export const sendNotification = (event: NotificationEvent) => 
  notificationPreferencesService.sendNotification(event)

export const scheduleNotification = (event: NotificationEvent, scheduledFor: Date) => 
  notificationPreferencesService.scheduleNotification(event, scheduledFor)

export const testNotifications = () => 
  notificationPreferencesService.testNotificationSystem()

// Export helper functions for common notification types
export const sendOrderNotification = (subtype: string, title: string, body: string, data?: any) =>
  sendNotification({ type: 'order', subtype, title, body, data })

export const sendPaymentNotification = (subtype: string, title: string, body: string, data?: any) =>
  sendNotification({ type: 'payment', subtype, title, body, data })

export const sendSubscriptionNotification = (subtype: string, title: string, body: string, data?: any) =>
  sendNotification({ type: 'subscription', subtype, title, body, data })

export const sendPromotionNotification = (title: string, body: string, data?: any) =>
  sendNotification({ type: 'promotion', subtype: 'discountOffers', title, body, data })

export const sendChatNotification = (title: string, body: string, data?: any) =>
  sendNotification({ type: 'chat', subtype: 'newMessage', title, body, data })

export const sendSystemNotification = (subtype: string, title: string, body: string, data?: any) =>
  sendNotification({ type: 'system', subtype, title, body, data })