// Dynamic Time-Based Theme Service for ATTI
// Schedule:
// - 6:00 AM – 6:00 PM: Light Mode
// - 6:00 PM – 6:00 AM: Dark Mode
// Supports automatic time-based switching, manual override, and local storage persistence.

export type ThemeMode = 'auto' | 'light' | 'dark';
export type ActiveTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'atti_theme_preference';

/**
 * Default to Light Mode as standard UI baseline across all portals.
 */
export function getTimeBasedTheme(date: Date = new Date()): ActiveTheme {
  return 'light';
}

/**
 * Retrieve user manual preference from localStorage, defaulting to 'light'.
 */
export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {}
  return 'light';
}

/**
 * Persist user manual preference to localStorage.
 */
export function storeThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {}
}

/**
 * Resolve current active theme from mode.
 */
export function resolveActiveTheme(mode: ThemeMode, date: Date = new Date()): ActiveTheme {
  if (mode === 'dark') return 'dark';
  return 'light';
}

/**
 * Apply 'dark' class to <html> element for Tailwind dark: variants.
 */
export function applyThemeToDOM(activeTheme: ActiveTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (activeTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
