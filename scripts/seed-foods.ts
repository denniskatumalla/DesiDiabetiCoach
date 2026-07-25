#!/usr/bin/env ts-node
/**
 * Seeds the `foods` table from packages/food-db/seed-data/foods.json.
 * Run: npm run db:seed (requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local)
 */
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { calculateGl } from '@desidiabeticoach/shared';
import foods from '../packages/food-db/seed-data/foods.json';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local — cannot seed.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log(`\n🍛 Seeding ${foods.length} South Asian foods...`);

  const rows = foods.map((f) => ({
    name_en: f.name_en,
    name_regional: f.name_regional,
    regional_lang: f.regional_lang,
    aliases: f.aliases,
    category: f.category,
    cuisine_region: f.cuisine_region,
    is_vegetarian: f.is_vegetarian,
    is_vegan: f.is_vegan,
    serving_desc: f.serving_desc,
    serving_g: f.serving_g,
    carbs_g: f.carbs_g,
    protein_g: f.protein_g,
    fat_g: f.fat_g,
    fiber_g: f.fiber_g,
    calories: f.calories,
    gi_score: f.gi_score,
    gl_score: calculateGl(f.gi_score, f.carbs_g),
    diabetic_notes: f.diabetic_notes,
    verified: false,
    source: 'Seed data — AI-assisted estimate, pending nutritionist review',
  }));

  const { error, count } = await supabase
    .from('foods')
    .upsert(rows, { onConflict: 'name_en', count: 'exact' });

  if (error) {
    console.error('✗ Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✓ Seeded ${count ?? rows.length} foods.\n`);
}

main();
