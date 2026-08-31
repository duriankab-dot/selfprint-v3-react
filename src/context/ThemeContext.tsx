import React, { createContext, useState, useCallback, useLayoutEffect } from "react";
import type { ReactNode } from "react";

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get from localStorage — a returning user's own explicit choice
    // always wins (§19: User Preference > AI Personalization).
    const stored = localStorage.getItem('selfprint_theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // DARKNAVY-001: no stored preference (first-ever visit) → default to
    // "Dark navy blue intelligence" per product decision, rather than
    // following OS light/dark preference. This matches the static
    // data-mode="dark" already set on <html> in index.html, so there's
    // no flash on first paint. Mood-based / AI-selected accent theming
    // (see [data-mood] in tokens.css) still layers on top independently.
    return 'dark';
  });

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('selfprint_theme', newTheme);
    document.documentElement.setAttribute('data-mode', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Apply theme on mount and when changed. useLayoutEffect (not useEffect)
  // so this runs before the browser paints — if a returning user's stored
  // theme differs from the static data-mode="dark" default in index.html
  // (e.g. they'd previously switched to light), the correction happens
  // before paint instead of flashing dark-then-light.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-mode', theme);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
