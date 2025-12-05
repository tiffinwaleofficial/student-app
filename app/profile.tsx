import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, HelpCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfileFragment() {
  const router = useRouter();
  const { t } = useTranslation('profile');
  
  return (
    <View>
      <TouchableOpacity 
        style={styles.settingsOption}
        onPress={() => router.push('/help-support')}
      >
        <View style={styles.settingsOptionContent}>
          <View style={[styles.settingsOptionIcon, { backgroundColor: '#FFF5E6' }]}>
            <HelpCircle size={20} color="#FF9B42" />
          </View>
          <Text style={styles.settingsOptionText}>{t('helpSupport')}</Text>
        </View>
        <ChevronRight size={20} color="#CCCCCC" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsOptionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
  },
}); 