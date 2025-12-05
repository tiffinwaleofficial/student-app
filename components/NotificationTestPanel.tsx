/**
 * Notification Test Panel
 * Development component to test all notification types and preferences
 * Remove this component in production builds
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native'
import { Bell, TestTube, Settings, Play, RotateCcw } from 'lucide-react-native'
import { useNotificationTracking } from '@/hooks/useNotificationTracking'
import { useNotificationPreferencesStore } from '@/store/notificationPreferencesStore'
import { testFirebaseNotifications } from '@/utils/notificationTester'

interface NotificationTestPanelProps {
  visible?: boolean
  onClose?: () => void
}

export const NotificationTestPanel: React.FC<NotificationTestPanelProps> = ({
  visible = false,
  onClose
}) => {
  const [isRunningTests, setIsRunningTests] = useState(false)
  const { preferences, toggleMasterNotifications } = useNotificationPreferencesStore()
  
  const {
    trackOrderPlaced,
    trackOrderCooking,
    trackOrderDelivered,
    trackPaymentSuccess,
    trackPaymentFailed,
    trackSubscriptionActivated,
    trackDiscountOffer,
    trackNewChatMessage,
    testAllNotifications
  } = useNotificationTracking()

  if (!visible) return null

  const runQuickTest = async () => {
    setIsRunningTests(true)
    
    try {
      console.log('🧪 Running quick notification test...')
      
      // Test order flow
      await trackOrderPlaced('TEST_001', 'This is a test order notification!')
      
      setTimeout(async () => {
        await trackOrderCooking('TEST_001', 'Test cooking notification!')
      }, 2000)
      
      setTimeout(async () => {
        await trackOrderDelivered('TEST_001', 'Test delivery notification!')
      }, 4000)
      
      // Test payment
      setTimeout(async () => {
        await trackPaymentSuccess('PAY_001', 299, 'UPI')
      }, 6000)
      
      // Test promotion
      setTimeout(async () => {
        await trackDiscountOffer('Test Offer', 25, 'TEST25')
      }, 8000)
      
      console.log('🧪 Quick test completed!')
    } catch (error) {
      console.error('❌ Test failed:', error)
    } finally {
      setTimeout(() => setIsRunningTests(false), 10000)
    }
  }

  const runFullTest = async () => {
    setIsRunningTests(true)
    
    try {
      await testAllNotifications()
    } catch (error) {
      console.error('❌ Full test failed:', error)
    } finally {
      setTimeout(() => setIsRunningTests(false), 20000)
    }
  }

  const testFirebaseSystem = async () => {
    setIsRunningTests(true)
    
    try {
      await testFirebaseNotifications()
    } catch (error) {
      console.error('❌ Firebase test failed:', error)
    } finally {
      setTimeout(() => setIsRunningTests(false), 15000)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bell size={24} color="#FF9B42" />
        <Text style={styles.headerTitle}>Notification Test Panel</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Master Toggle Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Notification Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>
              All Notifications: {preferences.allNotifications ? 'Enabled ✅' : 'Disabled ❌'}
            </Text>
            <Switch
              value={preferences.allNotifications}
              onValueChange={toggleMasterNotifications}
              trackColor={{ false: '#E0E0E0', true: '#FF9B42' }}
            />
          </View>
          <Text style={styles.statusSubtext}>
            {preferences.syncedWithBackend ? '🔄 Synced with backend' : '⚠️ Not synced'}
          </Text>
        </View>

        {/* Quick Tests */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Quick Tests</Text>
          
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#E8F5E8' }]}
            onPress={runQuickTest}
            disabled={isRunningTests}
          >
            <Play size={20} color="#4CAF50" />
            <Text style={[styles.testButtonText, { color: '#4CAF50' }]}>
              {isRunningTests ? 'Running Quick Test...' : 'Quick Test (10s)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#E3F2FD' }]}
            onPress={runFullTest}
            disabled={isRunningTests}
          >
            <TestTube size={20} color="#2196F3" />
            <Text style={[styles.testButtonText, { color: '#2196F3' }]}>
              {isRunningTests ? 'Running Full Test...' : 'Full Test (20s)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#FFF3E0' }]}
            onPress={testFirebaseSystem}
            disabled={isRunningTests}
          >
            <RotateCcw size={20} color="#FF9800" />
            <Text style={[styles.testButtonText, { color: '#FF9800' }]}>
              {isRunningTests ? 'Testing Firebase...' : 'Test Firebase System'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Individual Tests */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Individual Tests</Text>
          
          <TouchableOpacity 
            style={styles.individualTestButton}
            onPress={() => trackOrderPlaced('TEST_ORDER_001')}
            disabled={isRunningTests}
          >
            <Text style={styles.individualTestText}>🍽️ Test Order Placed</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.individualTestButton}
            onPress={() => trackPaymentSuccess('TEST_PAY_001', 299, 'UPI')}
            disabled={isRunningTests}
          >
            <Text style={styles.individualTestText}>💳 Test Payment Success</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.individualTestButton}
            onPress={() => trackSubscriptionActivated('TEST_SUB_001', 'Premium Plan')}
            disabled={isRunningTests}
          >
            <Text style={styles.individualTestText}>📅 Test Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.individualTestButton}
            onPress={() => trackDiscountOffer('Test Flash Sale', 50, 'FLASH50')}
            disabled={isRunningTests}
          >
            <Text style={styles.individualTestText}>🎁 Test Promotion</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.individualTestButton}
            onPress={() => trackNewChatMessage('Test Support', 'This is a test message from support team!', 'TEST_CHAT_001')}
            disabled={isRunningTests}
          >
            <Text style={styles.individualTestText}>💬 Test Chat Message</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>📋 How to Test</Text>
          <Text style={styles.instructionsText}>
            1. Toggle notification preferences in Settings{'\n'}
            2. Run tests to see how preferences affect notifications{'\n'}
            3. Check console logs for detailed information{'\n'}
            4. Verify notifications respect user preferences{'\n'}
            5. Test quiet hours and other timing preferences
          </Text>
        </View>

        {/* Warning */}
        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>⚠️ Development Only</Text>
          <Text style={styles.warningText}>
            This test panel is for development only and should be removed in production builds.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#666',
  },
  testSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  testButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  individualTestButton: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  individualTestText: {
    fontSize: 14,
    color: '#333',
  },
  instructionsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  warningContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginBottom: 32,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#F57C00',
  },
})

export default NotificationTestPanel