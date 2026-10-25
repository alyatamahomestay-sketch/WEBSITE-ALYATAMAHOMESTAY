import { describe, it, expect } from 'vitest';
import { normalizeIndonesianPhone, isValidIndonesianPhone, formatPhoneDisplay } from '../src/lib/phone';

describe('Phone Number Normalization & Validation', () => {
  it('normalizes local 08xx to standard 628xx format', () => {
    expect(normalizeIndonesianPhone('081234567890')).toBe('6281234567890');
    expect(normalizeIndonesianPhone('0813-4455-6677')).toBe('6281344556677');
    expect(normalizeIndonesianPhone('+62 812-3456-7890')).toBe('6281234567890');
    expect(normalizeIndonesianPhone('6281234567890')).toBe('6281234567890');
  });

  it('validates active Indonesian mobile and WhatsApp formats', () => {
    expect(isValidIndonesianPhone('081234567890')).toBe(true);
    expect(isValidIndonesianPhone('+6281234567890')).toBe(true);
    expect(isValidIndonesianPhone('6281234567890')).toBe(true);
    
    // Invalid formats
    expect(isValidIndonesianPhone('12345')).toBe(false);
    expect(isValidIndonesianPhone('0215556677')).toBe(false); // Landline Jakarta
    expect(isValidIndonesianPhone('')).toBe(false);
  });

  it('formats display phone with human-readable country code spacing', () => {
    const display = formatPhoneDisplay('081234567890');
    expect(display).toBe('+62 812-3456-7890');
  });
});
