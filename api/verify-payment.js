/* ============================================================
   GET /api/verify-payment?ref=ORDER_REFERENCE
   Secure status verification & polling endpoint for checkout.
   Includes Safaricom Daraja STK Query reconciliation fallback.
   ============================================================ */

'use strict';

import { storeGet, storeSet, storeSetAdd, generateId } from '../lib/store.js';
import { queryStkPushStatus } from '../lib/daraja.js';

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

export default async function handler(req, res) {
  // Support standard Node.js req/res signature
  if (res && typeof res.status === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const ref = url.searchParams.get('ref');
    const response = await handleVerify(ref);
    return res.status(response.status).json(response.body);
  }

  // Web API / Edge runtime signature
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'GET') return json(405, { error: 'Method not allowed' });

  const url = new URL(req.url);
  const ref = url.searchParams.get('ref');
  const response = await handleVerify(ref);
  return json(response.status, response.body);
}

async function handleVerify(ref) {
  if (!ref || typeof ref !== 'string') {
    return { status: 400, body: { error: 'ref (order reference) is required' } };
  }

  let order = await storeGet(`order:ref:${ref}`);
  if (!order) {
    return { status: 404, body: { error: 'Order not found.' } };
  }

  const now = new Date().toISOString();

  // ── Daraja STK Query Reconciliation Fallback ──────────────
  // If order is still processing/pending and has been waiting > 20s, actively query Daraja
  if (['pending', 'processing'].includes(order.status) && order.checkoutRequestId) {
    const elapsedSeconds = order.updatedAt ? Math.round((Date.now() - new Date(order.updatedAt).getTime()) / 1000) : 0;
    if (elapsedSeconds >= 20) {
      try {
        const queryResult = await queryStkPushStatus({ checkoutRequestId: order.checkoutRequestId });
        if (queryResult && queryResult.success) {
          // Transaction confirmed via Daraja Query
          const raw = queryResult.raw || {};
          const receipt = raw.MpesaReceiptNumber || raw.ReceiptNumber || `MP-${Date.now()}`;
          order = {
            ...order,
            status: 'paid',
            orderStatus: 'completed',
            paymentMethod: 'mpesa',
            receiptNumber: receipt,
            transactionReference: receipt,
            paidAt: now,
            updatedAt: now,
          };
          await storeSet(`order:ref:${ref}`, order);
          await storeSet(`order:id:${order.id}`, order);

          if (order.userId && order.courseId) {
            const enrollmentKey = `enrollment:${order.userId}:${order.courseId}`;
            await storeSet(enrollmentKey, {
              id: generateId('enr'),
              userId: order.userId,
              courseId: order.courseId,
              courseTitle: order.courseTitle,
              orderReference: order.orderReference,
              receiptNumber: receipt,
              enrolledAt: now,
              progress: 0,
              completed: false,
              status: 'active',
            });
            await storeSetAdd(`user:${order.userId}:enrollments`, order.courseId);
          }
        } else if (queryResult && queryResult.resultCode === '1032') {
          order = {
            ...order,
            status: 'cancelled',
            failureReason: 'The M-Pesa payment prompt was cancelled on the phone.',
            updatedAt: now,
          };
          await storeSet(`order:ref:${ref}`, order);
          await storeSet(`order:id:${order.id}`, order);
        } else if (queryResult && queryResult.resultCode === '1037') {
          order = {
            ...order,
            status: 'timed_out',
            failureReason: 'The payment prompt timed out.',
            updatedAt: now,
          };
          await storeSet(`order:ref:${ref}`, order);
          await storeSet(`order:id:${order.id}`, order);
        }
      } catch (err) {
        // Query failure is non-fatal — continue returning current state
        console.warn(`[verify-payment] Daraja STK query error for ${ref}:`, err.message);
      }
    }
  }

  // ── Check Enrollment State ────────────────────────────────
  let enrolled = false;
  if (order.status === 'paid' && order.userId && order.courseId) {
    const enrollment = await storeGet(`enrollment:${order.userId}:${order.courseId}`);
    enrolled = Boolean(enrollment);
  }

  const payableAmountKes = Math.round((Number(order.amount) || 0) / 100);

  return {
    status: 200,
    body: {
      orderReference: order.orderReference,
      courseId: order.courseId,
      courseTitle: order.courseTitle,
      amount: order.amount,
      payableAmountKes,
      currency: order.currency || 'KES',
      status: order.status,
      paymentMethod: order.paymentMethod,
      maskedPhone: order.maskedPhone || null,
      receiptNumber: order.receiptNumber || order.transactionReference || null,
      enrolled,
      paidAt: order.paidAt || null,
      failureReason: order.failureReason || null,
      updatedAt: order.updatedAt,
    },
  };
}
