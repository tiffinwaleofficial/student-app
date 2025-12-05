import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Step 1: Phone Verification (handled by Firebase)
export interface PhoneVerificationData {
  phoneNumber: string;
  isVerified: boolean;
}

// Step 2: Personal Information
export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  email: string;
  address?: string;
}

// Step 3: Food Preferences
export interface FoodPreferencesData {
  cuisinePreferences: string[];
  dietaryType: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain';
  spiceLevel: number; // 1-5 scale
  allergies: string[];
}

// Step 4: Delivery Location
export interface DeliveryLocationData {
  address: {
    street: string;
    area: string;
    city: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  addressType: 'home' | 'hostel' | 'pg' | 'office';
  deliveryInstructions: string;
}

// Complete onboarding data
export interface OnboardingData {
  phoneVerification?: PhoneVerificationData;
  personalInfo?: PersonalInfoData;
  foodPreferences?: FoodPreferencesData;
  deliveryLocation?: DeliveryLocationData;
}

interface OnboardingStore {
  // Current step (1-5)
  currentStep: number;
  totalSteps: number;
  
  // Onboarding data
  data: OnboardingData;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Data management
  setPhoneVerification: (data: PhoneVerificationData) => void;
  setPersonalInfo: (data: PersonalInfoData) => void;
  setFoodPreferences: (data: FoodPreferencesData) => void;
  setDeliveryLocation: (data: DeliveryLocationData) => void;
  
  // Validation
  isStepValid: (step: number) => boolean;
  
  // Completion
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  
  // UI state management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Available cuisine options
export const CUISINE_OPTIONS = [
  'North Indian',
  'South Indian',
  'Punjabi',
  'Chinese',
  'Italian',
  'Continental',
  'Bengali',
  'Gujarati',
  'Rajasthani',
  'Street Food'
];

// Available dietary types
export const DIETARY_TYPES = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian', icon: '🍗' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'jain', label: 'Jain', icon: '🙏' }
] as const;

// Address types
export const ADDRESS_TYPES = [
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'hostel', label: 'Hostel', icon: '🏫' },
  { value: 'pg', label: 'PG', icon: '🏢' },
  { value: 'office', label: 'Office', icon: '💼' }
] as const;

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 1,
      totalSteps: 5,
      data: {},
      isLoading: false,
      error: null,

      // Step navigation
      setCurrentStep: (step) => {
        set({ currentStep: Math.max(1, Math.min(step, get().totalSteps)) });
      },

      nextStep: () => {
        const { currentStep, totalSteps } = get();
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      // Data setters
      setPhoneVerification: (phoneData) => {
        set((state) => ({
          data: {
            ...state.data,
            phoneVerification: phoneData
          }
        }));
      },

      setPersonalInfo: (personalInfo) => {
        set((state) => ({
          data: {
            ...state.data,
            personalInfo
          }
        }));
      },

      setFoodPreferences: (foodPreferences) => {
        set((state) => ({
          data: {
            ...state.data,
            foodPreferences
          }
        }));
      },

      setDeliveryLocation: (deliveryLocation) => {
        set((state) => ({
          data: {
            ...state.data,
            deliveryLocation
          }
        }));
      },

      // Validation
      isStepValid: (step) => {
        const { data } = get();
        
        switch (step) {
          case 1: // Welcome screen - always valid
            return true;
          case 2: // Phone verification
            return !!(data.phoneVerification?.isVerified);
          case 3: // Personal info
            return !!(
              data.personalInfo?.firstName &&
              data.personalInfo?.lastName &&
              data.personalInfo?.email
            );
          case 4: // Food preferences
            return !!(
              data.foodPreferences?.cuisinePreferences?.length &&
              data.foodPreferences?.dietaryType
            );
          case 5: // Delivery location
            return !!(
              data.deliveryLocation?.address?.street &&
              data.deliveryLocation?.address?.city &&
              data.deliveryLocation?.address?.pincode &&
              data.deliveryLocation?.addressType
            );
          default:
            return false;
        }
      },

      // Complete onboarding
      completeOnboarding: async () => {
        const { data } = get();
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Completing onboarding with data:', data);
          
          // Import auth store dynamically to avoid circular dependency
          const { useAuthStore } = await import('./authStore');
          const authStore = useAuthStore.getState();
          
          // Register user with onboarding data
          await authStore.registerWithOnboarding(data);
          
          // Clear onboarding data after successful completion
          set({ 
            data: {},
            currentStep: 1,
            isLoading: false 
          });
          
        } catch (error) {
          console.error('Error completing onboarding:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to complete onboarding',
            isLoading: false 
          });
          throw error;
        }
      },

      // Reset onboarding
      resetOnboarding: () => {
        set({
          currentStep: 1,
          data: {},
          isLoading: false,
          error: null
        });
      },

      // UI state management
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      }
    }),
    {
      name: 'student-onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the data and currentStep, not UI state
      partialize: (state) => ({
        currentStep: state.currentStep,
        data: state.data
      })
    }
  )
);
