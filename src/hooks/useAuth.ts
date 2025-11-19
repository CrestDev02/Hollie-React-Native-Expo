/**
 * useAuth Hook
 * 
 * Hook to access authentication state and methods.
 * Provides user state, loading state, and authentication operations.
 * 
 * @returns {Object} Auth state and operations
 * @returns {AuthUser | null} user - Current authenticated user
 * @returns {boolean} loading - Loading state
 * @returns {string | null} error - Error message if any
 * @returns {Function} sendOTP - Send OTP to phone number
 * @returns {Function} verifyOTP - Verify OTP and sign in
 * @returns {Function} signOut - Sign out current user
 * @returns {Function} checkUser - Check current user session
 * 
 * @example
 * ```tsx
 * const { user, sendOTP, verifyOTP, signOut, loading } = useAuth();
 * 
 * const handleSendOTP = async () => {
 *   const { error } = await sendOTP('+1234567890');
 * };
 * 
 * const handleVerifyOTP = async () => {
 *   const { user, error } = await verifyOTP('+1234567890', '123456');
 * };
 * ```
 */

import { useAuthContext } from '@/src/contexts/AuthContext';

export function useAuth() {
  const context = useAuthContext();

  return {
    user: context.user,
    loading: context.loading,
    error: context.error,
    sendOTP: context.sendOTP,
    verifyOTP: context.verifyOTP,
    signOut: context.signOut,
    checkUser: context.checkUser,
  };
}

