import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LANGUAGES } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

export default function SettingsScreen() {
  const { data: profile } = trpc.profile.get.useQuery();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Row label="Name" value={profile?.full_name ?? '—'} />
        <Row label="Diabetes type" value={profile?.diabetes_type ?? '—'} />
        <Row
          label="Language"
          value={
            profile?.language_pref
              ? LANGUAGES[profile.language_pref as keyof typeof LANGUAGES]?.label
              : '—'
          }
        />
        <Row label="Units" value={profile?.units_preference ?? 'mg/dL'} />
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.navy, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(15,35,64,0.05)' },
  rowLabel: { color: COLORS.navy, opacity: 0.6 },
  rowValue: { color: COLORS.navy, fontWeight: '600' },
  logoutButton: { marginTop: 24, alignItems: 'center', padding: 14 },
  logoutText: { color: COLORS.rose, fontWeight: '600' },
});
