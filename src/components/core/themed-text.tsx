/**
 * ThemedText Component
 * 
 * A text component that automatically applies theme colors.
 * Supports light/dark mode and custom text type variants.
 * 
 * @param {ThemedTextProps} props - Component props
 * @returns {JSX.Element} Themed text component
 */

import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/src/hooks/use-theme';
import { useThemeMode } from '@/src/contexts/ThemeContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const { activeTheme } = useThemeMode();
  
  // Use custom colors if provided, otherwise use theme text color
  const color = lightColor && darkColor
    ? (activeTheme === 'dark' ? darkColor : lightColor)
    : lightColor || darkColor || theme.text;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: theme.primary }] : undefined,
        type === 'title' ? styles.title : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
  },
});
