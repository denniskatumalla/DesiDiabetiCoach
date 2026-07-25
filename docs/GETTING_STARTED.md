# Getting Started

For account creation and production deployment, see
[docs/DEPLOYMENT.md](./DEPLOYMENT.md). This doc assumes you already have a
Supabase project, an Anthropic API key, and `.env.local` filled in (steps 2–4
of that guide), and just want to run the app locally and try it.

## Run it

```bash
npm install
npm run db:seed        # loads ~54 South Asian foods into the database
npm run dev:web         # http://localhost:3000
```

For mobile, in a second terminal (after copying `apps/mobile/.env.example` to
`apps/mobile/.env` and filling in your LAN IP — see DEPLOYMENT.md §6):

```bash
npm run dev:mobile
```

Scan the QR code with the **Expo Go** app on your phone, or press `i`/`a` for
a simulator (camera scanning needs a physical device or a camera-enabled
emulator).

## Walkthrough

**1. Create an account (web or mobile — either works)**
Go to `/signup`, enter an email and password. Supabase sends a confirmation
email (check the inbox of whatever address you used — or, for local dev
without real SMTP configured, check the Supabase dashboard's Auth logs for
the confirmation link). Confirm, then log in.

**2. Complete onboarding**
You'll land on the onboarding wizard automatically — this happens because
every protected page checks `user_profiles.onboarded_at` and redirects here
until it's set (see `apps/web/src/app/(app)/layout.tsx`). Fill in your
diabetes type, target BG range, and preferences, then submit.

**3. Log a blood glucose reading**
Web: **Log BG** in the sidebar. Mobile: **Log** tab → **Log BG**. Enter a
value and a context (fasting, post-meal, etc.). Try a value under 54 or over
350 to see the safety banner (spec §5.6.4).

**4. Log a meal**
- **On mobile**: **Log** tab → **Scan Meal** → grant camera access → photograph
  any plate of food. Within a few seconds you'll see AI-identified items with
  estimated portions (in katori), carbs, and glycemic load. Items with low
  confidence are flagged for you to double-check. Confirm to save.
- **On web**: go to **Log Meal** and search for a food by name (try "dosa" or
  "sambar") — this is the manual-entry path; the web app deliberately has no
  camera, per the spec's mobile-captures/web-reviews channel split. Any meal
  you scanned on mobile shows up here too, with its photo, read-only.

**5. Check the dashboard**
Web dashboard shows a 7-day BG trend chart, time-in-range, and medication
adherence. Mobile shows the same summary stats plus a simplified list-based
analytics tab.

**6. Talk to the AI coach**
Ask something like *"Is rava dosa better for my blood sugar than plain
dosa?"* or reference a reading you just logged. The coach's context includes
your last 14 days of BG and 7 days of meals (spec §9.2) — try logging a few
data points first to see more grounded responses. Every response ends with
the wellness-guidance disclaimer.

**7. Export your data**
Web → **Reports** → export BG, meal, or medication logs as CSV.

## Common issues

- **"Unauthorized" from the mobile app when calling the API** — check
  `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` points at a reachable host (LAN
  IP, not `localhost`) and that the web app is actually running.
- **Magic link / signup email never arrives** — Supabase's default email
  sender is rate-limited and sometimes delayed; check **Authentication →
  Logs** in the Supabase dashboard for the generated link as a fallback, or
  configure real SMTP (DEPLOYMENT.md §2.7).
- **Food search returns nothing** — you likely skipped `npm run db:seed`.
- **Camera scan fails immediately** — confirm `ANTHROPIC_API_KEY` is set and
  has billing enabled; check the web app's server logs (the terminal running
  `npm run dev:web`) for the actual Anthropic API error.
