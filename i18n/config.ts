import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translation files
import enCommon from './resources/en/common.json';
import enAuth from './resources/en/auth.json';
import enOnboarding from './resources/en/onboarding.json';
import enSubscription from './resources/en/subscription.json';
import enOrders from './resources/en/orders.json';
import enProfile from './resources/en/profile.json';
import enSupport from './resources/en/support.json';
import enErrors from './resources/en/errors.json';
import enValidation from './resources/en/validation.json';

import hiCommon from './resources/hi/common.json';
import hiAuth from './resources/hi/auth.json';
import hiOnboarding from './resources/hi/onboarding.json';
import hiSubscription from './resources/hi/subscription.json';
import hiOrders from './resources/hi/orders.json';
import hiProfile from './resources/hi/profile.json';
import hiSupport from './resources/hi/support.json';
import hiErrors from './resources/hi/errors.json';
import hiValidation from './resources/hi/validation.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    onboarding: enOnboarding,
    subscription: enSubscription,
    orders: enOrders,
    profile: enProfile,
    support: enSupport,
    errors: enErrors,
    validation: enValidation,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
    onboarding: hiOnboarding,
    subscription: hiSubscription,
    orders: hiOrders,
    profile: hiProfile,
    support: hiSupport,
    errors: hiErrors,
    validation: hiValidation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0]?.languageCode || 'en',
    fallbackLng: 'en',
    debug: true, // Enable debug mode to show missing translations in console
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    defaultNS: 'common',
    
    ns: ['common', 'auth', 'onboarding', 'subscription', 'orders', 'profile', 'support', 'errors', 'validation'],
    
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
    
    // Missing key handling for development
    saveMissing: true,
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      console.warn(`🌐 Missing translation: [${lng}][${ns}] ${key}`, {
        fallbackValue,
        suggestion: `Add "${key}": "${fallbackValue}" to ${ns}.json`
      });
    },
    
    // Always return the key if translation is missing (helps identify missing translations)
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,
  });

export default i18n;
