import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { MessageCircle, Phone, HelpCircle, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useFeedbackStore } from '@/store/feedbackStore';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';
import { useSystemNotifications } from '@/hooks/useFirebaseNotification';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { t } = useTranslation('support');
  const { showSuccess, showError } = require('@/hooks/useFirebaseNotification').default();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const { submitFeedback, isLoading, error, submitSuccess, clearError, clearSuccess } = useFeedbackStore();

  const supportEmail = 'support@tiffinwale.com';
  const supportPhone = '1800-123-4567';

  const handleContactSupport = async (type: 'delivery' | 'food_quality' | 'account' | 'other', subject: string) => {
    try {
      await submitFeedback({
        type: 'general',
        subject: subject,
        message: `User needs help with: ${type}`,
        category: 'service'
      });
      
      showSuccess(
        t('supportRequestSent'),
        'Our support team will get back to you faster than food delivery! 🚀'
      );
      clearSuccess();
    } catch (err) {
      showError(
        t('error'),
        'Failed to send support request. Don\'t worry, we\'re still here to help! 💪'
      );
      clearError();
    }
  };

  const helpCategories = [
    {
      title: t('deliveryIssues'),
      description: t('deliveryIssuesDescription'),
      action: () => handleContactSupport('delivery', t('deliveryIssues')),
      faqs: [
        { question: t('myOrderIsLate'), answer: t('myOrderIsLateAnswer') },
        { question: t('wrongAddressDelivery'), answer: t('wrongAddressDeliveryAnswer') },
        { question: t('deliveryPersonNotResponding'), answer: t('deliveryPersonNotRespondingAnswer') }
      ]
    },
    {
      title: 'Food Quality',
      description: 'Issues with food quality or packaging',
      action: () => handleContactSupport('food_quality', 'Food Quality Issues'),
      faqs: [
        { question: 'Food arrived cold', answer: 'We apologize for the inconvenience. Please contact support for a refund or replacement.' },
        { question: 'Wrong items delivered', answer: 'Please contact support immediately. We will arrange for correct items to be delivered.' },
        { question: 'Food packaging damaged', answer: 'Contact our support team for immediate resolution and compensation.' }
      ]
    },
    {
      title: 'Account & Payments',
      description: 'Subscription, payments, or account issues',
      action: () => handleContactSupport('account', 'Account & Payment Issues'),
      faqs: [
        { question: 'How to cancel subscription?', answer: 'Go to your profile > subscription settings > cancel subscription. Cancellation takes effect at the end of current billing period.' },
        { question: 'Payment failed', answer: 'Check your payment method and try again. Contact support if the issue persists.' },
        { question: 'Forgot password', answer: 'Use the forgot password option on login screen or contact support for assistance.' }
      ]
    },
    {
      title: 'Other Issues',
      description: 'Any other concerns or feedback',
      action: () => handleContactSupport('other', 'General Support Request'),
      faqs: [
        { question: 'How to change delivery time?', answer: 'You can modify delivery time in your order details before confirmation.' },
        { question: 'Special dietary requirements', answer: 'Contact support to discuss your dietary needs and we will accommodate them.' },
        { question: 'App not working properly', answer: 'Try restarting the app or clearing cache. Contact support if the issue persists.' }
      ]
    },
  ];

  const filteredCategories = helpCategories.filter(category => 
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.faqs.some(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setExpandedCategory(null); // Close expanded categories when searching
    }
  };

  const toggleCategory = (index: number) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  const handleChatSupport = async () => {
    try {
      await submitFeedback({
        type: 'general',
        subject: 'Chat Support Request',
        message: 'User requested chat support assistance',
        category: 'service'
      });
      
      showSuccess(
        'Chat Request Sent! 💬',
        'We will connect you with an agent faster than you can say "tiffin"! 🏃‍♂️'
      );
      clearSuccess();
    } catch (err) {
      showError(
        'Chat Error 😅',
        'Failed to initiate chat. Don\'t worry, our phone support is always ready! ☎️'
      );
      clearError();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('helpSupport')}</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('searchHelp')}
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>{t('contactSupport')}</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={[styles.actionCard, isLoading && styles.disabledCard]}
              onPress={handleChatSupport}
              disabled={isLoading}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E6F2FF' }]}>
                <MessageCircle size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionTitle}>{t('chatWithUs')}</Text>
              <Text style={styles.actionSubtitle}>{t('contactSupport')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => Linking.openURL(`tel:${supportPhone}`)}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E7F5EF' }]}>
                <Phone size={24} color="#22C55E" />
              </View>
              <Text style={styles.actionTitle}>{t('callUs')}</Text>
              <Text style={styles.actionSubtitle}></Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/faq')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3E7' }]}>
                <HelpCircle size={24} color="#F97316" />
              </View>
              <Text style={styles.actionTitle}>{t('frequentlyAskedQuestions')}</Text>
              <Text style={styles.actionSubtitle}></Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Search Results (${filteredCategories.length})` : 'Help Categories'}
          </Text>
          <View style={styles.helpCategoriesContainer}>
            {filteredCategories.map((category, index) => (
              <View key={index} style={styles.categoryContainer}>
                <TouchableOpacity 
                  style={[styles.categoryCard, isLoading && styles.disabledCard]}
                  onPress={() => toggleCategory(index)}
                  disabled={isLoading}
                >
                  <View style={styles.categoryContent}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                  <ChevronRight 
                    size={20} 
                    color="#999999" 
                    style={{
                      transform: [{ rotate: expandedCategory === index ? '90deg' : '0deg' }]
                    }}
                  />
                </TouchableOpacity>
                
                {expandedCategory === index && (
                  <Animated.View entering={FadeInDown.duration(300)} style={styles.faqContainer}>
                    {category.faqs.map((faq, faqIndex) => (
                      <View key={faqIndex} style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                      </View>
                    ))}
                    <TouchableOpacity 
                      style={styles.contactSupportButton}
                      onPress={category.action}
                    >
                      <Text style={styles.contactSupportText}>Contact Support for {category.title}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <View style={styles.contactInfoCard}>
            <Text style={styles.contactInfoTitle}>Contact Information</Text>
            <Text style={styles.supportHours}>
              Our support team is available from 8:00 AM to 10:00 PM
            </Text>
            <View style={styles.contactDetail}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{supportEmail}</Text>
            </View>
            <View style={styles.contactDetail}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{supportPhone}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFBF2',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#333333',
  },
  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bellIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: '#333333',
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
  },
  actionSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  helpCategoriesContainer: {
    marginBottom: 24,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  contactInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactInfoTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#333333',
    marginBottom: 8,
  },
  supportHours: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  contactDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contactLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#666666',
  },
  contactValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
  },
  disabledCard: {
    backgroundColor: '#EEEEEE',
  },
  categoryContainer: {
    marginBottom: 12,
  },
  faqContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  faqQuestion: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  contactSupportButton: {
    backgroundColor: '#FF9B42',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  contactSupportText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
}); 