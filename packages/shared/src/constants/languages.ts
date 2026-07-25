import { z } from 'zod';

/** Spec §7.4 — supported languages (v1: English shipped, rest i18n-ready) */
export const LanguageCode = z.enum(['en', 'te', 'hi', 'ta', 'pa', 'gu']);
export type LanguageCode = z.infer<typeof LanguageCode>;

export const LANGUAGES: Record<LanguageCode, { label: string; script: string; shipped: boolean }> = {
  en: { label: 'English', script: 'Latin', shipped: true },
  te: { label: 'Telugu', script: 'Telugu', shipped: false },
  hi: { label: 'Hindi', script: 'Devanagari', shipped: false },
  ta: { label: 'Tamil', script: 'Tamil', shipped: false },
  pa: { label: 'Punjabi', script: 'Gurmukhi', shipped: false },
  gu: { label: 'Gujarati', script: 'Gujarati', shipped: false },
};
