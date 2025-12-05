import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Tag } from 'lucide-react-native';
import { useMarketingStore } from '@/store/marketingStore';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNotification } from '@/hooks/useNotification';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';

export default function PromotionsScreen() {
  const router = useRouter();
  const { t } = useTranslation('subscription');
  const { promotions, isLoading, error, fetchPromotions, applyPromotion } = useMarketingStore();
  const [promoCode, setPromoCode] = useState('');
  const { warning, success, showError } = useNotification();

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleApplyPromo = async () => {
    if (!promoCode) {
      warning('Please enter a promotion code.');
      return;
    }
    try {
      await applyPromotion(promoCode);
      success('Promotion applied successfully! 🎉');
      setPromoCode('');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to apply promotion.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('promotions')}</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.applyPromoSection}>
          <TextInput
            style={styles.input}
            placeholder="Enter Promo Code"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyPromo} disabled={isLoading}>
            {isLoading && !promotions.length ? null : <Text style={styles.applyButtonText}>Apply</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Available Promotions</Text>
        {isLoading && promotions.length === 0 ? (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#FF9B42" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : promotions.length === 0 ? (
          <Text style={styles.emptyText}>No promotions available right now.</Text>
        ) : (
          promotions.map((promo, index) => (
            <Animated.View key={promo.id} style={styles.promoCard} entering={FadeInDown.delay(index * 100).duration(400)}>
              <View style={styles.promoIcon}>
                <Tag size={24} color="#FF9B42" />
              </View>
              <View style={styles.promoDetails}>
                <Text style={styles.promoCode}>{promo.code}</Text>
                <Text style={styles.promoDescription}>{promo.description}</Text>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: '#FFFFFF' },
  backButton: { padding: 8, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  applyPromoSection: { flexDirection: 'row', marginBottom: 30 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, fontSize: 16 },
  applyButton: { backgroundColor: '#FF9B42', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  applyButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  promoCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  promoIcon: { marginRight: 15 },
  promoDetails: { flex: 1 },
  promoCode: { fontSize: 16, fontWeight: 'bold' },
  promoDescription: { fontSize: 14, color: '#666' },
  errorText: { color: 'red', textAlign: 'center' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 20 },
}); 