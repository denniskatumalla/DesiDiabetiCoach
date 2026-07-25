'use client';

import { useState, useRef, useEffect } from 'react';
import { Button, Card } from '@desidiabeticoach/ui';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    setMessages((m) => [...m, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: 'assistant', content: next[next.length - 1].content + chunk };
          return next;
        });
      }
    } catch {
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong reaching your coach. Please try again.',
        };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <h1 className="font-display text-2xl font-bold text-brand-navy">AI Coach</h1>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <Card className="text-sm text-brand-navy/60">
            Ask your coach anything about your food or blood sugar — e.g. &ldquo;Is rava dosa
            better for my blood sugar than plain dosa?&rdquo;
          </Card>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${
                m.role === 'user' ? 'bg-brand-teal text-white' : 'bg-white text-brand-navy shadow-[0_2px_12px_rgba(15,35,64,0.08)]'
              }`}
            >
              {m.content || (streaming && i === messages.length - 1 ? '…' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <p className="my-2 text-center text-[11px] text-brand-navy/40">
        This is general wellness guidance, not medical advice. Consult your physician before
        changing your treatment plan.
      </p>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach anything about your food or blood sugar…"
          className="flex-1 rounded-control border border-brand-navy/20 px-3 py-2.5"
        />
        <Button type="submit" disabled={streaming}>
          {streaming ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
