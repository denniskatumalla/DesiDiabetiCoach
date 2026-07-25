import en from './en.json';
import type { LanguageCode } from '../constants/languages';

/**
 * Only English ships with real translations today (spec §7.4 — TE/HI/TA/PA/GU
 * are v1.1). Every string still routes through `t()` so adding a locale later
 * means dropping in a new JSON file, not rewiring the UI.
 */
const catalogs: Partial<Record<LanguageCode, Record<string, string>>> = { en };

export function t(key: keyof typeof en, vars?: Record<string, string | number>, locale: LanguageCode = 'en'): string {
  const catalog = catalogs[locale] ?? catalogs.en!;
  let str = catalog[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

export type TranslationKey = keyof typeof en;
