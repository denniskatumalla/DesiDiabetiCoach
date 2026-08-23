'use client';

import { useEffect, useState } from 'react';
import {
  THEME_OPTIONS,
  applyTheme,
  readStoredTheme,
  storeTheme,
  type ThemePreference,
} from '@/lib/theme';

/**
 * Segmented System / Light / Dark control.
 *
 * The choice is read from localStorage on mount rather than during render so
 * the server and client markup agree; the boot script in the root layout has
 * already applied the visual theme by then, so there is nothing to flash.
 */
export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    setPreference(readStoredTheme());
  }, []);

  function choose(next: ThemePreference) {
    setPreference(next);
    applyTheme(next);
    storeTheme(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="flex gap-1 rounded-control border border-ink-rule p-1"
    >
      {THEME_OPTIONS.map((option) => {
        const selected = preference === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.hint}
            onClick={() => choose(option.value)}
            className={`flex-1 rounded-[5px] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              selected
                ? 'bg-accent text-ink'
                : 'text-fg/55 hover:bg-fg/5 hover:text-fg'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
