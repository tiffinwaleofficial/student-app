/**
 * Notification Preferences Screen
 * Comprehensive notification settings with all categories and subcategories
 */

import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'
import {
  Bell,
  BellOff,
  ChevronDown,
  ChevronRight,
  Clock,
  Volume2,
  Vibrate,
  Smartphone,
  RotateCcw,
  Check,
  AlertCircle,
} from 'lucide-react-native'
import { BackButton } from '@/components/BackButton'
import { useNotificationPreferencesStore, NotificationCategory } from '@/store/notificationPreferencesStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useFirebaseNotification } from '@/hooks/useFirebaseNotification'

export default function NotificationPreferencesScreen() {
  const router = useRouter()
  const { t } = useTranslation('profile')
  const { showSuccess, showError } = useFirebaseNotification()
  
  const {
    preferences,
    isLoading,
    error,
    lastSyncTime,
    initializePreferences,
    updatePreference,
    toggleMasterNotifications,
    toggleCategoryNotifications,
    syncWithBackend,
    resetToDefaults,
    getNotificationCategories,
    clearError,
  } = useNotificationPreferencesStore()

  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    initializePreferences()
  }, [])

  const handleMasterToggle = async (enabled: boolean) => {
    try {
      await toggleMasterNotifications(enabled)
      showSuccess(
        enabled ? 'Notifications Enabled! 🔔' : 'Notifications Disabled 🔕',
        enabled 
          ? 'You\'ll now receive all notifications! Stay updated with your orders 📱'
          : 'All notifications are now disabled. You can enable them anytime! 😴'
      )
    } catch (error) {
      showError('Update Failed', 'Failed to update notification settings. Please try again!')
    }
  }

  const handleCategoryToggle = async (categoryId: string, enabled: boolean) => {
    try {
      await toggleCategoryNotifications(categoryId, enabled)
      
      const category = getNotificationCategories().find(c => c.id === categoryId)
      showSuccess(
        `${category?.title} ${enabled ? 'Enabled' : 'Disabled'} ${category?.icon}`,
        enabled 
          ? `You'll now receive ${category?.title.toLowerCase()} notifications!`
          : `${category?.title} notifications are now disabled.`
      )
    } catch (error) {
      showError('Update Failed', 'Failed to update category settings. Please try again!')
    }
  }

  const handleSubcategoryToggle = async (categoryId: string, subcategoryId: string, enabled: boolean) => {
    try {
      await updatePreference(categoryId, subcategoryId, enabled)
      
      const category = getNotificationCategories().find(c => c.id === categoryId)
      const subcategory = category?.subcategories.find(s => s.id === subcategoryId)
      
      showSuccess(
        `${subcategory?.title} ${enabled ? 'Enabled' : 'Disabled'} ✅`,
        enabled 
          ? `You'll now receive ${subcategory?.title.toLowerCase()} notifications!`
          : `${subcategory?.title} notifications are now disabled.`
      )
    } catch (error) {
      showError('Update Failed', 'Failed to update notification setting. Please try again!')
    }
  }

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncWithBackend()
      showSuccess('Synced Successfully! ✅', 'Your notification preferences are now synced with our servers!')
    } catch (error) {
      showError('Sync Failed', 'Failed to sync with server. Your preferences are saved locally.')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleReset = () => {
    Alert.alert(
      'Reset Notification Preferences?',
      'This will reset all your notification preferences to default settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetToDefaults()
              showSuccess('Reset Complete! 🔄', 'All notification preferences have been reset to defaults!')
            } catch (error) {
              showError('Reset Failed', 'Failed to reset preferences. Please try again!')
            }
          }
        }
      ]
    )
  }

  const categories = getNotificationCategories()

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Notification Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9B42" />
          <Text style={styles.loadingText}>Loading notification preferences...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <TouchableOpacity onPress={handleSync} disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#FF9B42" />
          ) : (
            <Check size={24} color={preferences.syncedWithBackend ? "#4CAF50" : "#FF9B42"} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Display */}
        {error && (
          <Animated.View entering={FadeIn} style={styles.errorContainer}>
            <AlertCircle size={20} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.errorDismiss}>Dismiss</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Master Toggle */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.masterToggleContainer}>
          <View style={styles.masterToggleContent}>
            <View style={styles.masterToggleLeft}>
              <View style={[styles.masterToggleIcon, { backgroundColor: preferences.allNotifications ? '#E8F5E8' : '#FFEBEE' }]}>
                {preferences.allNotifications ? (
                  <Bell size={24} color="#4CAF50" />
                ) : (
                  <BellOff size={24} color="#F44336" />
                )}
              </View>
              <View style={styles.masterToggleText}>
                <Text style={styles.masterToggleTitle}>All Notifications</Text>
                <Text style={styles.masterToggleSubtitle}>
                  {preferences.allNotifications 
                    ? 'You\'ll receive all enabled notifications'
                    : 'All notifications are disabled'
                  }
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.allNotifications}
              onValueChange={handleMasterToggle}
              trackColor={{ false: '#E0E0E0', true: '#FF9B42' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Animated.View>

        {/* Sync Status */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.syncStatusContainer}>
          <View style={styles.syncStatusContent}>
            <View style={styles.syncStatusLeft}>
              <Smartphone size={16} color="#666" />
              <Text style={styles.syncStatusText}>
                {preferences.syncedWithBackend 
                  ? `Last synced: ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Just now'}`
                  : 'Not synced with server'
                }
              </Text>
            </View>
            <TouchableOpacity onPress={handleSync} disabled={isSyncing} style={styles.syncButton}>
              <Text style={styles.syncButtonText}>
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Notification Categories */}
        {categories.map((category, index) => (
          <Animated.View 
            key={category.id} 
            entering={FadeInDown.delay(300 + index * 100)} 
            style={styles.categoryContainer}
          >
            {/* Category Header */}
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategoryExpansion(category.id)}
              disabled={!preferences.allNotifications}
            >
              <View style={styles.categoryLeft}>
                <View style={[
                  styles.categoryIcon, 
                  { 
                    backgroundColor: category.enabled && preferences.allNotifications ? '#E8F5E8' : '#F5F5F5',
                    opacity: preferences.allNotifications ? 1 : 0.5
                  }
                ]}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <View style={styles.categoryText}>
                  <Text style={[
                    styles.categoryTitle,
                    { opacity: preferences.allNotifications ? 1 : 0.5 }
                  ]}>
                    {category.title}
                  </Text>
                  <Text style={[
                    styles.categoryDescription,
                    { opacity: preferences.allNotifications ? 1 : 0.5 }
                  ]}>
                    {category.description}
                  </Text>
                </View>
              </View>
              <View style={styles.categoryRight}>
                <Switch
                  value={category.enabled && preferences.allNotifications}
                  onValueChange={(enabled) => handleCategoryToggle(category.id, enabled)}
                  trackColor={{ false: '#E0E0E0', true: '#FF9B42' }}
                  thumbColor="#FFFFFF"
                  disabled={!preferences.allNotifications}
                />
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown size={20} color="#666" style={styles.chevron} />
                ) : (
                  <ChevronRight size={20} color="#666" style={styles.chevron} />
                )}
              </View>
            </TouchableOpacity>

            {/* Subcategories */}
            {expandedCategories.includes(category.id) && (
              <View style={styles.subcategoriesContainer}>
                {category.subcategories.map((subcategory) => (
                  <View key={subcategory.id} style={styles.subcategoryItem}>
                    <View style={styles.subcategoryLeft}>
                      <Text style={[
                        styles.subcategoryTitle,
                        { opacity: (category.enabled && preferences.allNotifications) ? 1 : 0.5 }
                      ]}>
                        {subcategory.title}
                      </Text>
                      <Text style={[
                        styles.subcategoryDescription,
                        { opacity: (category.enabled && preferences.allNotifications) ? 1 : 0.5 }
                      ]}>
                        {subcategory.description}
                      </Text>
                      {subcategory.critical && (
                        <Text style={styles.criticalLabel}>Required</Text>
                      )}
                    </View>
                    <Switch
                      value={subcategory.enabled && category.enabled && preferences.allNotifications}
                      onValueChange={(enabled) => handleSubcategoryToggle(category.id, subcategory.id, enabled)}
                      trackColor={{ false: '#E0E0E0', true: '#FF9B42' }}
                      thumbColor="#FFFFFF"
                      disabled={!category.enabled || !preferences.allNotifications || subcategory.critical}
                    />
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        ))}

        {/* Delivery Preferences */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.deliveryPreferencesContainer}>
          <Text style={styles.sectionTitle}>Delivery Preferences</Text>
          
          <View style={styles.deliveryPreferenceItem}>
            <View style={styles.deliveryPreferenceLeft}>
              <Volume2 size={20} color="#FF9B42" />
              <Text style={styles.deliveryPreferenceText}>Sound</Text>
            </View>
            <Switch
              value={preferences.deliveryPreferences.sound}
              onValueChange={(enabled) => updatePreference('deliveryPreferences', 'sound', enabled)}
              trackColor={{ false: '#E0E0E0', true: '#FF9B42' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.deliveryPreferenceItem}>
            <View style={styles.deliveryPreferenceLeft}>
              <Vibrate size={20} color="#FF9B42" />
              <Text style={styles.deliveryPreferenceText}>Vibration</Text>
            </View>
            <Switch
              value={preferences.deliveryPreferences.vibration}
              onValueChange={(enabled) => updatePreference('deliveryPreferences', 'vibration', enabled)}
              trackColor={{ false: '#E0E0E0', true: '#FF9B42' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Animated.View>

        {/* Quiet Hours */}
        <Animated.View entering={FadeInDown.delay(900)} style={styles.quietHoursContainer}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <Text style={styles.sectionDescription}>
            Disable notifications during specific hours
          </Text>
          
          <View style={styles.quietHoursItem}>
            <View style={styles.quietHoursLeft}>
              <Clock size={20} color="#FF9B42" />
              <Text style={styles.quietHoursText}>Enable Quiet Hours</Text>
            </View>
            <Switch
              value={preferences.timingPreferences.quietHours.enabled}
              onValueChange={(enabled) => updatePreference('timingPreferences', 'quietHours.enabled', enabled)}
              trackColor={{ false: '#E0E0E0', true: '#FF9B42' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {preferences.timingPreferences.quietHours.enabled && (
            <View style={styles.quietHoursTimeContainer}>
              <Text style={styles.quietHoursTimeText}>
                From {preferences.timingPreferences.quietHours.startTime} to {preferences.timingPreferences.quietHours.endTime}
              </Text>
              <Text style={styles.quietHoursNote}>
                You won't receive notifications during these hours
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Reset Button */}
        <Animated.View entering={FadeInDown.delay(1000)} style={styles.resetContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw size={20} color="#F44336" />
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 24, // Balance the back button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: '#F44336',
    fontSize: 14,
  },
  errorDismiss: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  masterToggleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  masterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  masterToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterToggleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  masterToggleText: {
    flex: 1,
  },
  masterToggleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  masterToggleSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  syncStatusContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  syncStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncStatusText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF9B42',
    borderRadius: 6,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 8,
  },
  subcategoriesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subcategoryLeft: {
    flex: 1,
  },
  subcategoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  subcategoryDescription: {
    fontSize: 12,
    color: '#666',
  },
  criticalLabel: {
    fontSize: 10,
    color: '#F44336',
    fontWeight: 'bold',
    marginTop: 2,
  },
  deliveryPreferencesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  deliveryPreferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  deliveryPreferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryPreferenceText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  quietHoursContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  quietHoursItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  quietHoursLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quietHoursText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  quietHoursTimeContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  quietHoursTimeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  quietHoursNote: {
    fontSize: 12,
    color: '#666',
  },
  resetContainer: {
    marginTop: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 12,
  },
  resetButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 32,
  },
})