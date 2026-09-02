/* ============================================================
   INSTRUCTIFY KENYA — Paystack API Client
   Keeps all provider-specific logic in one place.
   Swap this file to change payment providers.
   ============================================================ */

'use strict';

import { createHmac } from 'crypto';

const PAYSTACK_BASE = 'https://api.paystack.co';

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set');
  return key;
}

async function paystackRequest(method, path, body = null) {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message || `Paystack API error ${res.status}`);
  }
  return data.data;
}

/**
 * Initialize a card transaction.
 * Returns { authorization_url, access_code, reference }.
 *
 * @param {{ email, amount, currency, reference, callbackUrl }} params
 */
export async function initializeCardPayment({ email, amount, currency, reference, callbackUrl }) {
  return paystackRequest('POST', '/transaction/initialize', {
    email,
    amount,           // minor units
    currency,
    reference,
    callback_url: callbackUrl,
    channels: ['card'],
  });
}

/**
 * Initiate an M-Pesa STK Push via Paystack mobile_money channel.
 * Returns { reference, status, display_text }.
 *
 * @param {{ email, amount, currency, reference, phone }} params
 */
export async function initiateMpesaPayment({ email, amount, currency, reference, phone }) {
  return paystackRequest('POST', '/charge', {
    email,
    amount,
    currency,
    reference,
    mobile_money: {
      phone,           // normalised 2547XXXXXXXXX
      provider: 'mpesa',
    },
  });
}

/**
 * Verify a transaction by its reference.
 * Returns the full transaction data object.
 *
 * @param {string} reference
 */
export async function verifyTransaction(reference) {
  return paystackRequest('GET', `/transaction/verify/${encodeURIComponent(reference)}`);
}

/**
 * Verify a Paystack webhook signature.
 * Paystack signs the raw body with HMAC-SHA512 using the webhook secret.
 *
 * @param {string} rawBody     — raw request body as string
 * @param {string} signature   — value of x-paystack-signature header
 * @returns {boolean}
 */
export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[paystack] PAYSTACK_WEBHOOK_SECRET is not set — rejecting webhook');
    return false;
  }
  if (!signature) return false;

  const expected = createHmac('sha512', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Sanitise the Paystack transaction object for safe storage.
 * Removes sensitive authorization/card fields.
 *
 * @param {object} txn — raw Paystack transaction
 * @returns {object}
 */
export function sanitiseTransaction(txn) {
  if (!txn) return {};
  const { authorization, customer, ...safe } = txn;
  return {
    ...safe,
    customer: customer ? { email: customer.email } : undefined,
    // Strip full card details; keep only safe subset
    authorization: authorization
      ? {
          bank: authorization.bank,
          card_type: authorization.card_type,
          last4: authorization.last4,
          country_code: authorization.country_code,
          channel: authorization.channel,
        }
      : undefined,
  };
}
