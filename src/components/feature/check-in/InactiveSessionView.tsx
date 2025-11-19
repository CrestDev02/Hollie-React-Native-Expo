/**
 * InactiveSessionView Component
 * 
 * Displays the UI when no active session is running.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/use-theme';

interface InactiveSessionViewProps {
  isStarting: boolean;
  onStartPress: () => void;
}

export function InactiveSessionView({ isStarting, onStartPress }: InactiveSessionViewProps) {
  const theme = useTheme();

  return (
    <View style={styles.centerContent}>
      <View style={[styles.icon, { backgroundColor: theme.border }]}>
        <Text style={[styles.iconText, { color: theme.textSecondary }]}>✕</Text>
      </View>
      <Text style={[styles.title, { color: theme.text }]}>No Active Session</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        Start a session when you&apos;re in a situation where you want safety monitoring
      </Text>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.buttonPrimary },
          isStarting && styles.buttonDisabled,
        ]}
        onPress={onStartPress}
        disabled={isStarting}
      >
        {isStarting ? (
          <ActivityIndicator color={theme.buttonPrimaryText} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>
            Start Session
          </Text>
        )}
      </TouchableOpacity>
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
    marginBottom: 24,
  },
  iconText: {
    fontSize: 48,
    fontWeight: '300',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

