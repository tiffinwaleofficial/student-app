import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Navigation, Check } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useOnboardingStore, ADDRESS_TYPES } from '@/store/onboardingStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useFocusEffect } from '@react-navigation/native';

export default function DeliveryLocationScreen() {
  const router = useRouter();
  const { data, setDeliveryLocation, completeOnboarding, isLoading, setCurrentStep } = useOnboardingStore();
  const { t } = useTranslation('onboarding');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [street, setStreet] = useState(data.deliveryLocation?.address?.street || '');
  const [area, setArea] = useState(data.deliveryLocation?.address?.area || '');
  const [city, setCity] = useState(data.deliveryLocation?.address?.city || '');
  const [pincode, setPincode] = useState(data.deliveryLocation?.address?.pincode || '');
  const [addressType, setAddressType] = useState(data.deliveryLocation?.addressType || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    data.deliveryLocation?.deliveryInstructions || ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Scroll to top when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  // Request location permissions on component mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');
        if (status !== 'granted') {
          console.log('Location permission denied');
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
      }
    })();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!street.trim()) {
      newErrors.street = t('streetRequired');
    }

    if (!area.trim()) {
      newErrors.area = t('areaRequired');
    }

    if (!city.trim()) {
      newErrors.city = t('cityRequired');
    }

    if (!pincode.trim()) {
      newErrors.pincode = t('pincodeRequired');
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = t('pincodeInvalid');
    }

    if (!addressType) {
      newErrors.addressType = t('addressTypeRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteSetup = async () => {
    if (!validateForm()) {
      return;
    }

    // Save delivery location to store
    setDeliveryLocation({
      address: {
        street: street.trim(),
        area: area.trim(),
        city: city.trim(),
        pincode: pincode.trim()
      },
      addressType: addressType as any,
      deliveryInstructions: deliveryInstructions.trim()
    });

    try {
      // Complete onboarding
      await completeOnboarding();
      
      // Small delay to ensure auth state is fully updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to dashboard
      if (__DEV__) console.log('🚀 Navigating to dashboard after successful registration');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ Setup failed:', error);
      Alert.alert(t('setupFailedTitle'), t('setupFailedMessage'));
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert(
        t('locationPermissionTitle'),
        t('locationPermissionMessage'),
        [
          { text: t('cancel'), style: 'cancel' },
          { 
            text: t('grantPermission'), 
            onPress: async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              setHasLocationPermission(status === 'granted');
              if (status === 'granted') {
                handleUseCurrentLocation();
              }
            }
          }
        ]
      );
      return;
    }

    setIsLoadingLocation(true);
    
    try {
      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const addressResults = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addressResults.length > 0) {
        const address = addressResults[0];
        
        // Pre-fill form fields with location data
        setStreet(address.street || '');
        setArea(address.district || address.subregion || '');
        setCity(address.city || '');
        setPincode(address.postalCode || '');
        
        // Clear any existing errors
        setErrors({});
        
        Alert.alert(
          t('locationFoundTitle'),
          t('locationFoundMessage'),
          [{ text: t('ok') }]
        );
      } else {
        Alert.alert(
          t('addressNotFoundTitle'),
          t('addressNotFoundMessage'),
          [{ text: t('ok') }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        t('locationErrorTitle'),
        t('locationErrorMessage'),
        [{ text: t('ok') }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(4); // Go back to food preferences (step 4)
    router.back();
  };

  const isFormValid = street.trim() && area.trim() && city.trim() && 
                     /^\d{6}$/.test(pincode) && addressType;

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
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>{t('stepProgress', { current: 5, total: 5 })}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MapPin size={40} color="#FF9B42" />
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>{t('deliveryLocationTitle')}</Text>
        <Text style={styles.description}>
          {t('deliveryLocationDescription')}
        </Text>

        {/* Current Location Button */}
        <TouchableOpacity 
          style={[
            styles.currentLocationButton,
            isLoadingLocation && styles.currentLocationButtonDisabled
          ]}
          onPress={handleUseCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#FF9B42" />
          ) : (
            <Navigation size={20} color="#FF9B42" />
          )}
          <Text style={styles.currentLocationText}>
            {isLoadingLocation ? t('gettingLocation') : t('useCurrentLocation')}
          </Text>
        </TouchableOpacity>

        {/* Address Form */}
        <View style={styles.form}>
          {/* Street Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('streetAddress')}</Text>
            <TextInput
              style={[
                styles.input,
                errors.street && styles.inputError
              ]}
              placeholder={t('streetAddressPlaceholder')}
              placeholderTextColor="#999"
              value={street}
              onChangeText={(text) => {
                setStreet(text);
                if (errors.street) {
                  setErrors(prev => ({ ...prev, street: '' }));
                }
              }}
              multiline
              numberOfLines={2}
            />
            {errors.street && (
              <Text style={styles.errorText}>{errors.street}</Text>
            )}
          </View>

          {/* Area */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('areaLocality')}</Text>
            <TextInput
              style={[
                styles.input,
                errors.area && styles.inputError
              ]}
              placeholder={t('areaPlaceholder')}
              placeholderTextColor="#999"
              value={area}
              onChangeText={(text) => {
                setArea(text);
                if (errors.area) {
                  setErrors(prev => ({ ...prev, area: '' }));
                }
              }}
            />
            {errors.area && (
              <Text style={styles.errorText}>{errors.area}</Text>
            )}
          </View>

          {/* City and Pincode */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.inputLabel}>{t('city')}</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.city && styles.inputError
                ]}
                placeholder={t('cityPlaceholder')}
                placeholderTextColor="#999"
                value={city}
                onChangeText={(text) => {
                  setCity(text);
                  if (errors.city) {
                    setErrors(prev => ({ ...prev, city: '' }));
                  }
                }}
              />
              {errors.city && (
                <Text style={styles.errorText}>{errors.city}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.inputLabel}>{t('pincode')}</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.pincode && styles.inputError
                ]}
                placeholder={t('pincodePlaceholder')}
                placeholderTextColor="#999"
                value={pincode}
                onChangeText={(text) => {
                  setPincode(text.replace(/\D/g, ''));
                  if (errors.pincode) {
                    setErrors(prev => ({ ...prev, pincode: '' }));
                  }
                }}
                keyboardType="numeric"
                maxLength={6}
              />
              {errors.pincode && (
                <Text style={styles.errorText}>{errors.pincode}</Text>
              )}
            </View>
          </View>

          {/* Address Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('addressType')}</Text>
            <View style={styles.addressTypeGrid}>
              {ADDRESS_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.addressTypeCard,
                    addressType === type.value && styles.addressTypeCardSelected
                  ]}
                  onPress={() => {
                    setAddressType(type.value);
                    if (errors.addressType) {
                      setErrors(prev => ({ ...prev, addressType: '' }));
                    }
                  }}
                >
                  <Text style={styles.addressTypeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.addressTypeLabel,
                    addressType === type.value && styles.addressTypeLabelSelected
                  ]}>
                    {type.label}
                  </Text>
                  {addressType === type.value && (
                    <View style={styles.selectedIndicator}>
                      <Check size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {errors.addressType && (
              <Text style={styles.errorText}>{errors.addressType}</Text>
            )}
          </View>

          {/* Delivery Instructions */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('deliveryInstructions')}</Text>
            <Text style={styles.inputSubLabel}>{t('deliveryInstructionsSubLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('deliveryInstructionsPlaceholder')}
              placeholderTextColor="#999"
              value={deliveryInstructions}
              onChangeText={setDeliveryInstructions}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Complete Setup Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            (!isFormValid || isLoading) && styles.completeButtonDisabled
          ]}
          onPress={handleCompleteSetup}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.completeButtonText}>{t('completeSetup')}</Text>
              <Check size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            {t('deliveryLocationHelp')}
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
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FF9B42',
  },
  currentLocationText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#FF9B42',
    marginLeft: 8,
  },
  currentLocationButtonDisabled: {
    opacity: 0.6,
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginBottom: 4,
  },
  inputSubLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#FF4444',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  addressTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  addressTypeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  addressTypeCardSelected: {
    backgroundColor: '#FFF5E6',
    borderColor: '#FF9B42',
  },
  addressTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  addressTypeLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    textAlign: 'center',
  },
  addressTypeLabelSelected: {
    color: '#FF9B42',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF9B42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
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
  completeButtonDisabled: {
    backgroundColor: '#FFB97C',
    opacity: 0.6,
  },
  completeButtonText: {
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
    color: '#10B981',
    textAlign: 'center',
    lineHeight: 20,
  },
});
