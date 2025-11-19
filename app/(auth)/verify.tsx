import { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ThemedText, ThemedView } from '@/src/components/core';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/use-theme';
import { useAuth } from '@/src/hooks/useAuth';

export default function VerifyOTPScreen() {
  const theme = useTheme();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string }>();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { verifyOTP } = useAuth();

  useEffect(() => {
    if (!params.phone) {
      router.replace('/(auth)/phone');
    }
  }, [params.phone, router]);

  const handleVerifyOTP = async (otpCode?: string) => {
    const fullCode = otpCode || code.join('');
    
    if (!fullCode || fullCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    if (!params.phone) {
      Alert.alert('Error', 'Phone number is missing');
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await verifyOTP(params.phone, fullCode);

      if (error) {
        Alert.alert('Error', error.message || 'Invalid verification code');
      } else if (user) {
        // Navigate to bottom tabs after successful verification
        router.replace('/(tabs)');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // Handle paste - take first 6 digits
      const digits = digit.slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (index + i < 6) {
          newCode[index + i] = d;
        }
      });
      setCode(newCode);
      
      // Focus next empty input or last input
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      // Auto-submit when all 6 digits are entered
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerifyOTP(fullCode);
      }
    } else {
      const newCode = [...code];
      newCode[index] = digit;
      setCode(newCode);
      
      // Auto-focus next input
      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Auto-submit when all 6 digits are entered
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerifyOTP(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Verification
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Enter the code sent to
      </ThemedText>
      <ThemedText style={styles.phoneNumber}>
        {params.phone || 'your phone'}
      </ThemedText>

      <View style={styles.otpContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[styles.otpInput, getOTPInputStyle(theme)]}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={index === 0}
            editable={!loading}
            selectTextOnFocus
          />
        ))}
      </View>

      <View style={styles.resendContainer}>
        <ThemedText style={styles.resendQuestion}>
          Didn't receive code?
        </ThemedText>
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Info', 'Resend code functionality (dummy)');
          }}
          disabled={loading}
        >
          <ThemedText style={styles.resendText}>
            Resend Code
          </ThemedText>
        </TouchableOpacity>
      </View>
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
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 12,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendQuestion: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

/**
 * Get OTP input style with theme colors
 */
const getOTPInputStyle = (theme: ReturnType<typeof useTheme>) => ({
  borderColor: theme.border,
  backgroundColor: theme.background,
  color: theme.text,
});
