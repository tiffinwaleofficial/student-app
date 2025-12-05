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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Shield, RotateCcw } from 'lucide-react-native';
import phoneAuthService from '@/services/phoneAuthService';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuth } from '@/auth/AuthProvider';
import { notificationActions } from '@/store/notificationStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthNotifications, useValidationNotifications, useSystemNotifications } from '@/hooks/useFirebaseNotification';
import { useFocusEffect } from '@react-navigation/native';

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const { setPhoneVerification, nextStep, setCurrentStep } = useOnboardingStore();
  const { loginWithPhone, checkUserExists } = useAuth();
  const { t } = useTranslation('onboarding');
  
  // Firebase notifications
  const { loginFailed } = useAuthNotifications();
  const { requiredField } = useValidationNotifications();
  const { networkError } = useSystemNotifications();
  const { showSuccess, showError } = require('@/hooks/useFirebaseNotification').default();
  
  // Refs for OTP inputs
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to top when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  useEffect(() => {
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    }
    return phone;
  };

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (value && index === 5 && newOtp.every(digit => digit !== '')) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (providedOtp?: string) => {
    const otpCode = providedOtp || otp.join('');
    
    if (otpCode.length !== 6) {
      requiredField('complete OTP');
      return;
    }

    setIsLoading(true);

    try {
      // Verify OTP with Firebase
      const result = await phoneAuthService.verifyOTP(otpCode);
      
      if (result.success && result.user) {
        if (__DEV__) console.log('🔐 OTP Verification: Firebase OTP verified successfully');
        
        // Mark phone as verified in onboarding store
        setPhoneVerification({
          phoneNumber: phoneNumber!,
          isVerified: true
        });

        // Check if user exists using new auth system
        const userExists = await checkUserExists(phoneNumber!);
        
        if (userExists) {
          // User exists, log them in
          try {
            await loginWithPhone(phoneNumber!, result.user.uid);
            
            if (__DEV__) console.log('✅ OTP Verification: User logged in successfully');
            
            // Show success notification
            notificationActions.showNotification({
              id: `login-success-${Date.now()}`,
              type: 'toast',
              variant: 'success',
              title: `Welcome back!`,
              message: 'You have been successfully logged in.',
              duration: 4000,
            });
            
            // Small delay to ensure auth state is updated before navigation
            setTimeout(() => {
              // Navigate to main app - AuthProvider will handle the redirect
              router.replace('/(tabs)' as any);
            }, 500);
            
          } catch (loginError) {
            console.error('❌ OTP Verification: Login failed:', loginError);
            loginFailed('Please try again');
            setIsLoading(false);
            return;
          }
        } else {
          // User doesn't exist, proceed with onboarding
          if (__DEV__) console.log('📝 OTP Verification: User requires onboarding');
          
          // Show welcome notification for new user
          notificationActions.showNotification({
            id: `welcome-new-user-${Date.now()}`,
            type: 'toast',
            variant: 'success',
            title: 'Welcome to TiffinWale!',
            message: 'Let\'s set up your account to get started.',
            duration: 3000,
          });
          
          // Continue to personal info step
          setCurrentStep(3);
          router.push('/(onboarding)/personal-info' as any);
        }
      } else {
        loginFailed(result.error || t('verificationFailedMessage'));
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      networkError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !phoneNumber) return;

    setIsResending(true);
    
    try {
      const result = await phoneAuthService.resendOTP(phoneNumber);
      
      if (result.success) {
        // Reset timer and OTP
        setOtp(['', '', '', '', '', '']);
        setTimer(30);
        setCanResend(false);
        
        // Focus first input
        inputRefs.current[0]?.focus();
        
        // Show success notification for OTP resent
        showSuccess(t('otpSentTitle'), t('otpSentMessage'));
      } else {
        showError(t('error'), result.error || t('resendOtpFailed'));
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      networkError();
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(2); // Stay on step 2 but go back to phone input
    router.back();
  };

  const isOtpComplete = otp.every(digit => digit !== '');

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
          
          {/* Progress removed for authentication flow */}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Shield size={40} color="#FF9B42" />
          </View>

          {/* Title and Description */}
          <Text style={styles.title}>{t('otpVerificationTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('otpVerificationSubtitle')}{'\n'}
            <Text style={styles.phoneText}>{formatPhoneNumber(phoneNumber || '')}</Text>
          </Text>

          {/* OTP Input */}
          <View style={styles.otpSection}>
            <Text style={styles.otpLabel}>{t('enterVerificationCode')}</Text>
            
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isOtpComplete || isLoading) && styles.verifyButtonDisabled
            ]}
            onPress={handleVerifyOTP}
            disabled={!isOtpComplete || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.verifyButtonText}>{t('verifyAndContinue')}</Text>
            )}
          </TouchableOpacity>

          {/* Resend Section */}
          <View style={styles.resendSection}>
            {!canResend ? (
              <Text style={styles.timerText}>
                {t('resendCodeIn', { seconds: timer })}
              </Text>
            ) : (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={isResending}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color="#FF9B42" />
                ) : (
                  <>
                    <RotateCcw size={16} color="#FF9B42" />
                    <Text style={styles.resendText}>{t('resendCode')}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Help Text */}
          <View style={styles.helpSection}>
            <Text style={styles.helpText}>
              {t('didntReceiveCode')}
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
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  phoneText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FF9B42',
  },
  otpSection: {
    width: '100%',
    marginBottom: 32,
  },
  otpLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFF',
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    includeFontPadding: false,
  },
  otpInputFilled: {
    borderColor: '#FF9B42',
    backgroundColor: '#FFF9F0',
  },
  verifyButton: {
    backgroundColor: '#FF9B42',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
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
  verifyButtonDisabled: {
    backgroundColor: '#FFB97C',
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#FF9B42',
    marginLeft: 8,
  },
  helpSection: {
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
