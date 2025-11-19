/**
 * Design Tokens for Hollie App
 * 
 * This file contains all design tokens following the design system specifications.
 * Design tokens are the visual design atoms of the design system.
 */

import { Platform } from 'react-native';

/**
 * Color Tokens
 * Following design system with light and dark theme support
 */
export const Colors = {
  light: {
    // Base colors
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
    },
    
    // Brand colors (Purple theme)
    brand: {
      primary: '#8B5CF6',
      primaryLight: '#A78BFA',
      primaryDark: '#7C3AED',
      tint: '#8B5CF6',
    },
    
    // Status colors
    status: {
      success: '#10B981',
      successLight: '#34D399',
      successDark: '#059669',
      error: '#EF4444',
      errorLight: '#F87171',
      errorDark: '#DC2626',
      warning: '#F59E0B',
      warningLight: '#FBBF24',
      warningDark: '#D97706',
      info: '#3B82F6',
      infoLight: '#60A5FA',
      infoDark: '#2563EB',
    },
    
    // UI element colors
    border: {
      default: '#E5E7EB',
      light: '#F3F4F6',
      dark: '#D1D5DB',
    },
    card: {
      default: '#FFFFFF',
      secondary: '#F9FAFB',
    },
    
    // Icon colors
    icon: {
      default: '#6B7280',
      secondary: '#9CA3AF',
      active: '#8B5CF6',
    },
    
    // Button colors
    button: {
      primary: {
        background: '#8B5CF6',
        text: '#FFFFFF',
      },
      secondary: {
        background: '#F3F4F6',
        text: '#1F2937',
      },
      success: {
        background: '#10B981',
        text: '#FFFFFF',
      },
      error: {
        background: '#EF4444',
        text: '#FFFFFF',
      },
      disabled: {
        background: '#D1D5DB',
        text: '#9CA3AF',
      },
    },
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    // Base colors
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
      inverse: '#111827',
    },
    background: {
      primary: '#111827',
      secondary: '#1F2937',
      tertiary: '#374151',
    },
    
    // Brand colors
    brand: {
      primary: '#A78BFA',
      primaryLight: '#C4B5FD',
      primaryDark: '#8B5CF6',
      tint: '#A78BFA',
    },
    
    // Status colors
    status: {
      success: '#34D399',
      successLight: '#6EE7B7',
      successDark: '#10B981',
      error: '#F87171',
      errorLight: '#FCA5A5',
      errorDark: '#EF4444',
      warning: '#FBBF24',
      warningLight: '#FCD34D',
      warningDark: '#F59E0B',
      info: '#60A5FA',
      infoLight: '#93C5FD',
      infoDark: '#3B82F6',
    },
    
    // UI element colors
    border: {
      default: '#374151',
      light: '#4B5563',
      dark: '#1F2937',
    },
    card: {
      default: '#1F2937',
      secondary: '#374151',
    },
    
    // Icon colors
    icon: {
      default: '#9CA3AF',
      secondary: '#6B7280',
      active: '#A78BFA',
    },
    
    // Button colors
    button: {
      primary: {
        background: '#A78BFA',
        text: '#111827',
      },
      secondary: {
        background: '#374151',
        text: '#F9FAFB',
      },
      success: {
        background: '#34D399',
        text: '#111827',
      },
      error: {
        background: '#F87171',
        text: '#111827',
      },
      disabled: {
        background: '#4B5563',
        text: '#6B7280',
      },
    },
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
} as const;

/**
 * Typography Tokens
 * Font sizes, weights, line heights, and font families
 */
export const Typography = {
  fontFamily: Platform.select({
    ios: {
      sans: 'system-ui',
      serif: 'ui-serif',
      rounded: 'ui-rounded',
      mono: 'ui-monospace',
    },
    android: {
      sans: 'normal',
      serif: 'serif',
      rounded: 'normal',
      mono: 'monospace',
    },
    web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
      rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
    default: {
      sans: 'normal',
      serif: 'serif',
      rounded: 'normal',
      mono: 'monospace',
    },
  }),
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
} as const;

/**
 * Spacing Tokens
 * Consistent spacing scale for padding, margins, gaps
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

/**
 * Border Radius Tokens
 * Consistent border radius values
 */
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

/**
 * Shadow Tokens
 * Elevation and shadow definitions
 */
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;

/**
 * Animation Tokens
 * Duration and easing for animations
 */
export const Animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

/**
 * Z-Index Tokens
 * Layer ordering
 */
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

