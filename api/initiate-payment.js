/* ============================================================
   POST /api/initiate-payment
   Initiates payment via Paystack — M-Pesa STK Push or card.

   Body: { orderReference, method: 'mpesa'|'card', phone? }

   Returns (mpesa): { status: 'pending', message, reference }
   Returns (card):  { status: 'redirect', authorizationUrl, accessCode }
   ============================================================ */

'use strict';

import { storeGet, storeSet } from './lib/store.js';
import { initiateMpesaPayment, initializeCardPayment } from './lib/paystack.js';
import { validateKenyanPhone } from './lib/phone.js';
import { generateId } from './lib/store.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const { orderReference, method, phone } = body;

  if (!orderReference) return json(400, { error: 'orderReference is required' });
  if (!['mpesa', 'card'].includes(method)) {
    return json(400, { error: 'method must be "mpesa" or "card"' });
  }

  // ── Load order ────────────────────────────────────────────
  const order = await storeGet(`order:ref:${orderReference}`);
  if (!order) return json(404, { error: 'Order not found.' });
  if (order.status === 'paid') {
    return json(409, { error: 'already_paid', message: 'This order has already been paid.' });
  }
  if (['failed', 'cancelled', 'expired'].includes(order.status)) {
    return json(409, { error: 'order_inactive', message: `This order is ${order.status}. Please start a new order.` });
  }

  // ── Prevent duplicate initiation ──────────────────────────
  const initiationKey = `initiated:${orderReference}:${method}`;
  const alreadyInitiated = await storeGet(initiationKey);
  if (alreadyInitiated) {
    // Return the same payment reference so the frontend can continue polling
    return json(200, {
      status: method === 'mpesa' ? 'pending' : 'redirect',
      message: 'Payment already initiated. Please complete the request on your phone.',
      reference: alreadyInitiated.paymentReference,
      ...(alreadyInitiated.authorizationUrl
        ? { authorizationUrl: alreadyInitiated.authorizationUrl, accessCode: alreadyInitiated.accessCode }
        : {}),
    });
  }

  const callbackUrl = `${process.env.APP_BASE_URL || ''}/payment-success.html?ref=${orderReference}`;
  let paymentRecord;

  // ── M-Pesa STK Push ───────────────────────────────────────
  if (method === 'mpesa') {
    const phoneValidation = validateKenyanPhone(phone);
    if (!phoneValidation.valid) {
      return json(400, { error: phoneValidation.error });
    }

    let paystackData;
    try {
      paystackData = await initiateMpesaPayment({
        email: order.userEmail,
        amount: order.amount,
        currency: order.currency,
        reference: orderReference,
        phone: phoneValidation.normalised,
      });
    } catch (err) {
      console.error('[initiate-payment] M-Pesa error:', err.message);
      return json(502, { error: 'Payment initiation failed. Please try again.' });
    }

    paymentRecord = {
      id: generateId('pay'),
      orderId: order.id,
      provider: 'paystack',
      providerPaymentReference: paystackData.reference || orderReference,
      method: 'mpesa',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Update order status to processing
    const updatedOrder = { ...order, status: 'processing', paymentMethod: 'mpesa', updatedAt: new Date().toISOString() };
    await storeSet(`order:ref:${orderReference}`, updatedOrder);
    await storeSet(`order:id:${order.id}`, updatedOrder);
    await storeSet(`payment:${paymentRecord.id}`, paymentRecord);
    await storeSet(initiationKey, { paymentReference: paymentRecord.providerPaymentReference }, 600);

    return json(200, {
      status: 'pending',
      message: 'An M-Pesa STK Push has been sent to your phone. Enter your PIN to complete payment.',
      reference: paymentRecord.providerPaymentReference,
    });
  }

  // ── Card Payment (Paystack Popup) ─────────────────────────
  if (method === 'card') {
    let paystackData;
    try {
      paystackData = await initializeCardPayment({
        email: order.userEmail,
        amount: order.amount,
        currency: order.currency,
        reference: orderReference,
        callbackUrl,
      });
    } catch (err) {
      console.error('[initiate-payment] Card init error:', err.message);
      return json(502, { error: 'Payment initialization failed. Please try again.' });
    }

    paymentRecord = {
      id: generateId('pay'),
      orderId: order.id,
      provider: 'paystack',
      providerPaymentReference: orderReference,
      method: 'card',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedOrder = { ...order, status: 'processing', paymentMethod: 'card', updatedAt: new Date().toISOString() };
    await storeSet(`order:ref:${orderReference}`, updatedOrder);
    await storeSet(`order:id:${order.id}`, updatedOrder);
    await storeSet(`payment:${paymentRecord.id}`, paymentRecord);
    await storeSet(initiationKey, {
      paymentReference: orderReference,
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
    }, 1800);

    return json(200, {
      status: 'redirect',
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
      reference: orderReference,
    });
  }
}
