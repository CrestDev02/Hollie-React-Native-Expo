/**
 * Timer Utility Functions
 * 
 * Utility functions for formatting and managing timers.
 */

/**
 * Format seconds as MM:SS
 * @param seconds - Total seconds to format
 * @returns Formatted time string (e.g., "15:00")
 */
export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

