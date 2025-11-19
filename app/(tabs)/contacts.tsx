import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { ThemedText, ThemedView, Input, Button, EmptyState } from '@/src/components/core';
import { useContacts } from '@/src/hooks/useContacts';
import { formatPhoneNumber, getPhoneDigits } from '@/src/utils/phoneFormatter';
import { useTheme } from '@/src/hooks/use-theme';
import { Spacing, Shadows, BorderRadius } from '@/src/constants/design-tokens';

export default function ContactsScreen() {
  const theme = useTheme();
  const { contacts, loading, createContact, deleteContact } = useContacts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  const handleAddContact = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }

    // Get digits only for validation
    const phoneDigits = getPhoneDigits(phone);
    
    if (!phoneDigits || phoneDigits.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Format phone with + if not present
    const formattedPhone = phoneDigits.startsWith('+') ? phone : `+${phoneDigits}`;

    const { error } = await createContact({
      name: name.trim(),
      phone: formattedPhone,
    });

    if (error) {
      Alert.alert('Error', error.message || 'Failed to add contact');
    } else {
      setName('');
      setPhone('');
      setShowAddModal(false);
      Alert.alert('Success', 'Contact added successfully');
    }
  };

  const handleDeleteContact = (contactId: string, contactName: string) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteContact(contactId);
            if (error) {
              Alert.alert('Error', error.message || 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.headerTitle}>
            Contacts
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.buttonPrimary }]}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <ThemedText style={[styles.addButtonText, { color: theme.buttonPrimaryText }]}>
            +
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.contactsList}
        contentContainerStyle={styles.contactsListContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContent}>
            <ThemedText style={styles.loadingText}>Loading contacts...</ThemedText>
          </View>
        ) : contacts.length === 0 ? (
          <View style={styles.centerContent}>
            <EmptyState
              icon="👥"
              title="No contacts yet"
              subtitle="Add trusted contacts who can help you in emergencies"
            />
            <Button
              title="Add Contact"
              variant="primary"
              onPress={() => setShowAddModal(true)}
              style={styles.emptyStateButton}
            />
          </View>
        ) : (
          contacts.map((contact) => (
            <ThemedView key={contact.id} style={styles.contactCard}>
              <View style={[styles.contactIcon, { backgroundColor: theme.buttonPrimary }]}>
                <ThemedText style={[styles.contactIconText, { color: theme.buttonPrimaryText }]}>
                  {contact.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactName}>{contact.name}</ThemedText>
                <ThemedText style={styles.contactPhone}>
                  {formatPhoneNumber(contact.phone)}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteContact(contact.id, contact.name)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.deleteIcon}>🗑️</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ))
        )}
      </ScrollView>

      {/* Add Contact Modal */}
            <Modal
              visible={showAddModal}
              animationType="slide"
              transparent
              onRequestClose={() => setShowAddModal(false)}
            >
              <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title" style={styles.modalTitle}>
              Add Contact
            </ThemedText>

            <Input
              label="Name"
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              containerStyle={styles.modalInputContainer}
            />

            <Input
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              containerStyle={styles.modalInputContainer}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setShowAddModal(false);
                  setName('');
                  setPhone('');
                }}
                style={styles.modalButtonCancel}
              />
              <Button
                title="Save Contact"
                variant="primary"
                onPress={handleAddContact}
                style={styles.modalButtonSave}
              />
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  contactsList: {
    flex: 1,
  },
  contactsListContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  contactIconText: {
    fontSize: 24,
    fontWeight: '700',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  contactPhone: {
    fontSize: 15,
    opacity: 0.7,
  },
  deleteButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  deleteIcon: {
    fontSize: 22,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.6,
  },
  emptyStateButton: {
    marginTop: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.xl,
  },
  modalInputContainer: {
    marginBottom: Spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  modalButtonCancel: {
    flex: 1,
  },
  modalButtonSave: {
    flex: 1,
  },
});

