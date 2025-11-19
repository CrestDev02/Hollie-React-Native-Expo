/**
 * useSession Hook
 * 
 * Hook to manage safety sessions.
 * Provides session state and operations for starting, ending, and managing sessions.
 * 
 * @returns {Object} Session state and operations
 * @returns {Session | null} activeSession - Current active session
 * @returns {boolean} loading - Loading state
 * @returns {string | null} error - Error message if any
 * @returns {Function} startSession - Start a new safety session
 * @returns {Function} endSession - End the active session
 * @returns {Function} createCheckIn - Create a check-in for the active session
 * @returns {Function} refreshSession - Refresh session from storage
 * 
 * @example
 * ```tsx
 * const { activeSession, startSession, endSession } = useSession();
 * 
 * const handleStartSession = async () => {
 *   const { session, error } = await startSession(userId, quizAnswers);
 * };
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { CheckInService } from '@/src/services/check-in/checkInService';
import type { SafetyQuizAnswers, Session, LocationData } from '@/src/types/check-in/types';

interface UseSessionReturn {
  activeSession: Session | null;
  loading: boolean;
  error: string | null;
  startSession: (
    quizAnswers: SafetyQuizAnswers,
    initialLocation?: LocationData
  ) => Promise<{ session: Session | null; error: Error | null }>;
  endSession: () => Promise<{ error: Error | null }>;
  createCheckIn: (location: LocationData) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

/**
 * Hook to manage safety sessions
 */
export function useSession(): UseSessionReturn {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load active session from storage
   */
  const loadActiveSession = useCallback(async () => {
    if (!user) {
      setActiveSession(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { session, error: sessionError } = await CheckInService.getActiveSession(user.id);
      
      if (sessionError) {
        setError(sessionError.message);
        setActiveSession(null);
      } else {
        setActiveSession(session);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
      setActiveSession(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Load session on mount and when user changes
   */
  useEffect(() => {
    loadActiveSession();
  }, [loadActiveSession]);

  /**
   * Start a new safety session
   */
  const startSession = useCallback(
    async (
      quizAnswers: SafetyQuizAnswers,
      initialLocation?: LocationData
    ): Promise<{ session: Session | null; error: Error | null }> => {
      if (!user) {
        return { session: null, error: new Error('User not authenticated') };
      }

      setError(null);

      try {
        const { session, error: sessionError } = await CheckInService.startSession(
          user.id,
          quizAnswers,
          initialLocation
        );

        if (sessionError) {
          setError(sessionError.message);
          return { session: null, error: sessionError };
        }

        setActiveSession(session);
        return { session, error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to start session');
        setError(error.message);
        return { session: null, error };
      }
    },
    [user]
  );

  /**
   * End the active session
   */
  const endSession = useCallback(async (): Promise<{ error: Error | null }> => {
    if (!user || !activeSession) {
      return { error: new Error('No active session') };
    }

    setError(null);

    try {
      const { error: endError } = await CheckInService.endSession(activeSession.id, user.id);

      if (endError) {
        setError(endError.message);
        return { error: endError };
      }

      setActiveSession(null);
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to end session');
      setError(error.message);
      return { error };
    }
  }, [user, activeSession]);

  /**
   * Create a check-in for the active session
   */
  const createCheckIn = useCallback(
    async (location: LocationData): Promise<{ error: Error | null }> => {
      if (!user || !activeSession) {
        return { error: new Error('No active session') };
      }

      setError(null);

      try {
        const { error: checkInError } = await CheckInService.createCheckIn(
          activeSession.id,
          user.id,
          location
        );

        if (checkInError) {
          setError(checkInError.message);
          return { error: checkInError };
        }

        // Refresh session to get updated check-in time
        await loadActiveSession();
        return { error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create check-in');
        setError(error.message);
        return { error };
      }
    },
    [user, activeSession, loadActiveSession]
  );

  return {
    activeSession,
    loading,
    error,
    startSession,
    endSession,
    createCheckIn,
    refreshSession: loadActiveSession,
  };
}

