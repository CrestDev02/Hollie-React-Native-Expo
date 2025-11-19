import { AlertService } from '@/src/services/alerts/alertService';
import { NotificationService } from '@/src/services/notifications';
import { CheckInService } from './checkInService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

const STORAGE_KEY_SAFETY_CHECK_ID = '@safety_check_notification_id';
const STORAGE_KEY_USER_ID = '@location_tracking_user_id';
const STORAGE_KEY_SESSION_ID = '@location_tracking_session_id';
const SAFETY_CHECK_INTERVAL_MINUTES = 1;

class SafetyCheckNotificationService {
  private notificationReceivedListener: Notifications.Subscription | null = null;
  private notificationResponseListener: Notifications.Subscription | null = null;
  private scheduledNotificationIds: Set<string> = new Set();

  /**
   * Start recurring safety check notifications every 15 minutes
   */
  async startSafetyCheckNotifications(): Promise<{ error: Error | null }> {
    try {
      // Request notification permissions
      const { granted, error: permError } = await NotificationService.requestPermissions();
      if (!granted || permError) {
        return { error: permError || new Error('Notification permissions not granted') };
      }

      // Define action buttons
      const actions: Notifications.NotificationAction[] = [
        {
          identifier: 'im_okay',
          buttonTitle: "I'm okay",
        },
        {
          identifier: 'need_help',
          buttonTitle: 'I need help',
        },
      ];

      // Register the notification category with actions
      await Notifications.setNotificationCategoryAsync('safety-check', actions, {
        intentIdentifiers: [],
        customDismissAction: true,
      });

      // Set up listeners
      this.setupNotificationListeners();

      // Schedule 2 notifications: first after 1 min, second 1 min after first (2 min from now)
      await this.scheduleNotificationAtInterval(1); // First notification after 1 minute
      await this.scheduleNotificationAtInterval(2); // Second notification after 2 minutes (1 min after first)

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Schedule a notification at a specific interval (e.g., 1 = 1 min, 2 = 2 min, etc.)
   */
  private async scheduleNotificationAtInterval(intervalMinutes: number): Promise<void> {
    try {
      const actions: Notifications.NotificationAction[] = [
        {
          identifier: 'im_okay',
          buttonTitle: "I'm okay",
        },
        {
          identifier: 'need_help',
          buttonTitle: 'I need help',
        },
      ];

      // Schedule notification for the specified minutes from now
      const { notificationId, error } = await NotificationService.scheduleNotification(
        'Safety Check',
        'Are you okay?',
        {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: intervalMinutes * 60,
        },
        actions
      );

      if (notificationId && !error) {
        this.scheduledNotificationIds.add(notificationId);
        await AsyncStorage.setItem(STORAGE_KEY_SAFETY_CHECK_ID, notificationId);
      } else {
        console.error('Error scheduling safety check notification:', error);
      }
    } catch (error) {
      console.error('Error scheduling safety check notification:', error);
    }
  }

  /**
   * Schedule the next safety check notification (15 minutes from now)
   */
  async scheduleNextNotification(): Promise<void> {
    await this.scheduleNotificationAtInterval(SAFETY_CHECK_INTERVAL_MINUTES);
  }

  /**
   * Set up listeners for notification received and responses
   */
  private setupNotificationListeners(): void {
    // Remove existing listeners if any
    if (this.notificationReceivedListener) {
      this.notificationReceivedListener.remove();
    }
    if (this.notificationResponseListener) {
      this.notificationResponseListener.remove();
    }

    // Listen for when notifications are received (shown to user)
    // NOTE: This only works when app is in FOREGROUND
    // We schedule notifications in advance, so this is mainly for logging
    this.notificationReceivedListener = NotificationService.addNotificationReceivedListener(
      async (notification: Notifications.Notification) => {
        // Only handle safety check notifications
        if (notification.request.content.categoryIdentifier === 'safety-check') {
          console.log('Safety check notification received (foreground only)');
          // Notifications are pre-scheduled, so no need to schedule here
        }
      }
    );

    // Listen for notification responses (when user taps action buttons)
    // Note: The global handler in _layout.tsx handles all "I need help" responses
    // This listener is kept for potential future use but doesn't handle "I need help" to avoid duplicates
    this.notificationResponseListener = NotificationService.addNotificationResponseListener(
      async (response: Notifications.NotificationResponse) => {
        // Only handle safety check notifications
        if (response.notification.request.content.categoryIdentifier !== 'safety-check') {
          return;
        }

        const actionIdentifier = response.actionIdentifier;

        // Handle "I'm okay" response
        // "I'm okay" is handled by the global handler in _layout.tsx to avoid duplicate entries
        // Do not handle it here

        // "I need help" is handled by the global handler in _layout.tsx to avoid duplicate alerts
        // Do not handle it here

        // Handle notification tap (not an action button)
        if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          // User just tapped the notification, next one already scheduled
          console.log('User tapped safety check notification');
          // Notification dismissal is handled by the global handler in _layout.tsx
        }
      }
    );
  }

  /**
   * Handle notification response (can be called from background)
   * This method processes the response without requiring the app to be in foreground
   */
  async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    const actionIdentifier = response.actionIdentifier;

    if (actionIdentifier === 'need_help') {
      await this.handleNeedHelp();
      // Stop scheduling more notifications - alert has been triggered
      await this.stopSafetyCheckNotifications();
    } else if (actionIdentifier === 'im_okay') {
      await this.handleImOkay();
    }
  }

  /**
   * Handle "I'm okay" response - create session event to store response
   * This method can be called when the app is launched from a killed state
   */
  async handleImOkay(): Promise<void> {
    try {
      // Get user_id and session_id from AsyncStorage
      // Note: When app is launched from killed state, AsyncStorage should still be available
      // but we add a small delay to ensure it's ready
      let userId = await AsyncStorage.getItem(STORAGE_KEY_USER_ID);
      let sessionId = await AsyncStorage.getItem(STORAGE_KEY_SESSION_ID);

      // If not found immediately, wait a bit and retry (for edge cases when app is launching)
      if (!userId || !sessionId) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        userId = await AsyncStorage.getItem(STORAGE_KEY_USER_ID);
        sessionId = await AsyncStorage.getItem(STORAGE_KEY_SESSION_ID);
      }

      if (!userId || !sessionId) {
        console.error('No user_id or session_id found for safety check response');
        return;
      }

      // Get current location if possible
      let latitude: number = 0;
      let longitude: number = 0;
      let accuracy: number | undefined = undefined;
      
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = currentLocation.coords.latitude;
        longitude = currentLocation.coords.longitude;
        accuracy = currentLocation.coords.accuracy ?? undefined;
      } catch (locationError) {
        console.warn('Could not get location for safety check response:', locationError);
        // Continue without location - we'll use default coordinates (0, 0)
      }

      // Create check-in for "I'm okay" response using CheckInService
      // This will update the session's last_checkin_at and reset missed_checkins_count
      const checkInLocation = {
        latitude,
        longitude,
        accuracy,
        timestamp: Date.now(),
      };

      const { error } = await CheckInService.createCheckIn(sessionId, userId, checkInLocation);

      if (error) {
        console.error('Failed to create safety check okay event:', error);
      } else {
        console.log('Safety check okay event created successfully');
      }
    } catch (error) {
      console.error(`Error handling I'm okay response:`, error);
    }
  }

  /**
   * Handle "I need help" response - create alert and call API
   * This method can be called when the app is launched from a killed state
   */
  private async handleNeedHelp(): Promise<void> {
    try {
      // Get user_id and session_id from AsyncStorage
      // Note: When app is launched from killed state, AsyncStorage should still be available
      // but we add a small delay to ensure it's ready
      let userId = await AsyncStorage.getItem(STORAGE_KEY_USER_ID);
      let sessionId = await AsyncStorage.getItem(STORAGE_KEY_SESSION_ID);

      // If not found immediately, wait a bit and retry (for edge cases when app is launching)
      if (!userId || !sessionId) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        userId = await AsyncStorage.getItem(STORAGE_KEY_USER_ID);
        sessionId = await AsyncStorage.getItem(STORAGE_KEY_SESSION_ID);
      }

      if (!userId || !sessionId) {
        console.error('No user_id or session_id found for safety check alert');
        return;
      }

      // Create alert via API
      const { alert, error } = await AlertService.createAlert(userId, sessionId, 'manual');

      if (error) {
        console.error('Failed to create alert from safety check:', error);
      } else {
        console.log('Alert created successfully from safety check:', alert?.id);
      }
    } catch (error) {
      console.error('Error handling need help response:', error);
    }
  }

  /**
   * Stop safety check notifications
   */
  async stopSafetyCheckNotifications(): Promise<{ error: Error | null }> {
    try {
      // Remove listeners
      if (this.notificationReceivedListener) {
        this.notificationReceivedListener.remove();
        this.notificationReceivedListener = null;
      }
      if (this.notificationResponseListener) {
        this.notificationResponseListener.remove();
        this.notificationResponseListener = null;
      }

      // Cancel all scheduled safety check notifications
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of allScheduled) {
        if (notification.content.categoryIdentifier === 'safety-check') {
          await NotificationService.cancelNotification(notification.identifier);
          this.scheduledNotificationIds.delete(notification.identifier);
        }
      }

      // Clear storage
      await AsyncStorage.removeItem(STORAGE_KEY_SAFETY_CHECK_ID);
      this.scheduledNotificationIds.clear();

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Check if safety check notifications are active
   */
  async isActive(): Promise<boolean> {
    try {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      return allScheduled.some((n) => n.content.categoryIdentifier === 'safety-check');
    } catch (error) {
      console.error('Error checking safety check notification status:', error);
      return false;
    }
  }
}

export const safetyCheckNotificationService = new SafetyCheckNotificationService();
