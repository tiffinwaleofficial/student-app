/**
 * Firebase Notification Hook
 * Easy-to-use React hook for Firebase notifications with funny messages
 * 
 * Features:
 * - Simple API for common notification types
 * - Automatic funny message generation
 * - Context-aware notifications
 * - Integration with existing notification system
 */

import { useCallback } from 'react'
import { firebaseNotificationService } from '@/services/firebaseNotificationService'
import { useTranslation } from 'react-i18next'

export interface UseFirebaseNotificationReturn {
  // Basic notifications
  showSuccess: (title: string, body?: string, data?: any) => void
  showError: (title: string, body?: string, data?: any) => void
  showInfo: (title: string, body?: string, data?: any) => void
  showWarning: (title: string, body?: string, data?: any) => void
  
  // Order notifications
  showOrderPlaced: (orderId?: string, customMessage?: string) => void
  showOrderCooking: (orderId?: string, customMessage?: string) => void
  showOrderDelivery: (orderId?: string, customMessage?: string) => void
  showOrderDelivered: (orderId?: string, customMessage?: string) => void
  
  // Payment notifications
  showPaymentSuccess: (paymentId?: string, customMessage?: string) => void
  showPaymentFailed: (error?: string, customMessage?: string) => void
  
  // Confirmation dialogs
  showConfirmation: (title: string, body: string, onConfirm?: () => void, onCancel?: () => void) => void
  
  // Promotional notifications
  showPromotion: (title: string, body: string, data?: any) => void
  
  // Reminders
  showMealReminder: (data?: any) => void
  showSubscriptionReminder: (data?: any) => void
  
  // Chat notifications
  showChatMessage: (title: string, body: string, data?: any) => void
  
  // Service status
  isReady: () => boolean
}

/**
 * Firebase Notification Hook
 */
export const useFirebaseNotification = (): UseFirebaseNotificationReturn => {
  const { t } = useTranslation()

  // Basic notifications
  const showSuccess = useCallback((title: string, body?: string, data?: any) => {
    firebaseNotificationService.showSuccess({
      title,
      body,
      data
    })
  }, [])

  const showError = useCallback((title: string, body?: string, data?: any) => {
    firebaseNotificationService.showError({
      title,
      body,
      data
    })
  }, [])

  const showInfo = useCallback((title: string, body?: string, data?: any) => {
    firebaseNotificationService.showSuccess({
      title,
      body: body || t('common:notification'),
      data
    })
  }, [t])

  const showWarning = useCallback((title: string, body?: string, data?: any) => {
    firebaseNotificationService.showError({
      title,
      body: body || t('common:warning'),
      data
    })
  }, [t])

  // Order notifications
  const showOrderPlaced = useCallback((orderId?: string, customMessage?: string) => {
    firebaseNotificationService.showOrderUpdate('placed', {
      body: customMessage,
      data: { orderId }
    })
  }, [])

  const showOrderCooking = useCallback((orderId?: string, customMessage?: string) => {
    firebaseNotificationService.showOrderUpdate('cooking', {
      body: customMessage,
      data: { orderId }
    })
  }, [])

  const showOrderDelivery = useCallback((orderId?: string, customMessage?: string) => {
    firebaseNotificationService.showOrderUpdate('delivery', {
      body: customMessage,
      data: { orderId }
    })
  }, [])

  const showOrderDelivered = useCallback((orderId?: string, customMessage?: string) => {
    firebaseNotificationService.showOrderUpdate('delivered', {
      body: customMessage,
      data: { orderId }
    })
  }, [])

  // Payment notifications
  const showPaymentSuccess = useCallback((paymentId?: string, customMessage?: string) => {
    firebaseNotificationService.showPaymentUpdate(true, {
      body: customMessage,
      data: { paymentId }
    })
  }, [])

  const showPaymentFailed = useCallback((error?: string, customMessage?: string) => {
    firebaseNotificationService.showPaymentUpdate(false, {
      body: customMessage || error,
      data: { error }
    })
  }, [])

  // Confirmation dialogs
  const showConfirmation = useCallback((
    title: string, 
    body: string, 
    onConfirm?: () => void, 
    onCancel?: () => void
  ) => {
    firebaseNotificationService.showConfirmation({
      title,
      body,
      onConfirm,
      onCancel
    })
  }, [])

  // Promotional notifications
  const showPromotion = useCallback((title: string, body: string, data?: any) => {
    firebaseNotificationService.showPromotion({
      title,
      body,
      data
    })
  }, [])

  // Reminders
  const showMealReminder = useCallback((data?: any) => {
    firebaseNotificationService.showMealReminder({ data })
  }, [])

  const showSubscriptionReminder = useCallback((data?: any) => {
    firebaseNotificationService.showSubscriptionReminder({ data })
  }, [])

  // Chat notifications
  const showChatMessage = useCallback((title: string, body: string, data?: any) => {
    firebaseNotificationService.showChatMessage({
      title,
      body,
      data
    })
  }, [])

  // Service status
  const isReady = useCallback(() => {
    return firebaseNotificationService.isReady()
  }, [])

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showOrderPlaced,
    showOrderCooking,
    showOrderDelivery,
    showOrderDelivered,
    showPaymentSuccess,
    showPaymentFailed,
    showConfirmation,
    showPromotion,
    showMealReminder,
    showSubscriptionReminder,
    showChatMessage,
    isReady
  }
}

/**
 * Contextual notification hooks for specific use cases
 */

// Authentication notifications
export const useAuthNotifications = () => {
  const { showSuccess, showError, showConfirmation } = useFirebaseNotification()
  const { t } = useTranslation('auth')

  return {
    loginSuccess: () => showSuccess(t('loginSuccess'), t('welcomeBack')),
    loginFailed: (error?: string) => showError(t('loginFailed'), error || t('checkCredentials')),
    signupSuccess: () => showSuccess(t('accountCreated'), t('welcomeToTiffinWale')),
    signupFailed: (error?: string) => showError(t('signupFailed'), error || t('tryAgain')),
    logoutConfirm: (onConfirm: () => void) => showConfirmation(
      t('logoutConfirmation'),
      t('logoutMessage'),
      onConfirm
    )
  }
}

// Order notifications
export const useOrderNotifications = () => {
  const { 
    showOrderPlaced, 
    showOrderCooking, 
    showOrderDelivery, 
    showOrderDelivered,
    showError 
  } = useFirebaseNotification()
  const { t } = useTranslation('orders')

  return {
    orderPlaced: (orderId?: string) => showOrderPlaced(orderId),
    orderCooking: (orderId?: string) => showOrderCooking(orderId),
    orderDelivery: (orderId?: string) => showOrderDelivery(orderId),
    orderDelivered: (orderId?: string) => showOrderDelivered(orderId),
    orderCancelled: (orderId?: string) => showError(t('orderCancelled'), t('orderCancelledMessage')),
    orderFailed: (error?: string) => showError(t('orderFailed'), error || t('orderFailedMessage'))
  }
}

// Payment notifications
export const usePaymentNotifications = () => {
  const { showPaymentSuccess, showPaymentFailed, showInfo } = useFirebaseNotification()
  const { t } = useTranslation('common')

  return {
    paymentSuccess: (paymentId?: string) => showPaymentSuccess(paymentId),
    paymentFailed: (error?: string) => showPaymentFailed(error),
    paymentCancelled: () => showInfo(t('paymentCancelled'), t('paymentCancelledMessage')),
    paymentProcessing: () => showInfo(t('processingPayment'), t('pleaseWait'))
  }
}

// Profile notifications
export const useProfileNotifications = () => {
  const { showSuccess, showError } = useFirebaseNotification()
  const { t } = useTranslation('profile')

  return {
    profileUpdated: () => showSuccess(t('profileUpdated'), t('profileUpdatedMessage')),
    profileUpdateFailed: (error?: string) => showError(t('updateFailed'), error || t('tryAgain')),
    passwordChanged: () => showSuccess(t('passwordChanged'), t('passwordChangedMessage')),
    passwordChangeFailed: (error?: string) => showError(t('passwordChangeFailed'), error || t('tryAgain'))
  }
}

// Subscription notifications
export const useSubscriptionNotifications = () => {
  const { showSuccess, showError, showSubscriptionReminder } = useFirebaseNotification()
  const { t } = useTranslation('subscription')

  return {
    subscriptionActivated: () => showSuccess(t('subscriptionActivated'), t('subscriptionActivatedMessage')),
    subscriptionExpired: () => showError(t('subscriptionExpired'), t('subscriptionExpiredMessage')),
    subscriptionCancelled: () => showSuccess(t('subscriptionCancelled'), t('subscriptionCancelledMessage')),
    subscriptionReminder: () => showSubscriptionReminder()
  }
}

// Chat notifications
export const useChatNotifications = () => {
  const { showSuccess, showError, showChatMessage } = useFirebaseNotification()
  const { t } = useTranslation('common')

  return {
    messageSent: () => showSuccess(t('messageSent'), t('messageSentMessage')),
    messageFailed: () => showError(t('messageFailed'), t('messageFailedMessage')),
    newMessage: (sender: string) => showChatMessage(t('newMessage'), t('newMessageFrom', { sender }))
  }
}

// System notifications
export const useSystemNotifications = () => {
  const { showError, showInfo } = useFirebaseNotification()
  const { t } = useTranslation('errors')

  return {
    networkError: () => showError(t('networkError'), t('checkConnection')),
    serverError: () => showError(t('serverError'), t('serverErrorMessage')),
    maintenanceMode: () => showInfo(t('maintenanceMode'), t('maintenanceModeMessage')),
    updateAvailable: () => showInfo(t('updateAvailable'), t('updateAvailableMessage'))
  }
}

// Validation notifications
export const useValidationNotifications = () => {
  const { showError } = useFirebaseNotification()
  const { t } = useTranslation('validation')

  return {
    requiredField: (fieldName: string) => showError(t('requiredField'), t('fillField', { field: fieldName })),
    invalidEmail: () => showError(t('invalidEmail'), t('enterValidEmail')),
    invalidPhone: () => showError(t('invalidPhone'), t('enterValidPhone')),
    passwordMismatch: () => showError(t('passwordMismatch'), t('passwordsDoNotMatch')),
    weakPassword: () => showError(t('weakPassword'), t('chooseStrongerPassword'))
  }
}

export default useFirebaseNotification