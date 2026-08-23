import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { FoodScanResult, FOOD_SCAN_SYSTEM_PROMPT, LOW_CONFIDENCE_THRESHOLD } from '@desidiabeticoach/shared';
import { protectedProcedure, router } from '../trpc';
import { getAnthropicClient, CLAUDE_MODEL } from '../../lib/anthropic';
import { RATE_LIMITS, withinRateLimit } from '../../lib/rate-limit';

/**
 * Base64 characters, ~4.5MB — a little under the Anthropic image ceiling, and
 * comfortably above the ~2MB the mobile client produces after compression. The
 * client-side compression is a property of the current app, not a constraint
 * on the endpoint, so the bound is enforced here too.
 */
export const MAX_IMAGE_BASE64_CHARS = 4_718_592;

/**
 * Spec §5.5.2 / §9.1 — AI food recognition. Mobile-only feature (the web
 * app has no camera UI), but the scan itself runs here since the Anthropic
 * key must stay server-side.
 */
export const ScanInput = z.object({
  // Base64-encoded JPEG/PNG, already compressed client-side to ~2MB (spec §5.5.1)
  imageBase64: z.string().min(1).max(MAX_IMAGE_BASE64_CHARS),
  mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
});

export const foodScanRouter = router({
  scan: protectedProcedure
    .input(ScanInput)
    .mutation(async ({ ctx, input }) => {
      if (!(await withinRateLimit(ctx.supabase, RATE_LIMITS.foodScan))) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'You have scanned a lot of meals recently. Please try again later.',
        });
      }

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

      // A response we cannot parse is our problem, not a bad photo — reporting
      // it as "no food detected" tells the user to retake a picture that was
      // probably fine.
      const parsedJson = extractJson(textBlock.text);
      if (parsedJson === undefined) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not read the scan result. Please try again.',
        });
      }

      const result = FoodScanResult.safeParse(toCamelResult(parsedJson));
      if (!result.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not read the scan result. Please try again.',
        });
      }

      if (result.data.items.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No food detected in this image.' });
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

/**
 * Claude is told to return JSON only, but may still wrap it in a markdown
 * fence or add a sentence either side. Take the outermost `{...}` span rather
 * than stripping a specific fence syntax, which missed bare ``` fences and
 * any leading prose.
 *
 * @returns the parsed value, or `undefined` if no JSON object could be read.
 */
function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return undefined;

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return undefined;
  }
}

/** Claude returns snake_case per the prompt's JSON schema; the app is camelCase. */
type RawScanItem = Record<string, unknown>;

function toCamelResult(raw: unknown) {
  const r = (raw ?? {}) as Record<string, unknown>;
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
