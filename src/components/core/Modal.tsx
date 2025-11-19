/**
 * Modal Component
 * 
 * A reusable modal wrapper component with overlay and animations.
 * Uses design tokens for consistent styling.
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  ModalProps as RNModalProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { Spacing, BorderRadius, Shadows } from '@/src/constants/design-tokens';

export interface ModalProps extends Omit<RNModalProps, 'style'> {
  /**
   * Whether modal is visible
   */
  visible: boolean;
  
  /**
   * Modal content
   */
  children: React.ReactNode;
  
  /**
   * Callback when modal should close (backdrop press or back button)
   */
  onClose: () => void;
  
  /**
   * Whether to show close button
   * @default false
   */
  showCloseButton?: boolean;
  
  /**
   * Whether backdrop is pressable to close
   * @default true
   */
  dismissible?: boolean;
  
  /**
   * Custom style for modal content
   */
  contentStyle?: ViewStyle;
  
  /**
   * Modal size variant
   * @default 'default'
   */
  size?: 'small' | 'default' | 'large' | 'fullscreen';
}

/**
 * Modal component with overlay and customizable content
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  children,
  onClose,
  showCloseButton = false,
  dismissible = true,
  contentStyle,
  size = 'default',
  ...modalProps
}) => {
  const theme = useTheme();
  
  // Get content width based on size
  const getContentWidth = () => {
    switch (size) {
      case 'small':
        return '70%';
      case 'large':
        return '90%';
      case 'fullscreen':
        return '100%';
      default:
        return '85%';
    }
  };
  
  const contentContainerStyle: ViewStyle = {
    width: getContentWidth(),
    maxWidth: 400,
    backgroundColor: theme.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
    ...contentStyle,
  };
  
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...modalProps}
    >
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: theme.overlay }]}
        activeOpacity={1}
        onPress={dismissible ? onClose : undefined}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={contentContainerStyle}
        >
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={[styles.closeIcon, { backgroundColor: theme.border }]} />
            </TouchableOpacity>
          )}
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeIcon: {
    width: 20,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
});

