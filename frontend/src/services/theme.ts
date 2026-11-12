// Dynamic Time-Based Theme Service for ATTI
// Schedule:
// - 6:00 AM – 6:00 PM: Light Mode
// - 6:00 PM – 6:00 AM: Dark Mode
// Supports automatic time-based switching, manual override, and local storage persistence.

export type ThemeMode = 'auto' | 'light' | 'dark';
export type ActiveTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'atti_theme_preference';

/**
 * Determine theme based on patient's device local time:
 * Daytime: 6:00 AM (inclusive) to 6:00 PM (exclusive) -> Light Mode
 * Evening/Nighttime: 6:00 PM to 6:00 AM -> Dark Mode
 */
export function getTimeBasedTheme(date: Date = new Date()): ActiveTheme {
  const hour = date.getHours();
  if (hour >= 6 && hour < 18) {
    return 'light';
  }
  return 'dark';
}

/**
 * Retrieve user manual preference from localStorage, defaulting to 'auto'.
 */
export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'auto';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
  } catch {}
  return 'auto';
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
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return getTimeBasedTheme(date);
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
