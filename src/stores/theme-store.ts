import { create } from 'zustand';

import type { EffectiveTheme, ThemePreference } from '@/lib/theme';
import {
  getSystemPrefersDark,
  readStoredThemePreference,
  resolveEffectiveTheme,
  writeStoredThemePreference,
} from '@/lib/theme';

interface ThemeState {
  themePreference: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setThemePreference: (themePreference: ThemePreference) => void;
  syncEffectiveTheme: (systemPrefersDark: boolean) => void;
}

const initialThemePreference = readStoredThemePreference();

export const useThemeStore = create<ThemeState>()((set, get) => ({
  themePreference: initialThemePreference,
  effectiveTheme: resolveEffectiveTheme(initialThemePreference, getSystemPrefersDark()),

  setThemePreference: (themePreference) => {
    writeStoredThemePreference(themePreference);

    set({
      themePreference,
      effectiveTheme: resolveEffectiveTheme(themePreference, getSystemPrefersDark()),
    });
  },

  syncEffectiveTheme: (systemPrefersDark) =>
    set({
      effectiveTheme: resolveEffectiveTheme(get().themePreference, systemPrefersDark),
    }),
}));
