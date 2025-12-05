import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dynamic policy screen
    router.replace('/policy/privacy-policy');
  }, []);

  return null;
}
