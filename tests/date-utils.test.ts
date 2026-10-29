import { describe, it, expect } from 'vitest';
import { getTodayDateWIB, getDefaultCheckoutWIB } from '../src/lib/date-utils';

describe('Date Utils Asia/Jakarta (WIB)', () => {
  it('returns valid YYYY-MM-DD format for today WIB', () => {
    const today = getTodayDateWIB();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('calculates +1 day for daily rental', () => {
    const checkout = getDefaultCheckoutWIB('2026-10-30', 'daily');
    expect(checkout).toBe('2026-10-31');
  });

  it('calculates +1 month for monthly rental', () => {
    const checkout = getDefaultCheckoutWIB('2026-10-30', 'monthly');
    expect(checkout).toBe('2026-11-30');
  });

  it('calculates +1 year for yearly rental', () => {
    const checkout = getDefaultCheckoutWIB('2026-10-30', 'yearly');
    expect(checkout).toBe('2027-10-30');
  });

  it('handles invalid checkin gracefully', () => {
    const fallback = getDefaultCheckoutWIB('invalid', 'daily');
    expect(fallback).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
