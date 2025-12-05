import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star,} from 'lucide-react-native';
import { useOrderStore } from '@/store/orderStore';
import Animated from 'react-native-reanimated';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useValidationNotifications } from '@/hooks/useFirebaseNotification';

export default function RateMealScreen() {
  const router = useRouter();
  const { t } = useTranslation('orders');
  const { requiredField } = useValidationNotifications();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoading, addReview } = useOrderStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSaveReview = async () => {
    if (!id) return;
    if (rating === 0) {
      requiredField('rating');
      return;
    }
    await addReview(id, rating, comment);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('rateMeal')}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{t('howWasYourMeal')}</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity key={i} onPress={() => setRating(i)}>
              <Star size={40} color={i <= rating ? '#FFD700' : '#E0E0E0'} fill={i <= rating ? '#FFD700' : 'transparent'} />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.commentInput}
          placeholder={t('addCommentOptional')}
          multiline
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSaveReview} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{t('submitReview')}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: '#FFFFFF' },
    backButton: { padding: 8, marginRight: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20, alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    starsContainer: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    commentInput: {
        width: '100%',
        height: 120,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        textAlignVertical: 'top',
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
}); 