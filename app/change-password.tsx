import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import api from '@/utils/apiClient';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { ProtectedRoute } from '@/auth/AuthMiddleware';
import { useProfileNotifications, useValidationNotifications } from '@/hooks/useFirebaseNotification';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation('profile');
  const { passwordChanged, passwordChangeFailed } = useProfileNotifications();
  const { requiredField, passwordMismatch } = useValidationNotifications();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      requiredField('password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      passwordMismatch();
      return;
    }
    setIsLoading(true);
    try {
      await api.auth.changePassword(oldPassword, newPassword);
      passwordChanged();
      router.back();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('passwordChangeError');
      passwordChangeFailed(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('changePasswordTitle')}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('oldPassword')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showOldPassword}
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)} style={styles.eyeIcon}>
              {showOldPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('newPassword')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
              {showNewPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('confirmNewPassword')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              {showConfirmPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleChangePassword} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{t('changePassword')}</Text>}
        </TouchableOpacity>
      </View>
    </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: '#FFFFFF' },
    backButton: { padding: 8, marginRight: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 16, color: '#333', marginBottom: 10 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10 },
    input: { flex: 1, padding: 15, fontSize: 16 },
    eyeIcon: { padding: 10 },
    submitButton: { width: '100%', backgroundColor: '#FF9B42', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    submitButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
}); 