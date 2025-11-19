/**
 * Contacts Service
 * 
 * Mock contacts service for UI-only implementation.
 * This service is now replaced by ContactsContext using AsyncStorage directly.
 * Keeping this file for backward compatibility but it's deprecated.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Contact, CreateContactRequest, UpdateContactRequest } from '@/src/types/contacts/types';

const STORAGE_KEY_CONTACTS = '@contacts';

/**
 * Mock contacts service
 * @deprecated Use ContactsContext instead for direct AsyncStorage access
 */
export class ContactsService {
  /**
   * Get all contacts for the current user
   */
  static async getContacts(userId: string): Promise<{ contacts: Contact[]; error: Error | null }> {
    try {
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEY_CONTACTS);
      if (!contactsJson) {
        return { contacts: [], error: null };
      }
      
      const allContacts: Contact[] = JSON.parse(contactsJson);
      const userContacts = allContacts.filter((c) => c.user_id === userId);
      
      return { contacts: userContacts, error: null };
    } catch (error) {
      return { contacts: [], error: error as Error };
    }
  }

  /**
   * Create a new contact
   */
  static async createContact(
    userId: string,
    request: CreateContactRequest
  ): Promise<{ contact: Contact | null; error: Error | null }> {
    try {
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEY_CONTACTS);
      const allContacts: Contact[] = contactsJson ? JSON.parse(contactsJson) : [];
      
      // If setting as primary, unset other primary contacts
      if (request.is_primary) {
        allContacts.forEach((c) => {
          if (c.user_id === userId && c.is_primary) {
            c.is_primary = false;
          }
        });
      }
      
      const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const contact: Contact = {
        id: contactId,
        user_id: userId,
        name: request.name,
        phone: request.phone,
        is_primary: request.is_primary || false,
        auto_alert: request.auto_alert !== undefined ? request.auto_alert : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      allContacts.push(contact);
      await AsyncStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(allContacts));
      
      return { contact, error: null };
    } catch (error) {
      return { contact: null, error: error as Error };
    }
  }

  /**
   * Update a contact
   */
  static async updateContact(
    contactId: string,
    userId: string,
    request: UpdateContactRequest
  ): Promise<{ contact: Contact | null; error: Error | null }> {
    try {
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEY_CONTACTS);
      if (!contactsJson) {
        return { contact: null, error: new Error('Contact not found') };
      }
      
      const allContacts: Contact[] = JSON.parse(contactsJson);
      const contactIndex = allContacts.findIndex(
        (c) => c.id === contactId && c.user_id === userId
      );
      
      if (contactIndex === -1) {
        return { contact: null, error: new Error('Contact not found') };
      }
      
      // If setting as primary, unset other primary contacts
      if (request.is_primary) {
        allContacts.forEach((c) => {
          if (c.user_id === userId && c.is_primary && c.id !== contactId) {
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
      
      return { contact, error: null };
    } catch (error) {
      return { contact: null, error: error as Error };
    }
  }

  /**
   * Delete a contact
   */
  static async deleteContact(
    contactId: string,
    userId: string
  ): Promise<{ error: Error | null }> {
    try {
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEY_CONTACTS);
      if (!contactsJson) {
        return { error: null };
      }
      
      const allContacts: Contact[] = JSON.parse(contactsJson);
      const filteredContacts = allContacts.filter(
        (c) => !(c.id === contactId && c.user_id === userId)
      );
      
      await AsyncStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(filteredContacts));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get primary contact
   */
  static async getPrimaryContact(userId: string): Promise<{ contact: Contact | null; error: Error | null }> {
    try {
      const { contacts } = await ContactsService.getContacts(userId);
      const primaryContact = contacts.find((c) => c.is_primary);
      
      return { contact: primaryContact || null, error: null };
    } catch (error) {
      return { contact: null, error: error as Error };
    }
  }
}
