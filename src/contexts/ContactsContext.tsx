/**
 * Contacts Context
 * 
 * Manages trusted contacts using AsyncStorage for local persistence.
 * Provides CRUD operations and state management for contacts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import type { Contact, CreateContactRequest, UpdateContactRequest } from '@/src/types/contacts/types';

const STORAGE_KEY_CONTACTS = '@contacts';

interface ContactsContextType {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  createContact: (request: CreateContactRequest) => Promise<{ contact: Contact | null; error: Error | null }>;
  updateContact: (contactId: string, request: UpdateContactRequest) => Promise<{ contact: Contact | null; error: Error | null }>;
  deleteContact: (contactId: string) => Promise<{ error: Error | null }>;
  getPrimaryContact: () => Promise<{ contact: Contact | null; error: Error | null }>;
  refreshContacts: () => Promise<void>;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

/**
 * Contacts Provider Component
 * Manages contacts state and provides CRUD operations
 */
export function ContactsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load contacts from AsyncStorage
   */
  const loadContacts = useCallback(async () => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEY_CONTACTS);
      
      if (!contactsJson) {
        setContacts([]);
        setLoading(false);
        return;
      }
      
      const allContacts: Contact[] = JSON.parse(contactsJson);
      const userContacts = allContacts.filter((c) => c.user_id === user.id);
      
      // Sort by primary first, then by created date
      userContacts.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setContacts(userContacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Load contacts on mount and when user changes
   */
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  /**
   * Create a new contact
   */
  const createContact = useCallback(
    async (request: CreateContactRequest) => {
      if (!user) {
        return { contact: null, error: new Error('User not authenticated') };
      }

      setError(null);
      
      try {
        const contactsJson = await AsyncStorage.getItem(STORAGE_KEY_CONTACTS);
        const allContacts: Contact[] = contactsJson ? JSON.parse(contactsJson) : [];
        
        // If setting as primary, unset other primary contacts
        if (request.is_primary) {
          allContacts.forEach((c) => {
            if (c.user_id === user.id && c.is_primary) {
              c.is_primary = false;
            }
          });
        }
        
        const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const contact: Contact = {
          id: contactId,
          user_id: user.id,
          name: request.name,
          phone: request.phone,
          is_primary: request.is_primary || false,
          auto_alert: request.auto_alert !== undefined ? request.auto_alert : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        allContacts.push(contact);
        await AsyncStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(allContacts));
        
        // Update local state
        setContacts((prev) => {
          const updated = [contact, ...prev];
          updated.sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          return updated;
        });
        
        return { contact, error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create contact');
        setError(error.message);
        return { contact: null, error };
      }
    },
    [user]
  );

  /**
   * Update an existing contact
   */
  const updateContact = useCallback(
    async (contactId: string, request: UpdateContactRequest) => {
      if (!user) {
        return { contact: null, error: new Error('User not authenticated') };
      }

      setError(null);
      
      try {
        const contactsJson = await AsyncStorage.getItem(STORAGE_KEY_CONTACTS);
        if (!contactsJson) {
          return { contact: null, error: new Error('Contact not found') };
        }
        
        const allContacts: Contact[] = JSON.parse(contactsJson);
        const contactIndex = allContacts.findIndex(
          (c) => c.id === contactId && c.user_id === user.id
        );
        
        if (contactIndex === -1) {
          return { contact: null, error: new Error('Contact not found') };
        }
        
        // If setting as primary, unset other primary contacts
        if (request.is_primary) {
          allContacts.forEach((c) => {
            if (c.user_id === user.id && c.is_primary && c.id !== contactId) {
              c.is_primary = false;
            }
          });
        }
        
        const contact = allContacts[contactIndex];
        Object.assign(contact, request, {
          updated_at: new Date().toISOString(),
        });
        
        allContacts[contactIndex] = contact;
        await AsyncStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(allContacts));
        
        // Update local state
        setContacts((prev) => {
          const updated = prev.map((c) => (c.id === contactId ? contact : c));
          updated.sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          return updated;
        });
        
        return { contact, error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update contact');
        setError(error.message);
        return { contact: null, error };
      }
    },
    [user]
  );

  /**
   * Delete a contact
   */
  const deleteContact = useCallback(
    async (contactId: string) => {
      if (!user) {
        return { error: new Error('User not authenticated') };
      }

      setError(null);
      
      try {
        const contactsJson = await AsyncStorage.getItem(STORAGE_KEY_CONTACTS);
        if (!contactsJson) {
          return { error: null };
        }
        
        const allContacts: Contact[] = JSON.parse(contactsJson);
        const filteredContacts = allContacts.filter(
          (c) => !(c.id === contactId && c.user_id === user.id)
        );
        
        await AsyncStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(filteredContacts));
        
        // Update local state
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
        
        return { error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete contact');
        setError(error.message);
        return { error };
      }
    },
    [user]
  );

  /**
   * Get primary contact
   */
  const getPrimaryContact = useCallback(async () => {
    if (!user) {
      return { contact: null, error: new Error('User not authenticated') };
    }

    try {
      const primaryContact = contacts.find((c) => c.is_primary);
      return { contact: primaryContact || null, error: null };
    } catch (err) {
      return { contact: null, error: err instanceof Error ? err : new Error('Failed to get primary contact') };
    }
  }, [user, contacts]);

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        loading,
        error,
        createContact,
        updateContact,
        deleteContact,
        getPrimaryContact,
        refreshContacts: loadContacts,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

/**
 * Hook to use Contacts Context
 * @throws Error if used outside ContactsProvider
 */
export function useContactsContext() {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContactsContext must be used within a ContactsProvider');
  }
  return context;
}
