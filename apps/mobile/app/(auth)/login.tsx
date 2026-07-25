import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.replace('/dashboard');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DesiDiabetiCoach</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in…' : 'Log In'}</Text>
      </Pressable>

      <Link href="/signup" style={styles.link}>
        New here? Create an account
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.white },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.navy, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.navy, opacity: 0.6, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(15,35,64,0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: { backgroundColor: COLORS.teal, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: COLORS.rose, marginBottom: 8 },
  link: { marginTop: 20, textAlign: 'center', color: COLORS.teal },
});
