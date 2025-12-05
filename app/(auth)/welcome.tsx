import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '@/hooks/useTranslation';

export default function Welcome() {
  const { t } = useTranslation('auth');
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/5836429/pexels-photo-5836429.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
          style={styles.backgroundImage} 
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
        <View style={styles.logoTextContainer}>
          <Text style={styles.logoTitle}>{t('appName')}</Text>
          <Text style={styles.logoSubtitle}>{t('welcomeSubtitle')}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{t('welcomeTitle')}</Text>
        <Text style={styles.subtitle}>
          {t('welcomeSubtitle')}
        </Text>

        <View style={styles.buttonContainer}>
          <Link href="/(onboarding)/phone-verification" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>{t('loginButton')}</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/(onboarding)/phone-verification" asChild>
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupButtonText}>{t('signupButton')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  logoContainer: {
    height: '60%',
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  logoTextContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logoTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 40,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  logoSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#F5F5F5',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#333333',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
  },
  loginButton: {
    backgroundColor: '#FF9B42',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  signupButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF9B42',
  },
  signupButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#FF9B42',
  },
});