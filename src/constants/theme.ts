/**
 * Theme Configuration
 * 
 * This file provides theme utilities that use design tokens.
 * It maintains backward compatibility while using the new design token system.
 */

import { Colors as DesignTokensColors, Typography } from './design-tokens';

/**
 * Legacy Colors export for backward compatibility
 * Maps old flat structure to new nested structure
 */
export const Colors = {
  light: {
    // Base colors
    text: DesignTokensColors.light.text.primary,
    textSecondary: DesignTokensColors.light.text.secondary,
    textTertiary: DesignTokensColors.light.text.tertiary,
    background: DesignTokensColors.light.background.primary,
    backgroundSecondary: DesignTokensColors.light.background.secondary,
    backgroundTertiary: DesignTokensColors.light.background.tertiary,
    
    // Brand colors
    primary: DesignTokensColors.light.brand.primary,
    primaryLight: DesignTokensColors.light.brand.primaryLight,
    primaryDark: DesignTokensColors.light.brand.primaryDark,
    tint: DesignTokensColors.light.brand.tint,
    
    // Status colors
    success: DesignTokensColors.light.status.success,
    successLight: DesignTokensColors.light.status.successLight,
    successDark: DesignTokensColors.light.status.successDark,
    error: DesignTokensColors.light.status.error,
    errorLight: DesignTokensColors.light.status.errorLight,
    errorDark: DesignTokensColors.light.status.errorDark,
    warning: DesignTokensColors.light.status.warning,
    warningLight: DesignTokensColors.light.status.warningLight,
    warningDark: DesignTokensColors.light.status.warningDark,
    info: DesignTokensColors.light.status.info,
    infoLight: DesignTokensColors.light.status.infoLight,
    infoDark: DesignTokensColors.light.status.infoDark,
    
    // UI elements
    border: DesignTokensColors.light.border.default,
    borderLight: DesignTokensColors.light.border.light,
    card: DesignTokensColors.light.card.default,
    cardSecondary: DesignTokensColors.light.card.secondary,
    
    // Icons
    icon: DesignTokensColors.light.icon.default,
    iconSecondary: DesignTokensColors.light.icon.secondary,
    tabIconDefault: DesignTokensColors.light.icon.default,
    tabIconSelected: DesignTokensColors.light.icon.active,
    
    // Buttons
    buttonPrimary: DesignTokensColors.light.button.primary.background,
    buttonPrimaryText: DesignTokensColors.light.button.primary.text,
    buttonSecondary: DesignTokensColors.light.button.secondary.background,
    buttonSecondaryText: DesignTokensColors.light.button.secondary.text,
    buttonSuccess: DesignTokensColors.light.button.success.background,
    buttonSuccessText: DesignTokensColors.light.button.success.text,
    buttonError: DesignTokensColors.light.button.error.background,
    buttonErrorText: DesignTokensColors.light.button.error.text,
    buttonDisabled: DesignTokensColors.light.button.disabled.background,
    buttonDisabledText: DesignTokensColors.light.button.disabled.text,
    
    // Overlay
    overlay: DesignTokensColors.light.overlay,
    
    // Shadow
    shadowColor: '#000',
  },
  dark: {
    // Base colors
    text: DesignTokensColors.dark.text.primary,
    textSecondary: DesignTokensColors.dark.text.secondary,
    textTertiary: DesignTokensColors.dark.text.tertiary,
    background: DesignTokensColors.dark.background.primary,
    backgroundSecondary: DesignTokensColors.dark.background.secondary,
    backgroundTertiary: DesignTokensColors.dark.background.tertiary,
    
    // Brand colors
    primary: DesignTokensColors.dark.brand.primary,
    primaryLight: DesignTokensColors.dark.brand.primaryLight,
    primaryDark: DesignTokensColors.dark.brand.primaryDark,
    tint: DesignTokensColors.dark.brand.tint,
    
    // Status colors
    success: DesignTokensColors.dark.status.success,
    successLight: DesignTokensColors.dark.status.successLight,
    successDark: DesignTokensColors.dark.status.successDark,
    error: DesignTokensColors.dark.status.error,
    errorLight: DesignTokensColors.dark.status.errorLight,
    errorDark: DesignTokensColors.dark.status.errorDark,
    warning: DesignTokensColors.dark.status.warning,
    warningLight: DesignTokensColors.dark.status.warningLight,
    warningDark: DesignTokensColors.dark.status.warningDark,
    info: DesignTokensColors.dark.status.info,
    infoLight: DesignTokensColors.dark.status.infoLight,
    infoDark: DesignTokensColors.dark.status.infoDark,
    
    // UI elements
    border: DesignTokensColors.dark.border.default,
    borderLight: DesignTokensColors.dark.border.light,
    card: DesignTokensColors.dark.card.default,
    cardSecondary: DesignTokensColors.dark.card.secondary,
    
    // Icons
    icon: DesignTokensColors.dark.icon.default,
    iconSecondary: DesignTokensColors.dark.icon.secondary,
    tabIconDefault: DesignTokensColors.dark.icon.default,
    tabIconSelected: DesignTokensColors.dark.icon.active,
    
    // Buttons
    buttonPrimary: DesignTokensColors.dark.button.primary.background,
    buttonPrimaryText: DesignTokensColors.dark.button.primary.text,
    buttonSecondary: DesignTokensColors.dark.button.secondary.background,
    buttonSecondaryText: DesignTokensColors.dark.button.secondary.text,
    buttonSuccess: DesignTokensColors.dark.button.success.background,
    buttonSuccessText: DesignTokensColors.dark.button.success.text,
    buttonError: DesignTokensColors.dark.button.error.background,
    buttonErrorText: DesignTokensColors.dark.button.error.text,
    buttonDisabled: DesignTokensColors.dark.button.disabled.background,
    buttonDisabledText: DesignTokensColors.dark.button.disabled.text,
    
    // Overlay
    overlay: DesignTokensColors.dark.overlay,
    
    // Shadow
    shadowColor: '#000',
  },
};
export const Fonts = Typography.fontFamily;
