import { Slot } from 'expo-router';
import { GuestRoute } from '@/auth/AuthMiddleware';

export default function AuthLayout() {
  return (
    <GuestRoute>
      <Slot />
    </GuestRoute>
  );
}