/**
 * ThemedView Component
 * 
 * A view component that automatically applies theme background colors.
 * Supports light/dark mode and custom colors.
 * 
 * @param {ThemedViewProps} props - Component props
 * @returns {JSX.Element} Themed view component
 */

import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';
import { useThemeMode } from '@/src/contexts/ThemeContext';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  const { activeTheme } = useThemeMode();
  
  // Use custom colors if provided, otherwise use theme background color
  const backgroundColor = lightColor && darkColor
    ? (activeTheme === 'dark' ? darkColor : lightColor)
    : lightColor || darkColor || theme.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
