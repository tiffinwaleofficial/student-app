import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, Phone, Calendar, Edit2, Camera, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/auth/AuthProvider';
import { ProtectedRoute } from '@/auth/AuthMiddleware';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import api from '@/utils/apiClient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { profileImageService } from '@/services/profileImageService';
import { useNotification } from '@/hooks/useNotification';
import { BackButton } from '@/components/BackButton';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useTranslation } from '@/hooks/useTranslation';

export default function AccountInformation() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { currentSubscription } = useSubscriptionStore();
  const { success, showError } = useNotification();
  const { t } = useTranslation('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state - initialize with real user data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: ''
  });

  // Image upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      if (__DEV__) console.log('🔍 AccountInformation: Updating form data with user:', user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob || ''
      });
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (__DEV__) console.log('🔍 AccountInformation: Saving changes with data:', formData);
    try {
      // Prepare data according to backend DTO
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone, // Backend expects 'phoneNumber', not 'phone'
      };

      // Only include dob if it's provided and format it correctly
      if (formData.dob) {
        // Ensure dob is in ISO date format (YYYY-MM-DD)
        const dobDate = new Date(formData.dob);
        updateData.dob = dobDate.toISOString().split('T')[0];
      }

      // Note: Email updates should be handled separately as backend doesn't accept email in profile update
      
      await api.customer.updateProfile(updateData);
      
      success(t('profileUpdatedSuccessfully'));
      setIsEditing(false);
    } catch (error) {
      if (__DEV__) console.error('Profile update error:', error);
      showError(t('failedToUpdateProfile'));
    }
  };

  // Image upload functions
  const handleImageUpload = async () => {
    if (Platform.OS === 'web') {
      // Web: Show file picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
          await uploadImage(file);
        }
      };
      input.click();
    } else {
      // Mobile: Show image picker modal
      setShowImagePicker(true);
    }
  };

  const pickImageFromLibrary = async () => {
    setShowImagePicker(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    setShowImagePicker(false);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (imageAsset: any) => {
    setIsUploadingImage(true);
    try {
      const uploadResult = await profileImageService.uploadProfileImage(imageAsset);
      const uploadedImageUrl = typeof uploadResult === 'string' ? uploadResult : uploadResult.url;
      
      // Update user profile with new image URL
      await api.customer.updateProfile({
        profileImage: uploadedImageUrl,
      });
      
      success(t('profileImageUpdatedSuccessfully'));
    } catch (error) {
      console.error('Image upload error:', error);
      showError(t('imageUploadFailed'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Date picker functions
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      setFormData({...formData, dob: formattedDate});
    }
  };

  const showDatePickerModal = () => {
    if (formData.dob) {
      setSelectedDate(new Date(formData.dob));
    }
    setShowDatePicker(true);
  };

  // Helper function to get display name
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.name) {
      return user.name;
    }
    return t('user');
  };

  // Helper function to check if user has active subscription
  const hasActiveSubscription = () => {
    return currentSubscription && 
           (currentSubscription.status === 'active' || currentSubscription.status === 'pending');
  };

  // Show loading state while user data is being fetched
  if (isLoading && !user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>{t('accountInformation')}</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9B42" />
          <Text style={styles.loadingText}>{t('loadingYourInformation')}</Text>
        </View>
      </View>
    );
  }

  // Show error state if no user data
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>{t('accountInformation')}</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('unableToLoadAccountInformation')}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)/profile')}
          >
            <Text style={styles.retryButtonText}>{t('goBack')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ProtectedRoute>
      <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('accountInformation')}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Edit2 size={20} color="#FF9B42" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <ProfileAvatar
            profileImage={user?.profileImage}
            firstName={user?.firstName}
            lastName={user?.lastName}
            name={user?.name}
            size={100}
            onPress={isEditing ? handleImageUpload : undefined}
            showCameraIcon={isEditing}
            isUploading={isUploadingImage}
          />
          
          <Text style={styles.userName}>{getDisplayName()}</Text>
          {hasActiveSubscription() && (
            <View style={styles.subscriptionBadge}>
              <Text style={styles.subscriptionText}>
                {currentSubscription?.status === 'pending' ? t('premiumMemberPending') : t('premiumMember')}
              </Text>
            </View>
          )}
        </View>

        <Animated.View 
          entering={FadeInDown.delay(100).duration(300)}
          style={styles.infoCard}
        >
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <User size={20} color="#FF9B42" />
              <Text style={styles.infoLabel}>{t('fullName')}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={`${formData.firstName} ${formData.lastName}`.trim()}
                onChangeText={(text) => {
                  const [firstName, ...lastNameParts] = text.split(' ');
                  setFormData({
                    ...formData,
                    firstName: firstName || '',
                    lastName: lastNameParts.join(' ') || ''
                  });
                }}
                placeholder={t('enterFullName')}
              />
            ) : (
              <Text style={styles.infoValue}>{getDisplayName()}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Mail size={20} color="#FF9B42" />
              <Text style={styles.infoLabel}>{t('emailAddress')}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.infoValue}>{user?.email || t('notProvided')}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Phone size={20} color="#FF9B42" />
              <Text style={styles.infoLabel}>{t('phoneNumber')}</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.infoInput}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                keyboardType="phone-pad"
                placeholder={t('enterPhoneNumber')}
              />
            ) : (
              <Text style={styles.infoValue}>{user?.phone || t('notProvided')}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Calendar size={20} color="#FF9B42" />
              <Text style={styles.infoLabel}>{t('dateOfBirth')}</Text>
            </View>
            {isEditing ? (
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={showDatePickerModal}
              >
                <Text style={styles.datePickerText}>
                  {formData.dob ? new Date(formData.dob).toLocaleDateString() : t('selectDate')}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.infoValue}>
                {user?.dob ? new Date(user.dob).toLocaleDateString() : t('notProvided')}
              </Text>
            )}
          </View>
        </Animated.View>

        {isEditing && (
          <Animated.View 
            entering={FadeInDown.delay(200).duration(300)}
            style={styles.buttonContainer}
          >
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                // Reset form data to current user data
                if (user) {
                  setFormData({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    dob: user.dob || ''
                  });
                }
              }}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveChanges}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.additionalInfoCard}>
          <Text style={styles.sectionTitle}>{t('accountSecurity')}</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/change-password')}>
            <Text style={styles.actionButtonText}>{t('changePassword')}</Text>
            <ArrowLeft size={20} color="#666666" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>{t('twoFactorAuthentication')}</Text>
            <ArrowLeft size={20} color="#666666" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
            <Text style={styles.dangerButtonText}>{t('deleteAccount')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectImage')}</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
              <Camera size={24} color="#FF9B42" />
              <Text style={styles.modalButtonText}>{t('takePhoto')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButton} onPress={pickImageFromLibrary}>
              <User size={24} color="#FF9B42" />
              <Text style={styles.modalButtonText}>{t('chooseFromLibrary')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelModalButton]} 
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.cancelModalButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
    </ProtectedRoute>
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
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFAF0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FF9B42',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#333333',
    marginBottom: 4,
  },
  subscriptionBadge: {
    backgroundColor: '#FFF5E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  subscriptionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FF9B42',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
  },
  infoValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
    flex: 1,
  },
  infoInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333333',
    textAlign: 'right',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#666666',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#FF9B42',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  additionalInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  actionButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333333',
  },
  dangerButton: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  dangerButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#D32F2F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF9B42',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  // Date picker styles
  datePickerButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    justifyContent: 'center',
  },
  datePickerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333333',
    textAlign: 'right',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  modalButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
    marginLeft: 16,
  },
  cancelModalButton: {
    backgroundColor: '#FF6B6B',
    marginTop: 8,
  },
  cancelModalButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
}); 