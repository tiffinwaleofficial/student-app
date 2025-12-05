import React from 'react';
import { Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode;
  style?: any;
  scrollEnabled?: boolean;
  enableOnAndroid?: boolean;
}

/**
 * Universal keyboard avoiding wrapper that works on all platforms
 * Automatically adjusts screen content when keyboard opens/closes
 */
export const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  style,
  scrollEnabled = true,
  enableOnAndroid = true,
}) => {
  // Simplified approach - use KeyboardAwareScrollView for all platforms
  return scrollEnabled ? (
    <KeyboardAwareScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.scrollContent, { backgroundColor: 'transparent' }]}
      enableOnAndroid={enableOnAndroid}
      enableAutomaticScroll={true}
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 50}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      keyboardOpeningTime={0}
      resetScrollToCoords={{ x: 0, y: 0 }}
    >
      {children}
    </KeyboardAwareScrollView>
  ) : (
    <View style={[styles.container, style, { backgroundColor: 'transparent' }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Prevent white overlay
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent', // Prevent white overlay
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: 'transparent', // Prevent white overlay
  },
});

export default KeyboardAvoidingWrapper;
