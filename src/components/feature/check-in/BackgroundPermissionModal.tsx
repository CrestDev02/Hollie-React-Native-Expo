/**
 * BackgroundPermissionModal Component
 * 
 * Modal explaining background location permission for Android 11+.
 */

import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { ThemedView } from '@/src/components/core';
import { Shadows, BorderRadius, Spacing } from '@/src/constants/design-tokens';

interface BackgroundPermissionModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BackgroundPermissionModal({
  visible,
  onConfirm,
  onCancel,
}: BackgroundPermissionModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <ThemedView style={[styles.content, { backgroundColor: theme.background, shadowColor: theme.shadowColor }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            Background Location Permission
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Hollie needs access to your location even when the app is in the background to ensure
            your safety during check-in sessions.
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            When you tap Continue, you&apos;ll be taken to your device settings where you can
            grant Allow all the time permission for location access.
          </Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.backgroundSecondary }]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.success }]}
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, { color: theme.buttonSuccessText }]}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...Shadows.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  text: {
    fontSize: 16,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

