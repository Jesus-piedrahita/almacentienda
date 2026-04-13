import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTheme } from './use-theme';
import { useThemeStore } from '@/stores/theme-store';

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';

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

    useThemeStore.setState({
      themePreference: 'system',
      effectiveTheme: 'light',
    });
  });

  it('applies effective theme to the document', () => {
    useThemeStore.setState({
      themePreference: 'dark',
      effectiveTheme: 'dark',
    });

    const { result } = renderHook(() => useTheme());

    expect(result.current.themePreference).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('syncs effective theme when preference is system', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.themePreference).toBe('system');
    expect(useThemeStore.getState().effectiveTheme).toBe('dark');
  });

  it('keeps explicit theme without syncing to system preference', () => {
    useThemeStore.setState({
      themePreference: 'light',
      effectiveTheme: 'light',
    });

    const { result } = renderHook(() => useTheme());

    expect(result.current.themePreference).toBe('light');
    expect(useThemeStore.getState().effectiveTheme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
