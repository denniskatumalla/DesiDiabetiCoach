import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    setSubmitted(true);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>

      {submitted ? (
        <Text style={styles.subtitle}>
          Check your email to confirm your account, then log in and complete your diabetic
          profile.
        </Text>
      ) : (
        <>
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
            placeholder="Password (min. 8 characters)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={styles.button} onPress={handleSignup} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Sign Up'}</Text>
          </Pressable>
        </>
      )}

      <Link href="/login" style={styles.link}>
        Already have an account? Log in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: COLORS.white },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.navy, textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 14, color: COLORS.navy, opacity: 0.7, textAlign: 'center' },
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
