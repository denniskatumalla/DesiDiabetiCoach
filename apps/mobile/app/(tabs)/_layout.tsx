import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS } from '@/lib/theme';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={{ color: focused ? COLORS.teal : '#999', fontSize: 11 }}>{label}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.teal,
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon label="🏠" focused={focused} /> }}
      />
      <Tabs.Screen
        name="log"
        options={{ title: 'Log', tabBarIcon: ({ focused }) => <TabIcon label="➕" focused={focused} /> }}
      />
      <Tabs.Screen
        name="coach"
        options={{ title: 'AI Coach', tabBarIcon: ({ focused }) => <TabIcon label="💬" focused={focused} /> }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics', tabBarIcon: ({ focused }) => <TabIcon label="📊" focused={focused} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ focused }) => <TabIcon label="⚙️" focused={focused} /> }}
      />
    </Tabs>
  );
}
