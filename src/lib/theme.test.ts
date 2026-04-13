import { describe, expect, it, beforeEach } from 'vitest';

import {
  applyThemeToDocument,
  readStoredThemePreference,
  resolveEffectiveTheme,
  resolveAndApplyTheme,
  THEME_STORAGE_KEY,
  writeStoredThemePreference,
} from './theme';

describe('theme utilities', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    window.localStorage.clear();
  });

  it('resolves explicit light and dark preferences', () => {
    expect(resolveEffectiveTheme('light', true)).toBe('light');
    expect(resolveEffectiveTheme('dark', false)).toBe('dark');
  });

  it('resolves system preference from media value', () => {
    expect(resolveEffectiveTheme('system', true)).toBe('dark');
    expect(resolveEffectiveTheme('system', false)).toBe('light');
  });

  it('applies dark theme to document element', () => {
    applyThemeToDocument('dark');

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('reads stored theme preference or falls back to system', () => {
    expect(readStoredThemePreference()).toBe('system');

    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(readStoredThemePreference()).toBe('dark');
  });

  it('migrates legacy zustand persisted theme preference to plain storage', () => {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({
        state: {
          themePreference: 'dark',
        },
        version: 0,
      })
    );

    expect(readStoredThemePreference()).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('writes theme preference as plain storage value', () => {
    writeStoredThemePreference('light');

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('resolves and applies theme from current system preference', () => {
    window.matchMedia = ((query: string) =>
      ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia;

    expect(resolveAndApplyTheme('system')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
