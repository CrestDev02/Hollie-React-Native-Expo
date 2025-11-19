import { Alert } from 'react-native';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Handle and display user-friendly error messages
 */
export function handleError(error: unknown, customMessage?: string): void {
  let message = customMessage || 'An unexpected error occurred';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  // Map common error codes to user-friendly messages
  const friendlyMessages: Record<string, string> = {
    'PGRST116': 'No data found',
    '23505': 'This record already exists',
    '23503': 'Invalid reference',
    'network_error': 'Network error. Please check your connection.',
    'permission_denied': 'Permission denied. Please enable required permissions in settings.',
    'location_unavailable': 'Location unavailable. Please enable location services.',
  };

  // Check if error has a code that maps to a friendly message
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;
    if (friendlyMessages[code]) {
      message = friendlyMessages[code];
    }
  }

  Alert.alert('Error', message);
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }
  return String(error);
}

