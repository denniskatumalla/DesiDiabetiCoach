# DesiDiabetiCoach — Claude Code Project Context

## Project Overview
AI-powered diabetes management portal and mobile app for South Asian / Indian diaspora users.
Owner: Dennis David Katumalla | Casmendora Ventures LLC (Wyoming) / Sandcozam Group LLC (Florida)

## Mission
Help South Asian diabetics manage their health using culturally relevant food data, AI coaching,
and multilingual support — something no generic Western app currently provides.

## Tech Stack

### Frontend (Web Portal)
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS + shadcn/ui
- State: Zustand
- Auth: Supabase Auth

### Backend / API
- Runtime: Node.js 20 + TypeScript
- API: Next.js API routes + tRPC
- Database: Supabase (PostgreSQL)
- AI: Anthropic Claude API (claude-sonnet-4-6)
- Storage: Supabase Storage (meal photos)
- Email: Resend

### Mobile App
- Framework: React Native (Expo SDK 51)
- Navigation: Expo Router
- State: Zustand (shared with web)
- Payments: RevenueCat

### Infrastructure
- Hosting: Vercel (web) + Expo EAS (mobile)
- Dev DB: Supabase local (docker)
- Staging DB: Supabase project (staging)
- Prod DB: Supabase project (prod)
- CI/CD: GitHub Actions
- Secrets: .env.local (dev), Vercel env (staging/prod)

## Environments
| Env       | URL                                      | Branch   | Auto-deploy |
|-----------|------------------------------------------|----------|-------------|
| Dev       | http://localhost:3000                    | any      | No          |
| Staging   | https://staging.desidiabeticoach.com     | develop  | Yes         |
| Prod      | https://www.desidiabeticoach.com         | main     | Yes         |

## Repo Structure
```
desidiabeticoach/
├── CLAUDE.md              ← YOU ARE HERE - read this first every session
├── .claude/
│   ├── commands/          ← Custom slash commands
│   └── settings.json      ← Claude Code permissions
├── apps/
│   ├── web/               ← Next.js web portal
│   └── mobile/            ← Expo React Native app
├── packages/
│   ├── shared/            ← Shared types, utils, constants
│   ├── ui/                ← Shared UI components
│   └── food-db/           ← South Asian food database (JSON + seeder)
├── supabase/
│   ├── migrations/        ← Database migrations (run in order)
│   └── seed/              ← Dev seed data (Indian food database)
├── infrastructure/
│   ├── dev/               ← Docker compose for local dev
│   ├── staging/           ← Staging environment config
│   └── prod/              ← Production environment config
├── scripts/               ← Setup, migration, seed scripts
└── docs/                  ← Architecture docs, API specs
```

## Key Domain Concepts
- **Thali**: Full Indian meal plate — track as a composite meal, not individual dishes
- **GI Score**: Glycemic Index — critical for every food item in the database
- **HbA1c**: Primary diabetes control metric — tracked monthly per user
- **Katori**: Standard Indian serving cup (~150ml) — use as serving unit
- **BG**: Blood Glucose — logged by user multiple times per day

## Database Schema (Key Tables)
- `users` — auth + profile (name, diabetes_type, region, language_pref)
- `foods` — South Asian food database (name, regional_name, gi_score, carbs, protein, fat, serving_unit)
- `meal_logs` — user meal entries (user_id, foods[], timestamp, photo_url, bg_before, bg_after)
- `bg_logs` — blood glucose readings (user_id, value, timestamp, context)
- `medication_logs` — medication adherence (user_id, med_name, dose, taken_at)
- `ai_conversations` — coach chat history (user_id, messages[], session_id)

## Claude API Usage Pattern
```typescript
// Always use claude-sonnet-4-6 for coaching responses
// System prompt lives in: packages/shared/prompts/coach-system-prompt.ts
// Include user's: recent BG logs, today's meals, medication status, language preference
```

## Coding Standards
- TypeScript strict mode — no `any` types
- All API routes must have Zod validation
- Every new DB table needs a migration file
- Tests required for: API routes, food database calculations, GI scoring logic
- No hardcoded strings — use i18n keys (EN, TE, HI, TA supported)

## Current Sprint Focus
- [ ] Supabase schema setup + migrations
- [ ] Food database seeder (500 South Asian dishes, Phase 1)
- [ ] User auth flow (email + Google OAuth)
- [ ] Meal logging API
- [ ] AI coaching endpoint (Claude API integration)
- [ ] Web portal dashboard UI
- [ ] React Native mobile scaffold

## Do NOT Touch
- `supabase/migrations/` — never edit existing migration files, add new ones only
- `packages/food-db/seed-data/` — curated food data, changes need review
- `.env.production` — never commit production secrets

## Contact / Owner
Dennis David Katumalla | dennis@casmendora.com
Casmendora Ventures LLC — dba DesiDiabetiCoach
