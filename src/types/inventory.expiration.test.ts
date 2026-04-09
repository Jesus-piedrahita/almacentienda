/**
 * @fileoverview Tests unitarios para los helpers simples de vencimiento.
 */

import { describe, it, expect } from 'vitest';
import {
  EXPIRATION_DISPLAY_STATUS,
  getExpirationDisplayLabel,
  getExpirationDisplayStatus,
  getExpirationDisplayStatusColor,
} from './inventory';

describe('getExpirationDisplayStatus', () => {
  it('devuelve "none" cuando no hay fecha', () => {
    expect(getExpirationDisplayStatus(undefined)).toBe(EXPIRATION_DISPLAY_STATUS.NONE);
  });

  it('devuelve "none" cuando la fecha es inválida', () => {
    expect(getExpirationDisplayStatus('fecha-rara')).toBe(EXPIRATION_DISPLAY_STATUS.NONE);
  });

  it('devuelve "expired" para una fecha anterior a hoy', () => {
    expect(getExpirationDisplayStatus('2000-01-01')).toBe(EXPIRATION_DISPLAY_STATUS.EXPIRED);
  });

  it('devuelve "has_date" para una fecha futura', () => {
    expect(getExpirationDisplayStatus('2999-12-31')).toBe(EXPIRATION_DISPLAY_STATUS.HAS_DATE);
  });
});

describe('getExpirationDisplayLabel', () => {
  it('devuelve "Vencido" para expired', () => {
    expect(getExpirationDisplayLabel(EXPIRATION_DISPLAY_STATUS.EXPIRED)).toBe('Vencido');
  });

  it('devuelve "Con fecha" para has_date', () => {
    expect(getExpirationDisplayLabel(EXPIRATION_DISPLAY_STATUS.HAS_DATE)).toBe('Con fecha');
  });

  it('devuelve "Sin vencimiento" para none', () => {
    expect(getExpirationDisplayLabel(EXPIRATION_DISPLAY_STATUS.NONE)).toBe('Sin vencimiento');
  });
});

describe('getExpirationDisplayStatusColor', () => {
  it('devuelve clases rojas para "expired"', () => {
    const colorClass = getExpirationDisplayStatusColor(EXPIRATION_DISPLAY_STATUS.EXPIRED);
    expect(colorClass).toContain('red');
  });

  it('devuelve clases slate para "has_date"', () => {
    const colorClass = getExpirationDisplayStatusColor(EXPIRATION_DISPLAY_STATUS.HAS_DATE);
    expect(colorClass).toContain('slate');
  });

  it('devuelve clases muted/border para "none"', () => {
    const colorClass = getExpirationDisplayStatusColor(EXPIRATION_DISPLAY_STATUS.NONE);
    expect(colorClass).toContain('muted');
  });

  it('todos los estados devuelven strings no vacíos', () => {
    const statuses = Object.values(EXPIRATION_DISPLAY_STATUS);
    for (const status of statuses) {
      const color = getExpirationDisplayStatusColor(status);
      expect(typeof color).toBe('string');
      expect(color.trim().length).toBeGreaterThan(0);
    }
  });
});
