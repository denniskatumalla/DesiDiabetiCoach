import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { COLORS } from '@/lib/theme';

export default function LogMedicationScreen() {
  const utils = trpc.useUtils();
  const { data: medications, isLoading } = trpc.medications.list.useQuery();
  const mutation = trpc.medications.logDose.useMutation({
    onSuccess: () => {
      utils.medications.recentLogs.invalidate();
      router.back();
    },
  });

  if (isLoading) return <Text style={styles.empty}>Loading…</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={medications ?? []}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No medications added yet — add one from the Medications page on the web app or your
            Settings.
          </Text>
        }
        renderItem={({ item: med }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.medName}>
                {med.name} — {med.dose_value}
                {med.dose_unit}
              </Text>
            </View>
            <Pressable
              style={styles.takenButton}
              onPress={() =>
                mutation.mutate({
                  medicationId: med.id,
                  medicationName: med.name,
                  doseMg: med.dose_unit === 'mg' ? med.dose_value : undefined,
                  taken: true,
                })
              }
            >
              <Text style={styles.takenText}>Taken</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  empty: { padding: 20, color: COLORS.navy, opacity: 0.6, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  medName: { fontSize: 15, fontWeight: '600', color: COLORS.navy },
  takenButton: { backgroundColor: COLORS.jade, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  takenText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
