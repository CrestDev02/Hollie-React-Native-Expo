import { AuthService } from '@/src/services/auth/authService';
import type { AuthUser } from '@/src/types/auth/types';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  sendOTP: (phone: string) => Promise<{ error: Error | null }>;
  verifyOTP: (phone: string, token: string) => Promise<{ user: AuthUser | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const checkUser = useCallback(async () => {
    setLoading(true);
    const { user: currentUser, error: authError } = await AuthService.getCurrentUser();
    setUser(currentUser);
    setError(authError?.message || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { user: currentUser, error: authError } = await AuthService.getCurrentUser();

        if (mounted) {
          setUser(currentUser);
          setError(authError?.message || null);
          setInitialized(true);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize auth');
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const { data: authListener } = AuthService.onAuthStateChange((authUser) => {
      if (mounted) {
        setUser(authUser);
        setError(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  /**
   * Send OTP to phone number
   */
  const sendOTP = useCallback(async (phone: string) => {
    setLoading(true);
    setError(null);
    const { error: authError } = await AuthService.sendOTP(phone);
    setLoading(false);
    setError(authError?.message || null);
    return { error: authError };
  }, []);

  /**
   * Verify OTP and sign in
   */
  const verifyOTP = useCallback(async (phone: string, token: string) => {
    setLoading(true);
    setError(null);
    const { user: authUser, error: authError } = await AuthService.verifyOTP(phone, token);
    setUser(authUser);
    setLoading(false);
    setError(authError?.message || null);
    return { user: authUser, error: authError };
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    const { error: authError } = await AuthService.signOut();
    setUser(null);
    setLoading(false);
    setError(authError?.message || null);
    return { error: authError };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, initialized, sendOTP, verifyOTP, signOut, checkUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
