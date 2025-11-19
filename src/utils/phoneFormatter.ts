/**
 * Format phone number as +1 (555) 123-4567
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add it
  let formatted = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  
  // Remove extra + signs
  formatted = formatted.replace(/\+/g, (match, offset) => (offset === 0 ? '+' : ''));
  
  // Format: +1 (555) 123-4567
  if (formatted.length <= 1) {
    return formatted;
  } else if (formatted.length <= 4) {
    // +1 or +123
    return formatted;
  } else if (formatted.length <= 7) {
    // +1 (555)
    return `${formatted.slice(0, 2)} (${formatted.slice(2)}`;
  } else if (formatted.length <= 11) {
    // +1 (555) 123-4567
    return `${formatted.slice(0, 2)} (${formatted.slice(2, 5)}) ${formatted.slice(5, 8)}-${formatted.slice(8)}`;
  } else {
    // Limit to 14 digits after +
    const limited = formatted.slice(0, 15); // +1 + 13 digits max
    if (limited.length <= 7) {
      return `${limited.slice(0, 2)} (${limited.slice(2)}`;
    } else if (limited.length <= 11) {
      return `${limited.slice(0, 2)} (${limited.slice(2, 5)}) ${limited.slice(5, 8)}-${limited.slice(8)}`;
    } else {
      return `${limited.slice(0, 2)} (${limited.slice(2, 5)}) ${limited.slice(5, 8)}-${limited.slice(8, 12)}`;
    }
  }
}

/**
 * Extract digits only from formatted phone number
 */
export function getPhoneDigits(formattedPhone: string): string {
  return formattedPhone.replace(/\D/g, '');
}

