/* ============================================================
   GET /api/verify-payment?ref=ORDER_REFERENCE
   Polled by the frontend to check payment/order status.
   Returns the order status and enrollment state.
   Does NOT enroll — enrollment happens only via webhook.
   ============================================================ */

'use strict';

import { storeGet } from './lib/store.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
  if (req.method !== 'GET') return json(405, { error: 'Method not allowed' });

  const url = new URL(req.url);
  const ref = url.searchParams.get('ref');

  if (!ref) return json(400, { error: 'ref (order reference) is required' });

  const order = await storeGet(`order:ref:${ref}`);
  if (!order) return json(404, { error: 'Order not found.' });

  // Check enrollment (created by webhook on confirmed payment)
  let enrolled = false;
  if (order.status === 'paid') {
    const enrollment = await storeGet(`enrollment:${order.userId}:${order.courseId}`);
    enrolled = !!enrollment;
  }

  // Return safe subset — never expose raw payment data to browser
  return json(200, {
    orderReference: order.orderReference,
    courseId: order.courseId,
    courseTitle: order.courseTitle,
    amount: order.amount,
    currency: order.currency,
    status: order.status,       // pending|processing|paid|failed|cancelled|expired
    paymentMethod: order.paymentMethod,
    enrolled,
    paidAt: order.paidAt || null,
    transactionReference: order.transactionReference || null,
    failureReason: order.failureReason || null,
    updatedAt: order.updatedAt,
  });
}
