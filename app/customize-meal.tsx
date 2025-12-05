import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Plus, Minus, X, Info, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BackButton } from '@/components/BackButton';
import { useTranslation } from '@/hooks/useTranslation';

// Mock data for addon items
const ADDON_ITEMS = [
  { id: 'addon1', name: 'Extra Roti', price: 15, image: 'https://images.pexels.com/photos/9797029/pexels-photo-9797029.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: 'addon2', name: 'Raita', price: 25, image: 'https://images.pexels.com/photos/6260921/pexels-photo-6260921.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { id: 'addon3', name: 'Sweet Lassi', price: 40, image: 'https://images.pexels.com/photos/14354108/pexels-photo-14354108.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
];

export default function CustomizeMealScreen() {
  const router = useRouter();
  const { t } = useTranslation('orders');
  const params = useLocalSearchParams();
  const mealName = params.name as string || 'Meal';
  const mealId = params.id as string || 'meal1';
  
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [spiceLevel, setSpiceLevel] = useState('medium');
  const [isVegOnly, setIsVegOnly] = useState(true);
  
  const handleAddonChange = (addonId: string, quantity: number) => {
    setSelectedAddons(prev => {
      const updated = { ...prev };
      if (quantity <= 0) {
        delete updated[addonId];
      } else {
        updated[addonId] = quantity;
      }
      return updated;
    });
  };
  
  const calculateTotal = () => {
    return Object.entries(selectedAddons).reduce((total, [addonId, quantity]) => {
      const addon = ADDON_ITEMS.find(item => item.id === addonId);
      return total + (addon?.price || 0) * quantity;
    }, 0);
  };
  
  const handleSubmit = () => {
    // In a real app, you would submit this to your API
    console.log('Submitting customization:', {
      mealId,
      addons: selectedAddons,
      specialInstructions,
      spiceLevel,
      isVegOnly
    });
    
    // Navigate back to previous screen
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{t('customizeMeal')}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.mealCard}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }} 
            style={styles.mealImage} 
          />
          <View style={styles.mealDetails}>
            <Text style={styles.mealName}>{mealName}</Text>
            <Text style={styles.mealType}>Lunch</Text>
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Add Extra Items</Text>
          
          {ADDON_ITEMS.map(addon => (
            <View key={addon.id} style={styles.addonItem}>
              <Image source={{ uri: addon.image }} style={styles.addonImage} />
              <View style={styles.addonDetails}>
                <Text style={styles.addonName}>{addon.name}</Text>
                <Text style={styles.addonPrice}>₹{addon.price}</Text>
              </View>
              <View style={styles.quantityControl}>
                {selectedAddons[addon.id] ? (
                  <>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => handleAddonChange(addon.id, (selectedAddons[addon.id] || 0) - 1)}
                    >
                      <Minus size={18} color="#FF9B42" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{selectedAddons[addon.id] || 0}</Text>
                  </>
                ) : null}
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleAddonChange(addon.id, (selectedAddons[addon.id] || 0) + 1)}
                >
                  <Plus size={18} color="#FF9B42" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('spiceLevel')}</Text>
          <View style={styles.spiceLevelContainer}>
            {['mild', 'medium', 'spicy'].map(level => (
              <TouchableOpacity 
                key={level}
                style={[
                  styles.spiceLevelButton,
                  spiceLevel === level && styles.spiceLevelButtonActive
                ]}
                onPress={() => setSpiceLevel(level)}
              >
                <Text 
                  style={[
                    styles.spiceLevelText,
                    spiceLevel === level && styles.spiceLevelTextActive
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
          <View style={styles.preferenceSetting}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>{t('vegetarianOnly')}</Text>
              <Info size={16} color="#999999" />
            </View>
            <Switch
              value={isVegOnly}
              onValueChange={setIsVegOnly}
              trackColor={{ false: '#CCCCCC', true: '#FFD3B0' }}
              thumbColor={isVegOnly ? '#FF9B42' : '#F4F4F4'}
            />
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('specialInstructions')}</Text>
          <View style={styles.instructionsContainer}>
            <TextInput
              style={styles.instructionsInput}
              placeholder={t('specialRequestsPlaceholder')}
              multiline
              numberOfLines={4}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
            />
          </View>
          <View style={styles.noteContainer}>
            <AlertCircle size={16} color="#FF9B42" />
            <Text style={styles.noteText}>
              We'll try our best to accommodate your requests, but they are subject to availability.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      <View style={styles.footer}>
        {Object.keys(selectedAddons).length > 0 && (
          <Text style={styles.totalText}>
            Extra charge: ₹{calculateTotal()}
          </Text>
        )}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSubmit}
        >
          <Text style={styles.saveButtonText}>{t('savePreferences')}</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#FFFAF0',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
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
  content: {
    flex: 1,
    padding: 16,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'stretch',
  },
  mealImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    alignSelf: 'stretch',
  },
  mealDetails: {
    padding: 16,
  },
  mealName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 4,
  },
  mealType: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#FF9B42',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  addonItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  addonImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
    alignSelf: 'stretch',
  },
  addonDetails: {
    flex: 1,
    marginLeft: 16,
  },
  addonName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  addonPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#FFF5E8',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
    marginHorizontal: 12,
  },
  spiceLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spiceLevelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  spiceLevelButtonActive: {
    backgroundColor: '#FFF5E8',
    borderWidth: 1,
    borderColor: '#FF9B42',
  },
  spiceLevelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#666666',
  },
  spiceLevelTextActive: {
    color: '#FF9B42',
  },
  preferenceSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
    marginRight: 8,
  },
  instructionsContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
  },
  instructionsInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333333',
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5E8',
    borderRadius: 8,
    padding: 12,
  },
  noteText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  totalText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#FF9B42',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
}); 