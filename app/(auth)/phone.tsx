/**
 * Phone Login Screen
 * 
 * Primary authentication screen for phone number login.
 * Users enter their phone number to receive an OTP code.
 */

import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ThemedText, ThemedView, PhoneInput, Button } from '@/src/components/core';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useAuth } from '@/src/hooks/useAuth';
import { formatPhoneNumber, getPhoneDigits } from '@/src/utils/phoneFormatter';

export default function PhoneLoginScreen() {
  const theme = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { sendOTP } = useAuth();

  /**
   * Handle phone number change with formatting
   */
  const handlePhoneChange = (formattedPhone: string) => {
    setPhone(formattedPhone);
  };

  /**
   * Send OTP to the provided phone number
   */
  const handleSendOTP = async () => {
    const phoneDigits = getPhoneDigits(phone);
    
    if (!phoneDigits || phoneDigits.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Format phone with + if not present
    const formattedPhone = phoneDigits.startsWith('+') ? phoneDigits : `+${phoneDigits}`;

    setLoading(true);

    try {
      const { error } = await sendOTP(formattedPhone);

      if (error) {
        Alert.alert('Error', error.message || 'Failed to send OTP');
      } else {
        // Navigate to OTP verification screen
        router.push({
          pathname: '/(auth)/verify',
          params: { phone: formattedPhone },
        });
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Welcome to Hollie
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Enter your phone number to get started
      </ThemedText>

      <View style={styles.inputContainer}>
        <PhoneInput
          value={phone}
          onPhoneChange={handlePhoneChange}
          placeholder="+1 (555) 123-4567"
          autoFocus
          disabled={loading}
        />
      </View>

      <Button
        title="Send Code"
        onPress={handleSendOTP}
        loading={loading}
        disabled={loading}
        fullWidth
        style={styles.button}
      />

      <ThemedText style={styles.helpText}>
        We'll send you a verification code via SMS
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
});
