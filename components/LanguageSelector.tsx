import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { Globe, Check, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { showNotification } from '@/utils/notificationService';
import LanguageService from '@/utils/languageService';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Language {
  code: 'en' | 'hi';
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES = LanguageService.getAvailableLanguages();

interface LanguageSelectorProps {
  onLanguageChange?: (languageCode: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const { t, i18n } = useTranslation('profile');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  const handleLanguageChange = async (languageCode: 'en' | 'hi') => {
    if (languageCode === i18n.language || isChanging) return;

    try {
      setIsChanging(true);
      
      // Use LanguageService to change language and persist preference
      await LanguageService.changeLanguage(languageCode);
      
      // Close modal
      setIsModalVisible(false);
      
      // Show success notification
      showNotification.success(t('languageChangedSuccessfully'));
      
      // Call callback if provided
      onLanguageChange?.(languageCode);
      
    } catch (error) {
      console.error('Error changing language:', error);
      showNotification.error(t('languageChangeError'));
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      {/* Language Menu Item */}
      <TouchableOpacity 
        style={styles.menuItem} 
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuIcon, { backgroundColor: '#E8F5E8' }]}>
            <Globe size={20} color="#4CAF50" />
          </View>
          <View style={styles.languageInfo}>
            <Text style={styles.menuItemText}>{t('language')}</Text>
            <Text style={styles.currentLanguageText}>
              {currentLanguage.flag} {currentLanguage.nativeName}
            </Text>
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Text style={styles.chevronText}>›</Text>
        </View>
      </TouchableOpacity>

      {/* Language Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.modalOverlay}
        >
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={() => setIsModalVisible(false)}
          />
          
          <Animated.View 
            entering={SlideInDown.duration(300)}
            exiting={SlideOutDown.duration(300)}
            style={styles.modalContent}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Language Options */}
            <View style={styles.languageList}>
              {LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    language.code === i18n.language && styles.selectedLanguageOption
                  ]}
                  onPress={() => handleLanguageChange(language.code)}
                  disabled={isChanging}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageOptionLeft}>
                    <Text style={styles.languageFlag}>{language.flag}</Text>
                    <View style={styles.languageNames}>
                      <Text style={[
                        styles.languageName,
                        language.code === i18n.language && styles.selectedLanguageName
                      ]}>
                        {language.name}
                      </Text>
                      <Text style={[
                        styles.languageNativeName,
                        language.code === i18n.language && styles.selectedLanguageNativeName
                      ]}>
                        {language.nativeName}
                      </Text>
                    </View>
                  </View>
                  
                  {language.code === i18n.language && (
                    <View style={styles.checkContainer}>
                      <Check size={20} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                {t('languageChangeNote')}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 2,
  },
  currentLanguageText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  chevronContainer: {
    padding: 4,
  },
  chevronText: {
    fontSize: 20,
    color: '#CCCCCC',
    fontWeight: '300',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },

  // Language List Styles
  languageList: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#FAFAFA',
  },
  selectedLanguageOption: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  languageOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageNames: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  languageNativeName: {
    fontSize: 14,
    color: '#666666',
  },
  selectedLanguageNativeName: {
    color: '#4CAF50',
  },
  checkContainer: {
    marginLeft: 12,
  },

  // Modal Footer
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
});
