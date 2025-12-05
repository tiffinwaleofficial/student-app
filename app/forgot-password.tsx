import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { } from 'lucide-react-native';
import api from '@/utils/apiClient';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/BackButton';
import { GuestRoute } from '@/auth/AuthMiddleware';
import { useValidationNotifications, useSystemNotifications } from '@/hooks/useFirebaseNotification';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const { invalidEmail } = useValidationNotifications();
  const { showError, showSuccess } = require('@/hooks/useFirebaseNotification').default();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetRequest = async () => {
    if (!email) {
      invalidEmail();
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      await api.auth.forgotPassword(email);
      showSuccess(t('resetLinkSent'), 'Check your email for reset instructions! 📧');
      setMessage(t('resetLinkSent'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('unexpectedError');
      showError(t('error'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GuestRoute>
      <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('forgotPassword')}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.instructions}>
          {t('forgotPasswordInstructions')}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t('enterEmail')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {message ? (
          <Text style={styles.successMessage}>{message}</Text>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleResetRequest} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{t('sendResetLink')}</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
    </GuestRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: '#FFFFFF' },
  backButton: { padding: 8, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  instructions: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 30,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#FF9B42',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successMessage: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
    marginTop: 20,
  },
}); 