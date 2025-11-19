import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Colors } from '@/src/constants/design-tokens';

// Configure notification behavior
// This handler processes notifications even when app is in background
// For scheduled notifications, this ensures they show even when app is backgrounded
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Always show notifications, even when app is in background
    // This is critical for scheduled safety check notifications
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export class NotificationService {
  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<{
    granted: boolean;
    error: Error | null;
  }> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return { granted: false, error: new Error('Notification permissions not granted') };
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        // Create a dedicated channel for safety check notifications
        await Notifications.setNotificationChannelAsync('safety-check', {
          name: 'Safety Check',
          description: 'Notifications for safety check-ins',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: Colors.light.brand.primary,
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        // Also configure default channel
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: Colors.light.brand.primary,
        });
      }

      return { granted: true, error: null };
    } catch (error) {
      return { granted: false, error: error as Error };
    }
  }

  /**
   * Schedule a local notification
   */
  static async scheduleNotification(
    title: string,
    body: string,
    trigger?: Notifications.NotificationTriggerInput,
    actions?: Notifications.NotificationAction[]
  ): Promise<{ notificationId: string | null; error: Error | null }> {
    try {
      // Use dedicated channel for safety check notifications on Android
      const channelId = actions && Platform.OS === 'android' ? 'safety-check' : 'default';

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: actions ? 'safety-check' : undefined,
          data: {},
          // Ensure notification shows even when app is in background
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger: trigger || null, // null means show immediately
      });

      // Register category with actions if provided
      if (actions && actions.length > 0) {
        await Notifications.setNotificationCategoryAsync('safety-check', actions, {
          intentIdentifiers: [],
          customDismissAction: true,
        });
      }

      return { notificationId, error: null };
    } catch (error) {
      return { notificationId: null, error: error as Error };
    }
  }

  /**
   * Schedule a recurring notification (e.g., every 15 minutes)
   */
  static async scheduleRecurringNotification(
    title: string,
    body: string,
    intervalMinutes: number,
    actions?: Notifications.NotificationAction[]
  ): Promise<{ notificationId: string | null; error: Error | null }> {
    try {
      // Register category with actions if provided
      if (actions && actions.length > 0) {
        await Notifications.setNotificationCategoryAsync('safety-check', actions, {
          intentIdentifiers: [],
          customDismissAction: true,
        });
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: actions ? 'safety-check' : undefined,
          data: {},
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          repeats: true,
          seconds: intervalMinutes * 60,
        },
      });

      return { notificationId, error: null };
    } catch (error) {
      return { notificationId: null, error: error as Error };
    }
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<{ error: Error | null }> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<{ error: Error | null }> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get notification permissions status
   */
  static async getPermissionsStatus(): Promise<{
    status: Notifications.PermissionStatus;
    error: Error | null;
  }> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return { status, error: null };
    } catch (error) {
      return { status: Notifications.PermissionStatus.UNDETERMINED, error: error as Error };
    }
  }

  /**
   * Add notification received listener
   */
  static addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  static addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}
