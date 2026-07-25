import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

/** Server-side only — the API key must never reach the client (spec §7.1). */
export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
