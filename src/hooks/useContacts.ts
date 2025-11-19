/**
 * useContacts Hook
 * 
 * Convenience hook to access contacts from ContactsContext.
 * Provides contacts state and CRUD operations.
 * 
 * @returns {Object} Contacts state and operations
 * @returns {Contact[]} contacts - Array of user's contacts
 * @returns {boolean} loading - Loading state
 * @returns {string | null} error - Error message if any
 * @returns {Function} createContact - Create a new contact
 * @returns {Function} updateContact - Update an existing contact
 * @returns {Function} deleteContact - Delete a contact
 * @returns {Function} getPrimaryContact - Get primary contact
 * @returns {Function} refreshContacts - Refresh contacts from storage
 * 
 * @example
 * ```tsx
 * const { contacts, createContact, loading } = useContacts();
 * 
 * const handleAddContact = async () => {
 *   const { contact, error } = await createContact({
 *     name: 'John Doe',
 *     phone: '+1234567890',
 *   });
 * };
 * ```
 */

import { useContactsContext } from '@/src/contexts/ContactsContext';

export function useContacts() {
  return useContactsContext();
}

