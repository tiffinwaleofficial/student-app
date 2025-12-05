/**
 * Notification Integration Examples
 * Shows how to integrate notification tracking in your existing stores and components
 */

import { useNotificationTracking } from '@/hooks/useNotificationTracking'
import { notificationPreferencesService } from '@/services/notificationPreferencesService'

/**
 * Example: Order Store Integration
 */
export const orderStoreIntegrationExample = {
  // In your orderStore.ts, add notification tracking
  placeOrder: async (orderData: any) => {
    try {
      // Place order via API
      const response = await apiClient.post('/orders', orderData)
      const order = response.data
      
      // Track order placed notification
      const { trackOrderPlaced } = useNotificationTracking()
      await trackOrderPlaced(order.id)
      
      return order
    } catch (error) {
      // Track error notification
      const { trackCustomEvent } = useNotificationTracking()
      await trackCustomEvent({
        type: 'system',
        subtype: 'error',
        title: 'Order Failed 😔',
        body: 'Failed to place order. Please try again!',
        data: { error: error.message }
      })
      throw error
    }
  }
}

/**
 * Example: Payment Store Integration
 */
export const paymentStoreIntegrationExample = {
  // In your paymentStore.ts
  processPayment: async (paymentData: any) => {
    const { trackPaymentSuccess, trackPaymentFailed, trackPaymentPending } = useNotificationTracking()
    
    try {
      // Show payment processing notification
      await trackPaymentPending(paymentData.paymentId, 'Processing your payment...')
      
      // Process payment
      const response = await apiClient.post('/payments/process', paymentData)
      
      if (response.data.success) {
        // Track successful payment
        await trackPaymentSuccess(
          response.data.paymentId, 
          paymentData.amount, 
          paymentData.method
        )
      } else {
        // Track failed payment
        await trackPaymentFailed(
          response.data.paymentId, 
          response.data.error
        )
      }
      
      return response.data
    } catch (error) {
      await trackPaymentFailed(paymentData.paymentId, error.message)
      throw error
    }
  }
}

/**
 * Example: Subscription Store Integration
 */
export const subscriptionStoreIntegrationExample = {
  // In your subscriptionStore.ts
  activateSubscription: async (planId: string) => {
    const { trackSubscriptionActivated } = useNotificationTracking()
    
    try {
      const response = await apiClient.post('/subscriptions/activate', { planId })
      const subscription = response.data
      
      // Track subscription activation
      await trackSubscriptionActivated(subscription.id, subscription.plan.name)
      
      return subscription
    } catch (error) {
      throw error
    }
  },
  
  upgradePlan: async (subscriptionId: string, newPlanId: string) => {
    const { trackPlanUpgraded } = useNotificationTracking()
    
    try {
      const response = await apiClient.post(`/subscriptions/${subscriptionId}/upgrade`, { 
        newPlanId 
      })
      
      const { oldPlan, newPlan } = response.data
      
      // Track plan upgrade
      await trackPlanUpgraded(subscriptionId, oldPlan.name, newPlan.name)
      
      return response.data
    } catch (error) {
      throw error
    }
  }
}

/**
 * Example: Chat Store Integration
 */
export const chatStoreIntegrationExample = {
  // In your chatStore.ts
  sendMessage: async (conversationId: string, message: string) => {
    try {
      const response = await apiClient.post(`/chat/${conversationId}/messages`, {
        message,
        type: 'text'
      })
      
      // Don't track outgoing messages (only incoming)
      return response.data
    } catch (error) {
      const { trackCustomEvent } = useNotificationTracking()
      await trackCustomEvent({
        type: 'chat',
        subtype: 'messageFailed',
        title: 'Message Failed 😅',
        body: 'Failed to send message. Please check your connection and try again!',
        data: { conversationId, error: error.message }
      })
      throw error
    }
  },
  
  // This would be called when receiving WebSocket message
  handleIncomingMessage: async (message: any) => {
    const { trackNewChatMessage } = useNotificationTracking()
    
    // Track incoming chat message
    await trackNewChatMessage(
      message.senderName,
      message.content,
      message.conversationId
    )
  }
}

/**
 * Example: Component Integration
 */
export const componentIntegrationExample = {
  // In any component
  MyOrderComponent: () => {
    const { 
      trackOrderPlaced,
      trackPaymentSuccess,
      trackSubscriptionActivated 
    } = useNotificationTracking()
    
    const handleOrderSubmit = async (orderData: any) => {
      try {
        // Place order
        const order = await placeOrder(orderData)
        
        // Track order placed (will show funny notification if enabled)
        await trackOrderPlaced(order.id)
        
        // Process payment
        const payment = await processPayment({
          orderId: order.id,
          amount: order.total,
          method: 'UPI'
        })
        
        // Track payment success (will show funny notification if enabled)
        await trackPaymentSuccess(payment.id, payment.amount, 'UPI')
        
      } catch (error) {
        // Error notifications are handled automatically in the stores
        console.error('Order submission failed:', error)
      }
    }
    
    return (
      <TouchableOpacity onPress={handleOrderSubmit}>
        <Text>Place Order</Text>
      </TouchableOpacity>
    )
  }
}

/**
 * Example: WebSocket Event Handlers
 */
export const webSocketIntegrationExample = {
  // In your WebSocket service or component
  setupWebSocketListeners: () => {
    const { 
      trackOrderCooking,
      trackOrderDelivered,
      trackPaymentSuccess,
      trackNewChatMessage,
      trackDiscountOffer
    } = useNotificationTracking()
    
    // Order updates
    socket.on('order_update', async (data) => {
      switch (data.status) {
        case 'cooking':
          await trackOrderCooking(data.orderId)
          break
        case 'delivered':
          await trackOrderDelivered(data.orderId)
          break
        // Add more cases as needed
      }
    })
    
    // Payment updates
    socket.on('payment_update', async (data) => {
      if (data.status === 'success') {
        await trackPaymentSuccess(data.paymentId, data.amount, data.method)
      }
    })
    
    // Chat messages
    socket.on('chat_message', async (data) => {
      await trackNewChatMessage(data.senderName, data.message, data.conversationId)
    })
    
    // Promotional notifications
    socket.on('promotion', async (data) => {
      await trackDiscountOffer(data.title, data.discountPercent, data.code)
    })
  }
}

/**
 * Example: Testing in Development
 */
export const testingExamples = {
  // Test all notification types
  testAllNotifications: async () => {
    const { testAllNotifications } = useNotificationTracking()
    await testAllNotifications()
  },
  
  // Test specific notification
  testOrderFlow: async () => {
    const { 
      trackOrderPlaced,
      trackOrderCooking,
      trackOrderDelivered 
    } = useNotificationTracking()
    
    // Simulate order flow
    await trackOrderPlaced('TEST_001')
    
    setTimeout(async () => {
      await trackOrderCooking('TEST_001')
    }, 3000)
    
    setTimeout(async () => {
      await trackOrderDelivered('TEST_001')
    }, 6000)
  },
  
  // Test user preferences
  testWithPreferences: async () => {
    // User can disable order notifications in settings
    // Then test - notifications won't show
    const { trackOrderPlaced } = useNotificationTracking()
    await trackOrderPlaced('TEST_002')
    // Will be blocked if user disabled order notifications
  }
}

/**
 * Example: Scheduled Notifications
 */
export const scheduledNotificationExamples = {
  // Schedule meal reminder
  scheduleMealReminder: async (mealTime: Date, mealType: string) => {
    await notificationPreferencesService.scheduleNotification({
      type: 'meal',
      subtype: 'mealReminder',
      title: `${mealType} Time! 🍽️`,
      body: `Don't forget your ${mealType.toLowerCase()}! Your stomach is waiting 😋`,
      data: { mealType, scheduled: true }
    }, mealTime)
  },
  
  // Schedule subscription expiry reminder
  scheduleSubscriptionReminder: async (expiryDate: Date, subscriptionId: string) => {
    const reminderDate = new Date(expiryDate.getTime() - 24 * 60 * 60 * 1000) // 1 day before
    
    await notificationPreferencesService.scheduleNotification({
      type: 'subscription',
      subtype: 'subscriptionExpiring',
      title: 'Subscription Expiring Tomorrow! ⏰',
      body: 'Your subscription expires tomorrow! Renew now to avoid missing delicious meals 🍽️',
      data: { subscriptionId, expiryDate: expiryDate.toISOString() }
    }, reminderDate)
  }
}

export default {
  orderStoreIntegrationExample,
  paymentStoreIntegrationExample,
  subscriptionStoreIntegrationExample,
  chatStoreIntegrationExample,
  componentIntegrationExample,
  webSocketIntegrationExample,
  testingExamples,
  scheduledNotificationExamples
}