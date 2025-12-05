import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, ArrowRight, CheckCircle } from 'lucide-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useFocusEffect } from '@react-navigation/native';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { data, setPersonalInfo, nextStep, setCurrentStep } = useOnboardingStore();
  const { t } = useTranslation('onboarding');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [firstName, setFirstName] = useState(data.personalInfo?.firstName || '');
  const [lastName, setLastName] = useState(data.personalInfo?.lastName || '');
  const [email, setEmail] = useState(data.personalInfo?.email || '');
  const [address, setAddress] = useState(data.personalInfo?.address || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Scroll to top when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = t('firstNameRequired');
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = t('firstNameMinLength');
    }

    if (!lastName.trim()) {
      newErrors.lastName = t('lastNameRequired');
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = t('lastNameMinLength');
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    } else if (address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    // Save personal info to store
    setPersonalInfo({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      address: address.trim()
    });

    // Update step and navigate to food preferences
    setCurrentStep(4);
    router.push('/(onboarding)/food-preferences' as any);
  };

  const handleBack = () => {
    setCurrentStep(2); // Go back to OTP verification (step 2)
    router.back();
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && 
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && 
                      address.trim() && address.trim().length >= 5;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressText}>{t('stepProgress', { current: 3, total: 5 })}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <User size={40} color="#FF9B42" />
          </View>

          {/* Title and Description */}
          <Text style={styles.title}>{t('personalInfoTitle')}</Text>
          <Text style={styles.description}>
            {t('personalInfoDescription')}
          </Text>

          {/* Verified Phone Display */}
          <View style={styles.verifiedPhoneContainer}>
            <View style={styles.verifiedPhoneContent}>
              <CheckCircle size={20} color="#10B981" style={styles.checkIcon} />
              <Text style={styles.verifiedPhoneText}>
                Phone: +91 {data.phoneVerification?.phoneNumber?.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
              </Text>
            </View>
            <Text style={styles.verifiedLabel}>Verified ✓</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('firstName')}</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.firstName && styles.inputError
                ]}
                placeholder={t('firstNamePlaceholder')}
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.firstName) {
                    setErrors(prev => ({ ...prev, firstName: '' }));
                  }
                }}
                autoCapitalize="words"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('lastName')}</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.lastName && styles.inputError
                ]}
                placeholder={t('lastNamePlaceholder')}
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.lastName) {
                    setErrors(prev => ({ ...prev, lastName: '' }));
                  }
                }}
                autoCapitalize="words"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <Text style={styles.inputSubLabel}>We'll use this to send you updates</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.email && styles.inputError
                ]}
                placeholder="your.email@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <Text style={styles.inputSubLabel}>Your current residential address</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.address && styles.inputError
                ]}
                placeholder="Enter your address"
                placeholderTextColor="#999"
                value={address}
                onChangeText={(text) => {
                  setAddress(text);
                  if (errors.address) {
                    setErrors(prev => ({ ...prev, address: '' }));
                  }
                }}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isFormValid && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!isFormValid}
          >
            <Text style={styles.continueButtonText}>{t('continue')}</Text>
            <ArrowRight size={20} color="#FFF" />
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              {t('personalInfoHelp')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFAF0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9B42',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  verifiedPhoneContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    width: '100%',
    borderWidth: 1,
    borderColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedPhoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkIcon: {
    marginRight: 12,
  },
  verifiedPhoneText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    flex: 1,
  },
  verifiedLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#10B981',
    marginLeft: 8,
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginBottom: 4,
  },
  inputSubLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FF4444',
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#FF9B42',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
    shadowColor: '#FF9B42',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: '#FFB97C',
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    marginRight: 8,
  },
  helpContainer: {
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
