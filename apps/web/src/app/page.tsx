import Link from 'next/link';
import { Button } from '@desidiabeticoach/ui';

/** The ornament is the subject: what people actually eat, named as they name it. */
const DISHES = [
  'Idli', 'Masala Dosa', 'Sambar', 'Rajma Chawal', 'Dhokla', 'Bisi Bele Bath',
  'Puttu', 'Chole Bhature', 'Upma', 'Pesarattu', 'Undhiyu', 'Rasam',
  'Poha', 'Thepla', 'Appam', 'Khichdi', 'Pongal', 'Baingan Bharta',
];

const STEPS = [
  {
    n: '01',
    title: 'Photograph the plate',
    body: 'One tap in the mobile app. A thali comes back as its parts — sambar, rice, poriyal, papad — not as one unreadable blob.',
  },
  {
    n: '02',
    title: 'Check the numbers',
    body: 'Every item arrives with grams, katori, carbs and a glycemic load. Anything the model was unsure of is flagged for you to correct before it is saved.',
  },
  {
    n: '03',
    title: 'Log it against your day',
    body: 'Meals sit alongside your blood glucose readings and medication, so the connection between a Sunday biryani and Monday morning is visible instead of guessed at.',
  },
  {
    n: '04',
    title: 'Ask your coach',
    body: 'A coach that already knows your last fortnight of readings, your dietary restriction, and the difference between rava dosa and plain dosa.',
  },
];

const PILLARS = [
  {
    eyebrow: 'Built on katori',
    title: 'Portions in the unit you already use',
    body: 'Not cups. Not ounces. The katori your kitchen has measured in for generations, converted to carbohydrates without you doing the arithmetic.',
  },
  {
    eyebrow: 'Glycemic load, not just index',
    title: 'The number that reflects the plate',
    body: 'A high-GI food in a small portion behaves differently from a moderate one in a large portion. GL carries both, and it is on every item you log.',
  },
  {
    eyebrow: 'Six languages',
    title: 'Coaching in the language you think in',
    body: 'English today; Telugu, Hindi, Tamil, Punjabi and Gujarati are wired through the product and rolling out — not bolted on as a translation layer.',
  },
];

export default function LandingPage() {
  return (
    <main data-theme="dark" className="bg-ink text-white">
      {/* ─── Masthead ─────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <span className="font-display text-[15px] font-bold tracking-tight">DesiDiabetiCoach</span>
        <Link href="/login" className="eyebrow text-white/60 transition-colors hover:text-brand-saffron">
          Log in
        </Link>
      </header>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Warm bloom behind the headline — the only gradient on the page. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[52rem] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
          style={{ background: 'radial-gradient(closest-side, #F59E0B, transparent)' }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pt-24">
          <p className="eyebrow animate-rise-in text-brand-saffron">
            Diabetes care for South Asian kitchens
          </p>

          <h1 className="mt-7 max-w-5xl font-display text-display-xl font-bold">
            <span className="block animate-rise-in [animation-delay:80ms]">Know your food.</span>
            <span className="block animate-rise-in [animation-delay:160ms]">Manage your health.</span>
            <span className="block animate-rise-in text-brand-saffron [animation-delay:240ms]">
              In your language.
            </span>
          </h1>

          <div className="mt-10 flex animate-rise-in flex-col gap-6 [animation-delay:340ms] sm:flex-row sm:items-center sm:gap-10">
            <p className="max-w-md text-[17px] leading-relaxed text-white/70">
              Most nutrition apps have never heard of a katori. This one is built around
              one — and around the food actually on your plate.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup">
                <Button variant="saffron" size="lg">
                  Get started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-white">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Dish marquee ───────────────────────────────────── */}
        <div className="marquee-mask border-y border-ink-rule py-5">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap will-change-transform">
            {[...DISHES, ...DISHES].map((dish, i) => (
              <span
                key={i}
                className="flex items-center gap-10 font-mono text-sm uppercase tracking-[0.14em] text-white/35"
              >
                {dish}
                <span aria-hidden className="text-brand-saffron/50">
                  ◆
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Domain stat band ─────────────────────────────────── */}
      <div>
        {/* Padding sits outside the grid: the divider colour is the grid's own
            background, so horizontal padding on it would bleed past the cells. */}
        <section className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-px bg-ink-rule sm:grid-cols-3">
            {[
              { figure: '150 ml', label: 'One katori', note: 'The serving unit every portion is expressed in' },
              { figure: 'GI + GL', label: 'On every item', note: 'Index and load, because portion size changes the answer' },
              { figure: '6', label: 'Languages', note: 'English shipped, five more wired through the product' },
            ].map((stat) => (
              <div key={stat.label} className="bg-ink px-6 py-12 sm:px-8">
                <p className="font-display text-display-md font-bold text-brand-saffron [font-variant-numeric:tabular-nums]">
                  {stat.figure}
                </p>
                <p className="eyebrow mt-3 text-white">{stat.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{stat.note}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── How it works (a genuine sequence, so it is numbered) ─ */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div>
          <p className="eyebrow text-brand-teal">From plate to plan</p>
          <h2 className="mt-3 max-w-3xl font-display text-display-lg font-bold">
            Four steps, and none of them are &ldquo;look up your food in a database&rdquo;.
          </h2>
        </div>

        <div className="mt-16 grid gap-px bg-ink-rule sm:grid-cols-2">
          {STEPS.map((step) => (
            <div key={step.n}>
              <article className="h-full bg-ink px-6 py-10 sm:px-10 sm:py-12">
                <p className="font-mono text-sm text-brand-saffron [font-variant-numeric:tabular-nums]">
                  {step.n}
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold">{step.title}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/60">{step.body}</p>
              </article>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pillars ──────────────────────────────────────────── */}
      <section className="border-t border-ink-rule bg-ink-raised">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
          <div>
            <h2 className="max-w-3xl font-display text-display-lg font-bold">
              Built for the way South Asian families actually eat.
            </h2>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-10">
            {PILLARS.map((pillar) => (
              <div key={pillar.eyebrow}>
                <div className="border-t border-brand-saffron/40 pt-6">
                  <p className="eyebrow text-brand-saffron">{pillar.eyebrow}</p>
                  <h3 className="mt-4 font-display text-xl font-bold">{pillar.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/60">{pillar.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Closing CTA ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-36">
        <div>
          <div className="max-w-3xl">
            <h2 className="font-display text-display-lg font-bold">
              Your next meal is the one worth logging.
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/65">
              Free to start. No card, no calorie shaming, no asking you to weigh your
              rice in ounces.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button variant="saffron" size="lg">
                  Create your account
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-white">
                  I already have one
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-ink-rule">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm font-bold">DesiDiabetiCoach</p>
          <p className="max-w-xl text-xs leading-relaxed text-white/40">
            General wellness guidance, not medical advice. Consult your physician before
            changing your treatment plan.
          </p>
        </div>
      </footer>
    </main>
  );
}
