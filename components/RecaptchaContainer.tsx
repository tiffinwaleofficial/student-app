import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Invisible reCAPTCHA container for Firebase phone authentication
 * This component provides the DOM element needed for Firebase Web SDK
 */
export const RecaptchaContainer: React.FC = () => {
  return (
    <View 
      style={styles.container}
      // @ts-ignore - This is needed for web compatibility
      nativeID="recaptcha-container"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -1000, // Hide it off-screen
    left: -1000,
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default RecaptchaContainer;





























