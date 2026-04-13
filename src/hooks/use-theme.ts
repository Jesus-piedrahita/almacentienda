import { useEffect } from 'react';

import { applyThemeToDocument } from '@/lib/theme';
import { useThemeStore } from '@/stores/theme-store';

export function useTheme() {
  const themePreference = useThemeStore((state) => state.themePreference);
  const effectiveTheme = useThemeStore((state) => state.effectiveTheme);
  const syncEffectiveTheme = useThemeStore((state) => state.syncEffectiveTheme);

  useEffect(() => {
    applyThemeToDocument(effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    if (themePreference !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      if (themePreference !== 'system') {
        return;
      }

      syncEffectiveTheme(event.matches);
    };

    syncEffectiveTheme(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [syncEffectiveTheme, themePreference]);

  return {
    themePreference,
    effectiveTheme,
    resolvedTheme: effectiveTheme,
  };
}
