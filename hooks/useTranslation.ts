import { useTranslation as useI18nTranslation } from 'react-i18next';

// Type-safe namespaces for the Student App
export type TranslationNamespace = 
  | 'common' 
  | 'auth' 
  | 'onboarding' 
  | 'subscription' 
  | 'orders' 
  | 'profile' 
  | 'errors';

// Re-export useTranslation with type safety
export const useTranslation = (namespace?: TranslationNamespace) => {
  return useI18nTranslation(namespace);
};

// Export the translation function for direct use
export { useTranslation as default } from 'react-i18next';
