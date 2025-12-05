/**
 * TiffinWale Banner Notification Component
 * Persistent banner notifications for important updates
 * 
 * Features:
 * - Persistent display
 * - Action buttons
 * - Slide animations
 * - Swipe to dismiss
 * - Progress indicators
 * - Image support
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  PanGestureHandler,
  State,
  Dimensions,
  StyleSheet
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { NotificationData, NotificationConfig } from '../services/notificationService'

const { width: screenWidth } = Dimensions.get('window')

interface BannerNotificationProps {
  notification: NotificationData
  config: NotificationConfig
  onDismiss: (id: string) => void
  onPress?: (notification: NotificationData) => void
  onActionPress?: (actionId: string, notification: NotificationData) => void
}

const BannerNotification: React.FC<BannerNotificationProps> = ({
  notification,
  config,
  onDismiss,
  onPress,
  onActionPress
}) => {
  const { t } = useTranslation('common');
  const translateY = useRef(new Animated.Value(-100)).current
  const translateX = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const progress = useRef(new Animated.Value(0)).current
  const [isVisible, setIsVisible] = useState(true)

  const theme = config.theme
  const duration = notification.duration || config.defaultDuration
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
        toValue: -100,
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
  }

  const handleActionPress = (actionId: string) => {
    if (onActionPress) {
      onActionPress(actionId, notification)
    }
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
          textColor: '#FFFFFF',
          buttonBg: 'rgba(255, 255, 255, 0.2)',
          buttonText: '#FFFFFF'
        }
      case 'error':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
          buttonBg: 'rgba(255, 255, 255, 0.2)',
          buttonText: '#FFFFFF'
        }
      case 'warning':
        return {
          backgroundColor: colors.warning,
          borderColor: colors.warning,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
          buttonBg: 'rgba(255, 255, 255, 0.2)',
          buttonText: '#FFFFFF'
        }
      case 'info':
        return {
          backgroundColor: colors.info,
          borderColor: colors.info,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
          buttonBg: 'rgba(255, 255, 255, 0.2)',
          buttonText: '#FFFFFF'
        }
      case 'order':
        return {
          backgroundColor: colors.order,
          borderColor: colors.order,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
          buttonBg: 'rgba(255, 255, 255, 0.2)',
          buttonText: '#FFFFFF'
        }
      case 'promotion':
        return {
          backgroundColor: colors.promotion,
          borderColor: colors.promotion,
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
          buttonBg: 'rgba(255, 255, 255, 0.2)',
          buttonText: '#FFFFFF'
        }
      default:
        return {
          backgroundColor: colors.background,
          borderColor: colors.border,
          iconColor: colors.text,
          textColor: colors.text,
          buttonBg: colors.info,
          buttonText: '#FFFFFF'
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <PanGestureHandler
      onGestureEvent={handlePanGestureEvent}
      onHandlerStateChange={handlePanStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderColor: variantStyles.borderColor,
            borderBottomLeftRadius: theme.spacing.borderRadius,
            borderBottomRightRadius: theme.spacing.borderRadius,
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
            {/* Main Content */}
            <View style={styles.mainContent}>
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

              {/* Image (if provided) */}
              {notification.image && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: notification.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleDismiss}
                accessibilityRole="button"
                accessibilityLabel={t('dismissNotification')}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={variantStyles.iconColor}
                />
              </TouchableOpacity>
            </View>

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <View style={styles.actionsContainer}>
                {notification.actions.slice(0, 3).map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: action.style === 'destructive' 
                          ? 'rgba(255, 0, 0, 0.2)' 
                          : variantStyles.buttonBg
                      }
                    ]}
                    onPress={() => handleActionPress(action.id)}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        {
                          color: variantStyles.buttonText,
                          fontFamily: theme.typography.fontFamily
                        }
                      ]}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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

// Styles
const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    minHeight: 80
  },
  touchable: {
    flex: 1
  },
  content: {
    padding: 16
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'flex-start'
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
    marginBottom: 4,
    lineHeight: 20
  },
  message: {
    lineHeight: 18,
    opacity: 0.9
  },
  imageContainer: {
    marginLeft: 8,
    marginRight: 8
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8
  },
  closeButton: {
    padding: 4,
    marginLeft: 8
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'flex-end'
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600'
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

export default BannerNotification


