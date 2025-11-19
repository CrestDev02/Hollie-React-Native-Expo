/**
 * Input Component
 * 
 * A reusable text input component with validation states.
 * Uses design tokens for consistent styling.
 */

import React from 'react';
import { TextInput, Text, View, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { Spacing, BorderRadius, Typography } from '@/src/constants/design-tokens';

export type InputState = 'default' | 'error' | 'success';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input label text
   */
  label?: string;
  
  /**
   * Helper text shown below input
   */
  helperText?: string;
  
  /**
   * Error message (overrides helperText when provided)
   */
  error?: string;
  
  /**
   * Input state variant
   * @default 'default'
   */
  state?: InputState;
  
  /**
   * Whether input is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Custom style for input container
   */
  containerStyle?: ViewStyle;
  
  /**
   * Custom style for input field
   */
  inputStyle?: TextStyle;
  
  /**
   * Custom style for label
   */
  labelStyle?: TextStyle;
  
  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Right icon component
   */
  rightIcon?: React.ReactNode;
}

/**
 * Text input component with label, helper text, and validation states
 */
export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  state = 'default',
  disabled = false,
  containerStyle,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  ...textInputProps
}) => {
  const theme = useTheme();
  
  // Determine input state
  const inputState: InputState = error ? 'error' : state;
  
  // Get border color based on state
  const getBorderColor = () => {
    if (disabled) return theme.border;
    switch (inputState) {
      case 'error':
        return theme.error;
      case 'success':
        return theme.success;
      default:
        return theme.border;
    }
  };
  
  const borderColor = getBorderColor();
  const displayHelperText = error || helperText;
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: disabled ? theme.backgroundTertiary : theme.background,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              paddingLeft: leftIcon ? Spacing.sm : Spacing.md,
              paddingRight: rightIcon ? Spacing.sm : Spacing.md,
            },
            inputStyle,
          ]}
          placeholderTextColor={theme.textTertiary}
          editable={!disabled}
          {...textInputProps}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {displayHelperText && (
        <Text
          style={[
            styles.helperText,
            {
              color: error ? theme.error : theme.textSecondary,
            },
          ]}
        >
          {displayHelperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: Spacing.md,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    paddingRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
});

