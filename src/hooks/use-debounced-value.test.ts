/**
 * @fileoverview Tests para el hook useDebouncedValue.
 * Cubre: actualización tardía, reset del timer ante input rápido, cleanup en unmount.
 */

import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from './use-debounced-value';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does NOT update the debounced value before the delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Avanzamos menos del delay — el valor debounced no cambió aún
    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe('initial');
  });

  it('updates the debounced value after the delay expires', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('resets the timer on rapid consecutive changes (only last value applies)', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => { vi.advanceTimersByTime(100); });

    rerender({ value: 'abc' });
    act(() => { vi.advanceTimersByTime(100); });

    rerender({ value: 'abcd' });
    // Todavía no pasó el delay completo desde el último cambio
    act(() => { vi.advanceTimersByTime(100); });

    // El valor debounced sigue siendo el inicial
    expect(result.current).toBe('a');

    // Ahora dejamos que el delay expire completo desde el último cambio
    act(() => { vi.advanceTimersByTime(200); });

    expect(result.current).toBe('abcd');
  });

  it('clears the timeout on unmount (no state update after unmount)', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    unmount();

    // Avanzar el timer post-unmount no debe lanzar error
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // El valor en el momento del unmount era 'initial' (no se actualizó aún)
    expect(result.current).toBe('initial');
  });

  it('works with non-string generic types', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useDebouncedValue(value, 300),
      { initialProps: { value: 0 } }
    );

    rerender({ value: 42 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(42);
  });
});
