/**
 * Notification Service
 * Replaces Alert.alert with a more user-friendly notification system
 */

import Toast from 'react-native-toast-message';

export interface NotificationOptions {
  title?: string;
  message: string;
  duration?: number;
  position?: 'top' | 'bottom';
  autoHide?: boolean;
  onPress?: () => void;
}

export const showNotification = {
  /**
   * Show success notification
   */
  success: (message: string, options?: Partial<NotificationOptions>) => {
    Toast.show({
      type: 'success',
      text1: options?.title || 'Success',
      text2: message,
      position: options?.position || 'top',
      visibilityTime: options?.duration || 3000,
      autoHide: options?.autoHide !== false,
      onPress: options?.onPress,
    });
  },

  /**
   * Show error notification
   */
  error: (message: string, options?: Partial<NotificationOptions>) => {
    Toast.show({
      type: 'error',
      text1: options?.title || 'Error',
      text2: message,
      position: options?.position || 'top',
      visibilityTime: options?.duration || 4000,
      autoHide: options?.autoHide !== false,
      onPress: options?.onPress,
    });
  },

  /**
   * Show info notification
   */
  info: (message: string, options?: Partial<NotificationOptions>) => {
    Toast.show({
      type: 'info',
      text1: options?.title || 'Info',
      text2: message,
      position: options?.position || 'top',
      visibilityTime: options?.duration || 3000,
      autoHide: options?.autoHide !== false,
      onPress: options?.onPress,
    });
  },

  /**
   * Show warning notification
   */
  warning: (message: string, options?: Partial<NotificationOptions>) => {
    Toast.show({
      type: 'warning',
      text1: options?.title || 'Warning',
      text2: message,
      position: options?.position || 'top',
      visibilityTime: options?.duration || 3500,
      autoHide: options?.autoHide !== false,
      onPress: options?.onPress,
    });
  },

  /**
   * Show custom notification
   */
  custom: (options: NotificationOptions) => {
    Toast.show({
      type: 'custom',
      text1: options.title,
      text2: options.message,
      position: options.position || 'top',
      visibilityTime: options.duration || 3000,
      autoHide: options.autoHide !== false,
      onPress: options.onPress,
    });
  },

  /**
   * Hide all notifications
   */
  hide: () => {
    Toast.hide();
  },
};

/**
 * Confirmation dialog replacement using custom notification
 */
export const showConfirmation = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  // For now, we'll use a simple approach
  // In the future, we can implement a custom modal for confirmations
  Toast.show({
    type: 'custom',
    text1: title,
    text2: `${message}\n\nTap to confirm, swipe to dismiss`,
    position: 'center',
    visibilityTime: 5000,
    autoHide: true,
    onPress: onConfirm,
    props: {
      onSwipeUp: onCancel,
    },
  });
};

/**
 * Loading notification
 */
export const showLoading = (message: string = 'Loading...') => {
  Toast.show({
    type: 'info',
    text1: message,
    position: 'top',
    autoHide: false,
    visibilityTime: 0,
  });
};

/**
 * Hide loading notification
 */
export const hideLoading = () => {
  Toast.hide();
};

export default showNotification;
