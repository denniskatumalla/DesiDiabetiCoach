#!/usr/bin/env node
/**
 * DesiDiabetiCoach — Developer Setup Script
 * Run: node scripts/setup.js
 * Sets up local dev environment from scratch.
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const run = (cmd, opts = {}) => {
  console.log(`\n→ ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });
  } catch (e) {
    console.error(`✗ Failed: ${cmd}`);
    process.exit(1);
  }
};

const check = (cmd) => {
  try {
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

console.log('\n╔════════════════════════════════════════╗');
console.log('║  DesiDiabetiCoach — Dev Environment   ║');
console.log('║  Setup Script v1.0                    ║');
console.log('╚════════════════════════════════════════╝\n');

// ── 1. Prerequisites check ─────────────────────────────────────
console.log('📋 Checking prerequisites...');

const prereqs = [
  { cmd: 'node --version', name: 'Node.js 20+', required: true },
  { cmd: 'npm --version', name: 'npm', required: true },
  { cmd: 'git --version', name: 'Git', required: true },
  { cmd: 'docker --version', name: 'Docker', required: true },
  { cmd: 'supabase --version', name: 'Supabase CLI', required: false },
];

let allGood = true;
prereqs.forEach(({ cmd, name, required }) => {
  const ok = check(cmd);
  const icon = ok ? '✓' : (required ? '✗' : '⚠');
  console.log(`  ${icon} ${name}`);
  if (!ok && required) allGood = false;
});

if (!allGood) {
  console.error('\n✗ Missing required prerequisites. Please install them and re-run.\n');
  console.log('  Install Node.js: https://nodejs.org (v20+)');
  console.log('  Install Docker:  https://docs.docker.com/get-docker/');
  console.log('  Install Git:     https://git-scm.com/downloads\n');
  process.exit(1);
}

// ── 2. Install Supabase CLI if missing ────────────────────────
if (!check('supabase --version')) {
  console.log('\n📦 Installing Supabase CLI...');
  run('npm install -g supabase');
}

// ── 3. Copy .env.example → .env.local ─────────────────────────
const envPath = path.join(ROOT, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating .env.local from template...');
  fs.copyFileSync(path.join(ROOT, '.env.example'), envPath);
  console.log('  ✓ .env.local created');
  console.log('  ⚠  IMPORTANT: Open .env.local and fill in your API keys before continuing.');
  console.log('     → ANTHROPIC_API_KEY: https://console.anthropic.com');
  console.log('     → RESEND_API_KEY:    https://resend.com\n');
} else {
  console.log('\n✓ .env.local already exists — skipping');
}

// ── 4. Install npm dependencies ────────────────────────────────
console.log('\n📦 Installing dependencies...');
run('npm install');

// ── 5. Start local database ────────────────────────────────────
console.log('\n🐳 Starting local Supabase database...');
run('docker compose -f infrastructure/dev/docker-compose.yml up -d');

// Wait for DB to be ready
console.log('   Waiting for database to be ready...');
execSync('sleep 5');

// ── 6. Run migrations ──────────────────────────────────────────
console.log('\n🗄️  Running database migrations...');
// For local dev without Supabase CLI linked, apply migrations directly, in order
const migrationsDir = path.join(ROOT, 'supabase', 'migrations');
const migrations = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
migrations.forEach((file) => {
  run(`docker exec ddc_postgres psql -U postgres -d postgres -f /docker-entrypoint-initdb.d/${file} 2>/dev/null || echo "Migration ${file} may already be applied"`);
});

// ── 6b. Seed the South Asian food database ──────────────────────
console.log('\n🍛 Seeding South Asian food database...');
run('npm run db:seed');

// ── 7. Done ────────────────────────────────────────────────────
console.log('\n╔════════════════════════════════════════╗');
console.log('║  ✅ Setup Complete!                    ║');
console.log('╚════════════════════════════════════════╝');
console.log('');
console.log('Next steps:');
console.log('  1. Fill in .env.local with your API keys (if not done)');
console.log('  2. npm run dev:web     → Start web portal at http://localhost:3000');
console.log('  3. npm run dev:mobile  → Start Expo mobile app');
console.log('  4. http://localhost:8025  → Local email (Mailhog)');
console.log('  5. http://localhost:54323 → Supabase Studio (DB UI)');
console.log('');
console.log('Claude Code:');
console.log('  • Open Claude Desktop → Code tab → Select this folder');
console.log('  • Or: cd desidiabeticoach && claude');
console.log('  • The CLAUDE.md file gives Claude full project context');
console.log('');
