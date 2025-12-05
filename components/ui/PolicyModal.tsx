import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';

interface PolicyModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

const { height: screenHeight } = Dimensions.get('window');

export const PolicyModal: React.FC<PolicyModalProps> = ({
  visible,
  onClose,
  type,
}) => {
  const { t } = useTranslation('profile');

  const renderTermsContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.lastUpdated}>Last updated: October 11, 2025</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using TiffinWale's food delivery service, you accept and agree to be 
          bound by the terms and provision of this agreement. If you do not agree to abide by 
          the above, please do not use this service.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Service Description</Text>
        <Text style={styles.paragraph}>
          TiffinWale provides a platform for ordering meals from local restaurants and food 
          vendors. We facilitate the connection between customers and food providers but are 
          not directly responsible for food preparation or quality.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          To use our service, you must create an account. You are responsible for:
        </Text>
        <Text style={styles.bulletPoint}>• Maintaining the confidentiality of your account</Text>
        <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
        <Text style={styles.bulletPoint}>• Providing accurate and current information</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Orders and Payments</Text>
        <Text style={styles.paragraph}>
          All orders are subject to availability and acceptance. We reserve the right to refuse 
          or cancel orders at our discretion. Payment must be made at the time of ordering 
          through our approved payment methods.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Delivery</Text>
        <Text style={styles.paragraph}>
          We strive to deliver orders within the estimated time frame. However, delivery times 
          may vary due to factors beyond our control, including weather conditions, traffic, 
          and restaurant preparation time.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Cancellation and Refunds</Text>
        <Text style={styles.paragraph}>
          Orders may be cancelled within a limited time after placement. Refunds will be 
          processed according to our refund policy. Please contact customer support for 
          assistance with cancellations or refunds.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          TiffinWale shall not be liable for any indirect, incidental, special, or consequential 
          damages arising from the use of our service. Our liability is limited to the amount 
          paid for the specific order in question.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. Changes will be effective 
          immediately upon posting. Your continued use of the service constitutes acceptance 
          of the modified terms.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>9. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms and Conditions, please contact us at:
        </Text>
        <Text style={styles.bulletPoint}>• Email: support@tiffinwale.com</Text>
        <Text style={styles.bulletPoint}>• Phone: +91 98765 43210</Text>
      </View>
    </ScrollView>
  );

  const renderPrivacyContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: October 11, 2025</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly to us, such as when you create an account, 
          place an order, or contact us for support. This may include:
        </Text>
        <Text style={styles.bulletPoint}>• Name, email address, and phone number</Text>
        <Text style={styles.bulletPoint}>• Delivery addresses and preferences</Text>
        <Text style={styles.bulletPoint}>• Payment information (processed securely)</Text>
        <Text style={styles.bulletPoint}>• Order history and meal preferences</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.bulletPoint}>• Process and fulfill your orders</Text>
        <Text style={styles.bulletPoint}>• Provide customer support</Text>
        <Text style={styles.bulletPoint}>• Send you important updates about your orders</Text>
        <Text style={styles.bulletPoint}>• Improve our services and user experience</Text>
        <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, or otherwise transfer your personal information to third parties 
          without your consent, except as described in this policy:
        </Text>
        <Text style={styles.bulletPoint}>• With restaurant partners to fulfill orders</Text>
        <Text style={styles.bulletPoint}>• With delivery partners for order delivery</Text>
        <Text style={styles.bulletPoint}>• With payment processors for transaction processing</Text>
        <Text style={styles.bulletPoint}>• When required by law or to protect our rights</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate security measures to protect your personal information against 
          unauthorized access, alteration, disclosure, or destruction. However, no method of 
          transmission over the internet is 100% secure.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bulletPoint}>• Access and update your personal information</Text>
        <Text style={styles.bulletPoint}>• Request deletion of your account and data</Text>
        <Text style={styles.bulletPoint}>• Opt out of marketing communications</Text>
        <Text style={styles.bulletPoint}>• Request a copy of your data</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
        <Text style={styles.paragraph}>
          We use cookies and similar technologies to enhance your experience, analyze usage 
          patterns, and provide personalized content. You can control cookie settings through 
          your browser preferences.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Changes to Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. We will notify you of any 
          significant changes by posting the new policy on our app and updating the 
          "Last updated" date.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>8. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at:
        </Text>
        <Text style={styles.bulletPoint}>• Email: privacy@tiffinwale.com</Text>
        <Text style={styles.bulletPoint}>• Phone: +91 98765 43210</Text>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {type === 'terms' ? renderTermsContent() : renderPrivacyContent()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginRight: 24, // Compensate for close button
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginLeft: 16,
    marginBottom: 4,
  },
});

export default PolicyModal;
