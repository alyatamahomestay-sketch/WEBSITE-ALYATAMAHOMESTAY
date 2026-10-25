/**
 * Normalizes Indonesian phone numbers:
 * Converts:
 * 08123456789 -> 628123456789
 * +62 812-3456-789 -> 628123456789
 * 628123456789 -> 628123456789
 */
export function normalizeIndonesianPhone(phone: string): string {
  if (!phone) return '';
  // Strip all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Validates if a phone number is a valid Indonesian mobile or WhatsApp number
 */
export function isValidIndonesianPhone(phone: string): boolean {
  const normalized = normalizeIndonesianPhone(phone);
  // Indonesian mobile numbers usually start with 628 and have 10-15 digits total
  return /^628\d{8,12}$/.test(normalized);
}

/**
 * Formats normalized phone for display: +62 812-3456-7890
 */
export function formatPhoneDisplay(phone: string): string {
  const norm = normalizeIndonesianPhone(phone);
  if (!norm || norm.length < 10) return phone;
  
  const country = '+' + norm.slice(0, 2);
  const part1 = norm.slice(2, 5);
  const part2 = norm.slice(5, 9);
  const part3 = norm.slice(9);
  
  return `${country} ${part1}-${part2}-${part3}`;
}
