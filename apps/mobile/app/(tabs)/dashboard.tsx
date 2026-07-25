import { ScrollView, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useState } from 'react';
import { calculateTir, bgStatusColor } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc';
import { COLORS } from '@/lib/theme';

export default function DashboardScreen() {
  const utils = trpc.useUtils();
  const [refreshing, setRefreshing] = useState(false);
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: bgLogs } = trpc.bgLogs.list.useQuery({ limit: 30 });
  const { data: medLogs } = trpc.medications.recentLogs.useQuery({ days: 30 });

  const targetMin = profile?.target_bg_fasting_min ?? 80;
  const targetMax = profile?.target_bg_post_meal_max ?? 180;
  const last7 = (bgLogs ?? []).filter((b) => new Date(b.logged_at).getTime() > Date.now() - 7 * 86400000);
  const tir = calculateTir(last7.map((b) => b.value), targetMin, targetMax);
  const lastReading = bgLogs?.[0];
  const adherencePct =
    medLogs && medLogs.length > 0 ? Math.round((medLogs.filter((m) => m.taken).length / medLogs.length) * 100) : null;

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([utils.bgLogs.list.invalidate(), utils.medications.recentLogs.invalidate()]);
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Dashboard</Text>

      <Card>
        <CardLabel>Last BG</CardLabel>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={styles.statValue}>{lastReading ? `${lastReading.value} mg/dL` : '—'}</Text>
          {lastReading && (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: bgStatusColor(lastReading.value, targetMin, targetMax),
              }}
            />
          )}
        </View>
        <Text style={styles.statSub}>
          {lastReading ? new Date(lastReading.logged_at).toLocaleString() : 'No readings yet'}
        </Text>
      </Card>

      <Card>
        <CardLabel>7-Day Time in Range</CardLabel>
        <Text style={styles.statValue}>{tir}%</Text>
        <Text style={styles.statSub}>{last7.length} readings</Text>
      </Card>

      <Card>
        <CardLabel>Medication Adherence</CardLabel>
        <Text style={styles.statValue}>{adherencePct !== null ? `${adherencePct}%` : '—'}</Text>
        <Text style={styles.statSub}>Last 30 days</Text>
      </Card>
    </ScrollView>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.cardLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.navy, marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.navy,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLabel: { fontSize: 12, fontWeight: '600', color: COLORS.navy, opacity: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: '700', color: COLORS.navy },
  statSub: { fontSize: 13, color: COLORS.navy, opacity: 0.5, marginTop: 4 },
});
