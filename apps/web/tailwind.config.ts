import type { Config } from 'tailwindcss';

/**
 * Design tokens — "Thali".
 *
 * The spec §0 brand hues (navy / teal / saffron / rose / jade) are kept exactly
 * as `packages/shared` defines them, because the mobile app renders from those
 * same constants. Everything added here is web-only: deeper grounds, a chosen
 * paper neutral, and chart-safe steps derived from the brand hues.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Spec §0 brand (shared with mobile — do not change) ──
        'brand-navy': '#0F2340',
        'brand-teal': '#1B8F8A',
        'brand-saffron': '#F59E0B',
        'brand-white': '#FAFAFA',
        'brand-rose': '#E05A5A',
        'brand-jade': '#22C55E',

        // ── Themed grounds ──
        // Values live in globals.css and swap with `data-theme`, so these
        // class names mean "page ground" / "raised surface" / "hairline" /
        // "text" in whichever theme is active. The rgb(... / <alpha-value>)
        // form is what keeps opacity modifiers (`text-fg/60`) working.
        /** Page ground — the rail and the outermost surface. */
        ink: 'rgb(var(--c-bg) / <alpha-value>)',
        /** Raised surface: cards, rows, inputs. */
        'ink-raised': 'rgb(var(--c-surface) / <alpha-value>)',
        /** Hairline — the thali's compartment divider. */
        'ink-rule': 'rgb(var(--c-rule) / <alpha-value>)',
        /** Primary text. */
        fg: 'rgb(var(--c-fg) / <alpha-value>)',
        /** Eyebrows and small accents; steps down to amber on light. */
        accent: 'rgb(var(--c-accent) / <alpha-value>)',

        // ── Chart & status steps ──
        // Brand teal is only 2.1:1 on white and below the chroma floor, so the
        // chart line uses a deeper step of the same hue (validated >= 3:1).
        'chart-line': '#0F7A75',
        'chart-grid': 'rgba(15, 35, 64, 0.08)',
        // Status *text* steps. The jade/rose pair separates by only DeltaE 7.2
        // under deuteranopia, so status is always rendered with a written label
        // as well — these steps make that label readable.
        'state-good': '#15803D',
        'state-warn': '#B45309',
        'state-bad': '#B91C1C',
      },
      fontFamily: {
        /**
         * Spec §0 asks for Plus Jakarta Sans / Inter / JetBrains Mono, but
         * globals.css deliberately avoids a runtime font fetch and no font
         * files are vendored. These stacks resolve to real faces on every
         * target OS; the design carries its character through scale, tracking
         * and the monospace voice rather than through a downloaded family.
         */
        display: ['"Segoe UI Variable Display"', '"Segoe UI"', 'system-ui', '-apple-system', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        body: ['"Segoe UI Variable Text"', '"Segoe UI"', 'system-ui', '-apple-system', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', '"Cascadia Mono"', '"SF Mono"', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      fontSize: {
        // Display scale — used only at hero and section-opener sizes.
        'display-xl': ['clamp(2.75rem, 8vw, 6.5rem)', { lineHeight: '0.94', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(2rem, 5vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        // Uppercase monospace label — the recurring structural voice.
        eyebrow: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.16em' }],
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(15, 35, 64, 0.08)',
        lift: '0 18px 40px -24px rgba(8, 19, 31, 0.55)',
      },
      keyframes: {
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'rise-in': 'rise-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        marquee: 'marquee 42s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
