import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from '@/hooks/useTranslation';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';

export const NoSubscriptionDashboard = () => {
  const router = useRouter();
  const { t } = useTranslation('subscription');

  return (
    <View style={styles.noSubscriptionContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
          style={styles.noSubscriptionImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.8)', '#FFFAF0']}
          style={styles.imageOverlay}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.noSubscriptionTitle}>{t('noActiveSubscription')}</Text>
        <Text style={styles.noSubscriptionText}>
          {t('subscribeToPlan')}
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/plans')}
        >
          <LinearGradient
            colors={['#FF9B42', '#FF6B6B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subscribeButton}
          >
            <Text style={styles.subscribeButtonText}>{t('browsePlans')}</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  noSubscriptionContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFAF0',
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    position: 'relative',
  },
  noSubscriptionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  contentContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: -20,
  },
  noSubscriptionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  noSubscriptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#FF9B42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    gap: 8,
  },
  subscribeButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});