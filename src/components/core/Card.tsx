/**
 * Card Component
 * 
 * A reusable card container component for grouping content.
 * Uses design tokens for consistent styling.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { Spacing, BorderRadius, Shadows } from '@/src/constants/design-tokens';

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;
  
  /**
   * Whether card is pressable
   * @default false
   */
  pressable?: boolean;
  
  /**
   * Callback when card is pressed (only if pressable)
   */
  onPress?: () => void;
  
  /**
   * Card variant style
   * @default 'default'
   */
  variant?: 'default' | 'secondary' | 'elevated';
  
  /**
   * Custom style for card container
   */
  style?: ViewStyle;
  
  /**
   * Padding size
   * @default 'md'
   */
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Card container component for grouping content
 */
export const Card: React.FC<CardProps> = ({
  children,
  pressable = false,
  onPress,
  variant = 'default',
  style,
  padding = 'md',
}) => {
  const theme = useTheme();
  
  // Get padding value
  const getPadding = () => {
    switch (padding) {
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.lg;
      default:
        return Spacing.md;
    }
  };
  
  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.cardSecondary;
      default:
        return theme.card;
    }
  };
  
  const cardStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: BorderRadius.lg,
    padding: getPadding(),
    borderWidth: variant === 'elevated' ? 0 : 1,
    borderColor: theme.border,
    ...(variant === 'elevated' && Shadows.md),
    ...style,
  };
  
  if (pressable && onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  // Styles are defined inline for better type safety
});

