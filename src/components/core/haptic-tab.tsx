/**
 * HapticTab Component
 * 
 * A tab bar button component that provides haptic feedback on iOS.
 * Wraps the default tab button with haptic feedback functionality.
 * 
 * @param {BottomTabBarButtonProps} props - Props for the tab bar button
 * @returns {JSX.Element} Tab button with haptic feedback
 */

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
