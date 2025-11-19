/**
 * useLocationTracking Hook
 * 
 * Custom hook for managing location tracking, permissions, and session state.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckInService } from '@/src/services/check-in/checkInService';
import { safetyCheckNotificationService } from '@/src/services/check-in/safetyCheckNotificationService';
import type { SafetyQuizAnswers } from '@/src/types/check-in/types';

const LOCATION_TASK_NAME = 'background-location-task';
const STORAGE_KEY_USER_ID = '@location_tracking_user_id';
const STORAGE_KEY_SESSION_ID = '@location_tracking_session_id';

// Global ref to store location update callback
let locationUpdateCallback: ((locations: Location.LocationObject[]) => void) | null = null;

/**
 * Define the background task for location updates
 * This must be defined at the top level, before any component code
 */
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location tracking task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    console.log('Received new locations:', locations);

    const userId = await AsyncStorage.getItem(STORAGE_KEY_USER_ID);
    const sessionId = await AsyncStorage.getItem(STORAGE_KEY_SESSION_ID);

    if (!userId || !sessionId) {
      console.warn('No user_id or session_id found in storage for location tracking');
      if (locationUpdateCallback) {
        locationUpdateCallback(locations);
      }
      return;
    }

    console.log('Location update received:', {
      userId,
      sessionId,
      locationCount: locations.length,
    });

    if (locationUpdateCallback) {
      locationUpdateCallback(locations);
    }
  }
});

interface UseLocationTrackingOptions {
  userId: string | null;
  contactsCount: number;
  onContactsRequired: () => void;
}

export function useLocationTracking({
  userId,
  contactsCount,
  onContactsRequired,
}: UseLocationTrackingOptions) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [status, setStatus] = useState<string>('Ready');
  const [foregroundGranted, setForegroundGranted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(900);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAndroid11Plus = Platform.OS === 'android' && Platform.Version >= 30;

  const checkTrackingStatus = useCallback(async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(hasStarted);
      if (hasStarted) {
        setStatus('Tracking active');
      }
      return hasStarted;
    } catch (error) {
      console.error('Error checking tracking status:', error);
      return false;
    }
  }, []);

  const saveLocationUpdate = useCallback(async (location: Location.LocationObject) => {
    if (!userId || !sessionId) return;
    try {
      console.log('Location update saved locally:', {
        userId,
        sessionId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error saving location update:', error);
    }
  }, [userId, sessionId]);

  const requestBackgroundPermission = useCallback(async () => {
    try {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === 'granted') {
        setStatus('Ready - Tap Start to begin tracking');
      } else {
        console.warn('Background location permission not granted. Tracking will work in foreground only.');
      }
    } catch (error) {
      console.error('Error requesting background permission:', error);
      setStatus('Error requesting background permission');
    }
  }, []);

  const stopTracking = useCallback(async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      let activeSessionId = sessionId;
      if (!activeSessionId) {
        activeSessionId = await AsyncStorage.getItem(STORAGE_KEY_SESSION_ID);
      }

      if (userId && activeSessionId) {
        try {
          const { error: endSessionError } = await CheckInService.endSession(activeSessionId, userId);
          if (endSessionError) {
            console.error('Failed to end session:', endSessionError);
          }
        } catch (error) {
          console.error('Error ending session:', error);
        }
      }

      const { error: safetyCheckError } =
        await safetyCheckNotificationService.stopSafetyCheckNotifications();
      if (safetyCheckError) {
        console.error('Failed to stop safety check notifications:', safetyCheckError);
      }

      await AsyncStorage.removeItem(STORAGE_KEY_USER_ID);
      await AsyncStorage.removeItem(STORAGE_KEY_SESSION_ID);

      setIsTracking(false);
      setSessionId(null);
      setStatus('Tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
        if (hasStarted) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }
        setIsTracking(false);
        setStatus('Tracking stopped (with errors)');
      } catch {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to stop tracking'}`);
      }
    }
  }, [sessionId, userId]);

  const startTracking = useCallback(async (
    skipLoadingState = false,
    quizAnswers?: SafetyQuizAnswers
  ) => {
    if (!userId) {
      setStatus('Error: User not authenticated');
      return;
    }

    if (contactsCount === 0) {
      if (!skipLoadingState) {
        setIsStarting(false);
      }
      Alert.alert(
        'No Contacts',
        'Please add at least one contact before starting tracking. You need contacts to receive alerts in case of emergency.',
        [{ text: 'OK', onPress: onContactsRequired }]
      );
      return;
    }

    if (!quizAnswers) {
      return { needsQuiz: true };
    }

    if (!skipLoadingState) {
      setIsStarting(true);
    }

    try {
      if (!foregroundGranted) {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
          setStatus('Error: Foreground location permission denied');
          if (!skipLoadingState) {
            setIsStarting(false);
          }
          return { error: 'Foreground permission denied' };
        }
        setForegroundGranted(true);
      }

      const { status: currentBackgroundStatus } = await Location.getBackgroundPermissionsAsync();

      if (currentBackgroundStatus !== 'granted') {
        if (isAndroid11Plus) {
          if (!skipLoadingState) {
            setIsStarting(false);
          }
          return { needsBackgroundPermission: true };
        } else {
          await requestBackgroundPermission();
        }
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        setStatus('Location tracking already active');
        if (!skipLoadingState) {
          setIsStarting(false);
        }
        return { error: 'Already tracking' };
      }

      const { session: newSession, error: createError } = await CheckInService.startSession(
        userId,
        quizAnswers,
        undefined
      );

      if (createError || !newSession) {
        setStatus(`Error: ${createError?.message || 'Failed to create session'}`);
        if (!skipLoadingState) {
          setIsStarting(false);
        }
        return { error: createError?.message || 'Failed to create session' };
      }

      const activeSessionId = newSession.id;
      setSessionId(activeSessionId);

      await AsyncStorage.setItem(STORAGE_KEY_USER_ID, userId);
      await AsyncStorage.setItem(STORAGE_KEY_SESSION_ID, activeSessionId);

      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(initialLocation);
      await saveLocationUpdate(initialLocation);

      const locationOptions: Location.LocationTaskOptions = {
        accuracy: Location.Accuracy.Highest,
        distanceInterval: 100,
        showsBackgroundLocationIndicator: true,
        pausesUpdatesAutomatically: false,
      };

      if (Platform.OS === 'android') {
        locationOptions.foregroundService = {
          notificationTitle: 'Hollie Safety',
          notificationBody: 'Tracking your location for safety',
        };
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, locationOptions);

      const { error: safetyCheckError } =
        await safetyCheckNotificationService.startSafetyCheckNotifications();
      if (safetyCheckError) {
        console.error('Failed to start safety check notifications:', safetyCheckError);
      }

      setIsTracking(true);
      setStatus('Location tracking started');
      setTimeRemaining(900);
      return { success: true };
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to start tracking'}`);
      return { error: error instanceof Error ? error.message : 'Failed to start tracking' };
    } finally {
      if (!skipLoadingState) {
        setIsStarting(false);
      }
    }
  }, [userId, contactsCount, onContactsRequired, foregroundGranted, isAndroid11Plus, requestBackgroundPermission, saveLocationUpdate]);

  useEffect(() => {
    locationUpdateCallback = (locations: Location.LocationObject[]) => {
      if (locations.length > 0) {
        const latestLocation = locations[locations.length - 1];
        setLocation(latestLocation);
        setStatus('Tracking active');
        setIsTracking(true);
      }
    };

    checkTrackingStatus();

    const requestPermissions = async () => {
      try {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        setForegroundGranted(foregroundStatus === 'granted');

        if (foregroundStatus === 'granted') {
          const { status: currentBackgroundStatus } =
            await Location.getBackgroundPermissionsAsync();

          if (currentBackgroundStatus !== 'granted') {
            if (isAndroid11Plus) {
              // Will be handled by modal
            } else {
              await requestBackgroundPermission();
            }
          }

          const isActive = await checkTrackingStatus();
          if (!isActive) {
            setStatus('Ready - Tap Start to begin tracking');
          }
        } else {
          setStatus('Location permission denied');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        setStatus('Error requesting permissions');
      }
    };

    requestPermissions();

    const statusCheckInterval = setInterval(() => {
      checkTrackingStatus();
    }, 2000);

    return () => {
      locationUpdateCallback = null;
      clearInterval(statusCheckInterval);
    };
  }, [userId, sessionId, checkTrackingStatus, isAndroid11Plus, requestBackgroundPermission]);

  useEffect(() => {
    if (isTracking && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTracking, timeRemaining]);

  const resetTimer = useCallback(() => {
    setTimeRemaining(900);
  }, []);

  return {
    location,
    status,
    isTracking,
    isStarting,
    sessionId,
    timeRemaining,
    startTracking,
    stopTracking,
    checkTrackingStatus,
    requestBackgroundPermission,
    resetTimer,
  };
}

