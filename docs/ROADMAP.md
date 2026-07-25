# Roadmap — What's Built vs. What's Next

This tracks the gap between the full [product spec](../spec/CLAUDE.md) and what
actually ships in this codebase today. The goal of the first build pass was a
**real, working, testable core slice** across web + iOS + Android — not a
shallow pass over every spec section. Everything below is either fully wired
up, or explicitly deferred with a note on why and what's needed to finish it.

## Built and working

- Monorepo scaffold matching CLAUDE.md's target layout (`apps/`, `packages/`, `supabase/migrations/`, `infrastructure/`, `scripts/`, `.github/workflows/`)
- Supabase schema: `user_profiles`, `foods`, `meal_logs`, `meal_items`, `bg_logs`, `medication_logs`, `ai_conversations` (001), plus `a1c_logs`, `medications`, `medication_schedules`, onboarding fields, the `meal-photos` storage bucket, and an auto-create-profile-on-signup trigger (002) — all with RLS
- Auth: Supabase email/password + magic link, web (cookie session) and mobile (AsyncStorage session + bearer token to the API)
- Onboarding wizard (web full version, mobile condensed version)
- BG logging: entry, context enum, color-coded history, abnormal-value safety banner, 7-day trend chart (web)
- Medication logging: add medication, mark doses taken, adherence % on dashboard
- A1C table + API (`a1c` router) — not yet surfaced in a dedicated UI screen (data model and endpoints are ready; screen is a small follow-up)
- Meal logging: manual food search (web + mobile) and **AI camera photo scan (mobile only)**, matching the spec's channel split — the web app never shows a camera/upload UI, only read-only AI-scanned meal history
- AI food recognition: real Claude vision call, structured JSON parsing, Zod validation, low-confidence item flagging
- AI coaching chat: real Claude call with the spec's persona/context/disclaimer/safety-banner logic; **streams token-by-token on web**, request/response on mobile (see below)
- Dashboard summary (both platforms), simplified list-based analytics on mobile
- CSV export for BG/meal/medication logs
- ~54-item South Asian food database seed with GI/GL/katori data, seeder script
- Unit tests for GI/GL calculation and core Zod schemas (`packages/shared`)

## Deliberately deferred (not started)

| Item | Why deferred |
|---|---|
| Stripe (web) / RevenueCat (mobile) billing | Needs real payment provider accounts + webhook infra; out of scope for a first working slice |
| Branded PDF Doctor/Personal reports (`react-pdf`) | CSV export covers the "get my data out" need; PDF layout/branding work is substantial and separable |
| Social share cards, referral program | No user base yet to make sharing/referrals meaningful to test |
| Chatwoot support widget | Requires a hosted Chatwoot instance (self-host or Cloud) — infra decision, not app code |
| Docusaurus docs site | Separate deployable; app functionality didn't depend on it |
| Push notification *infrastructure* (scheduled reminders, proactive insights cron) | Expo push token registration is a small addition; the server-side scheduler is a real infra piece (cron + Redis rate limiting) |
| 5 of 6 languages (TE/HI/TA/PA/GU) | English ships; every string already routes through `packages/shared/src/i18n`, so adding a locale is a new JSON file, not a rewrite |
| Biometric auth / MFA | Auth works; these are additive hardening, not blocking |
| Care-partner sharing, physician tokens, NPS survey | Each needs its own table + UI; not part of the core logging/coaching loop |
| Full analytics deep-dive (histograms, time-of-day heatmap, food correlation) | Basic 30-day trend ships; deep-dive is a bigger charting effort, especially on mobile (see below) |
| Food DB at 500+ items | 54 seeded now, covering the categories in spec §5.5.2; expanding needs nutritionist review per CLAUDE.md's "Do Not Touch" rule on `packages/food-db/seed-data/` |

## Known simplifications worth revisiting

- **Mobile coach chat is not token-streamed.** React Native's `fetch` doesn't support reading a `ReadableStream` response body across iOS/Android without a polyfill (e.g. `react-native-sse` or upgrading to a fetch implementation with full Streams support). The mobile screen calls the same `/api/coach` endpoint and awaits the full response text instead. Web gets the real streaming UX described in spec §9.2.
- **Mobile analytics is list/summary-based, not chart-based.** Recharts (the web charting library) is SVG-DOM only and doesn't run in React Native. A native chart library (e.g. Victory Native, `react-native-svg`-based charts) is a deliberate follow-up rather than a rushed integration.
- **`packages/ui` is web-only.** shadcn/ui-style components can't be consumed by React Native directly. Both platforms pull the same color/token values from `packages/shared/src/constants/theme.ts`, but component code isn't shared — this matches the plan's explicit scoping, not an oversight.
- **No generated Supabase types.** Queries use the untyped `SupabaseClient` (no `Database` generic), so Supabase call results aren't compile-time checked against the schema. Run `supabase gen types typescript --linked > packages/shared/src/database.types.ts` once a real project exists, then type all `SupabaseClient<Database>` usages — this is the single highest-value follow-up for catching schema drift at compile time.
- **Settings screens are read-only.** Editing the profile after onboarding currently means re-running onboarding; an inline edit form is a small, contained addition.
- **No app icon / splash image assets yet.** `apps/mobile/app.json` doesn't reference an icon file — Expo falls back to its default icon. Real brand assets (spec §0, §15 Q6) need a designer pass before an EAS production build/store submission; drop the final files into `apps/mobile/assets/` and add `icon` / `splash.image` / `android.adaptiveIcon.foregroundImage` back to `app.json`.
