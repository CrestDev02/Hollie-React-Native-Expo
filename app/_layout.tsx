import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

/**
 * Root Layout
 * 
 * Main app layout component that sets up providers and navigation.
 * Handles notification responses and provides theme, auth, and contacts context.
 */

import { ErrorBoundary } from '@/src/components/core/ErrorBoundary';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { ContactsProvider } from '@/src/contexts/ContactsContext';
import { ThemeProvider, useThemeMode } from '@/src/contexts/ThemeContext';
import { AuthGuard } from '@/src/components/feature/AuthGuard';
import { safetyCheckNotificationService } from '@/src/services/check-in/safetyCheckNotificationService';

/**
 * Root Layout Navigation Component
 * Handles notification processing and sets up navigation stack
 */
function RootLayoutNav() {
  const { activeTheme } = useThemeMode();

  /**
   * Process a notification response (used both for pending responses and live responses)
   */
  const processNotificationResponse = async (response: Notifications.NotificationResponse) => {
    // Handle safety check notification actions
    if (response.notification.request.content.categoryIdentifier === 'safety-check') {
      const actionIdentifier = response.actionIdentifier;
      const notificationId = response.notification.request.identifier;

      // Handle "I need help" - process API call immediately
      // This happens as soon as the app receives the response, before UI loads
      if (actionIdentifier === 'need_help') {
        // Process the help request immediately - API call happens here
        // The app may open briefly, but the API call completes quickly
        await safetyCheckNotificationService.handleNotificationResponse(response);
        // Dismiss the notification
        if (notificationId) {
          await Notifications.dismissNotificationAsync(notificationId);
        }
        return;
      }

      // Handle "I'm okay" - store response in session_events
      if (actionIdentifier === 'im_okay') {
        // Store the response in session_events
        await safetyCheckNotificationService.handleImOkay();
        // Dismiss the notification
        if (notificationId) {
          await Notifications.dismissNotificationAsync(notificationId);
        }
        return;
      }

      // Handle notification tap (not an action button) - dismiss it
      if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        if (notificationId) {
          await Notifications.dismissNotificationAsync(notificationId);
        }
      }
    }

    // Handle other notification types
    const data = response.notification.request.content.data;
    if (data?.type === 'checkin_reminder') {
      // Navigate to home screen when check-in reminder is tapped
      // The home screen will handle the check-in logic
    }
  };

  useEffect(() => {
    // Check for pending notification responses on app launch
    // This handles cases where the app was killed and user pressed an action button
    const checkPendingNotificationResponse = async () => {
      try {
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          console.log('Processing pending notification response from app launch');
          await processNotificationResponse(lastResponse);
        }
      } catch (error) {
        console.error('Error checking for pending notification response:', error);
      }
    };

    // Process any pending response immediately on app launch
    checkPendingNotificationResponse();

    // Set up global notification response handler for future responses
    // Note: In Expo managed workflow, tapping notification actions will open the app
    // However, we process the API call immediately to minimize user impact
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response: Notifications.NotificationResponse) => {
        await processNotificationResponse(response);
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <NavigationThemeProvider value={activeTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGuard>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      </AuthGuard>
    </NavigationThemeProvider>
  );
}

/**
 * Root Layout Component
 * Wraps the app with necessary providers and error boundary
 */
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ContactsProvider>
            <RootLayoutNav />
          </ContactsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

