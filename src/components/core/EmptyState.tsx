/**
 * Empty State Component
 * 
 * A reusable empty state component for displaying when there's no content.
 * Uses design tokens for consistent styling.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { Spacing, Typography } from '@/src/constants/design-tokens';

export interface EmptyStateProps {
  /**
   * Main title text
   */
  title: string;
  
  /**
   * Subtitle/description text
   */
  subtitle?: string;
  
  /**
   * Icon or emoji to display
   */
  icon?: string | React.ReactNode;
  
  /**
   * Custom style for container
   */
  containerStyle?: ViewStyle;
  
  /**
   * Custom style for title
   */
  titleStyle?: TextStyle;
  
  /**
   * Custom style for subtitle
   */
  subtitleStyle?: TextStyle;
}

/**
 * Empty state component for displaying when there's no content
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  icon,
  containerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, containerStyle]}>
      {icon && (
        <View style={styles.iconContainer}>
          {typeof icon === 'string' ? (
            <Text style={styles.iconEmoji}>{icon}</Text>
          ) : (
            icon
          )}
        </View>
      )}
      
      <Text style={[styles.title, { color: theme.text }, titleStyle]}>
        {title}
      </Text>
      
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.textSecondary }, subtitleStyle]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
});

