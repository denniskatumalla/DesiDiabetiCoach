#!/usr/bin/env ts-node
/**
 * Pre-flight check for local setup — verifies .env.local, reaches the
 * database, confirms every migrated table exists, and reports seed state.
 *
 * Run: npm run check:env
 *
 * Exits non-zero if anything is missing, so it can gate a dev script or CI
 * step. Secret values are never printed.
 */
import path from 'path';
import dotenv from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@desidiabeticoach/shared';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

/** Kept in sync with the schema by the type parameter — a renamed or dropped
 *  table fails typecheck here rather than at runtime in the app. */
const TABLES: (keyof Database['public']['Tables'])[] = [
  'user_profiles',
  'foods',
  'meal_logs',
  'meal_items',
  'bg_logs',
  'medication_logs',
  'ai_conversations',
  'a1c_logs',
  'medications',
  'medication_schedules',
];

const STORAGE_BUCKET = 'meal-photos';

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

let problems = 0;
let warnings = 0;

function ok(label: string, detail = '') {
  console.log(`  ${green('✓')} ${label}${detail ? dim(`  ${detail}`) : ''}`);
}

function fail(label: string, fix: string) {
  problems++;
  console.log(`  ${red('✗')} ${label}\n      ${dim(fix)}`);
}

function warn(label: string, detail: string) {
  warnings++;
  console.log(`  ${yellow('!')} ${label}\n      ${dim(detail)}`);
}

function section(title: string) {
  console.log(`\n${title}`);
}

/** Heuristic for values still carrying their .env.example text. */
function isPlaceholder(value: string): boolean {
  return /your|placeholder|xxx|changeme|<|example\.com/i.test(value);
}

function checkEnvVars(): { url?: string; serviceKey?: string } {
  section('Environment variables');

  const required: { key: string; fix: string }[] = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', fix: 'Supabase dashboard → Settings → API → Project URL' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', fix: 'Supabase dashboard → Settings → API → anon/public key' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', fix: 'Supabase dashboard → Settings → API → service_role key' },
    { key: 'ANTHROPIC_API_KEY', fix: 'https://console.anthropic.com → API keys' },
  ];

  for (const { key, fix } of required) {
    const value = process.env[key];
    if (!value) fail(`${key} is not set`, fix);
    else if (isPlaceholder(value)) fail(`${key} still holds a placeholder`, fix);
    else ok(key, key.endsWith('URL') ? value : `${value.length} chars`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (url && /localhost|127\.0\.0\.1/.test(url)) {
    warn(
      'NEXT_PUBLIC_SUPABASE_URL points at a local Docker stack',
      'That needs `npm run dev:db` (Docker). If Docker is unavailable, point this at a Supabase Cloud project instead.'
    );
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey && !isPlaceholder(anthropicKey) && !anthropicKey.startsWith('sk-ant-')) {
    warn('ANTHROPIC_API_KEY does not start with "sk-ant-"', 'Double-check it was copied in full.');
  }

  return {
    url: url && !isPlaceholder(url) ? url : undefined,
    serviceKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY && !isPlaceholder(process.env.SUPABASE_SERVICE_ROLE_KEY)
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : undefined,
  };
}

async function checkTables(db: SupabaseClient) {
  section('Database tables');

  let missing = 0;
  for (const table of TABLES) {
    const { error, count } = await db.from(table).select('*', { count: 'exact', head: true });

    if (error) {
      missing++;
      fail(`${table} — ${error.message}`, 'Apply the migrations: npm run db:migrate');
    } else {
      ok(table, `${count ?? 0} rows`);
    }
  }

  if (missing === TABLES.length) {
    console.log(
      `\n  ${dim('Every table is missing — the schema has not been applied to this project yet.')}`
    );
  }
}

async function checkSeed(db: SupabaseClient) {
  section('Seed data');

  const { count, error } = await db.from('foods').select('*', { count: 'exact', head: true });
  if (error) {
    fail('Could not read the foods table', 'Apply the migrations first: npm run db:migrate');
    return;
  }

  if (!count) {
    fail('foods table is empty', 'Seed it: npm run db:seed  (food search returns nothing until then)');
  } else if (count < 54) {
    warn(`foods has only ${count} rows (expected 54)`, 'Re-run: npm run db:seed');
  } else {
    ok('foods', `${count} rows seeded`);
  }
}

async function checkStorage(db: SupabaseClient) {
  section('Storage');

  const { data, error } = await db.storage.listBuckets();
  if (error) {
    fail(`Could not list storage buckets — ${error.message}`, 'Check the service_role key.');
    return;
  }

  if (data.some((bucket) => bucket.name === STORAGE_BUCKET)) {
    ok(`bucket "${STORAGE_BUCKET}"`);
  } else {
    fail(
      `bucket "${STORAGE_BUCKET}" is missing`,
      'Created by migration 002 — apply it with: npm run db:migrate'
    );
  }
}

async function main() {
  console.log('\n🔍 DesiDiabetiCoach — environment & database pre-flight');

  const { url, serviceKey } = checkEnvVars();

  if (!url || !serviceKey) {
    section('Database');
    console.log(
      `  ${dim('Skipped — needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')}`
    );
  } else {
    // Untyped client on purpose: these checks iterate table names
    // dynamically, which the Database generic cannot express.
    const db = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    section('Database');
    const { error } = await db.from('foods').select('id', { head: true }).limit(1);
    // A missing table still proves the connection worked; only transport
    // failures mean we genuinely could not reach the project.
    if (error && /fetch|network|ENOTFOUND|ECONNREFUSED/i.test(error.message)) {
      fail(`Could not reach ${url}`, `${error.message} — check the URL and that the project is running.`);
    } else {
      ok('reachable', url);
      await checkTables(db);
      await checkSeed(db);
      await checkStorage(db);
    }
  }

  console.log('');
  if (problems > 0) {
    console.log(red(`✗ ${problems} problem(s)`) + (warnings ? yellow(`, ${warnings} warning(s)`) : ''));
    console.log(dim('  Fix the items marked ✗ above, then re-run: npm run check:env\n'));
    process.exit(1);
  }

  console.log(green('✓ All checks passed') + (warnings ? yellow(` (${warnings} warning(s))`) : ''));
  console.log(dim('  Start the app with: npm run dev:web\n'));
}

main().catch((err) => {
  console.error(`\n${red('✗ Pre-flight check crashed')}`);
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
