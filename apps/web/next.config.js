const path = require('path');

// The web app is invoked from apps/web (`cd apps/web && next dev`), but per
// CLAUDE.md all web/API env vars live in the monorepo-root .env.local, not
// apps/web/.env.local — load it explicitly before Next's own env handling runs.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@desidiabeticoach/shared', '@desidiabeticoach/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
