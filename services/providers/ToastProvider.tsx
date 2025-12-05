/**
 * TiffinWale Toast Notification Provider
 * Handles in-app toast notifications with animations and gestures
 * 
 * Features:
 * - Smooth animations (slide, fade, bounce)
 * - Swipe to dismiss gesture
 * - Auto-dismiss with progress indicator
 * - Multiple positioning options
 * - Accessibility support
 * - Theme integration
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StyleSheet
} from 'react-native'
import { PanGestureHandler, State } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NotificationData, NotificationProvider, NotificationConfig } from '../notificationService'

const { width: screenWidth } = Dimensions.get('window')

// Toast notification component
interface ToastNotificationProps {
  notification: NotificationData
  config: NotificationConfig
  onDismiss: (id: string) => void
  onPress?: (notification: NotificationData) => void
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  config,
  onDismiss,
  onPress
}) => {
  const insets = useSafeAreaInsets()
  const translateY = useRef(new Animated.Value(-200)).current
  const translateX = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const progress = useRef(new Animated.Value(0)).current
  const [isVisible, setIsVisible] = useState(true)

  const theme = config.theme
  const position = config.position || 'top'
  const duration = notification.duration || config.defaultDuration

  // Animation values
  const animationDuration = config.animationDuration || 300

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true
      })
    ]).start()

    // Progress animation for auto-dismiss
    if (!notification.persistent && duration > 0) {
      Animated.timing(progress, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false
      }).start()

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    if (!isVisible) return
    
    setIsVisible(false)
    
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: position === 'top' ? -200 : 200,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true
      })
    ]).start(() => {
      onDismiss(notification.id!)
    })
  }

  const handlePress = () => {
    if (onPress) {
      onPress(notification)
    }
    handleDismiss()
  }

  const handlePanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  )

  const handlePanStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent
      
      // Dismiss if swiped far enough or with enough velocity
      if (Math.abs(translationX) > screenWidth * 0.3 || Math.abs(velocityX) > 1000) {
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: translationX > 0 ? screenWidth : -screenWidth,
            duration: 200,
            useNativeDriver: true
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
          })
        ]).start(() => {
          onDismiss(notification.id!)
        })
      } else {
        // Snap back to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8
        }).start()
      }
    }
  }

  const getIconName = () => {
    if (notification.icon) return notification.icon
    
    switch (notification.variant) {
      case 'success': return 'checkmark-circle'
      case 'error': return 'close-circle'
      case 'warning': return 'warning'
      case 'info': return 'information-circle'
      case 'order': return 'restaurant'
      case 'promotion': return 'gift'
      default: return 'notifications'
    }
  }

  const getVariantStyles = () => {
    const colors = theme.colors
    
    switch (notification.variant) {
      case 'success':
        return {
          backgroundColor: colors.success,
          borderColor: colors.success,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        }
      case 'error':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        }
      case 'warning':
        return {
          backgroundColor: colors.warning,
          borderColor: colors.warning,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        }
      case 'info':
        return {
          backgroundColor: colors.info,
          borderColor: colors.info,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        }
      case 'order':
        return {
          backgroundColor: colors.order,
          borderColor: colors.order,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        }
      case 'promotion':
        return {
          backgroundColor: colors.promotion,
          borderColor: colors.promotion,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        }
      default:
        return {
          backgroundColor: colors.background,
          borderColor: colors.border,
          iconColor: colors.text,
          textColor: colors.text
        }
    }
  }

  const variantStyles = getVariantStyles()
  const topOffset = position === 'top' ? insets.top + 10 : undefined
  const bottomOffset = position === 'bottom' ? insets.bottom + 10 : undefined

  return (
    <PanGestureHandler
      onGestureEvent={handlePanGestureEvent}
      onHandlerStateChange={handlePanStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            top: topOffset,
            bottom: bottomOffset,
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            borderRadius: theme.spacing.borderRadius,
            ...theme.shadows,
            transform: [
              { translateY },
              { translateX }
            ],
            opacity
          }
        ]}
        accessibilityRole="alert"
        accessibilityLabel={`${notification.title}: ${notification.message}`}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={getIconName() as any}
                size={24}
                color={variantStyles.iconColor}
              />
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.title,
                  {
                    color: variantStyles.textColor,
                    fontSize: theme.typography.titleSize,
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: theme.typography.fontWeight as any
                  }
                ]}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
              <Text
                style={[
                  styles.message,
                  {
                    color: variantStyles.textColor,
                    fontSize: theme.typography.messageSize,
                    fontFamily: theme.typography.fontFamily
                  }
                ]}
                numberOfLines={2}
              >
                {notification.message}
              </Text>
            </View>

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <View style={styles.actionsContainer}>
                {notification.actions.slice(0, 2).map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionButton,
                      action.style === 'destructive' && styles.destructiveAction
                    ]}
                    onPress={() => {
                      action.action()
                      handleDismiss()
                    }}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        { color: variantStyles.textColor }
                      ]}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDismiss}
              accessibilityRole="button"
              accessibilityLabel="Dismiss notification"
            >
              <Ionicons
                name="close"
                size={20}
                color={variantStyles.iconColor}
              />
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          {!notification.persistent && duration > 0 && (
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: variantStyles.iconColor,
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  )
}

// Toast Provider Class
export class ToastProvider implements NotificationProvider {
  private config: NotificationConfig
  private activeToasts: Map<string, React.ComponentType> = new Map()

  constructor(config: NotificationConfig) {
    this.config = config
  }

  async show(notification: NotificationData): Promise<void> {
    // Implementation will be handled by the ToastContainer component
    // This provider mainly provides the configuration and styling
  }

  async hide(id: string): Promise<void> {
    this.activeToasts.delete(id)
  }

  async clear(): Promise<void> {
    this.activeToasts.clear()
  }

  configure(config: NotificationConfig): void {
    this.config = { ...this.config, ...config }
  }

  getConfig(): NotificationConfig {
    return this.config
  }
}

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    borderWidth: 1,
    minHeight: 64
  },
  touchable: {
    flex: 1
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    paddingRight: 48 // Space for close button
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2
  },
  textContainer: {
    flex: 1,
    marginRight: 8
  },
  title: {
    marginBottom: 2,
    lineHeight: 20
  },
  message: {
    lineHeight: 18,
    opacity: 0.9
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 8
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  destructiveAction: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)'
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600'
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%'
  }
})

export { ToastNotification }
export default ToastProvider
