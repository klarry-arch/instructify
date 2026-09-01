/* ============================================================
   INSTRUCTIFY KENYA — Kenyan Phone Number Utilities
   Normalise, mask, and validate Safaricom (M-Pesa eligible) numbers.
   ============================================================ */

'use strict';

/**
 * Valid Safaricom prefixes after country code (254).
 * 7XX → mobile; 1XX → newer Safaricom 011X series.
 */
const SAFARICOM_PREFIXES = [
  '700','701','702','703','704','705','706','707','708','709',
  '710','711','712','713','714','715','716','717','718','719',
  '720','721','722','723','724','725','726','727','728','729',
  '740','741','742','743','744','745','746','747','748','749',
  '757','758','759',
  '768','769',
  '790','791','792','793','794','795','796','797','798','799',
  '110','111','112','113','114','115','116','117','118','119',
];

/**
 * Normalise a Kenyan phone number to international format (2547XXXXXXXX or 2541XXXXXXXX).
 * Accepts: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, +2547XXXXXXXX, +2541XXXXXXXX.
 * Returns null if the number cannot be normalised.
 *
 * @param {string} raw
 * @returns {string|null}
 */
export function normalisePhone(raw) {
  if (!raw || typeof raw !== 'string') return null;

  // Strip whitespace, dashes, parentheses, dots
  let phone = raw.replace(/[\s\-().]/g, '');

  // Remove leading +
  if (phone.startsWith('+')) phone = phone.slice(1);

  // Already in international format 254XXXXXXXXX
  if (/^254\d{9}$/.test(phone)) return phone;

  // 07XXXXXXXXX or 01XXXXXXXXX → 254XXXXXXXXX
  if (/^0[71]\d{8}$/.test(phone)) return '254' + phone.slice(1);

  // 7XXXXXXXX or 1XXXXXXXX (9 digits without leading zero)
  if (/^[71]\d{8}$/.test(phone)) return '254' + phone;

  return null;
}

/**
 * Validate that a normalised number belongs to Safaricom.
 * @param {string} normalised — expects 254XXXXXXXXX format
 * @returns {boolean}
 */
export function isSafaricomNumber(normalised) {
  if (!normalised || normalised.length !== 12) return false;
  const prefix = normalised.slice(3, 6); // digits 4-6 (e.g. 712, 110)
  return SAFARICOM_PREFIXES.includes(prefix);
}

/**
 * Mask a Kenyan phone number for secure client display (e.g. 2547***678).
 * @param {string} raw
 * @returns {string}
 */
export function maskPhone(raw) {
  const norm = normalisePhone(raw) || String(raw || '');
  if (norm.length >= 10) {
    return norm.slice(0, 4) + '***' + norm.slice(-3);
  }
  return norm ? norm.slice(0, 2) + '***' + norm.slice(-2) : '2547***000';
}

/**
 * Full validation: normalise then check Safaricom prefix.
 * @param {string} raw
 * @returns {{ valid: boolean, normalised: string|null, masked: string|null, error: string|null }}
 */
export function validateKenyanPhone(raw) {
  const normalised = normalisePhone(raw);
  if (!normalised) {
    return {
      valid: false,
      normalised: null,
      masked: null,
      error: 'Enter a valid Kenyan phone number (e.g. 0712 345 678 or 0110 123 456).',
    };
  }
  if (!isSafaricomNumber(normalised)) {
    return {
      valid: false,
      normalised,
      masked: maskPhone(normalised),
      error: 'M-Pesa STK Push requires a Safaricom number. Please enter your active Safaricom line.',
    };
  }
  return {
    valid: true,
    normalised,
    masked: maskPhone(normalised),
    error: null,
  };
}
