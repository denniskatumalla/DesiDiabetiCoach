import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/lib/theme';

const ACTIONS = [
  { href: '/log/bg', label: 'Log BG', icon: '🩸', description: 'Record a blood glucose reading' },
  { href: '/log/scan', label: 'Scan Meal', icon: '📷', description: 'Photograph a meal for AI food recognition' },
  { href: '/log/medication', label: 'Log Medication', icon: '💊', description: 'Mark a dose taken or skipped' },
] as const;

export default function LogActionSheet() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What would you like to log?</Text>
      {ACTIONS.map((action) => (
        <Pressable key={action.href} style={styles.action} onPress={() => router.push(action.href)}>
          <Text style={styles.icon}>{action.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.navy, marginBottom: 20 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
  icon: { fontSize: 28 },
  actionLabel: { fontSize: 16, fontWeight: '600', color: COLORS.navy },
  actionDescription: { fontSize: 13, color: COLORS.navy, opacity: 0.5, marginTop: 2 },
});
