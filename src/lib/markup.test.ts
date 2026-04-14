import { describe, expect, it } from 'vitest';

import { formatMarkup, markupFromPrice, priceFromMarkup } from './markup';

describe('markup helpers', () => {
  describe('priceFromMarkup', () => {
    it('calculates derived price from cost and markup percentage', () => {
      expect(priceFromMarkup(100, 30)).toBe(130);
    });

    it('supports zero and full markup values', () => {
      expect(priceFromMarkup(100, 0)).toBe(100);
      expect(priceFromMarkup(100, 100)).toBe(200);
    });

    it('rounds derived price to two decimals', () => {
      expect(priceFromMarkup(19.99, 12.5)).toBe(22.49);
    });

    it('returns null for zero or negative costs', () => {
      expect(priceFromMarkup(0, 20)).toBeNull();
      expect(priceFromMarkup(-10, 20)).toBeNull();
    });

    it('never returns NaN or Infinity for invalid inputs', () => {
      expect(priceFromMarkup(Number.NaN, 20)).toBeNull();
      expect(priceFromMarkup(Number.POSITIVE_INFINITY, 20)).toBeNull();
      expect(priceFromMarkup(10, Number.NaN)).toBeNull();
      expect(priceFromMarkup(10, Number.POSITIVE_INFINITY)).toBeNull();
    });
  });

  describe('markupFromPrice', () => {
    it('calculates derived markup from cost and manual price', () => {
      expect(markupFromPrice(100, 140)).toBe(40);
    });

    it('returns zero when price equals cost', () => {
      expect(markupFromPrice(100, 100)).toBe(0);
    });

    it('rounds derived markup to two decimals', () => {
      expect(markupFromPrice(80, 99.99)).toBe(24.99);
    });

    it('returns null when cost is zero or invalid', () => {
      expect(markupFromPrice(0, 100)).toBeNull();
      expect(markupFromPrice(-5, 100)).toBeNull();
      expect(markupFromPrice(Number.NaN, 100)).toBeNull();
    });
  });

  describe('formatMarkup', () => {
    it('formats null as empty string', () => {
      expect(formatMarkup(null)).toBe('');
    });

    it('formats integer markup without decimals', () => {
      expect(formatMarkup(40)).toBe('40');
    });

    it('formats fractional markup with two decimals', () => {
      expect(formatMarkup(24.99)).toBe('24.99');
    });
  });
});
