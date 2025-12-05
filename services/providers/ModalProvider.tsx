/**
 * TiffinWale Modal Notification Provider
 * Handles modal notifications, confirmations, and alerts
 * 
 * Features:
 * - Confirmation dialogs
 * - Alert modals
 * - Custom content support
 * - Backdrop blur effect
 * - Smooth animations
 * - Keyboard handling
 * - Accessibility support
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  BackHandler
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { NotificationData, NotificationProvider, NotificationConfig } from '../notificationService'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Modal notification component
interface ModalNotificationProps {
  notification: NotificationData
  config: NotificationConfig
  onDismiss: (id: string) => void
  onActionPress?: (actionId: string, notification: NotificationData) => void
}

const ModalNotification: React.FC<ModalNotificationProps> = ({
  notification,
  config,
  onDismiss,
  onActionPress
}) => {
  const [visible, setVisible] = useState(true)
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  const theme = config.theme
  const animationDuration = config.animationDuration || 300

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      })
    ]).start()

    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (notification.persistent) {
        return true // Prevent back button if persistent
      }
      handleDismiss()
      return true
    })

    return () => backHandler.remove()
  }, [])

  const handleDismiss = () => {
    if (!visible) return
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.5,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        useNativeDriver: true,
        duration: animationDuration
      })
    ]).start(() => {
      setVisible(false)
      onDismiss(notification.id!)
    })
  }

  const handleActionPress = (actionId: string) => {
    const action = notification.actions?.find(a => a.id === actionId)
    if (action) {
      action.action()
      if (onActionPress) {
        onActionPress(actionId, notification)
      }
    }
    handleDismiss()
  }

  const handleBackdropPress = () => {
    if (!notification.persistent) {
      handleDismiss()
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
      default: return 'help-circle'
    }
  }

  const getVariantStyles = () => {
    const colors = theme.colors
    
    switch (notification.variant) {
      case 'success':
        return {
          iconColor: colors.success,
          titleColor: colors.text,
          messageColor: colors.text,
          primaryButtonBg: colors.success,
          primaryButtonText: '#FFFFFF'
        }
      case 'error':
        return {
          iconColor: colors.error,
          titleColor: colors.text,
          messageColor: colors.text,
          primaryButtonBg: colors.error,
          primaryButtonText: '#FFFFFF'
        }
      case 'warning':
        return {
          iconColor: colors.warning,
          titleColor: colors.text,
          messageColor: colors.text,
          primaryButtonBg: colors.warning,
          primaryButtonText: '#FFFFFF'
        }
      case 'info':
        return {
          iconColor: colors.info,
          titleColor: colors.text,
          messageColor: colors.text,
          primaryButtonBg: colors.info,
          primaryButtonText: '#FFFFFF'
        }
      case 'order':
        return {
          iconColor: colors.order,
          titleColor: colors.text,
          messageColor: colors.text,
          primaryButtonBg: colors.order,
          primaryButtonText: '#FFFFFF'
        }
      case 'promotion':
        return {
          iconColor: colors.promotion,
          titleColor: colors.text,
          messageColor: colors.text,
          primaryButtonBg: colors.promotion,
          primaryButtonText: '#FFFFFF'
        }
      default:
        return {
          iconColor: colors.text,
          titleColor: colors.text,
          messageColor: colors.text,
          primaryButtonBg: colors.info,
          primaryButtonText: '#FFFFFF'
        }
    }
  }

  const variantStyles = getVariantStyles()

  if (!visible) return null

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <Animated.View
            style={[
              styles.backdropOverlay,
              { opacity: opacityAnim }
            ]}
          />
        </TouchableOpacity>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
              opacity: opacityAnim
            }
          ]}
        >
          <View
            style={[
              styles.modal,
              {
                backgroundColor: theme.colors.background,
                borderRadius: theme.spacing.borderRadius,
                ...theme.shadows
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getIconName() as any}
                  size={32}
                  color={variantStyles.iconColor}
                />
              </View>

              {/* Close button (if not persistent) */}
              {!notification.persistent && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleDismiss}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Title */}
              <Text
                style={[
                  styles.title,
                  {
                    color: variantStyles.titleColor,
                    fontSize: theme.typography.titleSize + 2,
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: theme.typography.fontWeight as any
                  }
                ]}
              >
                {notification.title}
              </Text>

              {/* Message */}
              <Text
                style={[
                  styles.message,
                  {
                    color: variantStyles.messageColor,
                    fontSize: theme.typography.messageSize,
                    fontFamily: theme.typography.fontFamily
                  }
                ]}
              >
                {notification.message}
              </Text>

              {/* Image (if provided) */}
              {notification.image && (
                <View style={styles.imageContainer}>
                  {/* Image component would go here */}
                </View>
              )}
            </View>

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <View style={styles.actionsContainer}>
                {notification.actions.map((action, index) => {
                  const isPrimary = action.style === 'default' || index === 0
                  const isDestructive = action.style === 'destructive'
                  const isCancel = action.style === 'cancel'

                  return (
                    <TouchableOpacity
                      key={action.id}
                      style={[
                        styles.actionButton,
                        isPrimary && !isDestructive && !isCancel && {
                          backgroundColor: variantStyles.primaryButtonBg
                        },
                        isDestructive && {
                          backgroundColor: theme.colors.error
                        },
                        isCancel && {
                          backgroundColor: 'transparent',
                          borderWidth: 1,
                          borderColor: theme.colors.border
                        }
                      ]}
                      onPress={() => handleActionPress(action.id)}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                    >
                      <Text
                        style={[
                          styles.actionText,
                          {
                            color: isPrimary && !isCancel
                              ? variantStyles.primaryButtonText
                              : isCancel
                              ? theme.colors.text
                              : '#FFFFFF',
                            fontFamily: theme.typography.fontFamily,
                            fontWeight: isPrimary ? '600' : '500'
                          }
                        ]}
                      >
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// Modal Provider Class
export class ModalProvider implements NotificationProvider {
  private config: NotificationConfig
  private activeModals: Map<string, React.ComponentType> = new Map()

  constructor(config: NotificationConfig) {
    this.config = config
  }

  async show(notification: NotificationData): Promise<void> {
    // Implementation will be handled by the ModalContainer component
    // This provider mainly provides the configuration and styling
  }

  async hide(id: string): Promise<void> {
    this.activeModals.delete(id)
  }

  async clear(): Promise<void> {
    this.activeModals.clear()
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContainer: {
    width: screenWidth - 64,
    maxWidth: 400,
    maxHeight: screenHeight - 100
  },
  modal: {
    width: '100%',
    minHeight: 150
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center'
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8
  },
  imageContainer: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center'
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between'
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44
  },
  actionText: {
    fontSize: 16,
    textAlign: 'center'
  }
})

export { ModalNotification }
export default ModalProvider


