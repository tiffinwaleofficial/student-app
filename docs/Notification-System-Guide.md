# TiffinWale Notification System - Complete Usage Guide

## 🚀 **Enterprise-Grade Notification System**

This is a comprehensive notification system designed to match industry standards like Swiggy and Zomato, with the flexibility to easily modify UI/UX and functionality in the future.

## 📋 **System Overview**

### **Architecture**
```
TiffinWale Notification System
├── 📱 In-App Notifications (Real-time)
├── 🔔 Push Notifications (Device Level)  
├── ⚡ Real-time Integration (WebSocket)
└── 📅 Scheduled System (Cron Jobs)
```

### **Key Features**
- **Multiple notification types**: Toast, Modal, Banner, Push
- **Real-time updates**: WebSocket integration
- **Scheduled notifications**: Cron job system
- **Personalized messaging**: Template-based system
- **Easy UI/UX modifications**: Theme-driven design
- **Analytics tracking**: Comprehensive metrics
- **Offline support**: Queue-based system

## 🎯 **Quick Start**

### **1. Basic Usage**
```typescript
import { useNotification } from '@/hooks/useNotification'

function MyComponent() {
  const { success, error, warning, info } = useNotification()
  
  const handleSuccess = () => {
    success('Order placed successfully! 🎉')
  }
  
  const handleError = () => {
    error('Something went wrong. Please try again.')
  }
  
  return (
    <TouchableOpacity onPress={handleSuccess}>
      <Text>Place Order</Text>
    </TouchableOpacity>
  )
}
```

### **2. Advanced Usage**
```typescript
import { useNotification } from '@/hooks/useNotification'

function OrderComponent() {
  const { orderUpdate, confirm, show } = useNotification()
  
  const handleOrderUpdate = () => {
    orderUpdate({
      id: 'ORD123',
      status: 'confirmed',
      estimatedTime: '25 mins'
    })
  }
  
  const handleDeleteConfirmation = async () => {
    const confirmed = await confirm({
      title: 'Delete Order',
      message: 'Are you sure you want to cancel this order?',
      confirmText: 'Yes, Cancel',
      cancelText: 'Keep Order',
      variant: 'destructive'
    })
    
    if (confirmed) {
      // Delete order logic
    }
  }
  
  const handleCustomNotification = () => {
    show({
      type: 'banner',
      variant: 'promotion',
      title: '🎁 Special Offer!',
      message: 'Get 20% off on your next order',
      persistent: true,
      actions: [
        {
          id: 'claim',
          label: 'Claim Offer',
          action: () => console.log('Offer claimed!')
        }
      ]
    })
  }
}
```

## 📱 **Notification Types**

### **1. Toast Notifications**
Quick feedback messages that appear at the top of the screen.

```typescript
const { success, error, warning, info } = useNotification()

// Success toast
success('Profile updated successfully!')

// Error toast  
error('Failed to save changes')

// Warning toast
warning('Your session will expire in 5 minutes')

// Info toast
info('New features available in settings')
```

**Features:**
- Auto-dismiss after 4 seconds
- Swipe to dismiss
- Smooth animations
- Icon based on variant
- Progress indicator

### **2. Modal Notifications**
Important confirmations and alerts that require user attention.

```typescript
const { confirm, alert } = useNotification()

// Confirmation dialog
const result = await confirm({
  title: 'Delete Account',
  message: 'This action cannot be undone. Are you sure?',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'destructive'
})

// Alert dialog
await alert('Important', 'Your subscription expires tomorrow')
```

**Features:**
- Backdrop blur effect
- Keyboard handling
- Custom actions
- Persistent until dismissed
- Accessibility support

### **3. Banner Notifications**
Persistent notifications for important updates.

```typescript
const { show } = useNotification()

show({
  type: 'banner',
  variant: 'order',
  title: 'Order #123 Confirmed',
  message: 'Your order will be ready in 25 minutes',
  persistent: true,
  actions: [
    {
      id: 'track',
      label: 'Track Order',
      action: () => router.push('/orders/123')
    }
  ]
})
```

**Features:**
- Persistent display
- Action buttons
- Image support
- Swipe to dismiss
- Progress indicators

### **4. Push Notifications**
Device-level notifications that work even when app is closed.

```typescript
import { pushNotificationService } from '@/services/pushNotificationService'

// Initialize push notifications
await pushNotificationService.initialize()

// Schedule local notification
await pushNotificationService.scheduleLocalNotification({
  title: 'Meal Reminder',
  body: 'Time for your lunch!',
  data: { type: 'meal_reminder' }
}, {
  seconds: 3600 // 1 hour from now
})
```

## 🎨 **Customization & Theming**

### **Theme Configuration**
```typescript
const { configure } = useNotification()

configure({
  theme: {
    colors: {
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
      info: '#2196F3',
      order: '#FF6B35', // TiffinWale brand color
      promotion: '#E91E63'
    },
    typography: {
      titleSize: 16,
      messageSize: 14,
      fontFamily: 'Poppins',
      fontWeight: '600'
    },
    spacing: {
      padding: 16,
      margin: 8,
      borderRadius: 12
    }
  }
})
```

### **Position Configuration**
```typescript
configure({
  position: 'top', // 'top' | 'bottom' | 'center'
  maxNotifications: 5,
  defaultDuration: 4000,
  animationDuration: 300
})
```

## 🔄 **Real-time Integration**

### **WebSocket Connection**
The system automatically connects to WebSocket for real-time updates:

```typescript
// Automatic connection - no manual setup required
// Real-time notifications will appear automatically

// Example: Order status updates
// When backend sends: { type: 'order_update', orderId: '123', status: 'confirmed' }
// System automatically shows: Banner notification with order details
```

### **Event Handling**
```typescript
import { notificationService } from '@/services/notificationService'

// Listen for navigation events
notificationService.on('navigate', (data) => {
  // Handle navigation based on notification data
  switch (data.type) {
    case 'order_update':
      router.push(`/orders/${data.orderId}`)
      break
    case 'promotion':
      router.push('/promotions')
      break
  }
})
```

## 📊 **Analytics & Tracking**

### **Built-in Analytics**
The system automatically tracks:
- Notifications sent
- Notifications opened
- Notifications dismissed
- Open rates by category
- User engagement metrics

### **Custom Analytics**
```typescript
import { useNotificationStore } from '@/store/notificationStore'

function AnalyticsComponent() {
  const { stats, history } = useNotificationStore()
  
  return (
    <View>
      <Text>Total Sent: {stats.totalSent}</Text>
      <Text>Total Opened: {stats.totalOpened}</Text>
      <Text>Open Rate: {stats.openRate}%</Text>
    </View>
  )
}
```

## 🔧 **Settings & Preferences**

### **User Preferences**
```typescript
const { updateSettings } = useNotification()

updateSettings({
  pushEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  orderUpdates: true,
  promotions: false, // User disabled promotions
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  }
})
```

### **Category Management**
```typescript
const { toggleCategory } = useNotificationStore()

// Disable promotion notifications
toggleCategory('promotion')

// Check if category is enabled
const { canShowNotification } = useNotification()
const canShow = canShowNotification('promotion') // false
```

## 📋 **Notification History**

### **History Management**
```typescript
import { useNotificationStore, notificationActions } from '@/store/notificationStore'

function NotificationHistory() {
  const { history, getUnreadCount } = useNotificationStore()
  
  const unreadCount = getUnreadCount()
  const recentNotifications = history.slice(0, 10)
  
  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      {recentNotifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
        />
      ))}
    </View>
  )
}

// Mark all as read
notificationActions.markAllAsRead()

// Get notifications by date range
const lastWeek = notificationActions.getNotificationsByDateRange(
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  new Date()
)
```

## 🚀 **Advanced Features**

### **Scheduled Notifications**
```typescript
import { scheduleNotification } from '@/services/pushNotificationService'

// Schedule meal reminder
await scheduleNotification({
  title: 'Lunch Time! 🍽️',
  body: 'Your favorite meal is ready to order',
  data: { type: 'meal_reminder' }
}, {
  hour: 12,
  minute: 0,
  repeats: true // Daily reminder
})
```

### **Personalized Messages**
```typescript
// Backend sends personalized notification
// Template: "Hi {firstName}! Your {cuisineType} meal is ready"
// Result: "Hi John! Your Italian meal is ready"

const personalizedNotification = {
  templateId: 'meal_ready',
  data: {
    firstName: 'John',
    cuisineType: 'Italian',
    orderId: '123'
  }
}
```

### **Batch Operations**
```typescript
import { notificationActions } from '@/store/notificationStore'

// Mark multiple notifications as read
const orderNotifications = history.filter(n => n.category === 'order')
orderNotifications.forEach(n => markAsRead(n.id))

// Clear old notifications
const oldNotifications = notificationActions.getNotificationsByDateRange(
  new Date('2024-01-01'),
  new Date('2024-01-31')
)
// Clear logic here
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Notifications not showing**
```typescript
// Check if service is initialized
const { isReady } = useNotification()
if (!isReady()) {
  console.log('Notification service not ready')
}

// Check user preferences  
const { canShowNotification } = useNotification()
if (!canShowNotification('order')) {
  console.log('Order notifications disabled')
}
```

#### **2. Push notifications not working**
```typescript
import { pushNotificationService } from '@/services/pushNotificationService'

// Check if initialized
if (!pushNotificationService.isReady()) {
  await pushNotificationService.initialize()
}

// Check token
const token = pushNotificationService.getPushToken()
if (!token) {
  console.log('No push token available')
}
```

#### **3. Styling issues**
```typescript
// Reset to default theme
const { configure } = useNotification()
configure({
  theme: defaultTheme // Reset to defaults
})
```

## 📚 **Migration Guide**

### **From Alert.alert to Notification System**

#### **Before:**
```typescript
Alert.alert('Success', 'Order placed successfully')
Alert.alert('Error', 'Something went wrong', [
  { text: 'OK', onPress: () => console.log('OK') }
])
```

#### **After:**
```typescript
const { success, error } = useNotification()

success('Order placed successfully')
error('Something went wrong')

// With custom action
show({
  type: 'modal',
  variant: 'error',
  title: 'Error',
  message: 'Something went wrong',
  actions: [
    {
      id: 'ok',
      label: 'OK',
      action: () => console.log('OK')
    }
  ]
})
```

## 📈 **Performance Optimization**

### **Best Practices**
1. **Limit active notifications**: Max 5 notifications at once
2. **Use appropriate durations**: 3-5 seconds for most notifications
3. **Batch updates**: Group related notifications
4. **Clean up history**: Remove old notifications periodically
5. **Optimize images**: Use compressed images for banner notifications

### **Memory Management**
```typescript
// Clear old notifications
const { clearHistory } = useNotificationStore()
clearHistory() // Clear all history

// Limit history size (automatically handled)
// History is limited to 100 notifications
```

## 🎯 **Production Checklist**

- [ ] **Permissions**: Push notification permissions requested
- [ ] **Device registration**: Devices registered with backend
- [ ] **Error handling**: Comprehensive error handling implemented
- [ ] **Analytics**: Analytics tracking configured
- [ ] **Testing**: Tested on iOS and Android
- [ ] **Performance**: Memory usage optimized
- [ ] **Accessibility**: Screen reader support
- [ ] **Theming**: Brand colors configured
- [ ] **Documentation**: Usage documented for team

## 🔮 **Future Enhancements**

### **Planned Features**
- **Voice messages**: Audio notification support
- **Rich media**: Video and GIF support  
- **AI personalization**: Smart message generation
- **Advanced scheduling**: Complex scheduling rules
- **Multi-language**: Localization support
- **Notification groups**: Grouped notifications
- **Smart dismissal**: AI-powered auto-dismiss

---

## 📞 **Support**

For issues or questions about the notification system:
1. Check this documentation
2. Review console logs for errors
3. Test on physical device (push notifications)
4. Verify backend integration
5. Contact development team

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready


