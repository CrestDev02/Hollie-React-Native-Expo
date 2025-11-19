/**
 * Check-In Service
 * 
 * Mock check-in service for UI-only implementation.
 * Manages safety sessions and check-ins using local storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationData, SafetyQuizAnswers, Session } from '@/src/types/check-in/types';

const STORAGE_KEY_SESSIONS = '@sessions';
const STORAGE_KEY_ACTIVE_SESSION = '@active_session';

/**
 * Mock check-in service
 */
export class CheckInService {
  /**
   * Start a new session with safety quiz answers
   */
  static async startSession(
    userId: string,
    quizAnswers: SafetyQuizAnswers,
    initialLocation?: LocationData
  ): Promise<{ session: Session | null; error: Error | null }> {
    try {
      // End any existing active sessions
      await CheckInService.endAllActiveSessions(userId);
      
      // Create new session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const session: Session = {
        id: sessionId,
        user_id: userId,
        quiz_where: quizAnswers.where,
        quiz_who: quizAnswers.who,
        quiz_when: quizAnswers.when,
        quiz_wearing: quizAnswers.wearing,
        quiz_priority_contact_id: quizAnswers.priority_contact_id,
        status: 'active',
        started_at: now,
        ended_at: null,
        last_checkin_at: now,
        missed_checkins_count: 0,
        session_events: [
          {
            id: `event_${Date.now()}`,
            session_id: sessionId,
            event_type: 'started',
            latitude: initialLocation?.latitude || null,
            longitude: initialLocation?.longitude || null,
            created_at: now,
          },
        ],
      };
      
      // Store session
      const sessions = await CheckInService.getAllSessions(userId);
      sessions.push(session);
      await AsyncStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(session));
      
      return { session, error: null };
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }

  /**
   * End a session
   */
  static async endSession(
    sessionId: string,
    userId: string
  ): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const sessions = await CheckInService.getAllSessions(userId);
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return { session: null, error: new Error('Session not found') };
      }
      
      const session = sessions[sessionIndex];
      session.status = 'ended';
      session.ended_at = new Date().toISOString();
      
      // Add end event
      session.session_events = session.session_events || [];
      session.session_events.push({
        id: `event_${Date.now()}`,
        session_id: sessionId,
        event_type: 'ended',
        latitude: null,
        longitude: null,
        created_at: new Date().toISOString(),
      });
      
      sessions[sessionIndex] = session;
      await AsyncStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      
      // Clear active session if this was the active one
      const activeSession = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
      if (activeSession) {
        const active = JSON.parse(activeSession);
        if (active.id === sessionId) {
          await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
        }
      }
      
      return { session, error: null };
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }

  /**
   * Create a check-in (acknowledge safety)
   */
  static async createCheckIn(
    sessionId: string,
    userId: string,
    location: LocationData
  ): Promise<{ error: Error | null }> {
    try {
      const sessions = await CheckInService.getAllSessions(userId);
      const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return { error: new Error('Session not found') };
      }
      
      const session = sessions[sessionIndex];
      session.last_checkin_at = new Date().toISOString();
      session.missed_checkins_count = 0;
      
      // Add check-in event
      session.session_events = session.session_events || [];
      session.session_events.push({
        id: `event_${Date.now()}`,
        session_id: sessionId,
        event_type: 'checkin',
        latitude: location.latitude,
        longitude: location.longitude,
        created_at: new Date().toISOString(),
      });
      
      sessions[sessionIndex] = session;
      await AsyncStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      
      // Update active session if this is it
      const activeSession = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
      if (activeSession) {
        const active = JSON.parse(activeSession);
        if (active.id === sessionId) {
          await AsyncStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(session));
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get active session
   */
  static async getActiveSession(
    userId: string
  ): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const activeSession = await AsyncStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
      
      if (!activeSession) {
        return { session: null, error: null };
      }
      
      const session = JSON.parse(activeSession) as Session;
      
      // Verify it's still active and belongs to user
      if (session.user_id !== userId || session.status !== 'active') {
        await AsyncStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
        return { session: null, error: null };
      }
      
      return { session, error: null };
    } catch (error) {
      return { session: null, error: error as Error };
    }
  }

  /**
   * Mark a missed check-in
   */
  static async markMissedCheckIn(sessionId: string): Promise<{ error: Error | null }> {
    try {
      // Get all sessions to find the one we need
      const allSessionsJson = await AsyncStorage.getItem(STORAGE_KEY_SESSIONS);
      if (!allSessionsJson) {
        return { error: null };
      }
      
      const allSessions: Session[] = JSON.parse(allSessionsJson);
      const sessionIndex = allSessions.findIndex((s) => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return { error: null };
      }
      
      const session = allSessions[sessionIndex];
      session.missed_checkins_count = (session.missed_checkins_count || 0) + 1;
      
      // Add missed check-in event
      session.session_events = session.session_events || [];
      session.session_events.push({
        id: `event_${Date.now()}`,
        session_id: sessionId,
        event_type: 'missed_checkin',
        latitude: null,
        longitude: null,
        created_at: new Date().toISOString(),
      });
      
      allSessions[sessionIndex] = session;
      await AsyncStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(allSessions));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Check for missed check-ins (15 minutes since last check-in)
   */
  static async checkMissedCheckIns(
    sessionId: string
  ): Promise<{ missed: boolean; lastCheckInTime: number | null; error: Error | null }> {
    try {
      const { session } = await CheckInService.getActiveSession(sessionId);
      
      if (!session || !session.last_checkin_at) {
        return { missed: false, lastCheckInTime: null, error: null };
      }
      
      const lastCheckInTime = new Date(session.last_checkin_at).getTime();
      const now = Date.now();
      const fifteenMinutes = 15 * 60 * 1000;
      
      const missed = now - lastCheckInTime > fifteenMinutes;
      
      return { missed, lastCheckInTime, error: null };
    } catch (error) {
      return { missed: false, lastCheckInTime: null, error: error as Error };
    }
  }

  /**
   * Create manual emergency event
   */
  static async createManualEmergency(
    sessionId: string,
    location?: LocationData
  ): Promise<{ error: Error | null }> {
    try {
      // Get all sessions to find the one we need
      const allSessionsJson = await AsyncStorage.getItem(STORAGE_KEY_SESSIONS);
      if (!allSessionsJson) {
        return { error: null };
      }
      
      const allSessions: Session[] = JSON.parse(allSessionsJson);
      const sessionIndex = allSessions.findIndex((s) => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return { error: null };
      }
      
      const session = allSessions[sessionIndex];
      
      // Add manual emergency event
      session.session_events = session.session_events || [];
      session.session_events.push({
        id: `event_${Date.now()}`,
        session_id: sessionId,
        event_type: 'manual_emergency',
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        created_at: new Date().toISOString(),
      });
      
      allSessions[sessionIndex] = session;
      await AsyncStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(allSessions));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Helper: Get all sessions for a user
   */
  private static async getAllSessions(userId: string): Promise<Session[]> {
    try {
      const sessionsJson = await AsyncStorage.getItem(STORAGE_KEY_SESSIONS);
      if (!sessionsJson) {
        return [];
      }
      
      const allSessions: Session[] = JSON.parse(sessionsJson);
      return allSessions.filter((s) => s.user_id === userId);
    } catch (error) {
      return [];
    }
  }

  /**
   * Helper: End all active sessions for a user
   */
  private static async endAllActiveSessions(userId: string): Promise<void> {
    try {
      const sessions = await CheckInService.getAllSessions(userId);
      const now = new Date().toISOString();
      
      sessions.forEach((session) => {
        if (session.status === 'active') {
          session.status = 'ended';
          session.ended_at = now;
        }
      });
      
      await AsyncStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error ending active sessions:', error);
    }
  }
}
