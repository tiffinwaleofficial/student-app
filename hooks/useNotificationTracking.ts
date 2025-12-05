/**
 * Notification Tracking Hook
 * Provides easy-to-use methods for tracking all important events
 * Integrates with notification preferences service
 */

import { useCallback } from 'react'
import { 
  notificationPreferencesService, 
  sendOrderNotification,
  sendPaymentNotification,
  sendSubscriptionNotification,
  sendPromotionNotification,
  sendChatNotification,
  sendSystemNotification,
  NotificationEvent
} from '@/services/notificationPreferencesService'
import { useAuthStore } from '@/store/authStore'

export interface UseNotificationTrackingReturn {
  // Order tracking
  trackOrderPlaced: (orderId: string, customMessage?: string) => Promise<void>
  trackOrderConfirmed: (orderId: string, customMessage?: string) => Promise<void>
  trackOrderPreparing: (orderId: string, customMessage?: string) => Promise<void>
  trackOrderCooking: (orderId: string, customMessage?: string) => Promise<void>
  trackOrderReady: (orderId: string, customMessage?: string) => Promise<void>
  trackOrderOutForDelivery: (orderId: string, deliveryPartner?: string) => Promise<void>
  trackOrderDelivered: (orderId: string, customMessage?: string) => Promise<void>
  trackOrderCancelled: (orderId: string, reason?: string) => Promise<void>
  trackOrderDelayed: (orderId: string, newETA?: string) => Promise<void>
  
  // Payment tracking
  trackPaymentSuccess: (paymentId: string, amount: number, method?: string) => Promise<void>
  trackPaymentFailed: (paymentId: string, reason?: string) => Promise<void>
  trackPaymentPending: (paymentId: string, customMessage?: string) => Promise<void>
  trackRefundCompleted: (refundId: string, amount: number) => Promise<void>
  trackWalletTopup: (amount: number, method?: string) => Promise<void>
  trackSubscriptionPayment: (subscriptionId: string, amount: number) => Promise<void>
  
  // Subscription tracking
  trackSubscriptionActivated: (subscriptionId: string, planName: string) => Promise<void>
  trackSubscriptionExpiring: (subscriptionId: string, daysLeft: number) => Promise<void>
  trackSubscriptionExpired: (subscriptionId: string) => Promise<void>
  trackSubscriptionRenewed: (subscriptionId: string, planName: string) => Promise<void>
  trackSubscriptionCancelled: (subscriptionId: string, reason?: string) => Promise<void>
  trackPlanUpgraded: (subscriptionId: string, oldPlan: string, newPlan: string) => Promise<void>
  
  // Meal tracking
  trackMealReminder: (mealType: string, time: string) => Promise<void>
  trackMealReady: (mealId: string, restaurantName: string) => Promise<void>
  trackNewMenuItems: (restaurantName: string, itemCount: number) => Promise<void>
  trackChefSpecial: (restaurantName: string, specialName: string) => Promise<void>
  trackNutritionTip: (tip: string) => Promise<void>
  
  // Promotion tracking
  trackDiscountOffer: (title: string, discount: number, code?: string) => Promise<void>
  trackFlashSale: (title: string, discount: number, timeLeft: string) => Promise<void>
  trackSeasonalOffer: (title: string, description: string) => Promise<void>
  trackReferralReward: (amount: number, friendName?: string) => Promise<void>
  trackLoyaltyPoints: (points: number, action: string) => Promise<void>
  trackNewRestaurant: (restaurantName: string, cuisine: string) => Promise<void>
  
  // Chat tracking
  trackNewChatMessage: (senderName: string, preview: string, conversationId: string) => Promise<void>
  trackSupportReply: (message: string, ticketId?: string) => Promise<void>
  trackRestaurantMessage: (restaurantName: string, message: string) => Promise<void>
  trackDeliveryUpdate: (message: string, orderId: string) => Promise<void>
  
  // System tracking
  trackAppUpdate: (version: string, features: string[]) => Promise<void>
  trackMaintenanceAlert: (startTime: string, duration: string) => Promise<void>
  trackSecurityAlert: (message: string, action?: string) => Promise<void>
  trackServiceAnnouncement: (title: string, message: string) => Promise<void>
  
  // Delivery tracking
  trackDeliveryPartnerAssigned: (partnerName: string, orderId: string) => Promise<void>
  trackDeliveryPartnerNearby: (partnerName: string, eta: string) => Promise<void>
  trackDeliveryCompleted: (orderId: string, rating?: number) => Promise<void>
  
  // Custom tracking
  trackCustomEvent: (event: NotificationEvent) => Promise<void>
  
  // Batch tracking
  trackMultipleEvents: (events: NotificationEvent[]) => Promise<void>
  
  // Testing
  testAllNotifications: () => Promise<void>
}

/**
 * Notification Tracking Hook
 */
export const useNotificationTracking = (): UseNotificationTrackingReturn => {
  const { user } = useAuthStore()

  // Helper to get current user ID
  const getCurrentUserId = useCallback(() => user?.id, [user])

  // Order tracking methods
  const trackOrderPlaced = useCallback(async (orderId: string, customMessage?: string) => {
    await sendOrderNotification(
      'orderPlaced',
      'Order Placed Successfully! 🎉',
      customMessage || 'Your tiffin order has been placed! Get ready for some delicious food 🍽️',
      { orderId, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackOrderConfirmed = useCallback(async (orderId: string, customMessage?: string) => {
    await sendOrderNotification(
      'orderConfirmed',
      'Order Confirmed! ✅',
      customMessage || 'Great news! Your order has been confirmed by the restaurant 🏪',
      { orderId, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackOrderPreparing = useCallback(async (orderId: string, customMessage?: string) => {
    await sendOrderNotification(
      'orderPreparing',
      'Order Being Prepared! 👨‍🍳',
      customMessage || 'Your meal preparation has started! The chef is working their magic ✨',
      { orderId, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackOrderCooking = useCallback(async (orderId: string, customMessage?: string) => {
    await sendOrderNotification(
      'orderCooking',
      'Cooking in Progress! 🔥',
      customMessage || 'Your delicious meal is being cooked with love and care 💕',
      { orderId, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackOrderReady = useCallback(async (orderId: string, customMessage?: string) => {
    await sendOrderNotification(
      'orderReady',
      'Order Ready! 🍽️',
      customMessage || 'Your meal is ready and looking absolutely delicious! 😋',
      { orderId, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackOrderOutForDelivery = useCallback(async (orderId: string, deliveryPartner?: string) => {
    await sendOrderNotification(
      'orderOutForDelivery',
      'Out for Delivery! 🏃‍♂️',
      deliveryPartner 
        ? `${deliveryPartner} is on the way with your order! Track them in real-time 📍`
        : 'Your order is out for delivery! It will reach you soon 🚚',
      { orderId, deliveryPartner, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackOrderDelivered = useCallback(async (orderId: string, customMessage?: string) => {
    await sendOrderNotification(
      'orderDelivered',
      'Order Delivered! 🎊',
      customMessage || 'Your delicious meal has arrived! Enjoy your food and don\'t forget to rate us ⭐',
      { orderId, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackOrderCancelled = useCallback(async (orderId: string, reason?: string) => {
    await sendOrderNotification(
      'orderCancelled',
      'Order Cancelled 😔',
      reason 
        ? `Your order was cancelled: ${reason}. Don't worry, you can place a new order anytime!`
        : 'Your order has been cancelled. No worries, there are plenty more delicious options! 🍽️',
      { orderId, reason, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackOrderDelayed = useCallback(async (orderId: string, newETA?: string) => {
    await sendOrderNotification(
      'orderDelayed',
      'Order Delayed ⏰',
      newETA 
        ? `Your order is running a bit late. New estimated time: ${newETA}. Thanks for your patience! 🙏`
        : 'Your order is taking a bit longer than expected. Good food takes time! ⏳',
      { orderId, newETA, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  // Payment tracking methods
  const trackPaymentSuccess = useCallback(async (paymentId: string, amount: number, method?: string) => {
    await sendPaymentNotification(
      'paymentSuccess',
      'Payment Successful! 💳',
      `Payment of ₹${amount} completed successfully${method ? ` via ${method}` : ''}! Your order is confirmed 🎉`,
      { paymentId, amount, method, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackPaymentFailed = useCallback(async (paymentId: string, reason?: string) => {
    await sendPaymentNotification(
      'paymentFailed',
      'Payment Failed 😅',
      reason 
        ? `Payment failed: ${reason}. Please try again with a different payment method 💳`
        : 'Payment failed! Don\'t worry, you can try again. We\'re here to help! 🤝',
      { paymentId, reason, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackPaymentPending = useCallback(async (paymentId: string, customMessage?: string) => {
    await sendPaymentNotification(
      'paymentPending',
      'Payment Processing ⏳',
      customMessage || 'Your payment is being processed. Please wait a moment... 💫',
      { paymentId, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackRefundCompleted = useCallback(async (refundId: string, amount: number) => {
    await sendPaymentNotification(
      'refundCompleted',
      'Refund Completed! 💰',
      `Your refund of ₹${amount} has been processed successfully! It will reflect in your account soon 🏦`,
      { refundId, amount, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackWalletTopup = useCallback(async (amount: number, method?: string) => {
    await sendPaymentNotification(
      'walletTopup',
      'Wallet Topped Up! 💵',
      `₹${amount} has been added to your wallet${method ? ` via ${method}` : ''}! Ready for your next order 🛒`,
      { amount, method, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackSubscriptionPayment = useCallback(async (subscriptionId: string, amount: number) => {
    await sendPaymentNotification(
      'subscriptionPayment',
      'Subscription Payment! 📅',
      `Your subscription payment of ₹${amount} has been processed successfully! Enjoy your meals 🍽️`,
      { subscriptionId, amount, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  // Subscription tracking methods
  const trackSubscriptionActivated = useCallback(async (subscriptionId: string, planName: string) => {
    await sendSubscriptionNotification(
      'subscriptionActivated',
      'Subscription Activated! 🎉',
      `Your ${planName} subscription is now active! Get ready for regular delicious meals 📅`,
      { subscriptionId, planName, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackSubscriptionExpiring = useCallback(async (subscriptionId: string, daysLeft: number) => {
    await sendSubscriptionNotification(
      'subscriptionExpiring',
      'Subscription Expiring Soon! ⏰',
      `Your subscription expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}! Renew now to continue enjoying your meals 🔄`,
      { subscriptionId, daysLeft, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackSubscriptionExpired = useCallback(async (subscriptionId: string) => {
    await sendSubscriptionNotification(
      'subscriptionExpired',
      'Subscription Expired 😔',
      'Your subscription has expired. Renew now to continue getting delicious meals delivered! 📱',
      { subscriptionId, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackSubscriptionRenewed = useCallback(async (subscriptionId: string, planName: string) => {
    await sendSubscriptionNotification(
      'subscriptionRenewed',
      'Subscription Renewed! 🔄',
      `Your ${planName} subscription has been renewed successfully! More delicious meals coming your way 🍽️`,
      { subscriptionId, planName, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackSubscriptionCancelled = useCallback(async (subscriptionId: string, reason?: string) => {
    await sendSubscriptionNotification(
      'subscriptionCancelled',
      'Subscription Cancelled 👋',
      reason 
        ? `Your subscription was cancelled: ${reason}. We hope to serve you again soon!`
        : 'Your subscription has been cancelled. We hope to serve you again soon! 💔',
      { subscriptionId, reason, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackPlanUpgraded = useCallback(async (subscriptionId: string, oldPlan: string, newPlan: string) => {
    await sendSubscriptionNotification(
      'planUpgraded',
      'Plan Upgraded! ⬆️',
      `Congratulations! You've upgraded from ${oldPlan} to ${newPlan}. Enjoy more delicious options! 🌟`,
      { subscriptionId, oldPlan, newPlan, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  // Promotion tracking methods
  const trackDiscountOffer = useCallback(async (title: string, discount: number, code?: string) => {
    await sendPromotionNotification(
      title,
      `Get ${discount}% off on your next order${code ? ` with code ${code}` : ''}! Limited time offer 🏃‍♂️`,
      { discount, code, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackFlashSale = useCallback(async (title: string, discount: number, timeLeft: string) => {
    await sendPromotionNotification(
      `⚡ Flash Sale: ${title}`,
      `${discount}% off for the next ${timeLeft}! Hurry, this deal won't last long! ⏰`,
      { discount, timeLeft, flashSale: true, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackSeasonalOffer = useCallback(async (title: string, description: string) => {
    await sendPromotionNotification(
      `🎊 ${title}`,
      description,
      { seasonal: true, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackReferralReward = useCallback(async (amount: number, friendName?: string) => {
    await sendPromotionNotification(
      'Referral Reward Earned! 🎁',
      friendName 
        ? `You earned ₹${amount} for referring ${friendName}! Thanks for spreading the love 💕`
        : `You earned ₹${amount} from your referral! Keep sharing and earning 💰`,
      { amount, friendName, referral: true, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackLoyaltyPoints = useCallback(async (points: number, action: string) => {
    await sendPromotionNotification(
      'Loyalty Points Earned! ⭐',
      `You earned ${points} loyalty points for ${action}! Keep collecting to unlock rewards 🏆`,
      { points, action, loyalty: true, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackNewRestaurant = useCallback(async (restaurantName: string, cuisine: string) => {
    await sendPromotionNotification(
      'New Restaurant Alert! 🏪',
      `${restaurantName} is now available on TiffinWale! Try their delicious ${cuisine} cuisine 🍽️`,
      { restaurantName, cuisine, newRestaurant: true, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  // Chat tracking methods
  const trackNewChatMessage = useCallback(async (senderName: string, preview: string, conversationId: string) => {
    await sendChatNotification(
      `💬 ${senderName}`,
      preview.length > 50 ? `${preview.substring(0, 50)}...` : preview,
      { senderName, conversationId, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackSupportReply = useCallback(async (message: string, ticketId?: string) => {
    await sendChatNotification(
      'Support Team Reply 🎧',
      message.length > 100 ? `${message.substring(0, 100)}...` : message,
      { ticketId, support: true, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackRestaurantMessage = useCallback(async (restaurantName: string, message: string) => {
    await sendChatNotification(
      `🏪 ${restaurantName}`,
      message,
      { restaurantName, restaurant: true, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackDeliveryUpdate = useCallback(async (message: string, orderId: string) => {
    await sendChatNotification(
      'Delivery Update 🚚',
      message,
      { orderId, delivery: true, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  // System tracking methods
  const trackAppUpdate = useCallback(async (version: string, features: string[]) => {
    await sendSystemNotification(
      'appUpdates',
      'App Update Available! 📱',
      `Version ${version} is now available with ${features.length} new feature${features.length > 1 ? 's' : ''}! Update now for the best experience 🚀`,
      { version, features, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackMaintenanceAlert = useCallback(async (startTime: string, duration: string) => {
    await sendSystemNotification(
      'maintenanceAlerts',
      'Scheduled Maintenance 🔧',
      `We'll be performing maintenance from ${startTime} for ${duration}. The app may be temporarily unavailable ⏰`,
      { startTime, duration, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackSecurityAlert = useCallback(async (message: string, action?: string) => {
    await sendSystemNotification(
      'securityAlerts',
      'Security Alert 🔒',
      action ? `${message} ${action}` : message,
      { action, security: true, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  const trackServiceAnnouncement = useCallback(async (title: string, message: string) => {
    await sendSystemNotification(
      'serviceAnnouncements',
      title,
      message,
      { announcement: true, userId: getCurrentUserId() }
    )
  }, [getCurrentUserId])

  // Delivery tracking methods
  const trackDeliveryPartnerAssigned = useCallback(async (partnerName: string, orderId: string) => {
    await notificationPreferencesService.sendNotification({
      type: 'delivery',
      subtype: 'deliveryPartnerAssigned',
      title: 'Delivery Partner Assigned! 🏃‍♂️',
      body: `${partnerName} will deliver your order! You can track them in real-time 📍`,
      data: { partnerName, orderId, userId: getCurrentUserId() },
      priority: 'normal'
    })
  }, [getCurrentUserId])

  const trackDeliveryPartnerNearby = useCallback(async (partnerName: string, eta: string) => {
    await notificationPreferencesService.sendNotification({
      type: 'delivery',
      subtype: 'deliveryPartnerNearby',
      title: 'Delivery Partner Nearby! 📍',
      body: `${partnerName} is nearby and will reach you in ${eta}! Get ready to receive your order 🎉`,
      data: { partnerName, eta, userId: getCurrentUserId() },
      priority: 'high'
    })
  }, [getCurrentUserId])

  const trackDeliveryCompleted = useCallback(async (orderId: string, rating?: number) => {
    await notificationPreferencesService.sendNotification({
      type: 'delivery',
      subtype: 'deliveryCompleted',
      title: 'Delivery Completed! 🎊',
      body: rating 
        ? `Your order has been delivered! Thanks for rating us ${rating} star${rating > 1 ? 's' : ''} ⭐`
        : 'Your order has been delivered successfully! Don\'t forget to rate your experience 📝',
      data: { orderId, rating, userId: getCurrentUserId() },
      priority: 'high'
    })
  }, [getCurrentUserId])

  // Custom tracking
  const trackCustomEvent = useCallback(async (event: NotificationEvent) => {
    await notificationPreferencesService.sendNotification({
      ...event,
      userId: event.userId || getCurrentUserId()
    })
  }, [getCurrentUserId])

  // Batch tracking
  const trackMultipleEvents = useCallback(async (events: NotificationEvent[]) => {
    const eventsWithUserId = events.map(event => ({
      ...event,
      userId: event.userId || getCurrentUserId()
    }))
    
    await notificationPreferencesService.sendBulkNotifications(eventsWithUserId)
  }, [getCurrentUserId])

  // Testing
  const testAllNotifications = useCallback(async () => {
    console.log('🧪 Testing all notification types...')
    
    const testEvents = [
      // Order notifications
      () => trackOrderPlaced('TEST_001', 'Test order placed notification'),
      () => trackOrderCooking('TEST_001', 'Test cooking notification'),
      () => trackOrderDelivered('TEST_001', 'Test delivery notification'),
      
      // Payment notifications
      () => trackPaymentSuccess('PAY_001', 299, 'UPI'),
      () => trackWalletTopup(500, 'Credit Card'),
      
      // Subscription notifications
      () => trackSubscriptionActivated('SUB_001', 'Premium Plan'),
      () => trackSubscriptionExpiring('SUB_001', 3),
      
      // Promotion notifications
      () => trackDiscountOffer('Weekend Special', 25, 'WEEKEND25'),
      () => trackFlashSale('Flash Sale', 50, '2 hours'),
      
      // Chat notifications
      () => trackNewChatMessage('Support Team', 'How can we help you today?', 'CHAT_001'),
      
      // System notifications
      () => trackServiceAnnouncement('New Feature', 'We\'ve added real-time order tracking!'),
    ]
    
    for (let i = 0; i < testEvents.length; i++) {
      setTimeout(() => {
        testEvents[i]()
        console.log(`🧪 Test notification ${i + 1}/${testEvents.length} sent`)
      }, i * 1500)
    }
  }, [
    trackOrderPlaced, trackOrderCooking, trackOrderDelivered,
    trackPaymentSuccess, trackWalletTopup,
    trackSubscriptionActivated, trackSubscriptionExpiring,
    trackDiscountOffer, trackFlashSale,
    trackNewChatMessage, trackServiceAnnouncement
  ])

  return {
    // Order tracking
    trackOrderPlaced,
    trackOrderConfirmed,
    trackOrderPreparing,
    trackOrderCooking,
    trackOrderReady,
    trackOrderOutForDelivery,
    trackOrderDelivered,
    trackOrderCancelled,
    trackOrderDelayed,
    
    // Payment tracking
    trackPaymentSuccess,
    trackPaymentFailed,
    trackPaymentPending,
    trackRefundCompleted,
    trackWalletTopup,
    trackSubscriptionPayment,
    
    // Subscription tracking
    trackSubscriptionActivated,
    trackSubscriptionExpiring,
    trackSubscriptionExpired,
    trackSubscriptionRenewed,
    trackSubscriptionCancelled,
    trackPlanUpgraded,
    
    // Meal tracking
    trackMealReminder: useCallback(async (mealType: string, time: string) => {
      await notificationPreferencesService.sendNotification({
        type: 'meal',
        subtype: 'mealReminder',
        title: `${mealType} Reminder! 🔔`,
        body: `It's time for your ${mealType.toLowerCase()} at ${time}! Don't forget to eat 🍽️`,
        data: { mealType, time, userId: getCurrentUserId() },
        priority: 'normal'
      })
    }, [getCurrentUserId]),
    
    trackMealReady: useCallback(async (mealId: string, restaurantName: string) => {
      await notificationPreferencesService.sendNotification({
        type: 'meal',
        subtype: 'mealReady',
        title: 'Meal Ready! 🍽️',
        body: `Your meal from ${restaurantName} is ready for pickup/delivery! 😋`,
        data: { mealId, restaurantName, userId: getCurrentUserId() },
        priority: 'high'
      })
    }, [getCurrentUserId]),
    
    trackNewMenuItems: useCallback(async (restaurantName: string, itemCount: number) => {
      await notificationPreferencesService.sendNotification({
        type: 'meal',
        subtype: 'newMenuItems',
        title: 'New Menu Items! 🆕',
        body: `${restaurantName} has added ${itemCount} new delicious item${itemCount > 1 ? 's' : ''} to their menu! 🍽️`,
        data: { restaurantName, itemCount, userId: getCurrentUserId() },
        priority: 'normal'
      })
    }, [getCurrentUserId]),
    
    trackChefSpecial: useCallback(async (restaurantName: string, specialName: string) => {
      await notificationPreferencesService.sendNotification({
        type: 'meal',
        subtype: 'chefSpecial',
        title: 'Chef Special Available! 👨‍🍳',
        body: `${restaurantName} has a special dish today: ${specialName}! Limited quantity available 🌟`,
        data: { restaurantName, specialName, userId: getCurrentUserId() },
        priority: 'normal'
      })
    }, [getCurrentUserId]),
    
    trackNutritionTip: useCallback(async (tip: string) => {
      await notificationPreferencesService.sendNotification({
        type: 'meal',
        subtype: 'nutritionTips',
        title: 'Nutrition Tip! 🥗',
        body: tip,
        data: { tip, userId: getCurrentUserId() },
        priority: 'low'
      })
    }, [getCurrentUserId]),
    
    // Promotion tracking
    trackDiscountOffer,
    trackFlashSale,
    trackSeasonalOffer,
    trackReferralReward,
    trackLoyaltyPoints,
    trackNewRestaurant,
    
    // Chat tracking
    trackNewChatMessage,
    trackSupportReply,
    trackRestaurantMessage,
    trackDeliveryUpdate,
    
    // System tracking
    trackAppUpdate,
    trackMaintenanceAlert,
    trackSecurityAlert,
    trackServiceAnnouncement,
    
    // Delivery tracking
    trackDeliveryPartnerAssigned,
    trackDeliveryPartnerNearby,
    trackDeliveryCompleted,
    
    // Custom tracking
    trackCustomEvent,
    trackMultipleEvents,
    
    // Testing
    testAllNotifications,
  }
}

export default useNotificationTracking