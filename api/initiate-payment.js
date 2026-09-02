/* ============================================================
   POST /api/initiate-payment
   Initiates payment via Safaricom Daraja M-Pesa STK Push or Card.

   Body: { orderReference, method: 'mpesa'|'card', phone?, forceResend?: boolean }

   Returns (mpesa): {
     status: 'pending',
     message,
     orderReference,
     checkoutRequestId,
     phone,
     maskedPhone,
     amount,
     payableAmountKes,
     courseTitle,
     cooldownSeconds
   }
   ============================================================ */

'use strict';

import { storeGet, storeSet, generateId } from '../lib/store.js';
import { initiateStkPush } from '../lib/daraja.js';
import { initializeCardPayment } from '../lib/paystack.js';
import { validateKenyanPhone, maskPhone } from '../lib/phone.js';

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

export default async function handler(req, res) {
  // Support standard Node.js req/res signature
  if (res && typeof res.status === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON body' }); }
    }
    body = body || {};

    const response = await handleInitiate(body);
    return res.status(response.status).json(response.body);
  }

  // Web API / Edge runtime signature
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = typeof req.json === 'function' ? await req.json() : req.body;
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const response = await handleInitiate(body || {});
  return json(response.status, response.body);
}

async function handleInitiate(body) {
  const { orderReference, method, phone, forceResend } = body;

  if (!orderReference || typeof orderReference !== 'string') {
    return { status: 400, body: { error: 'orderReference is required' } };
  }
  if (!['mpesa', 'card'].includes(method)) {
    return { status: 400, body: { error: 'method must be "mpesa" or "card"' } };
  }

  // ── 1. Load & Validate Order ──────────────────────────────
  const order = await storeGet(`order:ref:${orderReference}`);
  if (!order) {
    return { status: 404, body: { error: 'Order not found or has expired. Please start a new checkout.' } };
  }
  if (order.status === 'paid') {
    return { status: 409, body: { error: 'already_paid', message: 'This order has already been paid.' } };
  }
  if (['cancelled', 'expired'].includes(order.status)) {
    return { status: 409, body: { error: 'order_inactive', message: `This order is ${order.status}. Please start a new checkout.` } };
  }

  const payableAmountKes = Math.max(1, Math.round((Number(order.amount) || 0) / 100));

  // ── 2. M-Pesa Express STK Push ────────────────────────────
  if (method === 'mpesa') {
    const phoneValidation = validateKenyanPhone(phone);
    if (!phoneValidation.valid) {
      return { status: 400, body: { error: phoneValidation.error } };
    }

    // Cooldown check (prevent duplicate STK push storms within 30 seconds)
    const cooldownKey = `cooldown:${orderReference}:mpesa`;
    const activeCooldown = await storeGet(cooldownKey);
    if (activeCooldown && !forceResend) {
      const elapsed = Math.round((Date.now() - activeCooldown.timestamp) / 1000);
      const remaining = Math.max(1, 30 - elapsed);
      return {
        status: 200,
        body: {
          status: 'pending',
          message: `An M-Pesa payment request has been sent to ${phoneValidation.masked}. Enter your M-Pesa PIN on your phone to authorize the payment. Do not close this page.`,
          orderReference: order.orderReference,
          checkoutRequestId: activeCooldown.checkoutRequestId || order.checkoutRequestId || '',
          phone: phoneValidation.normalised,
          maskedPhone: phoneValidation.masked,
          amount: order.amount,
          payableAmountKes,
          courseTitle: order.courseTitle,
          cooldownSeconds: remaining,
          resumed: true,
        },
      };
    }

    let stkResult;
    try {
      stkResult = await initiateStkPush({
        phone: phoneValidation.normalised,
        amount: payableAmountKes,
        orderReference: order.orderReference,
        accountReference: 'Instructify',
        transactionDesc: (order.courseTitle || 'Course Fee').slice(0, 13),
      });
    } catch (err) {
      console.error('[initiate-payment] Safaricom Daraja STK Push failed:', err.message);
      return {
        status: 502,
        body: { error: `Failed to send M-Pesa prompt: ${err.message}. Please check your phone number and try again.` },
      };
    }

    const paymentId = generateId('pay');
    const now = new Date().toISOString();

    const paymentRecord = {
      id: paymentId,
      orderId: order.id,
      orderReference: order.orderReference,
      provider: 'mpesa',
      checkoutRequestId: stkResult.checkoutRequestId,
      merchantRequestId: stkResult.merchantRequestId,
      phone: phoneValidation.normalised,
      maskedPhone: phoneValidation.masked,
      amount: order.amount,
      payableAmountKes,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // Update order status to processing with Daraja identifiers
    const updatedOrder = {
      ...order,
      status: 'processing',
      paymentMethod: 'mpesa',
      checkoutRequestId: stkResult.checkoutRequestId,
      merchantRequestId: stkResult.merchantRequestId,
      paymentPhone: phoneValidation.normalised,
      maskedPhone: phoneValidation.masked,
      updatedAt: now,
    };

    await storeSet(`order:ref:${order.orderReference}`, updatedOrder);
    await storeSet(`order:id:${order.id}`, updatedOrder);
    await storeSet(`payment:${paymentId}`, paymentRecord);
    // Map CheckoutRequestID -> Order Reference for webhook resolution
    await storeSet(`stk:checkout:${stkResult.checkoutRequestId}`, { orderReference: order.orderReference }, 1800);
    // Set 30-second cooldown marker
    await storeSet(cooldownKey, { timestamp: Date.now(), checkoutRequestId: stkResult.checkoutRequestId }, 30);

    return {
      status: 200,
      body: {
        status: 'pending',
        message: `An M-Pesa payment request has been sent to ${phoneValidation.masked}. Enter your M-Pesa PIN on your phone to authorize the payment. Do not close this page.`,
        orderReference: order.orderReference,
        checkoutRequestId: stkResult.checkoutRequestId,
        phone: phoneValidation.normalised,
        maskedPhone: phoneValidation.masked,
        amount: order.amount,
        payableAmountKes,
        courseTitle: order.courseTitle,
        cooldownSeconds: 30,
        sandbox: stkResult.sandboxSimulation || false,
      },
    };
  }

  // ── 3. Card Payment (Paystack) ────────────────────────────
  if (method === 'card') {
    const callbackUrl = `${process.env.APP_BASE_URL || ''}/payment-success.html?ref=${orderReference}`;
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
      return { status: 502, body: { error: 'Payment initialization failed. Please try again.' } };
    }

    const paymentId = generateId('pay');
    const paymentRecord = {
      id: paymentId,
      orderId: order.id,
      orderReference: order.orderReference,
      provider: 'paystack',
      providerPaymentReference: orderReference,
      method: 'card',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedOrder = {
      ...order,
      status: 'processing',
      paymentMethod: 'card',
      updatedAt: new Date().toISOString(),
    };

    await storeSet(`order:ref:${orderReference}`, updatedOrder);
    await storeSet(`order:id:${order.id}`, updatedOrder);
    await storeSet(`payment:${paymentId}`, paymentRecord);

    return {
      status: 200,
      body: {
        status: 'redirect',
        authorizationUrl: paystackData.authorization_url,
        accessCode: paystackData.access_code,
        reference: orderReference,
      },
    };
  }

  return { status: 400, body: { error: 'Unsupported payment method.' } };
}
