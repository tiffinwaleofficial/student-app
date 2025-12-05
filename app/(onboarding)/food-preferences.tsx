import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChefHat, ArrowRight } from 'lucide-react-native';
import { useOnboardingStore, CUISINE_OPTIONS, DIETARY_TYPES } from '@/store/onboardingStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useFocusEffect } from '@react-navigation/native';

export default function FoodPreferencesScreen() {
  const router = useRouter();
  const { data, setFoodPreferences, setCurrentStep } = useOnboardingStore();
  const { t } = useTranslation('onboarding');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    data.foodPreferences?.cuisinePreferences || []
  );
  const [selectedDietaryType, setSelectedDietaryType] = useState<string>(
    data.foodPreferences?.dietaryType || ''
  );
  const [spiceLevel, setSpiceLevel] = useState<number>(
    data.foodPreferences?.spiceLevel || 3
  );
  const [allergies, setAllergies] = useState<string[]>(
    data.foodPreferences?.allergies || []
  );

  // Scroll to top when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const commonAllergies = [
    t('nuts'), t('dairy'), t('gluten'), t('eggs'), t('seafood'), t('soy'), t('sesame')
  ];

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleContinue = () => {
    if (selectedCuisines.length === 0) {
      Alert.alert(t('selectPreferencesTitle'), t('selectPreferencesMessage'));
      return;
    }

    if (!selectedDietaryType) {
      Alert.alert(t('selectDietaryTypeTitle'), t('selectDietaryTypeMessage'));
      return;
    }

    // Save food preferences to store
    setFoodPreferences({
      cuisinePreferences: selectedCuisines,
      dietaryType: selectedDietaryType as any,
      spiceLevel,
      allergies
    });

    // Update step and navigate to delivery location
    setCurrentStep(5);
    router.push('/(onboarding)/delivery-location' as any);
  };

  const handleBack = () => {
    setCurrentStep(3); // Go back to personal info (step 3)
    router.back();
  };

  const isFormValid = selectedCuisines.length > 0 && selectedDietaryType;

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container} 
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '80%' }]} />
          </View>
          <Text style={styles.progressText}>{t('stepProgress', { current: 4, total: 5 })}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <ChefHat size={40} color="#FF9B42" />
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>{t('foodPreferencesTitle')}</Text>
        <Text style={styles.description}>
          {t('foodPreferencesDescription')}
        </Text>

        {/* Cuisine Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('cuisinePreferences')}</Text>
          <Text style={styles.sectionSubtitle}>{t('selectAllYouEnjoy')}</Text>
          
          <View style={styles.cuisineGrid}>
            {CUISINE_OPTIONS.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.cuisineChip,
                  selectedCuisines.includes(cuisine) && styles.cuisineChipSelected
                ]}
                onPress={() => toggleCuisine(cuisine)}
              >
                <Text style={[
                  styles.cuisineChipText,
                  selectedCuisines.includes(cuisine) && styles.cuisineChipTextSelected
                ]}>
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dietaryPreference')}</Text>
          <Text style={styles.sectionSubtitle}>{t('chooseDietaryType')}</Text>
          
          <View style={styles.dietaryGrid}>
            {DIETARY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.dietaryCard,
                  selectedDietaryType === type.value && styles.dietaryCardSelected
                ]}
                onPress={() => setSelectedDietaryType(type.value)}
              >
                <Text style={styles.dietaryIcon}>{type.icon}</Text>
                <Text style={[
                  styles.dietaryLabel,
                  selectedDietaryType === type.value && styles.dietaryLabelSelected
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spice Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('spiceLevel')}</Text>
          <Text style={styles.sectionSubtitle}>{t('howSpicyDoYouLike')}</Text>
          
          <View style={styles.spiceLevelContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.spiceLevelButton,
                  spiceLevel >= level && styles.spiceLevelButtonActive
                ]}
                onPress={() => setSpiceLevel(level)}
              >
                <Text style={styles.spiceIcon}>🌶️</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.spiceLevelLabel}>
            {spiceLevel === 1 && t('mild')}
            {spiceLevel === 2 && t('light')}
            {spiceLevel === 3 && t('medium')}
            {spiceLevel === 4 && t('spicy')}
            {spiceLevel === 5 && t('verySpicy')}
          </Text>
        </View>

        {/* Allergies (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('foodAllergies')}</Text>
          <Text style={styles.sectionSubtitle}>{t('optionalKeepYouSafe')}</Text>
          
          <View style={styles.allergyGrid}>
            {commonAllergies.map((allergy) => (
              <TouchableOpacity
                key={allergy}
                style={[
                  styles.allergyChip,
                  allergies.includes(allergy) && styles.allergyChipSelected
                ]}
                onPress={() => toggleAllergy(allergy)}
              >
                <Text style={[
                  styles.allergyChipText,
                  allergies.includes(allergy) && styles.allergyChipTextSelected
                ]}>
                  {allergy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isFormValid && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!isFormValid}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <ArrowRight size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            {t('foodPreferencesHelp')}
          </Text>
        </View>
      </View>
    </ScrollView>
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
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9B42',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  section: {
    width: '100%',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 16,
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cuisineChip: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cuisineChipSelected: {
    backgroundColor: '#FF9B42',
    borderColor: '#FF9B42',
  },
  cuisineChipText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  cuisineChipTextSelected: {
    color: '#FFF',
  },
  dietaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dietaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  dietaryCardSelected: {
    backgroundColor: '#FFF5E6',
    borderColor: '#FF9B42',
  },
  dietaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  dietaryLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    textAlign: 'center',
  },
  dietaryLabelSelected: {
    color: '#FF9B42',
  },
  spiceLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  spiceLevelButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  spiceLevelButtonActive: {
    backgroundColor: '#FF9B42',
    borderColor: '#FF9B42',
  },
  spiceIcon: {
    fontSize: 20,
  },
  spiceLevelLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#FF9B42',
    textAlign: 'center',
  },
  allergyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  allergyChip: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  allergyChipSelected: {
    backgroundColor: '#FFE8E8',
    borderColor: '#FF6B6B',
  },
  allergyChipText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  allergyChipTextSelected: {
    color: '#FF6B6B',
  },
  continueButton: {
    backgroundColor: '#FF9B42',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 24,
    shadowColor: '#FF9B42',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: '#FFB97C',
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
    marginRight: 8,
  },
  helpContainer: {
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
