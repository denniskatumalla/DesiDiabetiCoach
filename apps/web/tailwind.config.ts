import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0F2340',
        'brand-teal': '#1B8F8A',
        'brand-saffron': '#F59E0B',
        'brand-white': '#FAFAFA',
        'brand-rose': '#E05A5A',
        'brand-jade': '#22C55E',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
