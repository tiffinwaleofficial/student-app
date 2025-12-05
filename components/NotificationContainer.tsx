/**
 * TiffinWale Notification Container
 * Main container component that renders all notification types
 * 
 * Features:
 * - Multiple notification types (Toast, Modal, Banner)
 * - Provider-based architecture
 * - Real-time updates
 * - Queue management
 * - Animation coordination
 * - Accessibility support
 */

import React, { useEffect, useState, useCallback } from 'react'
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { notificationService, NotificationData } from '../services/notificationService'
import { useNotificationStore } from '../store/notificationStore'
import { ToastNotification } from '../services/providers/ToastProvider'
import { ModalNotification } from '../services/providers/ModalProvider'
import BannerNotification from '../components/BannerNotification'

interface NotificationContainerProps {
  children?: React.ReactNode
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ children }) => {
  const insets = useSafeAreaInsets()
  const store = useNotificationStore()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize notification service
  useEffect(() => {
    const initializeService = async () => {
      try {
        if (!notificationService.isReady()) {
          await notificationService.initialize()
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Failed to initialize notification service:', error)
        store.setError('Failed to initialize notifications')
      }
    }

    initializeService()
  }, [])

  // Listen to notification service events
  useEffect(() => {
    if (!isInitialized) return

    const handleNotificationShown = (notification: NotificationData) => {
      store.addNotification(notification)
    }

    const handleNotificationHidden = ({ id }: { id: string }) => {
      store.removeNotification(id)
    }

    const handleNotificationsCleared = () => {
      store.clearNotifications()
    }

    const handleConfigUpdated = (config: any) => {
      store.setConfig(config)
    }

    notificationService.on('notification_shown', handleNotificationShown)
    notificationService.on('notification_hidden', handleNotificationHidden)
    notificationService.on('notifications_cleared', handleNotificationsCleared)
    notificationService.on('config_updated', handleConfigUpdated)

    return () => {
      notificationService.off('notification_shown', handleNotificationShown)
      notificationService.off('notification_hidden', handleNotificationHidden)
      notificationService.off('notifications_cleared', handleNotificationsCleared)
      notificationService.off('config_updated', handleConfigUpdated)
    }
  }, [isInitialized, store])

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - refresh notifications if needed
        console.log('App active - notification container ready')
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background - clean up if needed
        console.log('App backgrounded - pausing notification updates')
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => subscription?.remove()
  }, [])

  // Handle notification dismissal
  const handleNotificationDismiss = useCallback((id: string) => {
    notificationService.hide(id)
    store.markAsDismissed(id)
  }, [store])

  // Handle notification press
  const handleNotificationPress = useCallback((notification: NotificationData) => {
    // Mark as opened
    store.markAsOpened(notification.id!)
    store.markAsRead(notification.id!)
    
    // Handle navigation if needed
    if (notification.data?.type) {
      notificationService.emit('navigate', notification.data)
    }
  }, [store])

  // Handle action press
  const handleActionPress = useCallback((actionId: string, notification: NotificationData) => {
    // Find and execute the action
    const action = notification.actions?.find(a => a.id === actionId)
    if (action) {
      action.action()
    }
    
    // Mark as interacted
    store.markAsOpened(notification.id!)
  }, [store])

  // Get configuration
  const config = store.config || notificationService.getConfig()

  // Separate notifications by type
  const toastNotifications = store.notifications.filter(n => n.type === 'toast')
  const modalNotifications = store.notifications.filter(n => n.type === 'modal')
  const bannerNotifications = store.notifications.filter(n => n.type === 'banner')

  if (!isInitialized) {
    return null
  }

  return (
    <>
      {children}
      
      {/* Toast Notifications */}
      <View style={[styles.toastContainer, { top: insets.top }]} pointerEvents="box-none">
        {toastNotifications.map((notification, index) => (
          <View
            key={notification.id}
            style={[
              styles.toastWrapper,
              { zIndex: 1000 + index }
            ]}
          >
            <ToastNotification
              notification={notification}
              config={config}
              onDismiss={handleNotificationDismiss}
              onPress={handleNotificationPress}
            />
          </View>
        ))}
      </View>

      {/* Banner Notifications */}
      <View style={[styles.bannerContainer, { top: insets.top }]} pointerEvents="box-none">
        {bannerNotifications.map((notification, index) => (
          <View
            key={notification.id}
            style={[
              styles.bannerWrapper,
              { zIndex: 900 + index }
            ]}
          >
            <BannerNotification
              notification={notification}
              config={config}
              onDismiss={handleNotificationDismiss}
              onPress={handleNotificationPress}
              onActionPress={handleActionPress}
            />
          </View>
        ))}
      </View>

      {/* Modal Notifications */}
      {modalNotifications.map((notification, index) => (
        <View
          key={notification.id}
          style={[
            StyleSheet.absoluteFill,
            { zIndex: 2000 + index }
          ]}
        >
          <ModalNotification
            notification={notification}
            config={config}
            onDismiss={handleNotificationDismiss}
            onActionPress={handleActionPress}
          />
        </View>
      ))}
    </>
  )
}

// Styles
const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: 16,
    paddingTop: 10
  },
  toastWrapper: {
    marginBottom: 8
  },
  bannerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0
  },
  bannerWrapper: {
    marginBottom: 4
  }
})

export default NotificationContainer
