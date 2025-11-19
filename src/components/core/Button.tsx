/**
 * Button Component
 * 
 * A reusable button component with multiple variants and states.
 * Uses design tokens for consistent styling.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { Spacing, BorderRadius, Typography } from '@/src/constants/design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /**
   * Button label text
   */
  title: string;
  
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   * @default 'medium'
   */
  size?: ButtonSize;
  
  /**
   * Whether button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether button is in loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Callback when button is pressed
   */
  onPress: () => void;
  
  /**
   * Custom style for button container
   */
  style?: ViewStyle;
  
  /**
   * Custom style for button text
   */
  textStyle?: TextStyle;
  
  /**
   * Whether button should take full width
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Button component with multiple variants and states
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onPress,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const theme = useTheme();
  
  // Determine button colors based on variant and state
  const getButtonColors = () => {
    if (disabled) {
      return {
        backgroundColor: theme.buttonDisabled,
        textColor: theme.buttonDisabledText,
      };
    }
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.buttonPrimary,
          textColor: theme.buttonPrimaryText,
        };
      case 'secondary':
        return {
          backgroundColor: theme.buttonSecondary,
          textColor: theme.buttonSecondaryText,
        };
      case 'success':
        return {
          backgroundColor: theme.buttonSuccess,
          textColor: theme.buttonSuccessText,
        };
      case 'error':
        return {
          backgroundColor: theme.buttonError,
          textColor: theme.buttonErrorText,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          textColor: theme.buttonPrimary,
        };
      default:
        return {
          backgroundColor: theme.buttonPrimary,
          textColor: theme.buttonPrimaryText,
        };
    }
  };
  
  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          fontSize: Typography.fontSize.sm,
        };
      case 'large':
        return {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
          fontSize: Typography.fontSize.lg,
        };
      default: // medium
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          fontSize: Typography.fontSize.base,
        };
    }
  };
  
  const colors = getButtonColors();
  const sizeStyles = getSizeStyles();
  
  const buttonStyle: ViewStyle = {
    backgroundColor: colors.backgroundColor,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Minimum touch target
    opacity: disabled ? 0.6 : 1,
    ...(variant === 'secondary' && !disabled && {
      borderWidth: 1,
      borderColor: theme.buttonPrimary,
    }),
    ...(variant === 'text' && {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      minHeight: 44,
    }),
    ...(fullWidth && { width: '100%' }),
    ...style,
  };
  
  const textStyleFinal: TextStyle = {
    color: colors.textColor,
    fontSize: sizeStyles.fontSize,
    fontWeight: Typography.fontWeight.semibold,
    ...textStyle,
  };
  
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.textColor} size="small" />
      ) : (
        <Text style={textStyleFinal}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Styles are defined inline for better type safety
});

