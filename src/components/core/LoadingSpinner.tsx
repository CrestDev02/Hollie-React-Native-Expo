/**
 * Loading Spinner Component
 * 
 * A reusable loading indicator component.
 * Uses design tokens for consistent styling.
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { Spacing } from '@/src/constants/design-tokens';

export interface LoadingSpinnerProps {
  /**
   * Spinner size
   * @default 'small'
   */
  size?: 'small' | 'large';
  
  /**
   * Spinner color (defaults to theme primary)
   */
  color?: string;
  
  /**
   * Whether to show full screen overlay
   * @default false
   */
  fullScreen?: boolean;
  
  /**
   * Custom style for container
   */
  style?: ViewStyle;
}

/**
 * Loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'small',
  color,
  fullScreen = false,
  style,
}) => {
  const theme = useTheme();
  
  const spinnerColor = color || theme.buttonPrimary;
  
  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, { backgroundColor: theme.overlay }, style]}>
        <ActivityIndicator size={size} color={spinnerColor} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={spinnerColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

