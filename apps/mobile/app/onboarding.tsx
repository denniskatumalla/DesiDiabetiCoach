import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import {
  OnboardingInput,
  type OnboardingInput as OnboardingInputType,
  type DiabetesType,
} from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc';
import { COLORS } from '@/lib/theme';

const DIABETES_TYPES: DiabetesType[] = ['type1', 'type2', 'prediabetes', 'gestational'];

const DEFAULTS: OnboardingInputType = {
  fullName: '',
  dateOfBirth: '1980-01-01',
  gender: 'prefer_not_to_say',
  diabetesType: 'type2',
  diagnosisYear: new Date().getFullYear(),
  targetBgFastingMin: 80,
  targetBgFastingMax: 130,
  targetBgPostMealMax: 180,
  languagePref: 'en',
  cuisinePreference: 'mixed',
  dietaryRestriction: 'none',
  unitsPreference: 'mg/dL',
};

export default function OnboardingScreen() {
  const [form, setForm] = useState<OnboardingInputType>(DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const mutation = trpc.profile.completeOnboarding.useMutation({
    onSuccess: () => router.replace('/dashboard'),
    onError: (e) => setError(e.message),
  });

  function update<K extends keyof OnboardingInputType>(key: K, value: OnboardingInputType[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    setError(null);
    const parsed = OnboardingInput.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Please check your inputs.');
    mutation.mutate(parsed.data);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Let&rsquo;s set up your diabetic profile</Text>

      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={form.fullName} onChangeText={(v) => update('fullName', v)} />

      <Text style={styles.label}>Diabetes type</Text>
      <View style={styles.chipRow}>
        {DIABETES_TYPES.map((type) => (
          <Pressable
            key={type}
            onPress={() => update('diabetesType', type)}
            style={[styles.chip, form.diabetesType === type && styles.chipActive]}
          >
            <Text style={form.diabetesType === type ? styles.chipTextActive : styles.chipText}>{type}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Year of diagnosis</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={String(form.diagnosisYear)}
        onChangeText={(v) => update('diagnosisYear', Number(v) || DEFAULTS.diagnosisYear)}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={mutation.isPending}>
        <Text style={styles.buttonText}>{mutation.isPending ? 'Saving…' : 'Finish Setup'}</Text>
      </Pressable>

      <Text style={styles.note}>
        Language, cuisine, and dietary preferences can be set from Settings after your first login
        — this quick version covers the fields needed to start logging today.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.navy, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.navy, marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: 'rgba(15,35,64,0.2)', borderRadius: 8, padding: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: 'rgba(15,35,64,0.2)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  chipActive: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  chipText: { color: COLORS.navy },
  chipTextActive: { color: '#fff' },
  button: { backgroundColor: COLORS.teal, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: COLORS.rose, marginTop: 12 },
  note: { fontSize: 12, color: COLORS.navy, opacity: 0.5, marginTop: 16, marginBottom: 40 },
});
