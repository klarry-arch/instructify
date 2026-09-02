/* ============================================================
   POST /api/webhook/paystack
   Receives Paystack webhook events and processes confirmed payments.

   Security:
   - Verifies HMAC-SHA512 signature (x-paystack-signature header)
   - Validates currency = KES
   - Validates amount matches server-side order total
   - Idempotent: duplicate events are safely ignored
   - Uses atomic KV writes to prevent double-enrollment

   On charge.success:
   1. Verify signature
   2. Find order by reference
   3. Validate currency + amount
   4. Check idempotency (providerTransactionId already processed?)
   5. Mark order as paid
   6. Create enrollment
   7. Return 200 immediately

   On charge.failed / transfer.reversed:
   - Mark order as failed
   - Do NOT create enrollment
   ============================================================ */

'use strict';

import { verifyWebhookSignature, sanitiseTransaction } from '../../lib/paystack.js';
import { storeGet, storeSet, storeSetHas, storeSetAdd, generateId } from '../../lib/store.js';

function json(status, body = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req) {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  // ── 1. Read raw body for signature verification ───────────
  let rawBody;
  try {
    rawBody = await req.text();
  } catch {
    return json(400, { error: 'Could not read request body' });
  }

  // ── 2. Verify webhook signature ───────────────────────────
  const signature = req.headers.get('x-paystack-signature') || '';
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[webhook] Invalid signature — rejecting request');
    return json(401, { error: 'Invalid webhook signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json(400, { error: 'Invalid JSON payload' });
  }

  const { event: eventType, data } = event;

  // ── 3. Handle charge.success ──────────────────────────────
  if (eventType === 'charge.success') {
    return handleChargeSuccess(data);
  }

  // ── 4. Handle failed/cancelled events ────────────────────
  if (['charge.failed', 'transfer.reversed', 'charge.dispute.create'].includes(eventType)) {
    return handleChargeFailed(data, eventType);
  }

  // Acknowledge unknown events
  return json(200, { received: true });
}

async function handleChargeSuccess(data) {
  const {
    reference,
    amount,
    currency,
    status,
    id: providerTransactionId,
    paid_at,
  } = data;

  if (status !== 'success') {
    return json(200, { received: true, note: 'Non-success status — ignored' });
  }

  // ── 5. Idempotency — check if this transaction was already processed ──
  const processedKey = `processed_txn:${providerTransactionId}`;
  const alreadyProcessed = await storeSetHas('processed_transactions', String(providerTransactionId));
  if (alreadyProcessed) {
    console.log(`[webhook] Duplicate event for transaction ${providerTransactionId} — skipped`);
    return json(200, { received: true, note: 'Duplicate event — already processed' });
  }

  // ── 6. Find order ─────────────────────────────────────────
  const order = await storeGet(`order:ref:${reference}`);
  if (!order) {
    console.warn(`[webhook] Order not found for reference: ${reference}`);
    return json(200, { received: true, note: 'Order not found — skipped' });
  }

  // ── 7. Validate currency ──────────────────────────────────
  if (currency !== 'KES') {
    console.warn(`[webhook] Currency mismatch: expected KES, got ${currency}`);
    return json(200, { received: true, note: 'Currency mismatch — skipped' });
  }

  // ── 8. Validate amount ────────────────────────────────────
  if (Number(amount) !== Number(order.amount)) {
    console.warn(`[webhook] Amount mismatch: expected ${order.amount}, got ${amount}`);
    // Mark as suspicious — do not enroll
    const suspiciousOrder = {
      ...order,
      status: 'failed',
      failureReason: `Amount mismatch: expected ${order.amount}, received ${amount}`,
      updatedAt: new Date().toISOString(),
    };
    await storeSet(`order:ref:${reference}`, suspiciousOrder);
    await storeSet(`order:id:${order.id}`, suspiciousOrder);
    return json(200, { received: true, note: 'Amount mismatch — order marked failed' });
  }

  // ── 9. Check if order is already paid ─────────────────────
  if (order.status === 'paid') {
    return json(200, { received: true, note: 'Order already paid — skipped' });
  }

  const now = new Date().toISOString();

  // ── 10. Create payment record ─────────────────────────────
  const paymentId = generateId('pay');
  const payment = {
    id: paymentId,
    orderId: order.id,
    provider: 'paystack',
    providerPaymentReference: reference,
    providerTransactionReference: String(providerTransactionId),
    amount: order.amount,
    currency: order.currency,
    status: 'paid',
    paidAt: paid_at || now,
    providerResponse: sanitiseTransaction(data),  // sanitised — no raw card data
    createdAt: now,
    updatedAt: now,
  };
  await storeSet(`payment:${paymentId}`, payment);

  // ── 11. Mark order as paid ────────────────────────────────
  const paidOrder = {
    ...order,
    status: 'paid',
    paymentId,
    transactionReference: String(providerTransactionId),
    paidAt: paid_at || now,
    updatedAt: now,
  };
  await storeSet(`order:ref:${reference}`, paidOrder);
  await storeSet(`order:id:${order.id}`, paidOrder);

  // ── 12. Create enrollment ─────────────────────────────────
  const enrollmentKey = `enrollment:${order.userId}:${order.courseId}`;
  const existingEnrollment = await storeGet(enrollmentKey);

  if (!existingEnrollment) {
    const enrollment = {
      id: generateId('enr'),
      userId: order.userId,
      courseId: order.courseId,
      orderId: order.id,
      paymentId,
      status: 'active',
      enrolledAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await storeSet(enrollmentKey, enrollment);
    // Also index by userId for listing enrollments
    await storeSetAdd(`user_enrollments:${order.userId}`, order.courseId);
    console.log(`[webhook] Enrollment created: ${order.userId} → ${order.courseId}`);
  }

  // ── 13. Mark transaction as processed (idempotency) ───────
  await storeSetAdd('processed_transactions', String(providerTransactionId));

  console.log(`[webhook] Payment confirmed: order ${reference}, user ${order.userId}`);
  return json(200, { received: true });
}

async function handleChargeFailed(data, eventType) {
  const { reference, gateway_response } = data;
  if (!reference) return json(200, { received: true });

  const order = await storeGet(`order:ref:${reference}`);
  if (!order || order.status === 'paid') {
    return json(200, { received: true });
  }

  const statusMap = {
    'charge.failed': 'failed',
    'transfer.reversed': 'failed',
    'charge.dispute.create': 'failed',
  };

  const now = new Date().toISOString();
  const failedOrder = {
    ...order,
    status: statusMap[eventType] || 'failed',
    failureReason: gateway_response || eventType,
    updatedAt: now,
  };
  await storeSet(`order:ref:${reference}`, failedOrder);
  await storeSet(`order:id:${order.id}`, failedOrder);

  console.log(`[webhook] Payment failed: order ${reference}, reason: ${gateway_response}`);
  return json(200, { received: true });
}
