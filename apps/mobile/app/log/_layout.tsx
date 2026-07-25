import { Stack } from 'expo-router';

export default function LogStackLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="bg" options={{ title: 'Log BG' }} />
      <Stack.Screen name="medication" options={{ title: 'Log Medication' }} />
      <Stack.Screen name="scan" options={{ title: 'Scan Meal' }} />
    </Stack>
  );
}
