import { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/lib/theme';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Mobile chat is request/response, not token-streamed like the web client.
 * React Native's fetch doesn't support reading a ReadableStream body across
 * platforms without a polyfill — see docs/ROADMAP.md. The same
 * POST /api/coach endpoint is used either way; here we just await the full
 * text instead of reading it incrementally.
 */
export default function CoachScreen() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setSending(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/coach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ message: text }),
      });

      const replyText = await res.text();
      setMessages((m) => [...m, { role: 'assistant', content: replyText }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Something went wrong reaching your coach.' }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16 }}>
        {messages.length === 0 && (
          <Text style={styles.placeholder}>
            Ask your coach anything about your food or blood sugar.
          </Text>
        )}
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
            <Text style={m.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant}>{m.content}</Text>
          </View>
        ))}
        {sending && <Text style={styles.placeholder}>Thinking…</Text>}
      </ScrollView>

      <Text style={styles.disclaimer}>
        This is general wellness guidance, not medical advice. Consult your physician before
        changing your treatment plan.
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask your coach…"
          onSubmitEditing={sendMessage}
        />
        <Pressable style={styles.sendButton} onPress={sendMessage} disabled={sending}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  placeholder: { color: COLORS.navy, opacity: 0.5, textAlign: 'center', marginTop: 20 },
  bubble: { maxWidth: '80%', borderRadius: 14, padding: 12, marginBottom: 8 },
  bubbleUser: { backgroundColor: COLORS.teal, alignSelf: 'flex-end' },
  bubbleAssistant: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAssistant: { color: COLORS.navy },
  disclaimer: { fontSize: 10, color: COLORS.navy, opacity: 0.4, textAlign: 'center', paddingHorizontal: 12 },
  inputRow: { flexDirection: 'row', gap: 8, padding: 12 },
  input: { flex: 1, borderWidth: 1, borderColor: 'rgba(15,35,64,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  sendButton: { backgroundColor: COLORS.teal, borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '600' },
});
