/**
 * Auth Layout
 * 
 * Layout component for authentication screens.
 * Handles navigation for phone login and OTP verification flows.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="phone" />
      <Stack.Screen name="phone-login" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}

