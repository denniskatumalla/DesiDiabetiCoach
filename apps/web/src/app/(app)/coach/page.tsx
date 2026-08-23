'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Field } from '@desidiabeticoach/ui';
import { COACHING_DISCLAIMER, COACH_HISTORY_LIMIT } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc/client';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Set by the first append so later turns extend the same conversation row.
  const sessionId = useRef<string | undefined>(undefined);

  const appendMessages = trpc.coach.appendMessages.useMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    // Captured before the optimistic append so it holds only completed turns.
    const history = messages.slice(-COACH_HISTORY_LIMIT);

    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok || !res.body) {
        throw new Error(res.status === 429 ? await res.text() : 'Coach request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: 'assistant', content: reply };
          return next;
        });
      }

      persist(text, reply);
    } catch (err) {
      const message =
        err instanceof Error && err.message.startsWith('You are sending')
          ? err.message
          : 'Something went wrong reaching your coach. Please try again.';
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = { role: 'assistant', content: message };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }

  /** Persist the completed exchange; a failure here must not break the chat. */
  function persist(userText: string, assistantText: string) {
    const timestamp = new Date().toISOString();
    appendMessages.mutate(
      {
        sessionId: sessionId.current,
        messages: [
          { role: 'user', content: userText, timestamp },
          { role: 'assistant', content: assistantText, timestamp },
        ],
      },
      { onSuccess: (result) => (sessionId.current = result.sessionId) }
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <p className="eyebrow text-accent">Ask anything</p>
      <h1 className="mt-2 font-display text-display-md font-bold text-fg">AI Coach</h1>

      <div className="mt-6 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="max-w-md font-display text-xl font-bold text-fg">
              Ask your coach anything about your food or blood sugar.
            </p>
            <p className="mt-2 max-w-sm text-sm text-fg/55">
              For example — &ldquo;Is rava dosa better for my blood sugar than plain dosa?&rdquo;
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] whitespace-pre-wrap rounded-card px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-brand-teal text-fg'
                  : 'border border-ink-rule bg-ink-raised text-fg'
              }`}
            >
              {m.content || (streaming && i === messages.length - 1 ? '…' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <p className="my-3 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-fg/35">
        {COACHING_DISCLAIMER}
      </p>

      <form onSubmit={sendMessage} className="flex gap-2">
        <Field
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach anything about your food or blood sugar…"
          className="flex-1"
        />
        <Button type="submit" disabled={streaming}>
          {streaming ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
