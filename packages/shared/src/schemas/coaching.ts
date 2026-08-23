import { z } from 'zod';
import { LanguageCode } from '../constants/languages';

/** Spec §9.2 — coaching context sent to Claude (never raw PII) */
export const CoachingContext = z.object({
  diabetesType: z.enum(['type1', 'type2', 'prediabetes', 'gestational']),
  a1cTarget: z.number(),
  language: LanguageCode,
  dietaryRestrictions: z.array(z.string()),
  cuisinePreference: z.string(),
  bgLogs14d: z.array(
    z.object({ value: z.number(), context: z.string(), timestamp: z.string() })
  ),
  mealLogs7d: z.array(
    z.object({ foods: z.array(z.string()), totalGl: z.number(), timestamp: z.string() })
  ),
  medications: z.array(z.object({ name: z.string(), frequency: z.string() })),
  recentMealPhotoDescription: z.string().optional(),
});
export type CoachingContext = z.infer<typeof CoachingContext>;

export const ChatMessage = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string().datetime(),
});
export type ChatMessage = z.infer<typeof ChatMessage>;

/**
 * A prior turn replayed to the model so follow-ups ("what about the other
 * one?") keep their context. Bounded on both axes because the client supplies
 * it and it is billed as input tokens on every request.
 */
export const CoachHistoryTurn = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});
export type CoachHistoryTurn = z.infer<typeof CoachHistoryTurn>;

/** Turns of history the client should send, and the server will accept. */
export const COACH_HISTORY_LIMIT = 20;

export const CoachChatInput = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
  history: z.array(CoachHistoryTurn).max(COACH_HISTORY_LIMIT).default([]),
});
export type CoachChatInput = z.infer<typeof CoachChatInput>;

/**
 * Spec §5.6.4 — how recent an abnormal reading must be to raise the safety
 * banner. The banner tells the user to consider emergency care, so it has to
 * track the reading in front of them: attaching it to anything in the 14-day
 * coaching window meant one resolved excursion produced a fortnight of alarms.
 */
export const ABNORMAL_BG_ALERT_WINDOW_MS = 6 * 60 * 60 * 1000;

/** Spec §5.6.4 — every coaching response carries this footer */
export const COACHING_DISCLAIMER =
  'This is general wellness guidance, not medical advice. Consult your physician before changing your treatment plan.';
