import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Phone, ArrowRight } from 'lucide-react-native';
import phoneAuthService from '@/services/phoneAuthService';
import { useOnboardingStore } from '@/store/onboardingStore';
import RecaptchaContainer from '@/components/RecaptchaContainer';
import { useTranslation } from '@/hooks/useTranslation';
import { useFocusEffect } from '@react-navigation/native';

export default function PhoneVerificationScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setPhoneVerification, nextStep, setCurrentStep } = useOnboardingStore();
  const { t } = useTranslation('onboarding');
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Format as XXX XXX XXXX
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    }
    return limited;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    // Valid Indian mobile number: 10 digits starting with 6, 7, 8, or 9
    return /^[6-9]\d{9}$/.test(cleaned);
  };

  const handleSendOTP = async () => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    
    if (!validatePhoneNumber(cleanedPhone)) {
      Alert.alert(
        t('invalidPhoneTitle'),
        t('invalidPhoneMessage', { phone: cleanedPhone, length: cleanedPhone.length }),
        [{ text: t('ok') }]
      );
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await phoneAuthService.sendOTP(cleanedPhone);
      
      if (result.success) {
        // Store phone number in onboarding store
        setPhoneVerification({
          phoneNumber: cleanedPhone,
          isVerified: false
        });
        
        // Set step and navigate to OTP verification screen
        setCurrentStep(2);
        router.push({
          pathname: '/(onboarding)/otp-verification' as any,
          params: { phoneNumber: cleanedPhone }
        });
      } else {
        Alert.alert(t('error'), result.error || t('otpSendFailed'));
      }
    } catch (error: any) {
      if (__DEV__) console.error('Error sending OTP:', error);
      Alert.alert(t('error'), t('somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleBack = () => {
    router.back();
  };

  const isValidPhone = validatePhoneNumber(phoneNumber.replace(/\D/g, ''));

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#FFFAF0' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          
          {/* Progress removed for authentication flow */}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Phone size={40} color="#FF9B42" />
          </View>

          {/* Title and Description */}
          <Text style={styles.title}>{t('phoneVerificationTitle')}</Text>
          <Text style={styles.description}>
            {t('phoneVerificationDescription')}
          </Text>

          {/* Phone Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>{t('mobileNumber')}</Text>
            
            <View style={styles.phoneInputContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
              </View>
              
              <TextInput
                style={styles.phoneInput}
                placeholder={t('phonePlaceholder')}
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="numeric"
                maxLength={13} // Formatted length: XXX XXX XXXX
                autoFocus
              />
            </View>
            
            {phoneNumber.length > 0 && !isValidPhone && (
              <Text style={styles.errorText}>
                {t('phoneValidationError')}
              </Text>
            )}
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!isValidPhone || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSendOTP}
            disabled={!isValidPhone || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Text style={styles.sendButtonText}>{t('sendOtp')}</Text>
                <ArrowRight size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              {t('smsAgreement')}
            </Text>
          </View>
        </View>

        {/* reCAPTCHA container for Firebase */}
        <RecaptchaContainer />
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
  // Progress styles removed for authentication flow
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
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  inputSection: {
    width: '100%',
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginBottom: 12,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  countryCode: {
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FF4444',
    marginTop: 8,
  },
  sendButton: {
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
  sendButtonDisabled: {
    backgroundColor: '#FFB97C',
    opacity: 0.6,
  },
  sendButtonText: {
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
