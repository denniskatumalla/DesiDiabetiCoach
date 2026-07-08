# DesiDiabetiCoach — Product Requirements Specification

**Owner:** Dennis David Katumalla | Candsillon Technologies
**Version:** 2.1 | **Date:** 2026-07-08
**Status:** Draft — pre-development

---

## 0. Brand Identity

### Logo

**Concept:** A stylized lotus bloom whose petals are formed by a rising health-trend graph line — merging South Asian cultural heritage (the lotus as symbol of purity and resilience) with digital health intelligence. A single saffron droplet sits at the center, evoking both a blood-glucose reading and the bindi — a mark of identity and wellbeing.

**Mark variants:**
- Full lockup: logo mark + wordmark "DesiDiabetiCoach" side-by-side
- Stacked lockup: logo mark above wordmark (for app icons and square placements)
- Icon-only: lotus-graph mark for favicon, app icon, and social avatar

**Primary palette:**

| Token | Hex | Usage |
|---|---|---|
| `--brand-navy` | `#0F2340` | Primary backgrounds, nav bars |
| `--brand-teal` | `#1B8F8A` | Primary interactive, CTAs |
| `--brand-saffron` | `#F59E0B` | Accent, highlights, logo droplet |
| `--brand-white` | `#FAFAFA` | Content backgrounds |
| `--brand-rose` | `#E05A5A` | Alert/danger states |
| `--brand-jade` | `#22C55E` | Success / in-range states |

**Typography:**
- Display / Headings: **Plus Jakarta Sans** (Bold, SemiBold) — modern, rounded, culturally neutral
- Body / UI: **Inter** — highly legible at all sizes, best-in-class screen hinting
- Monospace (data readouts, BG values): **JetBrains Mono** — clear numeric disambiguation

**Logo files to generate:** SVG (master), PNG 512×512, PNG 1024×1024, favicon.ico, iOS 1024×1024 App Store icon, Android 512×512 Play Store icon.

---

### Tagline

> **"Know Your Food. Manage Your Health. In Your Language."**

Secondary tagline (for sub-headings and App Store subtitle):
> *Culturally intelligent diabetes coaching for South Asian communities.*

---

### Mission Statement

DesiDiabetiCoach exists to empower South Asian communities worldwide to take meaningful control of their diabetes — through an AI-powered companion that understands their food, speaks their language, and honours their culture. We believe that managing a chronic condition should not require abandoning the cuisine of your heritage. Our mission is to make world-class diabetes coaching accessible, affordable, and deeply personal for every South Asian household, whether in Houston, Toronto, London, or Hyderabad.

---

## 1. Executive Summary

DesiDiabetiCoach is an AI-powered diabetes management platform built specifically for the South Asian and Indian diaspora. It combines clinical-grade blood glucose and HbA1c tracking with a culturally intelligent food recognition engine that understands idli, dosa, biryani, and hundreds of other South Asian dishes — something generic diabetes apps fundamentally cannot do.

Users log their health data, photograph their meals, and receive personalized coaching from an AI that speaks their language (literally — in English, Telugu, Hindi, Tamil, Punjabi, or Gujarati) and understands their cuisine. The platform generates professional PDF reports patients can email to their endocrinologist and supports care-partner sharing.

The product ships on two channels with deliberately different centers of gravity: the **mobile app** (iOS & Android) is built for on-the-go data capture — photographing meals for AI recognition, logging BG readings, checking off medications — while the **web app** is built for in-depth review — detailed charts, trend analytics, and physician-ready PDF reports. Account creation and social sharing are fully supported on both. There is no separate desktop application; users who want a larger screen use the responsive web app in a browser.

**Subscription:** $14.99/month per user (7-day free trial).

**Target market:** ~5 million South Asian-origin adults living in the US and Canada who have or are at risk for Type 2 diabetes — a population with a 2–4× higher diabetes prevalence than the general population.

---

## 2. Product Vision & Goals

### Vision Statement
Be the most culturally relevant diabetes companion for the South Asian diaspora — an app that knows what a katori of sambar does to your blood sugar and tells you so in your own language.

### Primary Goals
1. Give users accurate, culturally grounded food tracking without requiring manual calorie lookups
2. Surface meaningful trends in blood glucose, medication adherence, and diet
3. Make physician communication easy via polished PDF reports
4. Drive measurable improvement in HbA1c for consistent users
5. Be available where a South Asian household actually needs it — mobile for quick capture, web for deep review

### Key Differentiators

| Feature | DesiDiabetiCoach | mySugr | NutriScan / SNAQ |
|---|---|---|---|
| South Asian food AI recognition | Yes | No | Partial |
| Regional language support (TE, HI, TA, PA, GU) | Yes | No | No |
| Katori / thali-aware portion sizing | Yes | No | No |
| BG + food + medication unified view | Yes | Yes | No |
| Doctor PDF reports | Yes | Yes | No |
| AI coaching in native language | Yes | No | No |
| In-app tutorial & help system | Yes | Partial | No |
| Social sharing with privacy controls | Yes | Partial | No |

---

## 3. Target Users

### Persona 1 — Priya (Primary)
- **Age/Profile:** 52, female, recently diagnosed Type 2, vegetarian, Telugu-speaking
- **Location:** Houston, TX
- **Tech comfort:** Moderate — uses iPhone, WhatsApp daily
- **Primary device:** iPhone (mobile) and home Windows PC (web browser)
- **Pain points:** Generic apps don't recognize her foods; she cooks South Indian meals; calorie databases list only "Indian curry" as a catch-all
- **Goals:** Understand how her diet affects her BG; share reports with her endocrinologist; learn portion control without abandoning her cuisine

### Persona 2 — Raj (Secondary)
- **Age/Profile:** 38, male, Type 1 since age 14, software engineer, Hindi-speaking
- **Location:** Toronto, Canada
- **Tech comfort:** High — expects detailed analytics, API-level thinking
- **Primary device:** MacBook Pro (web browser) and Android phone
- **Pain points:** Wants granular BG data, correlation analysis, and a clean export for his personal spreadsheets
- **Goals:** Time-in-range optimization; integration with his workflow; impress his endo with data

### Persona 3 — Dr. Meena (Downstream User)
- **Age/Profile:** 48, endocrinologist, sees ~400 South Asian patients
- **Pain points:** Patients bring hand-written BG logs or nothing; cannot assess dietary patterns from clinic notes
- **Goals:** Receive a structured, readable 30/90-day report; understand patient's food habits and medication adherence at a glance
- **Interaction with product:** Receives PDF reports by email; may access a read-only web view via physician token (v2)

---

## 4. Platform Strategy & Use Cases

### 4.1 Channel Strategy

DesiDiabetiCoach ships on two channels — **mobile** (iOS & Android) and **web** — each scoped to the job it's best suited for, rather than duplicating every feature identically everywhere:

- **Mobile — "capture."** The camera-driven, on-the-go channel: photographing meals for AI food recognition, logging BG readings, checking off medications, and receiving push reminders. Flows are optimized for speed — a few taps, not a form.
- **Web — "review."** The detailed-analysis channel: the full analytics dashboard, BG/A1C trend charts, correlation panels, PDF physician reports, and CSV export. The web app has **no camera-based meal capture** — it isn't a relevant workflow at a desk or laptop — but it displays the meal photos and AI analysis already captured on mobile.
- **Shared on both:** account creation & onboarding, manual BG/medication/meal logging, AI coaching chat, dashboard summary, and social sharing (progress cards, referrals).

There is **no desktop application**. A native macOS/Windows app would not add capability beyond the responsive web app running in a browser, so it has been cut from scope entirely (see [Section 8](#8-technology-stack) — Tauri and desktop distribution tooling removed).

### 4.2 Supported Platforms

| Platform | Distribution | Primary Input | Key Strengths |
|---|---|---|---|
| **Web** (browser) | Direct URL | Mouse, keyboard | Full analytics, physician reports, onboarding, review on any screen |
| **iOS** (iPhone/iPad) | App Store | Touch, camera | On-the-go logging, AI photo scan, push notifications |
| **Android** (phone/tablet) | Play Store | Touch, camera | On-the-go logging, AI photo scan, push notifications |

**Feature parity matrix:**

| Feature | Web | iOS | Android |
|---|---|---|---|
| Account creation & onboarding | ✓ | ✓ | ✓ |
| BG logging | ✓ | ✓ | ✓ |
| Meal food search (manual) | ✓ | ✓ | ✓ |
| AI photo meal scan (camera capture) | — | ✓ | ✓ |
| View AI-analyzed meals & photos | ✓ | ✓ | ✓ |
| AI coaching chat | ✓ | ✓ | ✓ |
| Dashboard & analytics deep-dive | ✓ | ✓ | ✓ |
| PDF report generation | ✓ | ✓ | ✓ |
| Social sharing | ✓ | ✓ | ✓ |
| Push notifications | Web Push | APNs | FCM |
| Biometric auth | — | Face ID/Touch | Fingerprint |
| Offline mode (read) | — | ✓ | ✓ |

---

### 4.3 Platform-Specific Use Cases

#### Mobile (iOS & Android) — "On the Go"

**UC-M01: Meal Photo at a Restaurant**
Priya is at a South Indian restaurant with family. She opens the app, taps the camera icon, photographs her thali plate. Within 8 seconds the AI identifies: 2 idlis, sambar, coconut chutney, 1 cup rice, rasam, pickle. She adjusts quantities with a tap, logs the meal, and receives an instant GL estimate and coaching tip.

**UC-M02: Fasting BG Log at 7 AM**
Raj wakes up and receives a push notification: "Good morning Raj — time for your fasting BG." He taps it, enters 118 mg/dL, and the app automatically marks it in-range (amber — slightly high). The reading appears on his dashboard chart.

**UC-M03: Medication Reminder**
Priya receives a push notification at 8:00 PM: "Time for your Metformin 500mg." She taps "Taken" directly from the notification without opening the app. The adherence ring on her dashboard updates.

**UC-M04: Post-Meal Spike Alert**
Raj logs a post-meal BG of 240 mg/dL after a biryani dinner. The app shows a red badge and surfaces a coaching insight: "Your post-meal BG is 60 mg/dL above your target. Your last 3 biryani meals have shown similar spikes — try reducing rice by 1 katori and adding a raita side."

**UC-M05: Offline Quick Log**
Priya is in an area with no signal. She taps "Log BG," enters a value, and saves it. The entry is queued locally (SQLite) and syncs when connectivity returns.

**UC-M06: Care Partner Check-In**
Priya's daughter in New York opens the app on her phone with care-partner access. She sees her mother's BG chart for the last 7 days, notes an upward trend, and calls to check in.

**UC-M07: At-Home Meal Logging for an Older User**
Suresh (65, retired) finds mobile typing fiddly but the camera easy. After lunch at his kitchen table he opens the mobile app, taps "Scan Meal Photo," and photographs his plate — the same quick AI scan flow as any mobile user. Later that evening he opens the web app on the family desktop, where the larger screen and keyboard make it easier to review the AI's analysis, add a note, and adjust portions.

---

#### Web Browser — "In-Depth Review"

**UC-W01: Weekly Data Review on Laptop**
Raj sits at his MacBook on Sunday morning and opens the web portal. He reviews his 7-day BG chart, notices a consistent post-dinner spike pattern on Fridays, drills into the analytics screen, and correlates it with biryani meals. He exports a CSV for his personal tracking spreadsheet.

**UC-W02: PDF Report for Physician Appointment**
Before her quarterly endocrinologist visit, Priya opens the web portal on her laptop, selects "Doctor Report — last 90 days," previews the report, and clicks "Email to Dr. Kumar." The PDF arrives in Dr. Kumar's inbox within 30 seconds.

**UC-W03: Onboarding on the Web**
A new user discovers DesiDiabetiCoach via a friend's Instagram share card. They visit the website on their laptop, sign up, complete the onboarding wizard (diabetes type, language, cuisine preference), watch the 2-minute interactive tutorial, and log their first BG reading — all within 10 minutes.

**UC-W04: Admin Support Contact**
Priya encounters a bug where her A1C chart is not loading. She clicks the Help icon, selects "Report a bug," fills in the form with auto-attached device info and a screenshot, and submits. She receives a ticket confirmation email within minutes.

**UC-W05: Documentation / Tutorial Access**
Raj wants to understand how the estimated A1C is calculated. He clicks the "?" icon next to the eA1C value, which opens the in-app help article explaining the ADAG formula, with a link to the full documentation site.

**UC-W06: Detailed Analytics Review**
Raj opens the web app in his browser on his MacBook in the evening. He uses the full-screen analytics dashboard — date pickers, correlation panels, histogram charts — with the keyboard shortcuts he has learned. He adjusts his BG target range and sees the TIR recalculate live.

**UC-W07: Care Partner Daily Check (Web)**
Priya's husband, who does not have a smartphone, opens the web app in his browser to check Priya's shared dashboard every morning as part of his routine.

---

## 5. Feature Modules

### 5.1 Onboarding & Diabetic Profile

**Purpose:** Collect the clinical and personal context that personalizes all downstream features.

**Required fields at signup:**
- Full name, date of birth, gender
- Diabetes type: `Type 1` | `Type 2` | `Pre-diabetes` | `Gestational`
- Year of diagnosis
- Current medications (free-text list; structured med logging is in 5.4)
- Target BG range: fasting (default 80–130 mg/dL), post-meal (default < 180 mg/dL) — overridable per physician guidance
- Language preference: English (default) | Telugu | Hindi | Tamil | Punjabi | Gujarati
- Regional cuisine preference: South Indian | North Indian | Sri Lankan | Bangladeshi | Pakistani | Mixed
- Dietary restrictions: vegetarian | vegan | jain | halal | none
- Units preference: mg/dL (default for US/CA) | mmol/L

**Optional at onboarding (can complete later):**
- Weight, height (BMI calculation)
- A1C target (default < 7%)
- Physician name and email (for report delivery)
- Profile photo

**Profile is editable at any time from Settings.**

---

### 5.2 Blood Glucose (BG) Logging

**Purpose:** Core clinical value — accurate, contextualized BG logging with trend intelligence.

**Entry fields:**
- BG value (mg/dL or mmol/L, respects profile preference)
- Context (required): `fasting` | `pre_meal` | `post_meal` | `bedtime` | `random` | `after_exercise`
- Timestamp (defaults to now; editable)
- Optional note (free text, max 200 chars)
- Optional: link to a meal log entry (auto-suggested if meal was logged within ±2h)

**Display & intelligence:**
- Inline color coding: green (in range) / amber (slightly out of range) / red (significantly out of range), calibrated to user's target BG
- Trend arrows on the log screen: ↑ rising / → stable / ↓ falling, calculated from last 2–3 readings of same context
- **Time-in-Range (TIR):** daily and weekly % of readings within target, displayed on dashboard (see 5.7)
- Estimated average glucose (eAG) from last 30/90 days

**BG log list view:**
- Grouped by day, reverse chronological
- Filter by context, date range
- Inline edit and delete (with confirmation)

---

### 5.3 HbA1c / A1C Tracking

**Purpose:** Track the primary long-term diabetes control metric.

**Manual A1C entry:**
- Date of lab test
- A1C percentage value (3.0–15.0%)
- Optional: lab name, note

**Estimated A1C:**
- Computed from BG logs using the ADAG formula: `eA1C = (46.7 + eAG) / 28.7` where eAG is the 90-day average BG in mg/dL
- Displayed as a secondary figure alongside lab-confirmed A1C
- Labeled clearly: "Estimated — not a substitute for a lab test" — tapping the label opens the help article explaining the formula

**Visuals:**
- A1C history table (date, value, source: lab vs. estimated)
- Line chart: A1C over last 12 months with target line
- Progress indicator: distance from user's A1C goal

---

### 5.4 Medication Management

**Purpose:** Track medications and adherence, akin to mySugr's medication logging.

**Medication setup:**
- Add medication: name (free text with autocomplete from common list), dose, unit (mg / units / mcg), frequency (once/twice/three times daily, with meals, at bedtime, as needed), start date
- Common medication autocomplete includes: Metformin, Glipizide, Januvia, Ozempic, Victoza, Trulicity, Jardiance, Farxiga, NPH insulin, Lantus, Humalog, Novolog, Tresiba, and others
- Flag insulin entries: prompts for units and injection site (optional log)
- Edit, pause, discontinue medications (preserves history)

**Adherence logging:**
- Each scheduled dose appears as a checklist item at the appropriate time
- Mark: taken / skipped / taken late
- If taken late: log actual time
- Optional note per dose

**Alerts:**
- Push notification at scheduled dose times (configurable lead time: on time / 15 min early)
- Snooze: 15 / 30 / 60 min
- Missed dose: notification if not logged within 2h of scheduled time
- Streak tracking: consecutive days of full adherence; shown on dashboard

**Adherence view:**
- Calendar heatmap: green (full adherence) / amber (partial) / red (missed) per day
- Per-medication adherence % for last 30/90 days

---

### 5.5 Food & Calorie Tracking (AI Photo Scan)

**Purpose:** Eliminate the friction of manual calorie lookup by using AI vision to identify South Asian foods from photos.

#### 5.5.1 Photo Capture

**Mobile-only.** AI photo meal scanning is a mobile capability (iOS & Android) — it is the primary "capture" surface for the product. The web app does not expose a camera or file-upload meal-scan flow; it instead displays the photo and AI analysis after the meal has been logged on mobile (see 5.5.3).

- Camera capture (preferred) or gallery upload, via Expo Camera
- Maximum image size: 10 MB; compressed client-side to ~2 MB before upload
- Stored in Supabase Storage; URL saved to `meal_logs.photo_url`

#### 5.5.2 AI Food Recognition
- Model: Claude claude-sonnet-4-6 (multimodal vision)
- The model receives the image + a structured system prompt that:
  - Lists common South Asian foods with GI/GL context
  - Instructs output as JSON: `[{ name, regional_name, estimated_grams, estimated_katori, calories, carbs_g, gi_score, gl_score, confidence }]`
  - Requests identification of all distinct items visible in the image
- **Thali mode:** automatically triggered when multiple dishes detected in a single plate/tray image; each component logged as a separate `meal_item`
- **Confidence threshold:** if any item's `confidence < 0.70`, the app surfaces the top 3 candidates for that item and asks the user to confirm
- Processing time target: < 8 seconds on a 4G connection

**Recognized food categories (non-exhaustive):**

| Category | Examples |
|---|---|
| Breakfast | Idli, dosa (plain, masala, rava), uttapam, upma, poha, paratha, puri |
| Rice dishes | Plain rice, biryani (veg/chicken/mutton), pulao, lemon rice, curd rice |
| Breads | Roti, chapati, naan, bhatura, puri, parotta |
| Curries (veg) | Dal (toor/chana/moong), sambar, rasam, palak paneer, chole, rajma, aviyal |
| Curries (non-veg) | Chicken curry, butter chicken, fish curry, egg curry, prawn masala |
| Snacks | Samosa, vada, pakora, bhajji, murukku, mixture |
| Chutneys & sides | Coconut chutney, tomato chutney, pickle, raita, pappadam |
| Desserts | Gulab jamun, halwa, kheer, ladoo, barfi |
| Drinks | Lassi, chai (with milk), buttermilk (chaas) |

#### 5.5.3 Meal Log Entry
After AI analysis (or manual search), a meal log entry records:
- Meal time and type: `breakfast` | `lunch` | `dinner` | `snack`
- One or more food items, each with: food reference, quantity (g and katori), calories, carbs, GI, GL
- Total meal: calories, carbs, estimated GL (sum of item GLs)
- Photo (if taken)
- Note (optional)
- Linked BG log (auto-suggested: post-meal BG within 2h)

#### 5.5.4 Manual Food Search Fallback
- Search the South Asian food database by name (English or regional language)
- Results show: food name, serving size options, nutrition per katori
- User selects quantity (slider or number input in katori / grams)
- Can add custom foods not in database (stored per-user)

#### 5.5.5 Portion Control Feedback
After each meal log with a photo, the AI coaching engine (5.6) evaluates:
- Total GL relative to user's diabetic profile
- Whether any item is a known BG spike risk
- Whether portion sizes appear large relative to standard katori sizing in the photo
- Generates an inline tip: e.g., "This meal has a high glycemic load. Try reducing the rice portion by half a katori and adding more dal."

---

### 5.6 AI Coaching & Insights

**Purpose:** Deliver personalized, culturally sensitive dietary and lifestyle guidance powered by Claude.

#### 5.6.1 Coaching Chat Interface
- Persistent conversational UI (chat bubbles, web and mobile)
- History stored in `ai_conversations` table as JSONB `messages[]`
- User can ask free-form questions: "Is rava dosa better for my blood sugar than plain dosa?" or "My BG was 220 after lunch — what should I do?"
- Coach replies in user's preferred language (Claude handles multilingual output natively)

#### 5.6.2 Context Sent to Claude
Each coaching API call includes a structured context block (never raw PHI — anonymized to session):
- Diabetes type and A1C target
- Last 14 days of BG readings (values + contexts)
- Last 7 days of meal logs (food names, quantities, total GL)
- Current active medications (names and timing only — no sensitive identifiers)
- User's dietary restrictions and cuisine preference
- Any photo from the most recent meal (if coaching request follows a meal scan)

#### 5.6.3 Proactive Insights
System-generated insights surfaced on the dashboard (not user-initiated chat):
- "Your post-dinner BG has averaged 210 mg/dL this week — 3 of 5 dinners included biryani. Consider reducing portion or pairing with raita."
- "You've missed your metformin 3 times this week. Consistent timing improves effectiveness."
- "Your time-in-range dropped from 68% to 51% this week — your coach has a suggestion." (taps into chat)

Proactive insights run on a daily schedule (server-side, triggered after midnight in user's timezone).

#### 5.6.4 Coaching Guardrails
- Every AI response includes a standard footer: "This is general wellness guidance, not medical advice. Consult your physician before changing your treatment plan."
- Coach never adjusts insulin dosing recommendations — defers to physician
- Abnormal BG values (< 54 or > 350 mg/dL) trigger a safety banner: "This reading is outside safe range — contact your healthcare provider or seek emergency care if symptomatic."

---

### 5.7 Trend Tracking & Dashboard

**Purpose:** Give users and their physicians a clear visual summary of health status.

#### Dashboard — Web (full-width layout)
- **Header row:** Today's last BG | Today's TIR (if 3+ readings) | Streak (medication adherence days) | Calories today
- **BG chart:** 7-day line chart; one line per context type (fasting, post-meal); target range shown as shaded band
- **30-day BG summary card:** average, high, low, TIR%
- **A1C card:** last lab value + estimated A1C + trend arrow
- **Meal GL chart:** 7-day bar chart (daily total GL); color-coded vs. daily target
- **Medication adherence ring:** % for last 30 days, broken down by medication
- **Correlation panel:** last 5 meals with their post-meal BG (2h after); sortable by GL or BG spike

#### Dashboard — Mobile (scrollable cards)
Same data, optimized for single-column layout. Cards can be reordered by user.

#### Analytics Deep-Dive (separate screen)
- Date range picker (7 / 14 / 30 / 90 days, custom)
- BG distribution histogram (how many readings in each 10 mg/dL bucket)
- Time-of-day heatmap: BG by hour of day across selected period
- Food-to-BG correlation: select a food, see average post-meal BG when that food was logged
- Export data as CSV (all BG logs, meal logs, medication logs)

---

### 5.8 PDF Report Generation

**Purpose:** Professional reports patients can email to their physician or print for clinic visits.

#### Doctor Report (recommended)
One-page summary optimized for a 5-minute physician review:
- Patient name, DOB, diabetes type, A1C goal
- Reporting period (30 or 90 days, user selects)
- **BG Summary table:** avg fasting, avg post-meal, TIR%, # readings
- **A1C trend chart** (last 3–4 values)
- **Medication list** with adherence % per medication
- **Meal pattern summary:** top 10 most-logged foods, average daily GL, flagged high-GL meals
- **AI Coaching Notes:** 3–5 key observations from the coaching engine (auto-generated)
- **Footer:** "Generated by DesiDiabetiCoach. Not a substitute for clinical assessment."

#### Personal Report (full export)
Multi-page detailed export:
- All BG logs in tabular form
- All meal logs with food items and nutrition
- Medication log calendar
- All charts from the dashboard at high resolution

#### Report Delivery
- Download as PDF (all platforms)
- Email via Resend to user's physician email (stored in profile)
- Share sheet (iOS/Android native share; web: browser share/download)
- All reports branded with DesiDiabetiCoach logo and color scheme

#### Report Generation SLA
- 30-day Doctor Report: < 10 seconds
- 90-day Doctor Report: < 20 seconds
- Full personal export: < 30 seconds

---

### 5.9 Social Sharing & Community Features

**Purpose:** Enable users to share progress milestones in a privacy-safe, socially engaging way that builds community and brand awareness.

#### 5.9.1 Progress Share Cards
- Generate a branded image card (PNG, 1080×1080 for Instagram / 1200×628 for Facebook/X/LinkedIn)
- Card templates:
  - **Milestone card:** "I've logged 30 consecutive days with DesiDiabetiCoach 🌿" + streak badge + brand lockup
  - **TIR card:** "My time-in-range this week: 74% — personal best! 💚" + bar graphic + brand lockup
  - **HbA1c card:** "My A1C improved from 8.1% to 7.4% in 90 days 🎉" + simple trend line + brand lockup
  - **Challenge card:** "I'm on Day 7 of the 30-Day Desi Wellness Challenge" + progress ring
- **Privacy guardrails on share cards:** Never includes raw BG values, medication details, food logs, or identifiable health data — only aggregate wellness milestones
- User can add a personal caption before sharing
- One-tap sharing to: Instagram, Facebook, X (Twitter), WhatsApp, LinkedIn, iMessage, or copy link

#### 5.9.2 Native Platform Share Integration
- iOS/Android: native `Share` sheet — exposes to any installed app (WhatsApp, Gmail, etc.)
- Web: Web Share API (where supported) with clipboard fallback + direct social deep-links
- Share URL format: `app.desidiabeticoach.com/share/{token}` — opens a public, read-only, data-safe preview page with app download CTA

#### 5.9.3 Referral Sharing
- "Invite a Friend" generates a personal referral link
- Referred user gets 14-day free trial (instead of standard 7 days)
- Referring user earns 1 free month when referral converts to paid — tracked via `referrals` table
- Referral share card: "Join me on DesiDiabetiCoach — it actually knows what idli is!" + referral link

#### 5.9.4 App Store / Social Reviews Prompt
- After 30 days of consistent usage (≥ 3 logs/week), prompt user to rate the app
- Satisfied users (4–5 stars) directed to App Store / Play Store rating
- Dissatisfied users (1–3 stars) directed to in-app feedback form (not public review) — giving the team a chance to fix the issue first

#### 5.9.5 Wellness Challenge Program (v1.1)
- Monthly themed challenges (e.g., "30-Day Fasting BG Challenge", "7-Day No Sugar Chai Challenge")
- Users opt-in per challenge; progress tracked against challenge criteria
- Completion awards a shareable badge + in-app trophy
- Leaderboard (opt-in, anonymous): rank among challenge participants

---

### 5.10 Customer Support & Admin Communication

**Purpose:** Provide users with responsive, traceable support channels and give the Candsillon Technologies team actionable feedback.

#### 5.10.1 In-App Support Chat
- Powered by **Chatwoot** (open source, self-hosted) — embedded widget available on all platforms
- First response: AI-assisted (Claude) triage bot that:
  - Answers common questions from the help article knowledge base
  - Escalates to a human agent if the issue is not resolved within 2 exchanges or user requests it
- Human agent queue: Candsillon support staff notified via Chatwoot web dashboard
- SLA: first human response within 8 business hours
- Chat history stored in Chatwoot (not in user health data tables)

#### 5.10.2 Bug & Issue Reporting
- "Report a Bug" form accessible from: Help menu → Report a Problem
- Auto-attached to submission:
  - Platform and OS version
  - App version
  - Last 5 actions (anonymized event log — no health data)
  - Optional: user-attached screenshot
- Submitted to **Linear** (issue tracker) via API; user receives email confirmation with ticket ID
- User can check ticket status from Settings → My Support Requests

#### 5.10.3 Feature Request / Feedback Portal
- "Suggest a Feature" opens an in-app form → submitted to a Chatwoot inbox tagged "feature-request"
- Monthly digest of top-voted requests sent to product team (Dennis + team)
- Top requests surfaced anonymously in a public "What We're Building" page within the docs site

#### 5.10.4 Usability / NPS Survey
- Net Promoter Score (NPS) survey prompted quarterly (via in-app modal, not push)
- Open-text follow-up: "What's the one thing that would make DesiDiabetiCoach better for you?"
- Results aggregated in **Plausible Analytics** dashboard (open source, privacy-preserving)
- NPS responses that include contact consent forwarded to support team for follow-up call option

#### 5.10.5 Admin Notification Channels
The Candsillon team receives alerts via:
- **Chatwoot**: all in-app chat conversations and bug reports
- **Email**: new bug reports (Linear webhook → team email)
- **Slack** (internal): P0/P1 critical bug alerts, payment failures, AI safety flag triggers
- **Plausible**: usage analytics dashboard (no PII)

#### 5.10.6 Status Page
- Public status page at `status.desidiabeticoach.com` (hosted via **Instatus** or **Upptime**, open source)
- Monitors: web app availability, API response times, AI coaching response time, database uptime
- Users can subscribe to status updates via email or RSS
- Linked from the app's Help menu and support chat widget

---

### 5.11 In-App Documentation & Tutorial System

**Purpose:** Reduce friction at onboarding and ensure users can self-serve answers at any time, on any platform.

#### 5.11.1 Interactive Onboarding Tutorial
Triggered automatically after the user completes the signup form (skippable, resumable):

| Step | Content | Interaction |
|---|---|---|
| 1 | Welcome to DesiDiabetiCoach — what you can do here | 30-second animated intro, auto-plays with audio off |
| 2 | Your Dashboard — what each card means | Tooltip overlay on dashboard, user taps each card to learn |
| 3 | Log your first BG reading | Guided form fill — auto-opens BG entry, validates input |
| 4 | Scan your first meal | Walks through camera → scan → review → save flow |
| 5 | Meet your AI Coach | Opens coaching chat with a pre-filled starter question |
| 6 | Set up medication reminders | Guides through adding first medication |
| 7 | Done! Earn your "First Week" badge | Completion screen with share prompt |

Tutorial progress stored in `user_profiles.tutorial_progress` (JSONB). Partially completed tutorials resume from last step.

#### 5.11.2 Contextual Help (In-App)
- Every screen has a **"?" help icon** in the top-right corner — opens a context-aware help article drawer
- Complex fields (eA1C, GL score, TIR%) show an inline "ⓘ" icon; tapping opens a one-paragraph explanation
- Explanation cards link to the full article in the documentation site
- Medical abbreviations (eAG, HbA1c, GL) have a glossary tooltip on first use per session

#### 5.11.3 Documentation Site
**URL:** `docs.desidiabeticoach.com`

**Technology:** [Docusaurus 3](https://docusaurus.io) (open source, React-based) — hosted on Vercel. Source in `docs/` folder of this repo.

**Documentation structure:**

```
docs.desidiabeticoach.com/
├── Getting Started
│   ├── Creating Your Account
│   ├── Setting Up Your Diabetic Profile
│   ├── Understanding Your Dashboard
│   └── Quick Start Tutorial (5 minutes)
├── Features
│   ├── Blood Glucose Logging
│   ├── Meal & Food Tracking
│   │   ├── Using AI Photo Scan
│   │   ├── Manual Food Search
│   │   └── Understanding GI & GL Scores
│   ├── Medication Management
│   ├── AI Coaching Chat
│   ├── Reports & Sharing
│   └── Analytics Deep-Dive
├── Platform Guides
│   ├── Using on iPhone & iPad
│   ├── Using on Android
│   └── Using in Your Browser
├── Understanding Your Data
│   ├── What is HbA1c?
│   ├── Time-in-Range Explained
│   ├── Glycemic Index & Glycemic Load
│   └── Reading Your Doctor Report
├── South Asian Food Guide
│   ├── South Indian Foods & Diabetes
│   ├── North Indian Foods & Diabetes
│   ├── Smart Substitutions (lower-GI alternatives)
│   └── Katori — Your Standard Portion Unit
├── Privacy & Security
│   ├── What Data We Collect
│   ├── How Your Data is Used with AI
│   └── Deleting Your Account
├── Troubleshooting
│   ├── Photo Scan Issues
│   ├── Sync Problems
│   └── Notification Setup
└── Changelog
```

**Localization:** Documentation site available in English (v1). High-demand articles translated to Hindi and Telugu in v1.1.

**In-app links to docs:** Every contextual help drawer includes a "Read full article →" link that deep-links to the corresponding docs page. On mobile, the docs site opens in an in-app browser (not leaving the app).

#### 5.11.4 Video Tutorials
- 5–8 short video tutorials (2–4 minutes each) embedded in the documentation site and in-app help drawer
- Hosted on YouTube (unlisted playlist) and embedded via the `react-youtube` component
- Captions in English; Hindi and Telugu captions added in v1.1
- Topics:
  1. Getting Started with DesiDiabetiCoach (2 min overview)
  2. How to Log Blood Glucose
  3. AI Meal Photo Scan — Step by Step
  4. Setting Up Medication Reminders
  5. Reading Your Doctor PDF Report
  6. Using the AI Coach Chat
  7. Sharing Progress with Care Partners

#### 5.11.5 FAQ & Glossary
- Searchable FAQ at `docs.desidiabeticoach.com/faq`
- Full glossary of medical terms, food terms (katori, thali, GI, GL, eAG, TIR, HbA1c), and app terms
- Glossary terms are hyperlinked throughout documentation

---

### 5.12 Notifications & Reminders

All notifications are configurable per user. Default schedule is shown below.

| Notification | Default timing | Configurable? | Channel |
|---|---|---|---|
| BG log reminder — fasting | 7:30 AM | Yes (time) | Push + in-app |
| BG log reminder — post-breakfast | 10:00 AM (2h after typical breakfast) | Yes | Push + in-app |
| BG log reminder — post-dinner | 9:00 PM | Yes | Push + in-app |
| BG log reminder — bedtime | 10:30 PM | Yes | Push + in-app |
| Medication reminder | Per medication schedule | Yes | Push + in-app |
| Missed dose alert | 2h after scheduled time | Yes | Push only |
| Monthly A1C reminder | 1st of each month | Yes | Push + email |
| Trend alert (3 consecutive high readings) | Triggered | Read-only | In-app banner |
| Low BG safety alert (< user threshold) | Triggered | Threshold only | Push (urgent) |
| Weekly progress summary | Sunday 9 AM | Yes | Push + email |

**Push notification infrastructure:**
- Mobile iOS: APNs via Expo Notifications
- Mobile Android: FCM via Expo Notifications
- Web: Web Push API (Service Worker)

---

## 6. User Interface Design System

### 6.1 Design Philosophy

The DesiDiabetiCoach UI is inspired by the best practices from leading digital health and AI product companies:

- **[Marcus Medical](https://www.marcusmedical.com):** Clinical trustworthiness, structured data layouts, authoritative typography — the UI must feel like a tool a physician would trust
- **[creative.navy](https://creative.navy):** Bold visual confidence, generous whitespace, purposeful use of dark backgrounds for high-impact moments (onboarding hero, coaching interface)
- **[Vergo](https://www.getvergo.com):** Clean SaaS dashboard architecture, left-nav navigation model, data cards with clear hierarchy, CTA prominence without aggressiveness
- **[Jasper AI](https://www.jasper.ai):** AI-forward interaction design, conversational UI patterns, gradient accents that signal intelligence without being clinical

**Design principles:**
1. **Cultural warmth without kitsch** — saffron and teal carry cultural resonance; they must never look like clipart
2. **Data as clarity** — numbers are the product; charts must be immediately legible, not decorative
3. **Respect for the user's time** — every interaction should complete in 3 taps/clicks or fewer
4. **Accessible for all ages** — the primary audience includes users 50+; font sizes, touch targets, and contrast are non-negotiable
5. **Delight at milestones** — subtle micro-animations (confetti, badge pop-ins) at achievements; no gratuitous animation in the data flow
6. **Dynamic and responsive everywhere** — the web app and mobile app must adapt fluidly to any screen size, orientation, or window dimension; no fixed-width layouts, no horizontal scroll, no layout breaks between breakpoints; content reflows gracefully as the viewport changes

---

### 6.2 Navigation Architecture

#### Web Navigation
```
Left sidebar (collapsible, 240px expanded / 64px icon-only):
├── [Logo / Home]
├── Dashboard               (house icon)
├── Log BG                  (drop icon)
├── Log Meal                (fork icon — manual search only, no camera)
├── Medications             (pill icon)
├── Analytics               (chart icon)
├── AI Coach                (chat bubble icon)
├── Reports                 (document icon)
├── ──────────────────
├── Help & Docs             (question mark)
└── Settings / Profile      (avatar)
```
- Active state: teal left border + teal icon + bold label
- Hover state: navy-10% background tint
- Sidebar collapses to icon-only on tablet breakpoint; auto-reopens on wide (desktop-size) browser windows

#### Mobile Navigation
```
Bottom tab bar (5 tabs, always visible):
[ Dashboard ] [ Log ] [ AI Coach ] [ Analytics ] [ Settings ]
```
- "Log" tab opens an action sheet: "Log BG" / "Scan Meal" (camera) / "Log Medication"
- Tab active state: teal icon + label; inactive: grey
- FAB (floating action button) alternative on Android: teal circle "+" for quick log

---

### 6.3 Component Library & Design Tokens

**Component library base:** [shadcn/ui](https://ui.shadcn.com) (open source, Radix UI primitives + Tailwind) — customized with DesiDiabetiCoach design tokens.

**Key design tokens (CSS custom properties):**
```css
--radius: 12px;                     /* card border radius */
--radius-sm: 8px;                   /* button/input radius */
--shadow-card: 0 2px 12px rgba(15,35,64,0.08);
--transition-fast: 150ms ease-out;
--transition-standard: 250ms ease-out;
```

**Data visualization library:** [Recharts](https://recharts.org) (open source, React) — customized with brand palette.

**Chart style standards:**
- BG line charts: teal line, saffron target-range band, navy grid lines at 15% opacity
- Bar charts: teal fill for current period, navy-20% for prior period comparison
- Heatmaps: jade (best) → teal → saffron → rose (worst) continuous scale
- All charts include a text summary beneath for screen reader and PDF compatibility

---

### 6.4 Key Screen Design Patterns

#### Dashboard Card
```
┌─────────────────────────────────────────┐
│ BG Today                        [ⓘ]  │  ← saffron badge on unread insight
│ ─────────────────────────────────────── │
│  118 mg/dL  → Stable           🟢       │  ← large bold number, color indicator
│  Last reading: 1h ago                   │
│  7-day avg: 124 mg/dL                   │
│                                         │
│  [View BG Log]                          │  ← ghost button, teal text
└─────────────────────────────────────────┘
```
- Card shadow on white: `--shadow-card`
- Section title: Inter 13px, uppercase, letter-spacing 0.08em, navy-40% color
- Primary value: Plus Jakarta Sans 36px Bold, navy
- Trend: Inter 14px Medium, color-coded
- CTA: 14px, teal, underline on hover

#### Log Entry Form
- One primary action per screen; progressive disclosure (advanced options collapsed)
- Large, finger-friendly input fields (min height 48px)
- Numeric keyboard auto-invoked for BG value entry
- Save button: full-width teal, bottom of screen on mobile; right-aligned on desktop

#### Coaching Chat
- User messages: right-aligned, teal bubble
- AI responses: left-aligned, white card with navy-2% background, subtle top-left border radius removed to simulate chat style
- AI avatar: lotus logo mark, 32px circle
- Coaching footer disclaimer: Inter 11px, navy-40%, always visible below the message

---

### 6.5 Motion & Micro-interaction Guidelines

- **Page transitions:** Fade + slide-up (200ms) — conveys forward movement
- **Data loading:** Skeleton screens (not spinners) for charts and tables — prevents layout shift
- **Success states:** Inline checkmark animation (green, 300ms spring) on log save
- **Achievement unlock:** Confetti burst (canvas animation, 800ms, self-cleaning) + haptic feedback on mobile
- **Error states:** Shake animation (400ms) on invalid input field; never red screen flash
- **Tab bar:** Icon scales up 10% on press (mobile); transition: 100ms spring

---

### 6.6 Accessibility Standards

- WCAG 2.1 Level AA compliance target
- All interactive elements keyboard-accessible; visible focus ring (2px teal outline)
- Screen reader support: semantic HTML, ARIA labels on all custom components, roles on charts
- Color is never the only differentiator: patterns + icons + labels supplement color for BG status
- Minimum tap target: 44×44px on mobile; 32×32px on desktop with keyboard fallback
- Font size: user-adjustable in-app (small / medium / large / extra-large)
- Dark mode: supported on all platforms; follows system preference, overridable in settings
- Reduced motion: respects `prefers-reduced-motion`; disables confetti and slide animations

---

## 7. Non-Functional Requirements

### 7.1 Security & Privacy

**Encryption:**
- Data at rest: AES-256 (Supabase managed)
- Data in transit: TLS 1.3 minimum
- Meal photos encrypted in Supabase Storage with per-user bucket ACLs

**Authentication:**
- Supabase Auth (email/password + magic link)
- MFA available (TOTP authenticator app) — optional for users, recommended prompt shown
- OAuth: Google Sign-In (mobile and web), Sign in with Apple (iOS required)
- Biometric unlock: Face ID / Touch ID (iOS), Fingerprint (Android) — unlocks app without re-entering password
- Session management: 15-minute idle timeout on web; 30-minute idle timeout on mobile
- Refresh tokens rotated on each use

**Authorization:**
- Row-Level Security (RLS) on all user tables — enforced at database level, not application layer
- `foods` table is public read (no RLS)
- Service role key never exposed to client; only used in server-side API routes

**AI data handling:**
- No raw PII sent to Claude API — context is anonymized (no name, DOB, or email in prompts)
- AI conversation history stored in user's own row in `ai_conversations`
- Anthropic API calls go through a server-side tRPC route, never directly from client

**Compliance:**
- CCPA: right to erasure (account deletion wipes all user rows, cascades via FK constraints), data portability via export
- PIPEDA (Canada): same data rights as CCPA
- Terms of Service and Privacy Policy acceptance required at onboarding; version-tracked

**Audit logging:**
- Server logs all data access events (user ID, action, timestamp, IP) in a non-user-accessible audit table
- Logs retained 90 days, then purged

**Vulnerability management:**
- Dependabot alerts monitored weekly
- No secrets in source code — all via environment variables
- `.env.production` never committed (enforced in `.gitignore`)

---

### 7.2 Performance Targets

| Operation | Target | Measurement |
|---|---|---|
| Web — Time to Interactive | < 2.5s | Lighthouse on 4G throttle |
| Mobile — cold start to home screen | < 3s | Expo performance profiler |
| BG log entry to confirmation | < 500ms | p95 API response |
| AI food photo analysis | < 8s | p95 end-to-end (photo upload + Claude response) |
| Dashboard chart render (90-day data) | < 500ms | Browser paint timing |
| PDF generation (30-day) | < 10s | Server-side render time |
| PDF generation (90-day) | < 20s | Server-side render time |
| Share card generation | < 2s | Server-side PNG render |
| Docs site page load | < 1.5s | Lighthouse (static site) |

---

### 7.3 Dynamic & Responsive Design Requirements

The web application and mobile application must be **fully dynamic and responsive** — adapting fluidly to any viewport, window size, device orientation, or font-scale setting without breaking layout or losing functionality.

#### Responsive Behaviour — Web

**Breakpoints (Tailwind CSS):**

| Breakpoint | Range | Layout |
|---|---|---|
| `xs` | 320px–479px | Single column; bottom tab bar replaces sidebar |
| `sm` | 480px–767px | Single column; bottom tab bar; wider cards |
| `md` | 768px–1023px | Two-column; top nav; sidebar hidden (hamburger menu) |
| `lg` | 1024px–1279px | Two-column + collapsed sidebar (icon-only) |
| `xl` | 1280px–1535px | Full sidebar (240px) + content area |
| `2xl` | 1536px+ | Full sidebar + content max-width 1400px, centred |

**Fluid layout rules:**
- No hardcoded pixel widths on content containers — use `max-w-*` + `w-full`
- All charts resize dynamically via `ResponsiveContainer` (Recharts) — never clip or overflow
- Dashboard cards reflow from 3-column grid (`xl`) → 2-column (`md`) → 1-column (`sm`) automatically
- Tables switch to a card/list view below the `md` breakpoint (no horizontal scroll on health data tables)
- Navigation sidebar collapses to icon-only at `lg`, hides entirely below `md` (hamburger + slide-in drawer)
- Images and meal photos use `aspect-ratio` + `object-fit: cover` — never stretch or overflow
- PDF report generation uses a fixed 816px (letter) canvas on the server — unaffected by viewport

**Orientation support (web):**
- Landscape and portrait orientations fully supported at all breakpoints
- Dashboard charts reorder vertically in portrait; expand horizontally in landscape on tablet

#### Responsive Behaviour — Mobile (iOS & Android)

- **Fluid layouts only** — all screens use percentage-based or flex/grid sizing; no fixed-pixel widths
- **Dynamic Type support (iOS):** all text sizes scale with the user's system font-size setting (`accessibilityLargeText`); layouts reflow to accommodate larger text without clipping
- **Android font scaling:** all `sp`-unit text scales correctly; minimum contrast maintained at all scale levels
- **Orientation:** portrait is the primary orientation; landscape is supported on all screens with chart-optimised horizontal layout
- **Safe areas:** all UI respects `SafeAreaView` / `useSafeAreaInsets` — no content hidden behind notches, home indicators, or camera punch-holes
- **Foldable devices:** tested on Samsung Galaxy Z Fold; app adapts to inner and outer display dimensions

#### Dynamic Content Requirements

Beyond layout responsiveness, all data-driven content must update dynamically without requiring a page reload:

- **Real-time dashboard refresh:** BG chart, TIR badge, and adherence ring update automatically when a new log is saved (optimistic UI update via Zustand + tRPC `useMutation` → `invalidateQueries`)
- **Live coaching chat:** messages stream character-by-character using the Anthropic streaming API (`stream: true`) — no spinner wait for full response
- **Notification badges:** unread insight count in the nav updates without refresh via Supabase Realtime subscription
- **Subscription status:** plan badge (Trial / Active / Expired) updates in real time via Stripe/RevenueCat webhook → Supabase Realtime
- **Sync indicator:** a subtle sync status bar ("Syncing…" / "Up to date") appears when the app detects connectivity restoration after offline use

#### Platform Targets

**Mobile minimum OS:**
- iOS: 16.0 or later
- Android: 10 (API level 29) or later

---

### 7.4 Localization

**Supported languages (v1):**

| Code | Language | Script |
|---|---|---|
| en | English | Latin |
| te | Telugu | Telugu |
| hi | Hindi | Devanagari |
| ta | Tamil | Tamil |
| pa | Punjabi | Gurmukhi |
| gu | Gujarati | Gujarati |

**Localization scope:**
- All UI strings use i18n keys (no hardcoded user-facing text)
- Food names shown in English + regional transliteration in the selected language
- AI coaching responses generated in the user's selected language by Claude
- PDF reports generated in English only (v1) — physician audience
- Documentation site: English (v1); Hindi + Telugu in v1.1
- Date/time format follows user locale (US: MM/DD/YYYY; CA: YYYY-MM-DD option)

**RTL:** Not required in v1 — all supported languages are left-to-right.

---

## 8. Technology Stack

### 8.1 Technology Principles

All technology choices must satisfy: **stable** (production-proven, not experimental), **secure** (minimal attack surface, active security patches), and **open source** (auditable, no vendor lock-in for core infrastructure).

---

### 8.2 Full Stack

| Layer | Technology | Version | License | Rationale |
|---|---|---|---|---|
| Web frontend | [Next.js](https://nextjs.org) | 14 (App Router) | MIT | Production-proven React framework; excellent SSR/SSG |
| Mobile | [Expo](https://expo.dev) | SDK 51 | MIT | Best-in-class React Native toolchain; managed updates |
| Styling | [Tailwind CSS](https://tailwindcss.com) | 3.x | MIT | Utility-first; eliminates CSS drift |
| UI Components | [shadcn/ui](https://ui.shadcn.com) | latest | MIT | Accessible, headless Radix primitives + Tailwind |
| Charts | [Recharts](https://recharts.org) | 2.x | MIT | React-native charts; full SVG output for PDF |
| State management | [Zustand](https://zustand-demo.pmnd.rs) | 4.x | MIT | Minimal, type-safe, no boilerplate |
| API layer | [tRPC](https://trpc.io) | 11.x | MIT | End-to-end type safety; Zod-validated |
| Validation | [Zod](https://zod.dev) | 3.x | MIT | Type-safe schema validation |
| Authentication | [Supabase Auth](https://supabase.com/auth) | 2.x | Apache 2.0 | Integrated with DB; RLS; OAuth |
| Database | [PostgreSQL](https://www.postgresql.org) via Supabase | 15 | PostgreSQL License | Proven, open source RDBMS |
| ORM / Query | [Supabase JS](https://github.com/supabase/supabase-js) | 2.x | MIT | Type-safe queries; integrates with RLS |
| Storage | Supabase Storage | — | Apache 2.0 | S3-compatible; per-user buckets |
| AI | [Anthropic Claude API](https://console.anthropic.com) | claude-sonnet-4-6 | Commercial | Best multimodal + multilingual model for this use case |
| Email | [Resend](https://resend.com) | — | Commercial | Developer-friendly; React Email templates |
| Email templates | [React Email](https://react.email) | — | MIT | Type-safe, renderable email components |
| Payment (web) | [Stripe](https://stripe.com) | — | Commercial | Industry standard; webhooks |
| Payment (mobile) | [RevenueCat](https://www.revenuecat.com) | — | Commercial | Cross-platform IAP abstraction |
| Caching / Rate limit | [Redis](https://redis.io) via [Upstash](https://upstash.com) | 7.x | RSAL (free tier) | Serverless-compatible; token bucket rate limiting |
| PDF generation | [React PDF](https://react-pdf.org) | 3.x | MIT | Pure JS; no headless browser dependency |
| Push notifications | [Expo Notifications](https://docs.expo.dev/push-notifications) | — | MIT | Unified APNs + FCM |
| Customer support | [Chatwoot](https://www.chatwoot.com) | — | MIT | Self-hosted, open source support platform |
| Analytics | [Plausible](https://plausible.io) | — | AGPL 3.0 | Privacy-preserving; no cookies; open source |
| Docs site | [Docusaurus](https://docusaurus.io) | 3.x | MIT | React-based; versioned docs; search built-in |
| Status page | [Upptime](https://upptime.js.org) | — | MIT | GitHub Actions-based status monitoring |
| Issue tracking | [Linear](https://linear.app) | — | Commercial | Fast, developer-oriented (team tool, not open source) |
| CI/CD | [GitHub Actions](https://github.com/features/actions) | — | Free (OSS) | Integrated with repo; free for public repos |
| Hosting (web) | [Vercel](https://vercel.com) | — | Commercial | First-class Next.js hosting |
| Hosting (mobile) | [Expo EAS](https://expo.dev/eas) | — | Commercial | Build + submit pipeline for App Store / Play Store |
| Containerization | [Docker](https://www.docker.com) | 24.x | Apache 2.0 | Local dev services (Postgres, Redis, Mailpit) |
| Test runner | [Jest](https://jestjs.io) | 29.x | MIT | Standard for JS/TS testing |
| E2E testing | [Playwright](https://playwright.dev) | 1.x | Apache 2.0 | Cross-browser; also used for mobile web tests |
| Linting | [ESLint](https://eslint.org) + [Biome](https://biomejs.dev) | — | MIT | Biome for formatting (faster Prettier replacement) |
| Type checking | [TypeScript](https://www.typescriptlang.org) | 5.x | Apache 2.0 | Strict mode; no `any` |

---

### 8.3 Architecture Overview

**Web:** Next.js 14 App Router — server components for initial data fetch, client components for interactive charts. No camera integration — meal capture is a mobile-only workflow.

**Mobile:** Expo SDK 51 with Expo Router — native camera via `expo-camera`; push notifications via `expo-notifications`; RevenueCat SDK for subscription management.

**API layer:** tRPC routes (type-safe, Zod-validated) served from Next.js API routes. All Claude API calls are server-side only — the Anthropic API key never reaches the client.

**Database:** Supabase PostgreSQL. RLS enforced on all user tables. `ai_conversations` stores chat history as JSONB. `meal_logs.ai_analysis` stores the raw food scan result as JSONB.

**Storage:** Supabase Storage — meal photos in a per-user private bucket. Signed URLs for upload and retrieval, 24h expiry.

**Customer support:** Self-hosted Chatwoot on a separate VPS (Hetzner or DigitalOcean); not co-located with user health data.

**Analytics:** Plausible self-hosted or cloud — anonymized page view and event data; no user IDs; no health data.

---

## 9. AI & Machine Learning Specifications

### 9.1 Food Recognition (Vision)

**Model:** `claude-sonnet-4-6` (multimodal)

**Request flow:**
1. Client compresses image to ≤ 2 MB, uploads to Supabase Storage
2. Server-side tRPC route retrieves the signed URL and sends to Claude API as a base64 image or URL
3. System prompt instructs Claude to:
   - Identify all distinct food items in the image
   - Map each to the closest entry in the South Asian food database
   - Return structured JSON (schema below)
   - Flag low-confidence identifications
4. Server validates JSON response with Zod schema
5. Low-confidence items (< 0.70) returned to client for user confirmation
6. Confirmed items written to `meal_items` table

**Response schema (Zod):**
```ts
const FoodItem = z.object({
  name: z.string(),
  regional_name: z.string().optional(),
  food_db_id: z.string().uuid().optional(),
  estimated_grams: z.number(),
  estimated_katori: z.number(),
  calories: z.number(),
  carbs_g: z.number(),
  gi_score: z.number().min(0).max(100),
  gl_score: z.number(),
  confidence: z.number().min(0).max(1),
  candidates: z.array(z.string()).optional(),
});

const FoodScanResult = z.object({
  items: z.array(FoodItem),
  thali_detected: z.boolean(),
  raw_description: z.string(),
});
```

**Fallback strategy:**
- If Claude API returns an error or times out: surface manual search, show user-friendly error
- If no food items detected: return specific error message "No food detected in this image"
- Rate limit: max 20 photo scans per user per day on trial; unlimited on paid plan

---

### 9.2 Coaching Engine

**Model:** `claude-sonnet-4-6` (text)

**System prompt location:** `packages/shared/prompts/coach-system-prompt.ts`

**Context sent per request (anonymized):**
```ts
interface CoachingContext {
  diabetes_type: 'type1' | 'type2' | 'prediabetes' | 'gestational';
  a1c_target: number;
  language: 'en' | 'te' | 'hi' | 'ta' | 'pa' | 'gu';
  dietary_restrictions: string[];
  cuisine_preference: string;
  bg_logs_14d: Array<{ value: number; context: string; timestamp: string }>;
  meal_logs_7d: Array<{ foods: string[]; total_gl: number; timestamp: string }>;
  medications: Array<{ name: string; frequency: string }>;
  recent_meal_photo_description?: string;
}
```

**Coaching persona (system prompt excerpt):**
> You are DesiDiabetiCoach, a warm, knowledgeable diabetes wellness coach for South Asian communities. You understand South Asian cuisine deeply — idli, dosa, biryani, dal, roti, curries — and can give practical, culturally specific advice. Respond in {language}. Never suggest specific medication changes; always defer to the user's physician for clinical decisions. When giving portion advice, use katori as the unit of measurement. Keep responses concise — 2–4 sentences for inline tips, up to 150 words for detailed coaching responses.

**Proactive insights generation:**
- Runs daily, server-side, via a cron job (trigger: midnight in user's timezone)
- Reads last 7 days of BG + meal data for each active paid user
- Generates up to 3 insights per day; stored in a `coaching_insights` table
- Insights expire after 48 hours if not viewed

### 9.3 AI Cost Management

- Photo scan: estimated ~$0.008–0.015 per scan (claude-sonnet-4-6 vision pricing)
- Coaching chat: estimated ~$0.002–0.005 per message
- Proactive daily insights: estimated ~$0.005 per user per day
- Trial users: limited to 5 photo scans and 10 coaching messages
- Rate limiting enforced via Redis (token bucket, per user per hour)

---

## 10. Data Model Overview

> Full schema defined in `supabase/migrations/001_initial_schema.sql`. This section describes the functional role of each table.

| Table | Purpose |
|---|---|
| `user_profiles` | Extends `auth.users`; stores diabetes type, language, cuisine preference, subscription status, tutorial progress |
| `foods` | South Asian food database — public read; GI/GL data, regional names, katori serving units |
| `meal_logs` | One row per meal; links to photo, stores AI analysis JSONB, linked BG reading |
| `meal_items` | One row per food item within a meal; references `foods` or stores custom food data |
| `bg_logs` | BG readings with context enum and timestamp |
| `medication_logs` | Adherence records per scheduled dose |
| `ai_conversations` | Claude chat history as JSONB messages array; one row per conversation session |

**Additional tables required (new migration):**
- `a1c_logs` — lab A1C entries (value, date, lab name)
- `medications` — user's medication list (name, dose, frequency, start/end date)
- `medication_schedules` — scheduled dose times per medication
- `coaching_insights` — proactive insights generated by cron (content, generated_at, viewed_at)
- `care_partner_access` — care partner invite records (user_id, partner_email, granted_at, revoked_at)
- `physician_tokens` — time-limited read-only access tokens for physician report links
- `referrals` — referral tracking (referrer_user_id, referred_email, converted_at, reward_applied)
- `support_tickets` — local mirror of Linear tickets (ticket_id, status, created_at, user_id)
- `nps_responses` — NPS score + open text; anonymized; no FK to user (privacy)
- `share_cards` — generated share card metadata (type, token, created_at, expires_at)

---

## 11. Subscription & Monetization

**Individual Plan — $14.99/month**
- Unlimited BG, meal, and medication logging
- Unlimited AI food photo scans
- Unlimited AI coaching chat
- PDF report generation (Doctor Report + Personal Report)
- Care partner sharing (1 partner)
- All 6 language options
- Full trend analytics
- All platforms: web, iOS, Android

**Free Trial — 7 days** (14 days for referred users)
- Full feature access
- Limits: 10 BG logs, 5 food photo scans, 10 coaching messages
- PDF reports: available but watermarked with "Trial"
- No payment method required to start trial

**Payment infrastructure:**
- Mobile (iOS/Android): RevenueCat → App Store / Play Store billing
- Web: Stripe (subscription billing, invoice emails via Resend)
- Subscription status synced to `user_profiles.subscription` field in real time via webhook

**Future tiers (v2 — out of scope for v1 development):**
- Family Plan: $24.99/month, up to 3 member profiles
- Clinic Plan: per-patient pricing for practices managing patient cohorts

**Cancellation & refunds:**
- Users can cancel anytime; access continues to end of billing period
- No partial-month refunds (standard SaaS practice)
- Data retained 90 days after cancellation; user can export before deletion

---

## 12. Compliance & Regulatory

**Classification:** Wellness and health tracking application. Not a medical device under FDA 21 CFR 880 in v1 (no diagnostic or treatment recommendations that directly affect clinical management). All AI outputs are labeled "wellness guidance, not medical advice."

**Privacy regulations:**
- **CCPA (California):** Right to know, right to delete, right to portability — all implemented via in-app settings
- **PIPEDA (Canada):** Equivalent rights; privacy policy explicitly names data controller

**Required legal documents (before v1 launch):**
- Terms of Service
- Privacy Policy
- Consent to AI-assisted wellness coaching (acknowledged at onboarding)

**Data residency:** v1 hosted on US infrastructure (Vercel + Supabase US region). Canadian users' data may reside on US servers — disclosed in Privacy Policy.

**Audit trail:** All user data access logged (non-user-visible) for 90 days.

---

## 13. Out of Scope for v1

| Feature | Reason for deferral |
|---|---|
| CGM integration (Dexcom G6/G7, FreeStyle Libre) | Requires hardware partner agreement and complex OAuth flows |
| Direct EHR integration (Epic, Cerner) | Requires HL7 FHIR certification and enterprise sales |
| Physician portal (separate web product) | Physician token link covers immediate need |
| Apple Watch / Wear OS complications | Requires platform certification; core app must stabilize first |
| In-app community forum / peer groups | Moderation overhead; not in v1 value proposition |
| Family plan with shared data | Additional RLS complexity; out of scope for solo-user launch |
| Barcode scanning for packaged foods | Useful but secondary to core South Asian fresh-food use case |
| Blood pressure tracking | Adjacent, not core to diabetes MVP |
| Weight/BMI trend tracking | Nice to have; manual workaround (note field) acceptable in v1 |
| Docusaurus translations (non-English) | v1.1 — Hindi + Telugu documentation |
| Wellness challenge leaderboard | v1.1 after social features are live |

---

## 14. Release Strategy

### Alpha — Internal Only
**Goal:** Core BG logging + manual food logging fully working end-to-end on web and mobile.
- User signup, onboarding (with tutorial), and profile
- BG log entry, list, and basic chart
- Manual food search and meal log entry
- Medication list + adherence logging
- Dashboard with BG chart and adherence ring

**Exit criteria:** 3 internal testers use app daily for 2 weeks without critical bugs.

### Beta — Closed (invite-only, ~50 users)
**Goal:** AI features working; PDF reports generated; subscription billing active; both channels delivered.
- AI food photo scan (South Asian foods, mobile only)
- AI coaching chat
- Proactive insights
- Doctor PDF report
- Stripe and RevenueCat billing integration
- Push notifications (mobile + web push)
- In-app support chat (Chatwoot)
- Docs site live with Getting Started + key feature articles

**Exit criteria:** Beta users log ≥ 3 meals/day; photo scan accuracy ≥ 85% on test set; 0 P1 bugs.

### v1.0 — Public Launch
**Goal:** Full feature set publicly available across web, iOS, and Android.
- All features from Alpha + Beta
- Social share cards (all templates)
- Referral program live
- Sharing features (care partner, physician token)
- Full analytics deep-dive
- All 6 languages active
- Complete documentation site (all sections)
- Video tutorials (all 7) published
- Status page live

**Exit criteria:** App Store + Play Store listings approved; Stripe production webhook live; Chatwoot support queue staffed; docs site fully populated.

### v1.1 — Language, Food DB & Social Expansion
- Expanded regional food database (Bangladeshi, Sri Lankan, Pakistani cuisines)
- Additional South Asian languages (Malayalam, Kannada)
- Personal Report PDF (full data export); CSV and JSON data export
- Documentation translated to Hindi + Telugu
- Wellness challenge program (30-day challenges + badges)
- Community leaderboard (opt-in)

---

## 15. Open Questions for Stakeholder Review

1. **HIPAA:** Should v1 pursue HIPAA compliance (Business Associate Agreement with Supabase, Anthropic)? This significantly increases infrastructure cost and legal effort but would allow marketing to clinics.

2. **Anthropic data handling:** Confirm that the Anthropic API usage terms are acceptable for health data (even anonymized). Review Anthropic's data processing agreement before beta.

3. **App Store health data policies:** Apple HealthKit integration is out of scope for v1, but the app should avoid App Store rejection for health-related claims. Review Apple's App Store Review Guidelines §5.1.3 (health data) before submission.

4. **PDF library:** Decide between `react-pdf` (pure JS, faster) and Puppeteer (more design control, heavier) for report generation before Beta begins.

5. **South Asian food DB initial size:** Target ≥ 500 foods for v1 to cover 90%+ of commonly logged items. Confirm this is achievable with the `packages/food-db` seed data effort.

6. **Logo production:** Engage a designer to produce final SVG logo files from the concept description in Section 0. Required before Beta to brand PDF reports and share cards.

7. **Chatwoot hosting:** Self-host on Hetzner (~$12/mo) vs. Chatwoot Cloud ($25/mo). Self-hosting avoids external SaaS for support data; Cloud requires less ops effort. Decide before Beta.

8. **Social sharing legal review:** Confirm share card content (aggregate wellness milestones, no raw BG data) does not constitute a HIPAA disclosure or trigger App Store wellness data policies.

9. **Docs site launch timing:** Should the Docusaurus documentation site launch at Beta (to support beta testers) or only at v1.0 public launch? Recommend: launch a minimal docs site at Beta with Getting Started, FAQ, and key troubleshooting articles.
