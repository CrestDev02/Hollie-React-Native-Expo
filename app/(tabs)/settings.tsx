import { View, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ThemedText, ThemedView, Button, IconSymbol } from '@/src/components/core';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useThemeMode } from '@/src/contexts/ThemeContext';
import { useTheme } from '@/src/hooks/use-theme';
import { Spacing, Shadows, BorderRadius } from '@/src/constants/design-tokens';

export default function SettingsScreen() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeMode();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', error.message || 'Failed to logout');
            } else {
              router.replace('/(auth)/phone');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Settings
        </ThemedText>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
          <ThemedView style={styles.profileCard}>
            <ThemedView style={[styles.profileIcon, { backgroundColor: theme.buttonPrimary }]}>
              <ThemedText style={[styles.profileIconText, { color: theme.buttonPrimaryText }]}>
                {user?.phone?.charAt(user.phone.length - 1) || 'U'}
              </ThemedText>
            </ThemedView>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>User Profile</ThemedText>
              <ThemedText style={styles.profilePhone}>{user?.phone || 'N/A'}</ThemedText>
            </View>
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
          <ThemedView style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <IconSymbol name="phone.fill" size={20} color={theme.icon} />
                <ThemedText style={styles.infoLabel}>Phone Number</ThemedText>
              </View>
              <ThemedText style={styles.infoValue}>{user?.phone || 'N/A'}</ThemedText>
            </View>
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
          <ThemedView style={styles.infoCard}>
            <TouchableOpacity
              style={styles.themeOption}
              onPress={() => setThemeMode('light')}
              activeOpacity={0.7}
            >
              <View style={styles.themeOptionContent}>
                <View style={styles.themeOptionLeft}>
                  <IconSymbol 
                    name="sun.max.fill" 
                    size={20} 
                    color={themeMode === 'light' ? theme.buttonPrimary : theme.icon} 
                  />
                  <ThemedText style={styles.themeOptionLabel}>Light</ThemedText>
                </View>
                {themeMode === 'light' && (
                  <View style={[styles.radioButton, { backgroundColor: theme.buttonPrimary }]} />
                )}
              </View>
            </TouchableOpacity>
            <ThemedView style={styles.divider} />
            <TouchableOpacity
              style={styles.themeOption}
              onPress={() => setThemeMode('dark')}
              activeOpacity={0.7}
            >
              <View style={styles.themeOptionContent}>
                <View style={styles.themeOptionLeft}>
                  <IconSymbol 
                    name="moon.fill" 
                    size={20} 
                    color={themeMode === 'dark' ? theme.buttonPrimary : theme.icon.default} 
                  />
                  <ThemedText style={styles.themeOptionLabel}>Dark</ThemedText>
                </View>
                {themeMode === 'dark' && (
                  <View style={[styles.radioButton, { backgroundColor: theme.buttonPrimary }]} />
                )}
              </View>
            </TouchableOpacity>
            <ThemedView style={styles.divider} />
            <TouchableOpacity
              style={styles.themeOption}
              onPress={() => setThemeMode('system')}
              activeOpacity={0.7}
            >
              <View style={styles.themeOptionContent}>
                <View style={styles.themeOptionLeft}>
                  <IconSymbol 
                    name="gearshape.fill" 
                    size={20} 
                    color={themeMode === 'system' ? theme.buttonPrimary : theme.icon.default} 
                  />
                  <ThemedText style={styles.themeOptionLabel}>System</ThemedText>
                </View>
                {themeMode === 'system' && (
                  <View style={[styles.radioButton, { backgroundColor: theme.buttonPrimary }]} />
                )}
              </View>
            </TouchableOpacity>
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          <ThemedView style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <IconSymbol name="info.circle.fill" size={20} color={theme.icon} />
                <ThemedText style={styles.infoLabel}>App Version</ThemedText>
              </View>
              <ThemedText style={styles.infoValue}>1.0.0</ThemedText>
            </View>
          </ThemedView>
        </View>

        <Button
          title="Logout"
          variant="error"
          onPress={handleSignOut}
          style={styles.logoutButton}
        />
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  profileIconText: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  profilePhone: {
    fontSize: 15,
    opacity: 0.7,
  },
  logoutButton: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  themeOption: {
    paddingVertical: Spacing.md,
  },
  themeOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  themeOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 5,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
});

