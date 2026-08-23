/** User's theme choice. `system` follows the operating system setting. */
export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'ddc-theme';

export const THEME_OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Follow your device setting' },
  { value: 'light', label: 'Light', hint: 'Dark text on a pale ground' },
  { value: 'dark', label: 'Dark', hint: 'Pale text on a deep ground' },
];

/**
 * Write the choice onto `<html>`, which is what the CSS token blocks in
 * globals.css key off. `system` removes the attribute so the
 * `prefers-color-scheme` media query takes over.
 */
export function applyTheme(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === 'system') {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = preference;
  }
}

export function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  } catch {
    // Private mode or blocked storage — fall back to following the system.
    return 'system';
  }
}

export function storeTheme(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Non-fatal: the theme still applies for this page view.
  }
}

/**
 * Runs before first paint, inlined into <head>.
 *
 * Without this the server-rendered HTML carries no theme attribute, so a user
 * who chose light would see a flash of the dark default before hydration.
 * Kept dependency-free and tiny because it blocks rendering.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})();`;
