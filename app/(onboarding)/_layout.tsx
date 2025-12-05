import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GuestRoute } from '@/auth/AuthMiddleware';

export default function OnboardingLayout() {
  return (
    <GuestRoute>
      <StatusBar style="dark" backgroundColor="#FFFAF0" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Disable swipe back to prevent skipping steps
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="welcome" 
          options={{
            title: 'Welcome',
          }}
        />
        <Stack.Screen 
          name="phone-verification" 
          options={{
            title: 'Phone Verification',
          }}
        />
        <Stack.Screen 
          name="otp-verification" 
          options={{
            title: 'OTP Verification',
          }}
        />
        <Stack.Screen 
          name="personal-info" 
          options={{
            title: 'Personal Information',
          }}
        />
        <Stack.Screen 
          name="food-preferences" 
          options={{
            title: 'Food Preferences',
          }}
        />
        <Stack.Screen 
          name="delivery-location" 
          options={{
            title: 'Delivery Location',
          }}
        />
      </Stack>
    </GuestRoute>
  );
}








