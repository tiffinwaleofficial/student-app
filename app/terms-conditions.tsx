import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function TermsConditionsScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dynamic policy screen
    router.replace('/policy/terms-conditions');
  }, []);

  return null;
}
