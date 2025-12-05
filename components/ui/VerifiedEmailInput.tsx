import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Check, X, AlertCircle, RefreshCw } from 'lucide-react-native';
import emailVerificationService, { EmailVerificationResult } from '@/services/emailVerificationService';
import { useTranslation } from '@/hooks/useTranslation';

interface VerifiedEmailInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onVerificationChange: (isVerified: boolean, result?: EmailVerificationResult) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  style?: any;
  disabled?: boolean;
  autoVerify?: boolean; // Whether to auto-verify on text change
  debounceMs?: number; // Debounce delay for auto-verification
}

export const VerifiedEmailInput: React.FC<VerifiedEmailInputProps> = ({
  value,
  onChangeText,
  onVerificationChange,
  placeholder = 'Enter your email',
  label,
  error,
  style,
  disabled = false,
  autoVerify = true,
  debounceMs = 1000,
}) => {
  const { t } = useTranslation('auth');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<EmailVerificationResult | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Basic email format validation
  const isValidFormat = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Verify email function
  const verifyEmail = useCallback(async (email: string) => {
    if (!email || !isValidFormat(email)) {
      setVerificationResult(null);
      setVerificationError(null);
      onVerificationChange(false);
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      console.log('🔍 VerifiedEmailInput: Starting verification for:', email);
      const result = await emailVerificationService.verifyEmail(email);
      console.log('📧 VerifiedEmailInput: Verification result:', result);
      
      setVerificationResult(result);
      onVerificationChange(result.isValid && result.isDeliverable, result);
    } catch (error) {
      console.error('❌ VerifiedEmailInput: Verification failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setVerificationError(errorMessage);
      setVerificationResult(null);
      onVerificationChange(false);
    } finally {
      setIsVerifying(false);
    }
  }, [onVerificationChange]);

  // Handle text change with debouncing
  const handleTextChange = useCallback((text: string) => {
    onChangeText(text);

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Reset verification state when text changes
    if (text !== value) {
      setVerificationResult(null);
      setVerificationError(null);
      onVerificationChange(false);
    }

    // Set up new timer for auto-verification
    if (autoVerify && text && isValidFormat(text)) {
      const timer = setTimeout(() => {
        verifyEmail(text);
      }, debounceMs);
      setDebounceTimer(timer);
    }
  }, [onChangeText, value, debounceTimer, autoVerify, debounceMs, verifyEmail]);

  // Manual verification trigger
  const handleManualVerify = () => {
    if (value && isValidFormat(value)) {
      verifyEmail(value);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Get verification status icon
  const getVerificationIcon = () => {
    if (isVerifying) {
      return <ActivityIndicator size="small" color="#FF9B42" style={styles.icon} />;
    }

    if (verificationResult?.isValid && verificationResult?.isDeliverable) {
      return <Check size={20} color="#10B981" style={styles.icon} />;
    }

    if (verificationResult && (!verificationResult.isValid || !verificationResult.isDeliverable)) {
      return <X size={20} color="#EF4444" style={styles.icon} />;
    }

    if (verificationError) {
      return <AlertCircle size={20} color="#F59E0B" style={styles.icon} />;
    }

    return null;
  };

  // Removed getVerificationText and getVerificationTextColor functions
  // as we're only showing icons for a cleaner UI

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            verificationResult?.isValid && verificationResult?.isDeliverable && styles.inputSuccess,
          ]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />
        
        <View style={styles.iconContainer}>
          {getVerificationIcon()}
          
          {/* Manual verify button */}
          {!autoVerify && value && isValidFormat(value) && !isVerifying && (
            <TouchableOpacity onPress={handleManualVerify} style={styles.verifyButton}>
              <RefreshCw size={16} color="#FF9B42" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Verification text removed - only icons are shown for clean UI */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    paddingRight: 50, // Space for icon
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputSuccess: {
    borderColor: '#10B981',
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 4,
  },
  verifyButton: {
    padding: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  // Removed verificationText and debugText styles as they're no longer used
});

export default VerifiedEmailInput;
