/**
 * Smart Alert Replacement Utility
 * Replaces React Native Alert.alert with Firebase notifications
 * 
 * Features:
 * - Drop-in replacement for Alert.alert
 * - Automatic funny message generation
 * - Context-aware notifications
 * - Cross-platform compatibility
 */

import { Alert } from 'react-native'
import { firebaseNotificationService } from '@/services/firebaseNotificationService'

export interface AlertButton {
  text?: string
  onPress?: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

export interface AlertOptions {
  cancelable?: boolean
  onDismiss?: () => void
}

/**
 * Smart Alert class - Drop-in replacement for Alert.alert
 */
export class SmartAlert {
  /**
   * Show alert with Firebase notification
   * Drop-in replacement for Alert.alert()
   */
  static alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ): void {
    // Detect alert type based on title and message
    const alertType = this.detectAlertType(title, message)
    
    // If it's a simple success/error/info message, use Firebase notification
    if (!buttons || buttons.length <= 1) {
      this.showSimpleNotification(alertType, title, message, buttons?.[0])
      return
    }
    
    // If it has multiple buttons, show confirmation dialog
    this.showConfirmationDialog(title, message, buttons, options)
  }

  /**
   * Detect alert type from title and message
   */
  private static detectAlertType(title: string, message?: string): 'success' | 'error' | 'warning' | 'info' {
    const titleLower = title.toLowerCase()
    const messageLower = message?.toLowerCase() || ''
    
    // Success indicators
    if (titleLower.includes('success') || 
        titleLower.includes('completed') || 
        titleLower.includes('done') ||
        titleLower.includes('placed') ||
        titleLower.includes('sent') ||
        messageLower.includes('successfully') ||
        messageLower.includes('completed')) {
      return 'success'
    }
    
    // Error indicators
    if (titleLower.includes('error') || 
        titleLower.includes('failed') || 
        titleLower.includes('oops') ||
        titleLower.includes('wrong') ||
        messageLower.includes('failed') ||
        messageLower.includes('error') ||
        messageLower.includes('wrong')) {
      return 'error'
    }
    
    // Warning indicators
    if (titleLower.includes('warning') || 
        titleLower.includes('confirm') || 
        titleLower.includes('delete') ||
        titleLower.includes('remove') ||
        titleLower.includes('sure') ||
        messageLower.includes('sure') ||
        messageLower.includes('delete') ||
        messageLower.includes('cannot be undone')) {
      return 'warning'
    }
    
    // Default to info
    return 'info'
  }

  /**
   * Show simple notification (no buttons or single OK button)
   */
  private static showSimpleNotification(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string,
    button?: AlertButton
  ): void {
    switch (type) {
      case 'success':
        firebaseNotificationService.showSuccess({
          title,
          body: message,
          data: { originalTitle: title, originalMessage: message }
        })
        break
        
      case 'error':
        firebaseNotificationService.showError({
          title,
          body: message,
          data: { originalTitle: title, originalMessage: message }
        })
        break
        
      case 'warning':
      case 'info':
      default:
        // Use existing notification service for info/warning
        firebaseNotificationService.showSuccess({
          title,
          body: message || 'Notification',
          data: { originalTitle: title, originalMessage: message }
        })
        break
    }
    
    // Execute button callback if provided
    if (button?.onPress) {
      setTimeout(button.onPress, 100)
    }
  }

  /**
   * Show confirmation dialog with multiple buttons
   */
  private static showConfirmationDialog(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ): void {
    if (!buttons || buttons.length === 0) return
    
    // Find confirm and cancel buttons
    const cancelButton = buttons.find(btn => btn.style === 'cancel')
    const confirmButton = buttons.find(btn => btn.style === 'destructive') || buttons.find(btn => btn.style === 'default')
    
    firebaseNotificationService.showConfirmation({
      title,
      body: message || '',
      onConfirm: confirmButton?.onPress,
      onCancel: cancelButton?.onPress || options?.onDismiss,
      data: { originalTitle: title, originalMessage: message }
    })
  }

  /**
   * Show order-related alert with funny messages
   */
  static orderAlert(
    status: 'placed' | 'cooking' | 'delivery' | 'delivered',
    orderId?: string,
    customMessage?: string
  ): void {
    firebaseNotificationService.showOrderUpdate(status, {
      body: customMessage,
      data: { orderId }
    })
  }

  /**
   * Show payment-related alert with funny messages
   */
  static paymentAlert(
    success: boolean,
    paymentId?: string,
    customMessage?: string
  ): void {
    firebaseNotificationService.showPaymentUpdate(success, {
      body: customMessage,
      data: { paymentId }
    })
  }

  /**
   * Show promotional alert with funny messages
   */
  static promotionAlert(
    title: string,
    message: string,
    promotionId?: string
  ): void {
    firebaseNotificationService.showPromotion({
      title,
      body: message,
      data: { promotionId }
    })
  }

  /**
   * Show chat-related alert
   */
  static chatAlert(
    title: string,
    message: string,
    conversationId?: string
  ): void {
    firebaseNotificationService.showChatMessage({
      title,
      body: message,
      data: { conversationId }
    })
  }

  /**
   * Fallback to native Alert for critical system messages
   */
  static nativeAlert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ): void {
    Alert.alert(title, message, buttons, options)
  }
}

/**
 * Context-aware alert helpers
 */
export class ContextualAlert {
  /**
   * Authentication-related alerts
   */
  static auth = {
    loginSuccess: () => SmartAlert.alert('Login Successful!', 'Welcome back! Ready for some delicious tiffins? 🍱'),
    loginFailed: (error?: string) => SmartAlert.alert('Login Failed', error || 'Please check your credentials and try again'),
    signupSuccess: () => SmartAlert.alert('Account Created!', 'Welcome to TiffinWale! Your taste buds are in for a treat 🎉'),
    signupFailed: (error?: string) => SmartAlert.alert('Signup Failed', error || 'Please try again'),
    logoutConfirm: (onConfirm: () => void) => SmartAlert.alert(
      'Logout Confirmation',
      'Are you sure you want to logout? Your tiffins will miss you! 😢',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onConfirm }
      ]
    )
  }

  /**
   * Order-related alerts
   */
  static order = {
    placed: (orderId?: string) => SmartAlert.orderAlert('placed', orderId),
    cooking: (orderId?: string) => SmartAlert.orderAlert('cooking', orderId),
    delivery: (orderId?: string) => SmartAlert.orderAlert('delivery', orderId),
    delivered: (orderId?: string) => SmartAlert.orderAlert('delivered', orderId),
    cancelled: (orderId?: string) => SmartAlert.alert('Order Cancelled', 'Your order has been cancelled. No worries, there are plenty more delicious options! 🍽️'),
    failed: (error?: string) => SmartAlert.alert('Order Failed', error || 'Something went wrong with your order. Our chefs are investigating! 👨‍🍳')
  }

  /**
   * Payment-related alerts
   */
  static payment = {
    success: (paymentId?: string) => SmartAlert.paymentAlert(true, paymentId),
    failed: (error?: string) => SmartAlert.paymentAlert(false, undefined, error),
    cancelled: () => SmartAlert.alert('Payment Cancelled', 'Payment was cancelled. Your wallet is safe for now! 💸'),
    processing: () => SmartAlert.alert('Processing Payment', 'Please wait while we process your payment... 💳')
  }

  /**
   * Profile-related alerts
   */
  static profile = {
    updateSuccess: () => SmartAlert.alert('Profile Updated!', 'Your profile has been updated successfully! Looking good! ✨'),
    updateFailed: (error?: string) => SmartAlert.alert('Update Failed', error || 'Failed to update profile. Please try again'),
    passwordChanged: () => SmartAlert.alert('Password Changed!', 'Your password has been updated successfully! Your account is now more secure 🔒'),
    passwordFailed: (error?: string) => SmartAlert.alert('Password Change Failed', error || 'Failed to change password. Please try again')
  }

  /**
   * Subscription-related alerts
   */
  static subscription = {
    activated: () => SmartAlert.alert('Subscription Activated!', 'Your meal subscription is now active! Get ready for regular deliciousness 📅'),
    expired: () => SmartAlert.alert('Subscription Expired', 'Your subscription has expired. Time to renew and keep the good food coming! ⏰'),
    cancelled: () => SmartAlert.alert('Subscription Cancelled', 'Your subscription has been cancelled. We hope to serve you again soon! 👋'),
    reminder: () => firebaseNotificationService.showSubscriptionReminder()
  }

  /**
   * Chat-related alerts
   */
  static chat = {
    messageSent: () => SmartAlert.alert('Message Sent!', 'Your message has been delivered! 📨'),
    messageFailed: () => SmartAlert.alert('Message Failed', 'Failed to send message. Please check your connection and try again 📶'),
    newMessage: (sender: string) => SmartAlert.chatAlert('New Message', `You have a new message from ${sender}`)
  }

  /**
   * System-related alerts
   */
  static system = {
    networkError: () => SmartAlert.alert('Network Error', 'Please check your internet connection and try again 📶'),
    serverError: () => SmartAlert.alert('Server Error', 'Our servers are having a moment. Please try again later ⚙️'),
    maintenanceMode: () => SmartAlert.alert('Maintenance Mode', 'We are currently under maintenance. We will be back shortly! 🔧'),
    updateAvailable: () => SmartAlert.alert('Update Available', 'A new version of the app is available. Update for the best experience! 📱')
  }

  /**
   * Validation-related alerts
   */
  static validation = {
    requiredField: (fieldName: string) => SmartAlert.alert('Required Field', `Please fill in the ${fieldName} field`),
    invalidEmail: () => SmartAlert.alert('Invalid Email', 'Please enter a valid email address 📧'),
    invalidPhone: () => SmartAlert.alert('Invalid Phone', 'Please enter a valid phone number 📱'),
    passwordMismatch: () => SmartAlert.alert('Password Mismatch', 'Passwords do not match. Please try again 🔑'),
    weakPassword: () => SmartAlert.alert('Weak Password', 'Please choose a stronger password with at least 8 characters 💪')
  }
}

// Export the main SmartAlert as default
export default SmartAlert

// Export convenience functions
export const alert = SmartAlert.alert
export const orderAlert = SmartAlert.orderAlert
export const paymentAlert = SmartAlert.paymentAlert
export const promotionAlert = SmartAlert.promotionAlert
export const chatAlert = SmartAlert.chatAlert

// Export contextual alerts
export const authAlert = ContextualAlert.auth
export const orderAlerts = ContextualAlert.order
export const paymentAlerts = ContextualAlert.payment
export const profileAlerts = ContextualAlert.profile
export const subscriptionAlerts = ContextualAlert.subscription
export const chatAlerts = ContextualAlert.chat
export const systemAlerts = ContextualAlert.system
export const validationAlerts = ContextualAlert.validation