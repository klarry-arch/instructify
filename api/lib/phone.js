/* ============================================================
   INSTRUCTIFY KENYA — Kenyan Phone Number Utilities
   Normalise and validate Safaricom (M-Pesa eligible) numbers.
   ============================================================ */

'use strict';

/**
 * Valid Safaricom prefixes after country code (254).
 * 7XX → mobile; 1XX → newer Safaricom numbers.
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
 * Normalise a Kenyan phone number to international format (2547XXXXXXXX).
 * Accepts: 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, +2547XXXXXXXX.
 * Returns null if the number cannot be normalised.
 *
 * @param {string} raw
 * @returns {string|null}
 */
export function normalisePhone(raw) {
  if (!raw || typeof raw !== 'string') return null;

  // Strip whitespace, dashes, parentheses
  let phone = raw.replace(/[\s\-().]/g, '');

  // Remove leading +
  if (phone.startsWith('+')) phone = phone.slice(1);

  // Already in international format 254XXXXXXXXX
  if (/^254\d{9}$/.test(phone)) return phone;

  // 07XXXXXXXXX or 01XXXXXXXXX → 254XXXXXXXXX
  if (/^0[71]\d{8}$/.test(phone)) return '254' + phone.slice(1);

  return null;
}

/**
 * Validate that a normalised number belongs to Safaricom.
 * @param {string} normalised — expects 254XXXXXXXXX format
 * @returns {boolean}
 */
export function isSafaricomNumber(normalised) {
  if (!normalised || normalised.length !== 12) return false;
  const prefix = normalised.slice(3, 6); // digits 4-6 (e.g. 712)
  return SAFARICOM_PREFIXES.includes(prefix);
}

/**
 * Full validation: normalise then check Safaricom prefix.
 * @param {string} raw
 * @returns {{ valid: boolean, normalised: string|null, error: string|null }}
 */
export function validateKenyanPhone(raw) {
  const normalised = normalisePhone(raw);
  if (!normalised) {
    return {
      valid: false,
      normalised: null,
      error: 'Enter a valid Kenyan phone number (e.g. 0712 345 678).',
    };
  }
  if (!isSafaricomNumber(normalised)) {
    return {
      valid: false,
      normalised,
      error: 'M-Pesa STK Push requires a Safaricom number. Please use your Safaricom line.',
    };
  }
  return { valid: true, normalised, error: null };
}
