/**
 * Phone Login Screen (Legacy)
 * 
 * @deprecated This file is kept for backward compatibility.
 * The primary phone login is now in phone.tsx
 * This file redirects to phone.tsx
 */

import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView, LoadingSpinner } from '@/src/components/core';

export default function PhoneLoginScreen() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the primary phone login screen
    router.replace('/(auth)/phone');
  }, [router]);

  return (
    <ThemedView style={styles.container}>
      <LoadingSpinner />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

