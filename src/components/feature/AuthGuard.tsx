import { useAuthContext } from '@/src/contexts/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useRef<{ user: typeof user; hasNavigated: boolean }>({
    user: null,
    hasNavigated: false,
  });

  useEffect(() => {
    // Don't navigate until auth is initialized
    if (!initialized || loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // Reset navigation flag if user state changed
    if (navigationRef.current.user !== user) {
      navigationRef.current.user = user;
      navigationRef.current.hasNavigated = false;
    }

    // Prevent multiple navigations for the same state
    if (navigationRef.current.hasNavigated) {
      return;
    }

    if (!user && !inAuthGroup) {
      // Redirect to phone login if not authenticated
      navigationRef.current.hasNavigated = true;
      router.replace('/(auth)/phone');
    } else if (user && inAuthGroup) {
      // Allow verify screen even when authenticated (for re-verification)
      // Only redirect to tabs if on the initial phone screen
      const currentRoute = segments[segments.length - 1];
      const allowedAuthRoutes = ['verify'];
      
      if (currentRoute && !allowedAuthRoutes.includes(currentRoute)) {
        // Redirect to app if authenticated and not on verify
        navigationRef.current.hasNavigated = true;
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, initialized, segments, router]);

  // Don't render children until auth state is determined
  // This prevents protected routes from mounting before auth check completes
  if (!initialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Only render children if we're on the correct route
  const inAuthGroup = segments[0] === '(auth)';
  const currentRoute = segments[segments.length - 1];
  const allowedAuthRoutes = ['verify'];
  // Allow verify screen even when authenticated (for re-verification)
  const shouldRender = 
    (user && !inAuthGroup) || 
    (!user && inAuthGroup) ||
    (user && inAuthGroup && currentRoute && allowedAuthRoutes.includes(currentRoute));

  if (!shouldRender) {
    // Show loading while redirecting
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
