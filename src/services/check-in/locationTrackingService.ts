// LOCATION TRACKING CODE COMMENTED OUT
// import { supabase } from '@/services/supabase';
// import { LocationService } from '@/services/location';
// import type { LocationData } from '../types';
// import * as Location from 'expo-location';
// import * as TaskManager from 'expo-task-manager';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const LOCATION_TRACKING_TASK = 'location-tracking-task';
// const STORAGE_KEY_USER_ID = '@location_tracking_user_id';
// const STORAGE_KEY_SESSION_ID = '@location_tracking_session_id';

// // Define background task for location updates
// TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }) => {
//   if (error) {
//     console.error('Location tracking task error:', error);
//     return;
//   }

//   if (data) {
//     const { locations } = data as { locations: Location.LocationObject[] };
    
//     // Get stored user_id and session_id from AsyncStorage
//     const userId = await AsyncStorage.getItem(STORAGE_KEY_USER_ID);
//     const sessionId = await AsyncStorage.getItem(STORAGE_KEY_SESSION_ID);

//     if (!userId || !sessionId) {
//       console.warn('No user_id or session_id found in storage for location tracking');
//       return;
//     }

//     // Push each location update to Supabase
//     for (const location of locations) {
//       try {
//         const { error: insertError } = await supabase.from('location_updates').insert({
//           user_id: userId,
//           session_id: sessionId,
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//           accuracy: location.coords.accuracy || null,
//         });

//         if (insertError) {
//           console.error('Failed to push location to Supabase:', insertError);
//         } else {
//           console.log('Location pushed to Supabase:', {
//             userId,
//             sessionId,
//             latitude: location.coords.latitude,
//             longitude: location.coords.longitude,
//           });
//         }
//       } catch (err) {
//         console.error('Error pushing location to Supabase:', err);
//       }
//     }
//   }
// });

// class LocationTrackingService {
//   private isTracking = false;

//   /**
//    * Start tracking location and pushing to Supabase every 30 seconds
//    * Uses Expo Location's background location updates for reliable background tracking
//    */
//   async startTracking(userId: string, sessionId: string): Promise<{ 
//     error: Error | null;
//     backgroundPermissionGranted: boolean;
//   }> {
//     try {
//       // Stop any existing tracking
//       await this.stopTracking();

//       // Store user_id and session_id in AsyncStorage for background task
//       await AsyncStorage.setItem(STORAGE_KEY_USER_ID, userId);
//       await AsyncStorage.setItem(STORAGE_KEY_SESSION_ID, sessionId);

//       // Request foreground location permissions first (required before background on Android 11+)
//       const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
//       if (foregroundStatus !== 'granted') {
//         return { 
//           error: new Error('Foreground location permission is required for tracking'),
//           backgroundPermissionGranted: false
//         };
//       }

//       // Check current background permission status first
//       const currentBackgroundStatus = await Location.getBackgroundPermissionsAsync();
      
//       // Request background location permissions
//       let backgroundStatus = currentBackgroundStatus.status;
//       let backgroundPermissionGranted = backgroundStatus === 'granted';
      
//       if (backgroundStatus !== 'granted') {
//         try {
//           const requestResult = await Location.requestBackgroundPermissionsAsync();
//           backgroundStatus = requestResult.status;
//           backgroundPermissionGranted = backgroundStatus === 'granted';
//         } catch (error) {
//           // On Android 11+, requestBackgroundPermissionsAsync may throw or redirect to settings
//           console.warn('Background location permission request failed:', error);
//           backgroundStatus = 'undetermined';
//           backgroundPermissionGranted = false;
//         }
        
//         if (!backgroundPermissionGranted) {
//           console.warn('Background location permission not granted. Status:', backgroundStatus);
//           // On Android 11+, users need to manually grant this in app settings
//           // The system will show a dialog directing them to settings
//           // We'll continue with foreground tracking which will still work
//           // Location will be tracked when app is in foreground
//         }
//       }

//       // Push initial location immediately
//       await this.pushLocation(userId, sessionId);

//       // Start background location updates (every 30 seconds)
//       await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
//         accuracy: Location.Accuracy.Balanced,
//         timeInterval: 30000, // 30 seconds
//         distanceInterval: 0, // Update based on time, not distance
//         foregroundService: {
//           notificationTitle: 'Hollie Safety',
//           notificationBody: 'Tracking your location for safety',
//           notificationColor: '#8B5CF6',
//         },
//         pausesUpdatesAutomatically: false,
//         showsBackgroundLocationIndicator: true,
//       });

//       this.isTracking = true;
//       console.log('Location tracking started for session:', sessionId);
//       console.log('Background permission granted:', backgroundPermissionGranted);

//       return { 
//         error: null,
//         backgroundPermissionGranted
//       };
//     } catch (error) {
//       console.error('Error starting location tracking:', error);
//       return { 
//         error: error as Error,
//         backgroundPermissionGranted: false
//       };
//     }
//   }

//   /**
//    * Stop tracking location
//    */
//   async stopTracking(): Promise<{ error: Error | null }> {
//     try {
//       this.isTracking = false;

//       // Check if location updates are running, then stop them
//       try {
//         const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);
//         if (hasStarted) {
//           await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
//         }
//       } catch (stopError) {
//         // If stopping fails, it might be because updates weren't started
//         // This is okay, just log it
//         console.warn('Could not stop location updates (may not have been started):', stopError);
//       }

//       // Clear stored user_id and session_id
//       await AsyncStorage.removeItem(STORAGE_KEY_USER_ID);
//       await AsyncStorage.removeItem(STORAGE_KEY_SESSION_ID);

//       console.log('Location tracking stopped');
//       return { error: null };
//     } catch (error) {
//       console.error('Error stopping location tracking:', error);
//       return { error: error as Error };
//     }
//   }

//   /**
//    * Push current location to Supabase (for immediate push)
//    */
//   private async pushLocation(userId: string, sessionId: string): Promise<void> {
//     try {
//       // Get current location
//       const { location, error: locationError } = await LocationService.getCurrentLocation();

//       if (locationError || !location) {
//         console.warn('Failed to get location for tracking:', locationError);
//         return;
//       }

//       // Insert location update into Supabase
//       const { error } = await supabase.from('location_updates').insert({
//         user_id: userId,
//         session_id: sessionId,
//         latitude: location.latitude,
//         longitude: location.longitude,
//         accuracy: location.accuracy || null,
//       });

//       if (error) {
//         console.error('Failed to push location to Supabase:', error);
//       } else {
//         console.log('Location pushed to Supabase:', {
//           userId,
//           sessionId,
//           latitude: location.latitude,
//           longitude: location.longitude,
//         });
//       }
//     } catch (error) {
//       console.error('Error in pushLocation:', error);
//     }
//   }

//   /**
//    * Check if location tracking is active
//    */
//   isActive(): boolean {
//     return this.isTracking;
//   }
// }

// export const locationTrackingService = new LocationTrackingService();

// Placeholder to prevent import errors
class LocationTrackingService {
  private isTracking = false;
  async startTracking() {
    return { error: new Error('Location tracking disabled'), backgroundPermissionGranted: false };
  }
  async stopTracking() {
    return { error: null };
  }
  isActive() {
    return false;
  }
}

export const locationTrackingService = new LocationTrackingService();

