/**
 * Alert Service
 * 
 * Mock alert service for UI-only implementation.
 * Manages emergency alerts using local storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alert } from '@/src/types/alerts/types';

const STORAGE_KEY_ALERTS = '@alerts';

/**
 * Mock alert service
 */
export class AlertService {
  /**
   * Create an alert
   */
  static async createAlert(
    userId: string,
    sessionId: string,
    type: Alert['type']
  ): Promise<{ alert: Alert | null; error: Error | null }> {
    try {
      const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const alert: Alert = {
        id: alertId,
        user_id: userId,
        session_id: sessionId,
        type,
        status: 'pending',
        contacts_notified: [],
        created_at: now,
        resolved_at: null,
      };
      
      // Store alert
      const alerts = await AlertService.getAllAlerts(userId);
      alerts.push(alert);
      await AsyncStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
      
      console.log(`[Mock] Alert created: ${alertId} for session ${sessionId}`);
      
      return { alert, error: null };
    } catch (error) {
      return { alert: null, error: error as Error };
    }
  }

  /**
   * Resolve an alert
   */
  static async resolveAlert(alertId: string, userId: string): Promise<{ error: Error | null }> {
    try {
      const alerts = await AlertService.getAllAlerts(userId);
      const alertIndex = alerts.findIndex((a) => a.id === alertId);
      
      if (alertIndex === -1) {
        return { error: new Error('Alert not found') };
      }
      
      alerts[alertIndex].status = 'resolved';
      alerts[alertIndex].resolved_at = new Date().toISOString();
      
      await AsyncStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get alerts for a user
   */
  static async getAlerts(userId: string): Promise<{ alerts: Alert[]; error: Error | null }> {
    try {
      const alerts = await AlertService.getAllAlerts(userId);
      return { alerts, error: null };
    } catch (error) {
      return { alerts: [], error: error as Error };
    }
  }

  /**
   * Helper: Get all alerts for a user
   */
  private static async getAllAlerts(userId: string): Promise<Alert[]> {
    try {
      const alertsJson = await AsyncStorage.getItem(STORAGE_KEY_ALERTS);
      if (!alertsJson) {
        return [];
      }
      
      const allAlerts: Alert[] = JSON.parse(alertsJson);
      return allAlerts.filter((a) => a.user_id === userId);
    } catch (error) {
      return [];
    }
  }
}
