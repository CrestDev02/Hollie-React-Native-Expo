/**
 * Auth Service
 * 
 * Mock authentication service for UI-only implementation.
 * In production, this would connect to a real authentication backend.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '@/src/types/auth/types';

const STORAGE_KEY_USER = '@auth_user';
const STORAGE_KEY_SESSION = '@auth_session';

/**
 * Mock authentication service
 * Phone number authentication only
 */
export class AuthService {
  /**
   * Send OTP to phone number (mock implementation)
   */
  static async sendOTP(phone: string): Promise<{ error: Error | null }> {
    try {
      // Mock delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // In real implementation, this would send OTP via SMS
      // For mock, we just store the phone number temporarily
      await AsyncStorage.setItem('@pending_otp_phone', phone);
      
      console.log(`[Mock] OTP sent to ${phone}`);
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Verify OTP and sign in (mock implementation)
   */
  static async verifyOTP(phone: string, token: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      // Mock delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Mock OTP verification - accept any 6-digit code
      if (!token || token.length !== 6) {
        return { user: null, error: new Error('Invalid OTP format') };
      }
      
      // Check if phone matches pending OTP
      const pendingPhone = await AsyncStorage.getItem('@pending_otp_phone');
      if (pendingPhone !== phone) {
        return { user: null, error: new Error('Phone number mismatch') };
      }
      
      // Generate or get user
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
      let user: AuthUser;
      
      if (storedUser) {
        user = JSON.parse(storedUser);
        user.phone = phone;
      } else {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        user = {
          id: userId,
          email: undefined,
          phone: phone,
          created_at: new Date().toISOString(),
        };
      }
      
      // Store user in AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, 'active');
      await AsyncStorage.removeItem('@pending_otp_phone');
      
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Get current user from storage
   */
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
      const session = await AsyncStorage.getItem(STORAGE_KEY_SESSION);
      
      if (!storedUser || session !== 'active') {
        return { user: null, error: null };
      }
      
      const user = JSON.parse(storedUser) as AuthUser;
      // Ensure phone is present (required field)
      if (!user.phone) {
        return { user: null, error: null };
      }
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<{ error: Error | null }> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
      // Optionally remove user data
      // await AsyncStorage.removeItem(STORAGE_KEY_USER);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Listen to auth state changes (mock implementation)
   * In real implementation, this would use Supabase auth state listener
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    // Poll for auth state changes (mock implementation)
    const interval = setInterval(async () => {
      const { user } = await AuthService.getCurrentUser();
      callback(user);
    }, 1000);
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => clearInterval(interval),
        },
      },
    };
  }
}
