import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Utensils } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function ActiveSubscriptionPlanScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(100).duration(300)} style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/profile')} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Subscription</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Premium Plan</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>

          <Text style={styles.planPrice}>₹3,999/month</Text>

          <View style={styles.subscriptionInfoContainer}>
            <View style={styles.subscriptionInfoItem}>
              <Calendar size={20} color="#666666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Subscription Period</Text>
                <Text style={styles.infoValue}>Mar 1, 2024 - Mar 31, 2024</Text>
              </View>
            </View>

            <View style={styles.subscriptionInfoItem}>
              <Utensils size={20} color="#666666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Meals Remaining</Text>
                <Text style={styles.infoValue}>42 meals</Text>
              </View>
            </View>

            <View style={styles.subscriptionInfoItem}>
              <Clock size={20} color="#666666" style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Next Renewal</Text>
                <Text style={styles.infoValue}>Apr 1, 2024</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.modifyPlanButton}>
            <Text style={styles.modifyPlanButtonText}>Modify Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pauseButton}>
            <Text style={styles.pauseButtonText}>Pause Subscription</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>Plan Benefits</Text>

          <View style={styles.benefitCard}>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Utensils size={24} color="#4299e1" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>2 Meals per Day</Text>
                <Text style={styles.benefitDescription}>Choose from a variety of dishes for lunch and dinner</Text>
              </View>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconContainer, { backgroundColor: '#FFF8EE' }]}>
                <Calendar size={24} color="#FF9B42" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Weekend Delivery</Text>
                <Text style={styles.benefitDescription}>Enjoy fresh meals even on weekends</Text>
              </View>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Clock size={24} color="#43A047" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Flexible Timing</Text>
                <Text style={styles.benefitDescription}>Schedule deliveries at your preferred time</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Your subscription will remain active until the end of the current billing period
        </Text>
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
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#333333',
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#43A047',
  },
  planPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    color: '#FF9B42',
    marginBottom: 24,
  },
  subscriptionInfoContainer: {
    marginBottom: 24,
  },
  subscriptionInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 16,
  },
  infoLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
  },
  modifyPlanButton: {
    backgroundColor: '#FF9B42',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  modifyPlanButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  pauseButton: {
    backgroundColor: '#FFF8EE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pauseButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FF9B42',
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#333333',
    marginBottom: 16,
  },
  benefitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#E53935',
  },
  disclaimerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
}); 