# Deployment Guide

This assumes you're starting from **zero accounts**. Follow the sections in
order — later steps depend on values collected in earlier ones. Budget about
half a day for the first end-to-end pass (most of it is account creation and
waiting on app-store review queues, not active work).

---

## 1. Accounts you'll need

| Service | Used for | Cost |
|---|---|---|
| [Supabase](https://supabase.com) | Database, auth, storage | Free tier is enough to start |
| [Anthropic Console](https://console.anthropic.com) | Claude API (coaching + food scan) | Pay-as-you-go, a few dollars covers testing |
| [Vercel](https://vercel.com) | Web app hosting | Free tier is enough to start |
| [Expo (EAS)](https://expo.dev) | Mobile build/submit pipeline | Free tier works for development builds; paid plan ($29/mo) recommended once you're submitting to stores regularly |
| [Apple Developer Program](https://developer.apple.com/programs/) | iOS TestFlight/App Store | $99/year |
| [Google Play Console](https://play.google.com/console) | Android Play Store | $25 one-time |

Resend (email) and the Phase 2 services (Stripe, RevenueCat, Chatwoot,
Docusaurus hosting) are **not required** to run what's built in this pass —
see [docs/ROADMAP.md](./ROADMAP.md).

---

## 2. Supabase project

1. Create an account at [supabase.com](https://supabase.com) and click **New Project**.
2. Pick a name (e.g. `desidiabeticoach`), a strong database password (save it — you'll need it for the CLI), and a region close to your users (spec targets US/Canada, so `us-east-1` or similar).
3. Once the project is provisioned, go to **Project Settings → API** and copy:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → this is `SUPABASE_SERVICE_ROLE_KEY` (never expose this to a client)
4. Install the Supabase CLI and link your project:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref <your-project-ref>   # ref is in the project URL
   ```
5. Push the migrations (creates every table, RLS policy, and the `meal-photos` storage bucket):
   ```bash
   supabase db push --linked
   ```
6. Confirm in **Table Editor** that `user_profiles`, `foods`, `bg_logs`,
   `meal_logs`, `medications`, `a1c_logs`, etc. all exist, and in **Storage**
   that a `meal-photos` bucket exists.
7. **Auth email settings**: Go to **Authentication → Providers** and confirm
   Email is enabled. For magic links / signup confirmation to actually
   deliver in production, go to **Authentication → Email Templates → SMTP
   Settings** and configure a real SMTP provider (Supabase's built-in email
   sender is rate-limited and meant for testing only) — Resend works well
   here if you want to use it beyond the spec's Phase 2 transactional email.

---

## 3. Anthropic API key

1. Create an account at [console.anthropic.com](https://console.anthropic.com).
2. Go to **API Keys → Create Key**. Copy it — this is `ANTHROPIC_API_KEY`.
3. Add a small amount of credit (Settings → Billing) so test calls don't get rejected.
4. Note: the model configured in this codebase (`ANTHROPIC_MODEL`, default
   `claude-sonnet-4-6`) matches what's declared in the project's `CLAUDE.md`.
   If that model id isn't available on your account, check
   [console.anthropic.com](https://console.anthropic.com) for the current
   model list and update `ANTHROPIC_MODEL` in your `.env.local` accordingly.

---

## 4. Local environment setup

From the repo root:

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<from step 2>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from step 2>
SUPABASE_SERVICE_ROLE_KEY=<from step 2>
ANTHROPIC_API_KEY=<from step 3>
ANTHROPIC_MODEL=claude-sonnet-4-6
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Install dependencies and seed the food database:

```bash
npm install
npm run db:seed
```

Run the web app:

```bash
npm run dev:web
```

Visit `http://localhost:3000` — you should be able to sign up, complete
onboarding, log a BG reading, and chat with the coach. See
[docs/GETTING_STARTED.md](./GETTING_STARTED.md) for the full walkthrough.

**Note on local Docker Supabase:** `docker-compose.yml`
(`infrastructure/dev/docker-compose.yml`) exists for a fully offline local
Postgres instance if you'd rather not use a cloud Supabase project for dev.
If you use it, run `npm run dev:db` instead of connecting to a cloud project,
and point `.env.local` at `http://localhost:54321` with the anon/service keys
Supabase's local stack prints on startup. Cloud Supabase (steps above) is
simpler to get started with and is what the rest of this guide assumes.

---

## 5. Deploy the web app (Vercel)

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Create a [Vercel](https://vercel.com) account and **Import Project** from your GitHub repo.
3. Set the **Root Directory** to `apps/web` in the Vercel project settings.
4. Add environment variables (Project Settings → Environment Variables) — same keys as your `.env.local`, plus:
   ```
   NEXT_PUBLIC_APP_URL=https://<your-vercel-domain>.vercel.app
   ```
5. Deploy. Vercel will run `next build` automatically.
6. In Supabase, go to **Authentication → URL Configuration** and add your
   Vercel domain to both **Site URL** and **Redirect URLs**
   (`https://<your-domain>/auth/callback`) so magic-link/signup emails
   redirect correctly in production.

The `.github/workflows/ci-cd.yml` file wires up automated staging/production
deploys on push to `develop`/`main` — it expects `VERCEL_TOKEN`,
`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and Supabase CLI secrets configured as
GitHub Actions secrets. Manual deploys via the Vercel dashboard (above) work
fine without setting that up.

---

## 6. Mobile app — local development

1. Copy the mobile env template:
   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   ```
2. Fill in `apps/mobile/.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=<same as web>
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<same as web>
   EXPO_PUBLIC_API_URL=http://<your-machine's-LAN-IP>:3000
   ```
   Use your computer's LAN IP (e.g. `192.168.1.42`), not `localhost` — your
   phone/simulator is a separate device and can't reach your laptop's
   `localhost`. Find it with `ipconfig` (Windows) or `ifconfig`/`ipconfig
   getifaddr en0` (Mac).
3. Make sure the web app is running (`npm run dev:web`) since mobile calls it as its backend.
4. Start Expo:
   ```bash
   npm run dev:mobile
   ```
5. Scan the QR code with **Expo Go** (iOS/Android) for the fastest loop, or press `i`/`a` in the terminal to open an iOS Simulator / Android Emulator if you have Xcode/Android Studio installed.
   - **Camera scanning requires a physical device or a simulator with camera passthrough** — the iOS Simulator has no real camera; Android Emulator can use your webcam if configured.

---

## 7. Mobile app — building and publishing

### iOS

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) ($99/year).
2. Install the EAS CLI: `npm install -g eas-cli`, then `eas login`.
3. From `apps/mobile`, run `eas build:configure` (creates `eas.json`).
4. Build: `eas build --platform ios --profile preview` (internal testing) or `--profile production`.
5. EAS will prompt to create/reuse an App Store Connect API key and provisioning profile — follow its prompts (it automates most of the Apple Developer portal steps).
6. Create the app record in [App Store Connect](https://appstoreconnect.apple.com) matching `apps/mobile/app.json`'s `ios.bundleIdentifier` (`com.candsillon.desidiabeticoach` — change this to your own if you don't own that identifier).
7. Submit the build to TestFlight: `eas submit --platform ios`.
8. Test via TestFlight, then submit for App Store review from App Store Connect once ready.
   - Apple's health-data review guidelines (§5.1.3) are relevant here — the app's AI coaching disclaimer language (already implemented per spec §5.6.4) should be visible during review; see [spec §15 Q3](../spec/CLAUDE.md).

### Android

1. Create a [Google Play Console](https://play.google.com/console) account ($25 one-time).
2. Create an app matching `apps/mobile/app.json`'s `android.package` (`com.candsillon.desidiabeticoach`).
3. Build: `eas build --platform android --profile preview` (APK for direct testing) or `--profile production` (AAB for Play Store).
4. `eas submit --platform android` to upload to the Play Console.
5. Use an **Internal Testing** track first, then promote to Production once verified.

---

## 8. Environment variable reference

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | root `.env.local` | Also used by `scripts/seed-foods.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | root `.env.local` | Client-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | root `.env.local` | Server-only, never exposed to a browser/app bundle |
| `ANTHROPIC_API_KEY` | root `.env.local` | Server-only — read by `apps/web/src/lib/anthropic.ts` |
| `ANTHROPIC_MODEL` | root `.env.local` | Defaults to `claude-sonnet-4-6` |
| `NEXT_PUBLIC_APP_URL` | root `.env.local` | Used for tRPC's server-side base URL |
| `EXPO_PUBLIC_SUPABASE_URL` | `apps/mobile/.env` | Same Supabase project as web |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `apps/mobile/.env` | Same as web's anon key |
| `EXPO_PUBLIC_API_URL` | `apps/mobile/.env` | Points at the deployed (or LAN-local) web app |

---

## 9. Post-deploy smoke test

1. Sign up on the web app → confirm email → log in → complete onboarding.
2. Log a BG reading on web; confirm it appears on the dashboard chart.
3. Add a medication and mark a dose taken.
4. Search and log a meal manually on web.
5. On mobile (same account): scan a meal photo with the camera → confirm the AI-identified items look reasonable → save.
6. Back on web: confirm the mobile-scanned meal appears in **Log Meal** history with its photo.
7. Chat with the AI coach on both web (should stream) and mobile (single response).
8. Export a CSV from **Reports**.

If every step above works, the deployment is healthy end-to-end.
