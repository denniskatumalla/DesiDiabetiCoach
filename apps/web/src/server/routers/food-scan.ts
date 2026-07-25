import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { FoodScanResult, FOOD_SCAN_SYSTEM_PROMPT, LOW_CONFIDENCE_THRESHOLD } from '@desidiabeticoach/shared';
import { protectedProcedure, router } from '../trpc';
import { getAnthropicClient, CLAUDE_MODEL } from '../../lib/anthropic';

/**
 * Spec §5.5.2 / §9.1 — AI food recognition. Mobile-only feature (the web
 * app has no camera UI), but the scan itself runs here since the Anthropic
 * key must stay server-side.
 */
export const foodScanRouter = router({
  scan: protectedProcedure
    .input(
      z.object({
        // Base64-encoded JPEG/PNG, already compressed client-side to ~2MB (spec §5.5.1)
        imageBase64: z.string().min(1),
        mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
      })
    )
    .mutation(async ({ input }) => {
      const anthropic = getAnthropicClient();

      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        system: FOOD_SCAN_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: input.mediaType, data: input.imageBase64 },
              },
              { type: 'text', text: 'Identify the food items in this meal photo.' },
            ],
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No response from food scan.' });
      }

      let parsedJson: unknown;
      try {
        // Claude is instructed to return JSON only, but strip any stray fencing defensively.
        const cleaned = textBlock.text.replace(/^```json\s*|```$/g, '').trim();
        parsedJson = JSON.parse(cleaned);
      } catch {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No food detected in this image.' });
      }

      const camelCased = toCamelResult(parsedJson);
      const result = FoodScanResult.safeParse(camelCased);
      if (!result.success || result.data.items.length === 0) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No food detected in this image.' });
      }

      return {
        ...result.data,
        items: result.data.items.map((item) => ({
          ...item,
          needsConfirmation: item.confidence < LOW_CONFIDENCE_THRESHOLD,
        })),
      };
    }),
});

/** Claude returns snake_case per the prompt's JSON schema; the app is camelCase. */
type RawScanItem = Record<string, unknown>;

function toCamelResult(raw: unknown) {
  const r = raw as Record<string, unknown>;
  const items = Array.isArray(r.items) ? (r.items as RawScanItem[]) : [];
  return {
    items: items.map((i) => ({
      name: i.name,
      regionalName: i.regional_name ?? undefined,
      estimatedGrams: i.estimated_grams,
      estimatedKatori: i.estimated_katori,
      calories: i.calories,
      carbsG: i.carbs_g,
      giScore: i.gi_score,
      glScore: i.gl_score,
      confidence: i.confidence,
      candidates: i.candidates ?? undefined,
    })),
    thaliDetected: r.thali_detected ?? false,
    rawDescription: r.raw_description ?? '',
  };
}
