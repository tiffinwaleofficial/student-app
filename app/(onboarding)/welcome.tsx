import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Check, Users, Clock, MapPin, Heart } from 'lucide-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useTranslation } from '@/hooks/useTranslation';
import { PolicyModal } from '@/components/ui/PolicyModal';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { setCurrentStep, nextStep } = useOnboardingStore();
  const { t } = useTranslation('onboarding');
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [policyType, setPolicyType] = useState<'terms' | 'privacy'>('terms');

  const handleGetStarted = () => {
    setCurrentStep(2);
    router.push('/(onboarding)/phone-verification' as any);
  };

  // Removed handleLogin - no longer needed since we handle both new and existing users through phone verification

  const handleTermsPress = () => {
    setPolicyType('terms');
    setPolicyModalVisible(true);
  };

  const handlePrivacyPress = () => {
    setPolicyType('privacy');
    setPolicyModalVisible(true);
  };

  const benefits = [
    {
      icon: <Heart size={20} color="#FF9B42" />,
      title: t('benefit1Title'),
      description: t('benefit1Description')
    },
    {
      icon: <Users size={20} color="#FF9B42" />,
      title: t('benefit2Title'),
      description: t('benefit2Description')
    },
    {
      icon: <Clock size={20} color="#FF9B42" />,
      title: t('benefit3Title'),
      description: t('benefit3Description')
    },
    {
      icon: <MapPin size={20} color="#FF9B42" />,
      title: t('benefit4Title'),
      description: t('benefit4Description')
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={require('@/assets/images/banner.png')}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
          style={styles.heroOverlay}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{t('appName')}</Text>
          <Text style={styles.heroSubtitle}>{t('appSubtitle')}</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>
            {t('welcomeTitle')}
          </Text>
          <Text style={styles.welcomeDescription}>
            {t('welcomeDescription')}
          </Text>
        </View>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                {benefit.icon}
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
              <View style={styles.checkIcon}>
                <Check size={16} color="#10B981" />
              </View>
            </View>
          ))}
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10K+</Text>
            <Text style={styles.statLabel}>{t('stat1Label')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>{t('stat2Label')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>{t('stat3Label')}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>{t('getStarted')}</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            {t('termsText')}{' '}
            <TouchableOpacity onPress={handleTermsPress}>
              <Text style={styles.termsLink}>{t('termsOfService')}</Text>
            </TouchableOpacity>
            {' '}{t('and')}{' '}
            <TouchableOpacity onPress={handlePrivacyPress}>
              <Text style={styles.termsLink}>{t('privacyPolicy')}</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>

      {/* Policy Modal */}
      <PolicyModal
        visible={policyModalVisible}
        type={policyType}
        onClose={() => setPolicyModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  heroSection: {
    height: height * 0.4,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  heroTitle: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  contentSection: {
    padding: 24,
    paddingTop: 32,
  },
  welcomeContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  welcomeDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666666',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FF9B42',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#666666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
  actionContainer: {
    marginBottom: 24,
  },
  getStartedButton: {
    backgroundColor: '#FF9B42',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#FF9B42',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  // Removed loginButton and loginText styles - no longer needed
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#FF9B42',
    fontFamily: 'Poppins-Medium',
  },
});
