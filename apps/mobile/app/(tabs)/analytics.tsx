import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { calculateTir, bgStatusColor } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc';
import { COLORS } from '@/lib/theme';

/**
 * A simplified, text/list-based analytics view. The web app's chart-heavy
 * deep-dive (histograms, correlation panels) uses Recharts, which is
 * web/SVG-DOM only — a native equivalent is a follow-up (docs/ROADMAP.md).
 */
export default function AnalyticsScreen() {
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: bgLogs, isLoading } = trpc.bgLogs.list.useQuery({ limit: 90 });

  const targetMin = profile?.target_bg_fasting_min ?? 80;
  const targetMax = profile?.target_bg_post_meal_max ?? 180;
  const values = (bgLogs ?? []).map((b) => b.value);
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
  const high = values.length ? Math.max(...values) : null;
  const low = values.length ? Math.min(...values) : null;
  const tir = calculateTir(values, targetMin, targetMax);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Analytics</Text>

      <View style={styles.summaryRow}>
        <SummaryStat label="Avg" value={avg ? `${avg}` : '—'} />
        <SummaryStat label="High" value={high ? `${high}` : '—'} />
        <SummaryStat label="Low" value={low ? `${low}` : '—'} />
        <SummaryStat label="TIR" value={`${tir}%`} />
      </View>

      <Text style={styles.sectionLabel}>Recent Readings</Text>
      {isLoading ? (
        <Text style={styles.empty}>Loading…</Text>
      ) : (
        (bgLogs ?? []).slice(0, 20).map((log) => (
          <View key={log.id} style={styles.readingRow}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: bgStatusColor(log.value, targetMin, targetMax),
                marginRight: 10,
              }}
            />
            <Text style={styles.readingValue}>{log.value} mg/dL</Text>
            <Text style={styles.readingMeta}>
              {log.context} · {new Date(log.logged_at).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
      {bgLogs?.length === 0 && <Text style={styles.empty}>No readings yet.</Text>}
    </ScrollView>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.navy, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20 },
  summaryStat: { alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: COLORS.navy },
  summaryLabel: { fontSize: 11, color: COLORS.navy, opacity: 0.5, marginTop: 2, textTransform: 'uppercase' },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.navy, opacity: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  readingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 6 },
  readingValue: { fontWeight: '600', color: COLORS.navy, marginRight: 10 },
  readingMeta: { color: COLORS.navy, opacity: 0.5, fontSize: 12 },
  empty: { color: COLORS.navy, opacity: 0.5 },
});
