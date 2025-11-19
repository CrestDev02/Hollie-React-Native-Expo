/**
 * Phone Input Component
 * 
 * A specialized input component for phone numbers with formatting.
 * Uses design tokens and includes country code selection.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Input, InputProps } from './Input';
import { useTheme } from '@/src/hooks/use-theme';
import { formatPhoneNumber, getPhoneDigits } from '@/src/utils/phoneFormatter';
import { Spacing, Typography } from '@/src/constants/design-tokens';

export interface PhoneInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  /**
   * Phone number value (formatted)
   */
  value: string;
  
  /**
   * Callback when phone number changes
   * Receives formatted phone number
   */
  onPhoneChange: (formattedPhone: string) => void;
  
  /**
   * Default country code
   * @default '+1'
   */
  defaultCountryCode?: string;
  
  /**
   * Show country code selector
   * @default false
   */
  showCountryCode?: boolean;
}

/**
 * Phone number input with automatic formatting
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onPhoneChange,
  defaultCountryCode = '+1',
  showCountryCode = false,
  ...inputProps
}) => {
  const theme = useTheme();
  const [countryCode] = useState(defaultCountryCode);
  
  /**
   * Handle phone number input change
   * Formats the input automatically
   */
  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onPhoneChange(formatted);
  };
  
  /**
   * Validate phone number format
   */
  const validatePhone = (phone: string): boolean => {
    const digits = getPhoneDigits(phone);
    return digits.length >= 10;
  };
  
  // Determine if phone is valid
  const isValid = value ? validatePhone(value) : true;
  const error = value && !isValid ? 'Please enter a valid phone number' : undefined;
  
  return (
    <View>
      {showCountryCode && (
        <View style={styles.countryCodeContainer}>
          <Text style={[styles.countryCode, { color: theme.text }]}>
            {countryCode}
          </Text>
        </View>
      )}
      
      <Input
        {...inputProps}
        value={value}
        onChangeText={handlePhoneChange}
        keyboardType="phone-pad"
        placeholder={inputProps.placeholder || '+1 (555) 123-4567'}
        error={error}
        state={error ? 'error' : inputProps.state}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  countryCodeContainer: {
    marginBottom: Spacing.xs,
  },
  countryCode: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});

