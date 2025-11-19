import { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemedText, ThemedView } from '@/src/components/core';
import { useTheme } from '@/src/hooks/use-theme';
import type { SafetyQuizAnswers } from '@/src/types/check-in/types';
import type { Contact } from '@/src/types/contacts/types';
import { formatPhoneNumber } from '@/src/utils/phoneFormatter';

interface SafetyQuizModalProps {
  visible: boolean;
  contacts: Contact[];
  onComplete: (answers: SafetyQuizAnswers) => void;
  onCancel: () => void;
}

export function SafetyQuizModal({
  visible,
  contacts,
  onComplete,
  onCancel,
}: SafetyQuizModalProps) {
  const theme = useTheme();
  const [where, setWhere] = useState('');
  const [who, setWho] = useState('');
  const [when, setWhen] = useState('');
  const [wearing, setWearing] = useState('');
  const [priorityContactId, setPriorityContactId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!where.trim() || !who.trim() || !when.trim() || !wearing.trim()) {
      Alert.alert('Incomplete', 'Please answer all questions before starting the session.');
      return;
    }

    onComplete({
      where: where.trim(),
      who: who.trim(),
      when: when.trim(),
      wearing: wearing.trim(),
      priority_contact_id: priorityContactId,
    });

    // Reset form
    setWhere('');
    setWho('');
    setWhen('');
    setWearing('');
    setPriorityContactId(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <ThemedView style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ThemedText type="title" style={styles.title}>
              Safety Check-in Quiz
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Please answer these questions before starting your session
            </ThemedText>

            <View style={styles.questionContainer}>
              <ThemedText type="defaultSemiBold" style={styles.question}>
                1. Where are you going?
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }]}
                placeholder="Enter location"
                placeholderTextColor={theme.textSecondary}
                value={where}
                onChangeText={setWhere}
                multiline
              />
            </View>

            <View style={styles.questionContainer}>
              <ThemedText type="defaultSemiBold" style={styles.question}>
                2. Who are you meeting?
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }]}
                placeholder="Enter person's name"
                placeholderTextColor={theme.textSecondary}
                value={who}
                onChangeText={setWho}
              />
            </View>

            <View style={styles.questionContainer}>
              <ThemedText type="defaultSemiBold" style={styles.question}>
                3. When do you expect to return?
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }]}
                placeholder="e.g., 2 hours, 6:00 PM"
                placeholderTextColor={theme.textSecondary}
                value={when}
                onChangeText={setWhen}
              />
            </View>

            <View style={styles.questionContainer}>
              <ThemedText type="defaultSemiBold" style={styles.question}>
                4. What are you wearing?
              </ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, backgroundColor: theme.background, color: theme.text }]}
                placeholder="Describe your clothing"
                placeholderTextColor={theme.textSecondary}
                value={wearing}
                onChangeText={setWearing}
                multiline
              />
            </View>

            <View style={styles.questionContainer}>
              <ThemedText type="defaultSemiBold" style={styles.question}>
                5. Which contact should we prioritize?
              </ThemedText>
              {contacts.length === 0 ? (
                <ThemedText style={styles.noContacts}>
                  No contacts available. Add contacts in the Contacts tab.
                </ThemedText>
              ) : (
                <View style={styles.contactList}>
                  <TouchableOpacity
                    style={[
                      styles.contactOption,
                      { borderColor: theme.border, backgroundColor: theme.background },
                      priorityContactId === null && { borderColor: theme.info, backgroundColor: theme.infoLight },
                    ]}
                    onPress={() => setPriorityContactId(null)}
                  >
                    <ThemedText
                      style={[
                        styles.contactOptionText,
                        priorityContactId === null && { color: theme.info, fontWeight: '600' },
                      ]}
                    >
                      None (Alert all contacts)
                    </ThemedText>
                  </TouchableOpacity>
                  {contacts.map((contact) => (
                    <TouchableOpacity
                      key={contact.id}
                      style={[
                        styles.contactOption,
                        { borderColor: theme.border, backgroundColor: theme.background },
                        priorityContactId === contact.id && { borderColor: theme.info, backgroundColor: theme.infoLight },
                      ]}
                      onPress={() => setPriorityContactId(contact.id)}
                    >
                      <ThemedText
                        style={[
                          styles.contactOptionText,
                          priorityContactId === contact.id && { color: theme.info, fontWeight: '600' },
                        ]}
                      >
                        {contact.name} ({formatPhoneNumber(contact.phone)})
                        {contact.is_primary && ' ⭐'}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.textSecondary }]} onPress={onCancel}>
                <ThemedText style={[styles.cancelButtonText, { color: theme.buttonPrimaryText }]}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.info }]} onPress={handleSubmit}>
                <ThemedText style={[styles.submitButtonText, { color: theme.buttonPrimaryText }]}>Start Session</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
  questionContainer: {
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  contactList: {
    marginTop: 8,
  },
  contactOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  contactOptionText: {
    fontSize: 16,
  },
  noContacts: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

