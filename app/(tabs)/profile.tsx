import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  Bell,
  LogOut,
  ChevronRight,
  Edit,
  TestTube,
} from 'lucide-react-native';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { showNotification } from '@/utils/notificationService';
import { profileImageService } from '@/services/profileImageService';
// Remove BackButton import since we're in tabs now
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';
import NotificationTestPanel from '@/components/NotificationTestPanel';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { currentSubscription, fetchCurrentSubscription } = useSubscriptionStore();
  const { t } = useTranslation('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  if (__DEV__) console.log('🔍 MyProfileScreen: Component rendered');
  if (__DEV__) console.log('👤 MyProfileScreen: User state:', user);
  if (__DEV__) console.log('🔔 MyProfileScreen: Current subscription:', currentSubscription);

  useEffect(() => {
    if (__DEV__) console.log('🔍 ProfileScreen: useEffect triggered');
    if (__DEV__) console.log('📊 ProfileScreen: Fetching subscription data...');
    
    // User data is automatically managed by AuthProvider
    // Use cached data first, refresh in background
    fetchCurrentSubscription(false);
    
    if (__DEV__) console.log('✅ ProfileScreen: Subscription fetch call made');
  }, [fetchCurrentSubscription]);

  const handleLogout = async () => {
    console.log('🚪 MyProfileScreen: Starting logout process...');
    
    try {
      setIsLoggingOut(true);
      console.log('🚪 MyProfileScreen: Calling logout API...');
      
      // Call logout API and clear local storage
      await logout();
      
      console.log('✅ MyProfileScreen: Logout successful, redirecting to login...');
      
      // Show success notification
      showNotification.success(t('loggedOutSuccessfully'));
      
      // Redirect to welcome page immediately
      router.replace('/(onboarding)/welcome');
      
    } catch (error) {
      console.error('❌ MyProfileScreen: Logout error:', error);
      
      // Show error notification but still redirect
      showNotification.error(t('logoutFailed'));
      
      // Even if API fails, clear local data and redirect
      console.log('🚪 MyProfileScreen: API failed, but clearing local data and redirecting...');
      router.replace('/(onboarding)/welcome');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      // Check permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showNotification.error(t('permissionRequired'));
        return;
      }

      // Check if Cloudinary is configured
      if (!profileImageService.isConfigured()) {
        showNotification.error(t('imageUploadNotConfigured'));
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingImage(true);
        showNotification.info(t('uploadingImage'));

        const uploadResult = await profileImageService.uploadProfileImage(result.assets[0].uri);

        if (uploadResult.success && uploadResult.url) {
          showNotification.success(t('profileImageUpdated'));
          // TODO: Update user profile with new image URL
          console.log('📸 New profile image URL:', uploadResult.url);
        } else {
          showNotification.error(uploadResult.error || t('imageUploadFailed'));
        }
      }
    } catch (error) {
      console.error('❌ Image upload error:', error);
      showNotification.error(t('imageUploadFailed'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (!user) {
    console.log('⚠️ MyProfileScreen: No user found, showing loading');
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('loadingProfile')}</Text>
      </View>
    );
  }

  console.log('✅ MyProfileScreen: Rendering profile content');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>{t('myProfile')}</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Profile Card */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <ProfileAvatar
                profileImage={user?.profileImage}
                firstName={user?.firstName}
                lastName={user?.lastName}
                name={user?.name}
                size={60}
                onPress={handleImageUpload}
                showCameraIcon={true}
                isUploading={isUploadingImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.name || t('user')
                  }
                </Text>
                <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={() => router.push('/account-information')}>
                <Edit size={20} color="#FF9B42" />
              </TouchableOpacity>
            </View>

            {/* Subscription Section */}
            <View style={styles.subscriptionSection}>
              <View style={styles.activePlanHeader}>
                <Text style={styles.activePlanLabel}>{t('currentSubscription')}</Text>
                <TouchableOpacity 
                  style={styles.viewPlansButton}
                  onPress={() => router.push('/(tabs)/plans')}
                >
                  <Text style={styles.viewPlansButtonText}>
                    {currentSubscription ? t('changePlan') : t('viewPlans')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {currentSubscription ? (
                <View style={styles.activePlanContainer}>
                  <View style={styles.subscriptionDetailRow}>
                    <View style={styles.subscriptionIconContainer}>
                      <Package size={20} color="#FF9B42" />
                    </View>
                    <View style={styles.subscriptionInfo}>
                      <Text style={styles.subscriptionLabel}>{t('plan')}</Text>
                      <Text style={styles.subscriptionValue}>
                        {(currentSubscription as any).plan?.name || t('subscriptionPlan')}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.subscriptionDetailRow}>
                    <View style={styles.subscriptionIconContainer}>
                      <Calendar size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.subscriptionInfo}>
                      <Text style={styles.subscriptionLabel}>{t('status')}</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>
                          {currentSubscription.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.subscriptionDetailRow}>
                    <View style={styles.subscriptionIconContainer}>
                      <Calendar size={20} color="#2196F3" />
                    </View>
                    <View style={styles.subscriptionInfo}>
                      <Text style={styles.subscriptionLabel}>{t('validUntil')}</Text>
                      <Text style={styles.subscriptionValue}>
                        {new Date(currentSubscription.endDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.subscriptionDetailRow}>
                    <View style={styles.subscriptionIconContainer}>
                      <CreditCard size={20} color="#9C27B0" />
                    </View>
                    <View style={styles.subscriptionInfo}>
                      <Text style={styles.subscriptionLabel}>{t('startedOn')}</Text>
                      <Text style={styles.subscriptionValue}>
                        {new Date(currentSubscription.startDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noSubscriptionContainer}>
                  <Package size={48} color="#CCCCCC" />
                  <Text style={styles.noSubscriptionTitle}>{t('noActiveSubscription')}</Text>
                  <Text style={styles.noSubscriptionText}>
                    {t('subscribeToMealPlan')}
                  </Text>
                  <TouchableOpacity 
                    style={styles.subscribeNowButton}
                    onPress={() => router.push('/(tabs)/plans')}
                  >
                    <Text style={styles.subscribeNowButtonText}>{t('subscribeNow')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Menu Options */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account-information')}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
                  <User size={20} color="#2196F3" />
                </View>
                <Text style={styles.menuItemText}>{t('accountInformation')}</Text>
              </View>
              <ChevronRight size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/delivery-addresses')}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#E8F5E8' }]}>
                  <MapPin size={20} color="#4CAF50" />
                </View>
                <Text style={styles.menuItemText}>{t('deliveryAddresses')}</Text>
              </View>
              <ChevronRight size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/payment-methods')}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
                  <CreditCard size={20} color="#FF9800" />
                </View>
                <Text style={styles.menuItemText}>{t('paymentMethods')}</Text>
              </View>
              <ChevronRight size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notification-preferences')}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Bell size={20} color="#9C27B0" />
                </View>
                <Text style={styles.menuItemText}>Notification Settings</Text>
              </View>
              <ChevronRight size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <LanguageSelector onLanguageChange={(lang) => {
              console.log('🌐 Language changed to:', lang);
              // Optionally refresh user profile or other data after language change
            }} />

            {/* Development Test Panel - Remove in production */}
            {__DEV__ && (
              <TouchableOpacity 
                style={[styles.menuItem, { backgroundColor: '#FFF3E0' }]} 
                onPress={() => setShowTestPanel(true)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: '#FF9800' }]}>
                    <TestTube size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.menuItemText}>🧪 Test Notifications</Text>
                </View>
                <ChevronRight size={20} color="#CCCCCC" />
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Support Section */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.supportSection}>
            <Text style={styles.sectionTitle}>{t('support')}</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/help-support')}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemText}>{t('helpSupport')}</Text>
              </View>
              <ChevronRight size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/terms-conditions')}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemText}>{t('termsConditions')}</Text>
              </View>
              <ChevronRight size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/privacy-policy')}>
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemText}>{t('privacyPolicy')}</Text>
              </View>
              <ChevronRight size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.logoutSection}>
            <TouchableOpacity 
              style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]} 
              onPress={() => {
                console.log('🚪 MyProfileScreen: Logout button pressed');
                console.log('🚪 MyProfileScreen: Button disabled state:', isLoggingOut);
                
                handleLogout();
              }}
              disabled={isLoggingOut}
              activeOpacity={0.7}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#F44336" />
              ) : (
                <LogOut size={20} color="#F44336" />
              )}
              <Text style={styles.logoutButtonText}>
                {isLoggingOut ? t('loggingOut') : t('logout')}
              </Text>
            </TouchableOpacity>
            
          </Animated.View>
        </View>
      </ScrollView>
      
      {/* Test Panel - Development Only */}
      <NotificationTestPanel 
        visible={showTestPanel} 
        onClose={() => setShowTestPanel(false)} 
      />
    </SafeAreaView>
  );
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    width: 60,
    height: 60,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF9B42',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
  },
  editButton: {
    padding: 8,
  },
  subscriptionSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 20,
  },
  activePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activePlanLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  viewPlansButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
  },
  viewPlansButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF9B42',
  },
  activePlanContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  subscriptionDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  subscriptionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noSubscriptionContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noSubscriptionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  noSubscriptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  subscribeNowButton: {
    backgroundColor: '#FF9B42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  subscribeNowButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  supportSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  logoutSection: {
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#F44336',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAF0',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
});
