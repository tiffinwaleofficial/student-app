/**
 * Real-time Notification Service
 * Integrates Firebase notifications with WebSocket for real-time updates
 * 
 * Features:
 * - Real-time order updates with funny messages
 * - WebSocket + Firebase integration
 * - Automatic notification routing
 * - Background notification support
 */

import { firebaseNotificationService } from './firebaseNotificationService'
import { nativeWebSocketService } from './nativeWebSocketService'
import { pushNotificationService } from './pushNotificationService'
import { notificationPreferencesService, NotificationEvent } from './notificationPreferencesService'
import { useAuthStore } from '@/store/authStore'

export interface RealtimeNotificationPayload {
  type: 'order_update' | 'payment_update' | 'chat_message' | 'promotion' | 'system'
  data: {
    orderId?: string
    paymentId?: string
    conversationId?: string
    promotionId?: string
    status?: string
    message?: string
    title?: string
    userId?: string
    [key: string]: any
  }
  priority?: 'low' | 'normal' | 'high'
  timestamp?: number
}

/**
 * Real-time Notification Service Class
 */
export class RealtimeNotificationService {
  private static instance: RealtimeNotificationService
  private isInitialized = false
  private webSocketConnected = false

  private constructor() {}

  static getInstance(): RealtimeNotificationService {
    if (!RealtimeNotificationService.instance) {
      RealtimeNotificationService.instance = new RealtimeNotificationService()
    }
    return RealtimeNotificationService.instance
  }

  /**
   * Initialize real-time notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('🔄 Initializing Real-time Notification Service...')

      // Initialize Firebase notifications
      await firebaseNotificationService.initialize()

      // Initialize push notifications
      await pushNotificationService.initialize()

      // Set up WebSocket listeners
      this.setupWebSocketListeners()

      this.isInitialized = true
      console.log('🔄 Real-time Notification Service initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize real-time notifications:', error)
      throw error
    }
  }

  /**
   * Set up WebSocket event listeners
   */
  private setupWebSocketListeners(): void {
    // Listen for WebSocket connection status
    nativeWebSocketService.on('connected', () => {
      this.webSocketConnected = true
      console.log('🔄 WebSocket connected - real-time notifications active')
    })

    nativeWebSocketService.on('disconnected', () => {
      this.webSocketConnected = false
      console.log('🔄 WebSocket disconnected - using fallback notifications')
    })

    // Listen for real-time notification events
    nativeWebSocketService.on('notification', this.handleRealtimeNotification.bind(this))
    nativeWebSocketService.on('order_update', this.handleOrderUpdate.bind(this))
    nativeWebSocketService.on('payment_update', this.handlePaymentUpdate.bind(this))
    nativeWebSocketService.on('chat_message', this.handleChatMessage.bind(this))
    nativeWebSocketService.on('promotion', this.handlePromotion.bind(this))
    nativeWebSocketService.on('system_notification', this.handleSystemNotification.bind(this))
  }

  /**
   * Handle generic real-time notification
   */
  private handleRealtimeNotification(payload: RealtimeNotificationPayload): void {
    console.log('🔄 Real-time notification received:', payload)

    // Check if notification is for current user
    const currentUser = useAuthStore.getState().user
    if (payload.data.userId && payload.data.userId !== currentUser?.id) {
      return // Not for this user
    }

    // Route notification based on type
    switch (payload.type) {
      case 'order_update':
        this.handleOrderUpdate(payload.data)
        break
      case 'payment_update':
        this.handlePaymentUpdate(payload.data)
        break
      case 'chat_message':
        this.handleChatMessage(payload.data)
        break
      case 'promotion':
        this.handlePromotion(payload.data)
        break
      case 'system':
        this.handleSystemNotification(payload.data)
        break
      default:
        console.warn('🔄 Unknown notification type:', payload.type)
    }
  }

  /**
   * Handle order update notifications
   */
  private async handleOrderUpdate(data: any): Promise<void> {
    const { orderId, status, message, title, userId } = data

    console.log('🍽️ Order update notification:', { orderId, status })

    // Create notification event
    const event: NotificationEvent = {
      type: 'order',
      subtype: this.mapOrderStatusToSubtype(status),
      title: title || this.getOrderStatusTitle(status),
      body: message || this.getOrderStatusMessage(status),
      data: { orderId, status },
      userId,
      priority: this.getOrderPriority(status)
    }

    // Send through notification preferences service
    const result = await notificationPreferencesService.sendNotification(event)
    
    if (result.sent) {
      console.log('✅ Order notification sent successfully')
    } else {
      console.log('🔕 Order notification blocked:', result.reason)
    }
  }

  /**
   * Handle payment update notifications
   */
  private async handlePaymentUpdate(data: any): Promise<void> {
    const { paymentId, status, amount, message, title, userId } = data

    console.log('💳 Payment update notification:', { paymentId, status })

    const success = status === 'completed' || status === 'success'
    
    // Create notification event
    const event: NotificationEvent = {
      type: 'payment',
      subtype: success ? 'paymentSuccess' : 'paymentFailed',
      title: title || (success ? 'Payment Successful! 💳' : 'Payment Failed 😅'),
      body: message || (success 
        ? `Payment of ₹${amount} completed successfully! Your wallet is lighter, but your stomach will be happier 😊`
        : 'Payment failed! Don\'t worry, we\'re fixing it faster than you can say "tiffin" 🔧'
      ),
      data: { paymentId, status, amount },
      userId,
      priority: 'high'
    }

    // Send through notification preferences service
    const result = await notificationPreferencesService.sendNotification(event)
    
    if (result.sent) {
      console.log('✅ Payment notification sent successfully')
    } else {
      console.log('🔕 Payment notification blocked:', result.reason)
    }
  }

  /**
   * Handle chat message notifications
   */
  private async handleChatMessage(data: any): Promise<void> {
    const { conversationId, senderId, senderName, message, title, userId } = data

    console.log('💬 Chat message notification:', { conversationId, senderId })

    // Create notification event
    const event: NotificationEvent = {
      type: 'chat',
      subtype: 'newMessage',
      title: title || `New message from ${senderName || 'Support'}`,
      body: message || 'You have a new chat message',
      data: { conversationId, senderId, senderName },
      userId,
      priority: 'high'
    }

    // Send through notification preferences service
    const result = await notificationPreferencesService.sendNotification(event)
    
    if (result.sent) {
      console.log('✅ Chat notification sent successfully')
    } else {
      console.log('🔕 Chat notification blocked:', result.reason)
    }
  }

  /**
   * Handle promotion notifications
   */
  private async handlePromotion(data: any): Promise<void> {
    const { promotionId, title, message, discountPercent, validUntil, userId } = data

    console.log('🎁 Promotion notification:', { promotionId, title })

    // Create notification event
    const event: NotificationEvent = {
      type: 'promotion',
      subtype: 'discountOffers',
      title: title || 'Special Offer! 🎁',
      body: message || `New deal alert! Your wallet and stomach are both going to love this 💝`,
      data: { promotionId, discountPercent, validUntil },
      userId,
      priority: 'normal'
    }

    // Send through notification preferences service
    const result = await notificationPreferencesService.sendNotification(event)
    
    if (result.sent) {
      console.log('✅ Promotion notification sent successfully')
    } else {
      console.log('🔕 Promotion notification blocked:', result.reason)
    }
  }

  /**
   * Handle system notifications
   */
  private async handleSystemNotification(data: any): Promise<void> {
    const { title, message, type, priority, userId } = data

    console.log('🔔 System notification:', { title, type })

    // Create notification event
    const event: NotificationEvent = {
      type: 'system',
      subtype: type || 'serviceAnnouncements',
      title: title || 'System Alert',
      body: message || 'System notification',
      data,
      userId,
      priority: priority || 'normal'
    }

    // Send through notification preferences service
    const result = await notificationPreferencesService.sendNotification(event)
    
    if (result.sent) {
      console.log('✅ System notification sent successfully')
    } else {
      console.log('🔕 System notification blocked:', result.reason)
    }
  }

  /**
   * Send push notification (for background notifications)
   */
  private async sendPushNotification(payload: {
    title: string
    body: string
    data?: any
  }): Promise<void> {
    try {
      // This would be sent from backend to Firebase FCM
      // For now, we'll just log it
      console.log('📱 Push notification prepared:', payload)
      
      // In a real implementation, this would be sent via your backend:
      // await apiClient.notifications.sendPush({
      //   token: pushNotificationService.getCurrentPushToken(),
      //   ...payload
      // })
    } catch (error) {
      console.error('❌ Failed to send push notification:', error)
    }
  }

  /**
   * Get order status title
   */
  private getOrderStatusTitle(status: string): string {
    const titles = {
      'placed': 'Order Placed! 🎉',
      'confirmed': 'Order Confirmed! ✅',
      'preparing': 'Cooking Started! 👨‍🍳',
      'cooking': 'Kitchen Magic! 🔥',
      'out_for_delivery': 'On the Way! 🏃‍♂️',
      'on_the_way': 'Almost There! 🚀',
      'delivered': 'Delivered! 🎊',
      'completed': 'Bon Appétit! 🍽️',
      'cancelled': 'Order Cancelled 😔'
    }
    return titles[status as keyof typeof titles] || 'Order Update 📱'
  }

  /**
   * Get order status message
   */
  private getOrderStatusMessage(status: string): string {
    const messages = {
      'placed': 'Your tiffin order is placed! Even your mom would be proud 🥘',
      'confirmed': 'Order confirmed! Your taste buds are doing a happy dance 💃',
      'preparing': 'Your meal is being cooked with extra love (and secret spices) ✨',
      'cooking': 'Chef is working harder than you on Monday morning 😴',
      'out_for_delivery': 'Your tiffin is on the way! Faster than your assignment deadline ⚡',
      'on_the_way': 'Your meal is traveling faster than campus gossip 📰',
      'delivered': 'Your tiffin has arrived! Time to abandon all diet plans 🍔',
      'completed': 'Food delivered! Now hide your hunger, show some gratitude 🙏',
      'cancelled': 'Your order has been cancelled. No worries, there are plenty more delicious options! 🍽️'
    }
    return messages[status as keyof typeof messages] || `Your order status has been updated to: ${status}`
  }

  /**
   * Map order status to notification subtype
   */
  private mapOrderStatusToSubtype(status: string): string {
    const mapping = {
      'placed': 'orderPlaced',
      'confirmed': 'orderConfirmed',
      'preparing': 'orderPreparing',
      'cooking': 'orderCooking',
      'ready': 'orderReady',
      'out_for_delivery': 'orderOutForDelivery',
      'on_the_way': 'orderOutForDelivery',
      'delivered': 'orderDelivered',
      'completed': 'orderDelivered',
      'cancelled': 'orderCancelled',
      'delayed': 'orderDelayed'
    }
    return mapping[status as keyof typeof mapping] || 'orderPlaced'
  }

  /**
   * Get order priority based on status
   */
  private getOrderPriority(status: string): 'low' | 'normal' | 'high' {
    const highPriorityStatuses = ['cancelled', 'delayed', 'delivered']
    return highPriorityStatuses.includes(status) ? 'high' : 'normal'
  }

  /**
   * Manually trigger test notifications
   */
  async testNotifications(): Promise<void> {
    console.log('🧪 Testing real-time notifications...')

    // Test order notifications
    setTimeout(() => {
      this.handleOrderUpdate({
        orderId: 'TEST_001',
        status: 'placed',
        message: 'Test order placed successfully!'
      })
    }, 1000)

    setTimeout(() => {
      this.handleOrderUpdate({
        orderId: 'TEST_001',
        status: 'cooking',
        message: 'Test order is being prepared!'
      })
    }, 3000)

    setTimeout(() => {
      this.handleOrderUpdate({
        orderId: 'TEST_001',
        status: 'delivery',
        message: 'Test order is on the way!'
      })
    }, 5000)

    setTimeout(() => {
      this.handlePaymentUpdate({
        paymentId: 'PAY_TEST_001',
        status: 'success',
        amount: 299,
        message: 'Test payment completed!'
      })
    }, 7000)

    setTimeout(() => {
      this.handlePromotion({
        promotionId: 'PROMO_TEST_001',
        title: 'Test Offer! 🎁',
        message: 'Get 20% off on your next order!',
        discountPercent: 20
      })
    }, 9000)
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && firebaseNotificationService.isReady()
  }

  /**
   * Check WebSocket connection status
   */
  isWebSocketConnected(): boolean {
    return this.webSocketConnected
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    // Remove WebSocket listeners
    nativeWebSocketService.off('notification', this.handleRealtimeNotification)
    nativeWebSocketService.off('order_update', this.handleOrderUpdate)
    nativeWebSocketService.off('payment_update', this.handlePaymentUpdate)
    nativeWebSocketService.off('chat_message', this.handleChatMessage)
    nativeWebSocketService.off('promotion', this.handlePromotion)
    nativeWebSocketService.off('system_notification', this.handleSystemNotification)

    this.isInitialized = false
    console.log('🔄 Real-time Notification Service cleaned up')
  }
}

// Export singleton instance
export const realtimeNotificationService = RealtimeNotificationService.getInstance()

// Export convenience methods
export const initializeRealtimeNotifications = () => realtimeNotificationService.initialize()
export const testRealtimeNotifications = () => realtimeNotificationService.testNotifications()
export const isRealtimeNotificationsReady = () => realtimeNotificationService.isReady()

// Export for use in stores
export const triggerOrderNotification = (orderId: string, status: string, message?: string) => {
  realtimeNotificationService['handleOrderUpdate']({ orderId, status, message })
}

export const triggerPaymentNotification = (paymentId: string, status: string, amount?: number, message?: string) => {
  realtimeNotificationService['handlePaymentUpdate']({ paymentId, status, amount, message })
}

export const triggerPromotionNotification = (promotionId: string, title: string, message: string, discountPercent?: number) => {
  realtimeNotificationService['handlePromotion']({ promotionId, title, message, discountPercent })
}