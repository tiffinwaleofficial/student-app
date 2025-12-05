import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgfF7twAURbSUCcwWYSmu6i1jqEPdn91E",
  authDomain: "tiffin-wale-15d70.firebaseapp.com",
  projectId: "tiffin-wale-15d70",
  storageBucket: "tiffin-wale-15d70.firebasestorage.app",
  messagingSenderId: "375989594965",
  appId: "1:375989594965:web:9fc3e62375152bf6cf9ddc",
  measurementId: "G-RFJPRLSCP3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with proper persistence for React Native
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    // For React Native, use proper AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  // If auth is already initialized, get the existing instance
  console.log('Firebase Auth already initialized, using existing instance');
  auth = getAuth(app);
}

// Initialize Analytics (optional, only works on web)
let analytics;
if (Platform.OS === 'web') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics not available:', error);
  }
}

export { auth, analytics };
export default app;



