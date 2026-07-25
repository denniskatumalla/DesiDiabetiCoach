import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { BG_CONTEXT_LABELS, isAbnormalBg, type BgContext } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc';
import { COLORS } from '@/lib/theme';

export default function LogBgScreen() {
  const utils = trpc.useUtils();
  const [value, setValue] = useState('');
  const [context, setContext] = useState<BgContext>('fasting');
  const mutation = trpc.bgLogs.create.useMutation({
    onSuccess: () => {
      utils.bgLogs.list.invalidate();
      router.back();
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>BG Value (mg/dL)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholder="e.g. 118"
        value={value}
        onChangeText={setValue}
        autoFocus
      />

      <Text style={styles.label}>Context</Text>
      <View style={styles.chipRow}>
        {Object.entries(BG_CONTEXT_LABELS).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setContext(key as BgContext)}
            style={[styles.chip, context === key && styles.chipActive]}
          >
            <Text style={context === key ? styles.chipTextActive : styles.chipText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {value !== '' && isAbnormalBg(Number(value)) && (
        <Text style={styles.warning}>
          This reading is outside safe range — contact your healthcare provider or seek emergency
          care if symptomatic.
        </Text>
      )}

      <Pressable
        style={styles.button}
        disabled={!value || mutation.isPending}
        onPress={() => mutation.mutate({ value: Number(value), context })}
      >
        <Text style={styles.buttonText}>{mutation.isPending ? 'Saving…' : 'Save Reading'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.navy, marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: 'rgba(15,35,64,0.2)', borderRadius: 8, padding: 14, fontSize: 18 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: 'rgba(15,35,64,0.2)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  chipActive: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  chipText: { color: COLORS.navy, fontSize: 13 },
  chipTextActive: { color: '#fff', fontSize: 13 },
  warning: { color: COLORS.rose, marginTop: 16, fontSize: 13 },
  button: { backgroundColor: COLORS.teal, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
