import { describe, expect, it } from 'vitest';

import { toApiEndDate, toApiStartDate } from './date-utils';

describe('date-utils', () => {
  it('formats start date at beginning of day', () => {
    expect(toApiStartDate('2026-04-01')).toBe('2026-04-01T00:00:00');
  });

  it('formats end date at end of day', () => {
    expect(toApiEndDate('2026-04-01')).toBe('2026-04-01T23:59:59');
  });
});
