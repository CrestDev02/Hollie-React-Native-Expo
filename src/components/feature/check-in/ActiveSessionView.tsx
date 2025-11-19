/**
 * ActiveSessionView Component
 * 
 * Displays the UI when an active session is running.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';
import { formatTimer } from '@/src/utils/timer';

interface ActiveSessionViewProps {
  timeRemaining: number;
  onImSafe: () => void;
  onEmergency: () => void;
  onEndSession: () => void;
}

export function ActiveSessionView({
  timeRemaining,
  onImSafe,
  onEmergency,
  onEndSession,
}: ActiveSessionViewProps) {
  const theme = useTheme();

  return (
    <View style={styles.centerContent}>
      <View style={[styles.icon, { backgroundColor: theme.successLight }]}>
        <Text style={[styles.iconText, { color: theme.success }]}>✓</Text>
      </View>
      <Text style={[styles.title, { color: theme.success }]}>Active Session</Text>
      <Text style={[styles.timer, { color: theme.text }]}>{formatTimer(timeRemaining)}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Next check-in</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.imSafeButton, { backgroundColor: theme.background, borderColor: theme.success }]}
          onPress={onImSafe}
        >
          <Text style={[styles.imSafeIcon, { color: theme.success }]}>✓</Text>
          <Text style={[styles.imSafeText, { color: theme.success }]}>I&apos;m Safe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.emergencyButton, { backgroundColor: theme.error }]}
          onPress={onEmergency}
        >
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={[styles.emergencyText, { color: theme.buttonErrorText }]}>
            Emergency Help
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.endButton, { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={onEndSession}
        >
          <Text style={[styles.endText, { color: theme.text }]}>End Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 64,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  imSafeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  imSafeIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  imSafeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  emergencyIcon: {
    fontSize: 20,
  },
  emergencyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  endButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  endText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

