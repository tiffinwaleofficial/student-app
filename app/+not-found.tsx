import { Link } from 'expo-router';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation('common');
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#FF9B42', '#FF7A42']}
          style={styles.gradient}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('oops')}</Text>
          <Text style={styles.headerSubtitle}>{t('pageNotFound')}</Text>
        </View>
      </View>
      
      {/* Scrollable Content Section */}
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7518/7518748.png' }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>{t('error404')}</Text>
        <Text style={styles.description}>
          {t('pageNotFoundDescription')}
        </Text>
        
        <View style={styles.buttonContainer}>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.homeButton}>
              <Text style={styles.homeButtonText}>{t('goToHome')}</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/help-support" asChild>
            <TouchableOpacity style={styles.supportButton}>
              <Text style={styles.supportButtonText}>{t('contactSupport')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  header: {
    height: height * 0.1,
    width: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  imageWrapper: {
    width: width * 0.7,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: width * 0.4,
    height: width * 0.4,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  homeButton: {
    backgroundColor: '#FF9B42',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    maxWidth: 250,
  },
  homeButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  supportButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 250,
    borderWidth: 1,
    borderColor: '#FF9B42',
  },
  supportButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FF9B42',
  },
});
