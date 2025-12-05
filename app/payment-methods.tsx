import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, CreditCard } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { t } = useTranslation('profile');

  const paymentMethods = [
    {
      id: '1',
      type: 'Credit Card',
      number: '**** **** **** 4242',
      expiryDate: '09/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'Debit Card',
      number: '**** **** **** 5678',
      expiryDate: '12/24',
      isDefault: false,
    },
  ];

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('paymentMethods')}</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {paymentMethods.map((method, index) => (
          <Animated.View 
            key={method.id}
            entering={FadeInDown.delay(200 + (index * 100)).duration(400)} 
            style={styles.cardContainer}
          >
            <View style={styles.cardIconContainer}>
              <CreditCard size={24} color="#FF9B42" />
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardType}>{method.type}</Text>
              <Text style={styles.cardNumber}>{method.number}</Text>
              <Text style={styles.cardExpiry}>{t('expires')} {method.expiryDate}</Text>
            </View>
            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>{t('default')}</Text>
              </View>
            )}
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <TouchableOpacity style={styles.addCardButton}>
            <Plus size={20} color="#FF9B42" />
            <Text style={styles.addCardButtonText}>{t('addPaymentMethod')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardDetails: {
    flex: 1,
  },
  cardType: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  cardNumber: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  cardExpiry: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#999999',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#43A047',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8EE',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  addCardButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FF9B42',
    marginLeft: 8,
  },
}); 