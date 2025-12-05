import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '@/i18n/config';

const LANGUAGE_STORAGE_KEY = 'userLanguage';

export class LanguageService {
  /**
   * Initialize language from stored preference
   */
  static async initializeLanguage(): Promise<void> {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      
      if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'hi')) {
        // Only change if different from current
        if (i18n.language !== storedLanguage) {
          await i18n.changeLanguage(storedLanguage);
          console.log(`🌐 Language initialized to: ${storedLanguage}`);
        }
      } else {
        // If no stored language, save current language
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, i18n.language);
        console.log(`🌐 Current language saved: ${i18n.language}`);
      }
    } catch (error) {
      console.error('❌ Error initializing language:', error);
    }
  }

  /**
   * Change language and persist preference
   */
  static async changeLanguage(languageCode: 'en' | 'hi'): Promise<void> {
    try {
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      console.log(`🌐 Language changed to: ${languageCode}`);
    } catch (error) {
      console.error('❌ Error changing language:', error);
      throw error;
    }
  }

  /**
   * Get current language
   */
  static getCurrentLanguage(): string {
    return i18n.language;
  }

  /**
   * Get stored language preference
   */
  static async getStoredLanguage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      console.error('❌ Error getting stored language:', error);
      return null;
    }
  }

  /**
   * Check if language is supported
   */
  static isSupportedLanguage(languageCode: string): languageCode is 'en' | 'hi' {
    return languageCode === 'en' || languageCode === 'hi';
  }

  /**
   * Get available languages
   */
  static getAvailableLanguages() {
    return [
      {
        code: 'en' as const,
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
      },
      {
        code: 'hi' as const,
        name: 'Hindi',
        nativeName: 'हिंदी',
        flag: '🇮🇳',
      },
    ];
  }

  /**
   * Get language display info
   */
  static getLanguageInfo(languageCode: string) {
    const languages = this.getAvailableLanguages();
    return languages.find(lang => lang.code === languageCode) || languages[0];
  }
}

export default LanguageService;
