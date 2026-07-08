# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered diabetes management portal and mobile app for South Asian / Indian diaspora users.
Owner: Dennis David Katumalla | Candsillon Technologies

## Current State

The repo is in scaffold/bootstrap phase. The directory structure below is the **target layout** — most subdirectories do not exist yet and need to be created. Files currently at root that will move when scaffolding is complete:

| File at root now         | Target location                              |
| ------------------------ | -------------------------------------------- |
| `001_initial_schema.sql` | `supabase/migrations/001_initial_schema.sql` |
| `docker-compose.yml`     | `infrastructure/dev/docker-compose.yml`      |
| `setup.js`               | `scripts/setup.js`                           |
| `settings.json`          | `.claude/settings.json`                      |
| `ci-cd.yml`              | `.github/workflows/ci-cd.yml`                |

## Target Directory Structure

```
desidiabeticoach/
├── apps/
│   ├── web/               ← Next.js 14 (App Router) web portal
│   └── mobile/            ← Expo SDK 51 React Native app
├── packages/
│   ├── shared/            ← Shared types, utils, constants, i18n keys
│   ├── ui/                ← Shared UI components (shadcn/ui base)
│   └── food-db/           ← South Asian food database (JSON + seeder)
├── supabase/
│   └── migrations/        ← Sequential migration files — never edit existing ones
├── infrastructure/
│   └── dev/               ← Docker Compose for local dev
├── scripts/               ← Setup, migration, seed scripts
└── docs/                  ← Architecture docs, API specs
```

## Tech Stack

- **Web**: Next.js 14 App Router, Tailwind CSS, shadcn/ui, Zustand, Supabase Auth
- **API**: Next.js API routes + tRPC, Zod validation on all routes
- **Database**: Supabase (PostgreSQL) with Row Level Security on all user tables
- **AI**: Anthropic Claude API — model `claude-sonnet-4-6`, system prompt at `packages/shared/prompts/coach-system-prompt.ts`
- **Mobile**: React Native (Expo SDK 51), Expo Router, RevenueCat for payments
- **Email**: Resend | **Storage**: Supabase Storage (meal photos)
- **Hosting**: Vercel (web) + Expo EAS (mobile)

## Commands

```bash
# First-time setup (copies .env.example → .env.local, starts Docker, runs migrations)
node setup.js

# Local dev database (Docker)
npm run dev:db          # start
npm run dev:db:stop     # stop
npm run dev:db:reset    # wipe and restart

# Development servers
npm run dev             # web + mobile concurrently
npm run dev:web         # Next.js at http://localhost:3000
npm run dev:mobile      # Expo

# Quality checks
npm run typecheck       # tsc --noEmit
npm run lint            # eslint, zero warnings allowed
npm run test            # jest
npm run test:watch      # jest --watch

# Database
npm run db:migrate      # supabase db push
npm run db:seed         # ts-node scripts/seed-foods.ts
npm run db:studio       # open Supabase Studio
```

### Single test file

```bash
npx jest path/to/test.spec.ts
```

## Local Dev Services (after `npm run dev:db`)

| Service         | URL                    | Purpose                       |
| --------------- | ---------------------- | ----------------------------- |
| Web portal      | http://localhost:3000  | Next.js app                   |
| Supabase Studio | http://localhost:54323 | Database UI                   |
| PostgreSQL      | localhost:54322        | Direct DB connection          |
| Mailhog         | http://localhost:8025  | Local email capture           |
| Redis           | localhost:6379         | Rate limiting + session cache |

## Environment Variables

Copy `.env.example` to `.env.local`. Key vars:

- `ANTHROPIC_API_KEY` — get from console.anthropic.com
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` — email sending
- `NEXT_PUBLIC_ENABLE_AI_PHOTO_SCAN` / `NEXT_PUBLIC_ENABLE_MULTILINGUAL` — feature flags (default `false`)

Mobile env vars go in `apps/mobile/.env`, not root `.env.local`.

## Database Schema

RLS is enabled on all user tables. The `foods` table is public (no RLS). Key tables:

- `user_profiles` — extends `auth.users`; includes `diabetes_type`, `language_pref`, `ethnicity`, `subscription`
- `foods` — South Asian food DB; `gi_category` is a generated column derived from `gi_score`
- `meal_logs` + `meal_items` — meal entries with per-item food references
- `bg_logs` — blood glucose readings with typed `context` (fasting, before/after meals, etc.)
- `medication_logs` — adherence tracking
- `ai_conversations` — Claude chat history stored as JSONB `messages[]`

Migration rule: **add new migration files only — never edit existing ones**.

## Domain Concepts

- **GI Score / GL Score**: Every food entry needs both. `gi_category` is auto-computed. GL = (GI × carbs) / 100.
- **Katori**: Standard Indian serving unit ~150ml — use as the default serving descriptor.
- **Thali**: Composite meal — log as a `meal_log` with multiple `meal_items`, not as a single food.
- **HbA1c**: Tracked monthly; primary long-term diabetes control metric.
- **BG**: Blood glucose in mg/dL, logged multiple times daily with a `context` enum.

## Coding Standards

- TypeScript strict mode — no `any` types
- All API routes require Zod validation
- No hardcoded user-facing strings — use i18n keys (EN, TE, HI, TA, PA, GU supported)
- Tests required for: API routes, food DB calculations, GI scoring logic

## CI/CD (GitHub Actions — `ci-cd.yml`)

- Every push/PR: typecheck → lint → test
- `develop` branch → auto-deploy to staging (requires `supabase db push --linked` — blocked in local permissions)
- `main` branch → deploy to production with **manual approval gate** in GitHub Environments

## Do NOT Touch

- Existing files in `supabase/migrations/` — append new files only
- `packages/food-db/seed-data/` — curated nutritional data, changes need review
- `.env.production` — never commit
