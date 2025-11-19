import { AlertService } from '@/src/services/alerts/alertService';
import { useAuth } from '@/src/hooks/useAuth';
import { SafetyQuizModal } from '@/src/components/feature/check-in/SafetyQuizModal';
import { InactiveSessionView } from '@/src/components/feature/check-in/InactiveSessionView';
import { ActiveSessionView } from '@/src/components/feature/check-in/ActiveSessionView';
import { BackgroundPermissionModal } from '@/src/components/feature/check-in/BackgroundPermissionModal';
import { useLocationTracking } from '@/src/hooks/useLocationTracking';
import { CheckInService } from '@/src/services/check-in/checkInService';
import { safetyCheckNotificationService } from '@/src/services/check-in/safetyCheckNotificationService';
import type { SafetyQuizAnswers } from '@/src/types/check-in/types';
import { useContacts } from '@/src/hooks/useContacts';
import { useTheme } from '@/src/hooks/use-theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import * as Location from 'expo-location';

const Index = () => {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const theme = useTheme();
  const router = useRouter();
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showBackgroundPermissionModal, setShowBackgroundPermissionModal] = useState(false);
  const [pendingQuizAnswers, setPendingQuizAnswers] = useState<SafetyQuizAnswers | null>(null);

  const {
    location,
    isTracking,
    isStarting,
    sessionId,
    timeRemaining,
    startTracking,
    stopTracking,
    checkTrackingStatus,
    requestBackgroundPermission,
    resetTimer,
  } = useLocationTracking({
    userId: user?.id || null,
    contactsCount: contacts?.length || 0,
    onContactsRequired: () => router.push('/(tabs)/contacts'),
  });

  const handleStartSession = async () => {
    const result = await startTracking(false);
    if (result?.needsQuiz) {
      setShowQuizModal(true);
    } else if (result?.needsBackgroundPermission) {
      setShowBackgroundPermissionModal(true);
    }
  };

  const handleQuizModalComplete = async (answers: SafetyQuizAnswers) => {
    setShowQuizModal(false);
    const result = await startTracking(false, answers);
    if (result?.needsBackgroundPermission) {
      setPendingQuizAnswers(answers);
      setShowBackgroundPermissionModal(true);
    }
  };

  const handleBackgroundPermissionModalConfirm = async () => {
    setShowBackgroundPermissionModal(false);
    const answers = pendingQuizAnswers;
    setPendingQuizAnswers(null);
    await requestBackgroundPermission();
    if (user && answers) {
      await startTracking(true, answers);
    }
  };

  const handleBackgroundPermissionModalCancel = () => {
    setShowBackgroundPermissionModal(false);
    setPendingQuizAnswers(null);
  };

  const handleImSafe = async () => {
    if (!user || !sessionId || !location) {
      Alert.alert('Error', 'Unable to check in. Please ensure location is available.');
      return;
    }

    try {
      const { error } = await CheckInService.createCheckIn(sessionId, user.id, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        timestamp: Date.now(),
      });

      if (error) {
        Alert.alert('Error', `Failed to check in: ${error.message}`);
      } else {
        resetTimer();
      }
    } catch (error) {
      Alert.alert(
        'Error',
        `Failed to check in: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleEmergencyHelp = async () => {
    if (!user || !sessionId) {
      Alert.alert('Error', 'No active session found');
      return;
    }

    Alert.alert(
      'Emergency Help',
      'Are you sure you need emergency help? This will alert your contacts immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Get Help',
          style: 'destructive',
          onPress: async () => {
            try {
              const { alert, error } = await AlertService.createAlert(user.id, sessionId, 'manual');

              if (error) {
                Alert.alert('Error', `Failed to create alert: ${error.message}`);
              } else {
                Alert.alert('Help Requested', 'Your contacts have been notified');
                await safetyCheckNotificationService.stopSafetyCheckNotifications();
              }
            } catch (error) {
              Alert.alert(
                'Error',
                `Failed to send alert: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          },
        },
      ]
    );
  };

  const handleEndSession = async () => {
    await stopTracking();
    await checkTrackingStatus();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Home</Text>

      {!isTracking ? (
        <InactiveSessionView isStarting={isStarting} onStartPress={handleStartSession} />
      ) : (
        <ActiveSessionView
          timeRemaining={timeRemaining}
          onImSafe={handleImSafe}
          onEmergency={handleEmergencyHelp}
          onEndSession={handleEndSession}
        />
      )}

      <SafetyQuizModal
        visible={showQuizModal}
        contacts={contacts}
        onComplete={handleQuizModalComplete}
        onCancel={() => setShowQuizModal(false)}
      />

      <BackgroundPermissionModal
        visible={showBackgroundPermissionModal}
        onConfirm={handleBackgroundPermissionModalConfirm}
        onCancel={handleBackgroundPermissionModalCancel}
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});
