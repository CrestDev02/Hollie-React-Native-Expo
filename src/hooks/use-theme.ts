/**
 * useTheme Hook
 * 
 * Hook to access theme colors based on current theme mode (light/dark).
 * Returns color palette for the active theme.
 * 
 * @returns {Object} Color palette for the active theme
 * 
 * @example
 * ```tsx
 * const theme = useTheme();
 * 
 * <View style={{ backgroundColor: theme.background }}>
 *   <Text style={{ color: theme.text }}>Hello</Text>
 * </View>
 * ```
 */

import { Colors } from '@/src/constants/theme';
import { useThemeMode } from '@/src/contexts/ThemeContext';

export function useTheme() {
  const { activeTheme } = useThemeMode();
  return Colors[activeTheme];
}

