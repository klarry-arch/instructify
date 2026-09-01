/* ============================================================
   POST /api/webhook/mpesa
   Safaricom Daraja M-Pesa STK Push Webhook Callback Handler.

   Idempotently processes Safaricom callbacks, validates amounts,
   records M-Pesa receipt numbers, completes orders, and grants course access.
   ============================================================ */

'use strict';

import { storeGet, storeSet, storeSetAdd, storeSetHas, generateId } from '../lib/store.js';

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
  // Support standard Node.js signature
  if (res && typeof res.status === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ ResultCode: 1, ResultDesc: 'Method not allowed' });

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid JSON' }); }
    }
    body = body || {};

    const response = await handleCallback(body);
    return res.status(response.status).json(response.body);
  }

  // Web API / Edge runtime signature
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { ResultCode: 1, ResultDesc: 'Method not allowed' });

  let body;
  try {
    body = typeof req.json === 'function' ? await req.json() : req.body;
  } catch {
    return json(400, { ResultCode: 1, ResultDesc: 'Invalid JSON body' });
  }

  const response = await handleCallback(body || {});
  return json(response.status, response.body);
}

async function handleCallback(body) {
  const stkCallback = body?.Body?.stkCallback || body?.stkCallback;

  if (!stkCallback) {
    console.warn('[webhook/mpesa] Missing stkCallback structure in payload');
    return { status: 200, body: { ResultCode: 0, ResultDesc: 'Accepted (ignored malformed payload)' } };
  }

  const {
    MerchantRequestID,
    CheckoutRequestID,
    ResultCode,
    ResultDesc,
    CallbackMetadata,
  } = stkCallback;

  console.log(`[webhook/mpesa] Received callback: CheckoutRequestID=${CheckoutRequestID}, ResultCode=${ResultCode}, ResultDesc=${ResultDesc}`);

  // ── 1. Locate Order ───────────────────────────────────────
  let orderReference = null;
  const stkMapping = await storeGet(`stk:checkout:${CheckoutRequestID}`);
  if (stkMapping && stkMapping.orderReference) {
    orderReference = stkMapping.orderReference;
  }

  if (!orderReference) {
    // Attempt reverse lookup via order records
    const possibleOrder = await storeGet(`order:ref:${MerchantRequestID}`);
    if (possibleOrder) orderReference = possibleOrder.orderReference;
  }

  if (!orderReference) {
    console.warn(`[webhook/mpesa] No order found matching CheckoutRequestID=${CheckoutRequestID}`);
    // Acknowledge to Safaricom so they don't retry endlessly
    return { status: 200, body: { ResultCode: 0, ResultDesc: 'Accepted' } };
  }

  const order = await storeGet(`order:ref:${orderReference}`);
  if (!order) {
    console.warn(`[webhook/mpesa] Order ${orderReference} not found in store`);
    return { status: 200, body: { ResultCode: 0, ResultDesc: 'Accepted' } };
  }

  // ── 2. Idempotency Check ──────────────────────────────────
  if (order.status === 'paid') {
    console.log(`[webhook/mpesa] Order ${orderReference} is already marked as paid. Skipping duplicate processing.`);
    return { status: 200, body: { ResultCode: 0, ResultDesc: 'Accepted (idempotent duplicate)' } };
  }

  const now = new Date().toISOString();

  // ── 3. Parse Metadata on Success (ResultCode === 0) ───────
  if (Number(ResultCode) === 0) {
    const metaMap = {};
    if (CallbackMetadata && Array.isArray(CallbackMetadata.Item)) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name && item.Value !== undefined) {
          metaMap[item.Name] = item.Value;
        }
      }
    }

    const receiptNumber = String(metaMap.MpesaReceiptNumber || '').trim().toUpperCase();
    const paidAmount = Number(metaMap.Amount) || 0;
    const phone = String(metaMap.PhoneNumber || '');
    const transactionDate = String(metaMap.TransactionDate || '');

    // Check duplicate receipt number protection
    if (receiptNumber) {
      const isReceiptUsed = await storeSetHas('mpesa:used_receipts', receiptNumber);
      if (isReceiptUsed) {
        console.warn(`[webhook/mpesa] Security alert: M-Pesa receipt ${receiptNumber} was already used.`);
        const flaggedOrder = {
          ...order,
          status: 'under_review',
          failureReason: `Duplicate M-Pesa receipt ${receiptNumber} detected.`,
          updatedAt: now,
        };
        await storeSet(`order:ref:${orderReference}`, flaggedOrder);
        await storeSet(`order:id:${order.id}`, flaggedOrder);
        return { status: 200, body: { ResultCode: 0, ResultDesc: 'Accepted' } };
      }
      await storeSetAdd('mpesa:used_receipts', receiptNumber);
    }

    // Verify amount matches expected server-side order price (in KES)
    const expectedKes = Math.round(Number(order.amount) / 100);
    if (paidAmount && expectedKes && paidAmount < expectedKes) {
      console.warn(`[webhook/mpesa] Amount mismatch for order ${orderReference}: expected KES ${expectedKes}, received KES ${paidAmount}`);
      const underpaidOrder = {
        ...order,
        status: 'amount_mismatch',
        receivedAmountKes: paidAmount,
        expectedAmountKes: expectedKes,
        receiptNumber,
        failureReason: `Received KES ${paidAmount}, but course fee is KES ${expectedKes}.`,
        updatedAt: now,
      };
      await storeSet(`order:ref:${orderReference}`, underpaidOrder);
      await storeSet(`order:id:${order.id}`, underpaidOrder);
      return { status: 200, body: { ResultCode: 0, ResultDesc: 'Accepted' } };
    }

    // ── Update Order to Completed & Paid ──
    const completedOrder = {
      ...order,
      status: 'paid',
      orderStatus: 'completed',
      paymentMethod: 'mpesa',
      paymentProvider: 'M-Pesa',
      receiptNumber: receiptNumber || `MP-${Date.now()}`,
      transactionReference: receiptNumber || `MP-${Date.now()}`,
      paidAmount: order.amount,
      paidAmountKes: paidAmount || expectedKes,
      paymentPhone: phone || order.paymentPhone,
      transactionDate,
      paidAt: now,
      updatedAt: now,
    };

    await storeSet(`order:ref:${orderReference}`, completedOrder);
    await storeSet(`order:id:${order.id}`, completedOrder);

    // ── Post-Payment Fulfillment (LMS Enrollment) ──
    if (order.userId && order.courseId) {
      const enrollmentKey = `enrollment:${order.userId}:${order.courseId}`;
      const enrollmentRecord = {
        id: generateId('enr'),
        userId: order.userId,
        userEmail: order.userEmail,
        userName: order.userName || '',
        courseId: order.courseId,
        courseTitle: order.courseTitle,
        orderReference: order.orderReference,
        receiptNumber: completedOrder.receiptNumber,
        enrolledAt: now,
        progress: 0,
        completed: false,
        status: 'active',
        lastAccessedAt: now,
      };
      await storeSet(enrollmentKey, enrollmentRecord);
      await storeSetAdd(`user:${order.userId}:enrollments`, order.courseId);
    }

    // Store audit trail
    const auditRecord = {
      id: generateId('audit'),
      orderReference,
      checkoutRequestId: CheckoutRequestID,
      receiptNumber: completedOrder.receiptNumber,
      amount: paidAmount,
      resultCode: ResultCode,
      resultDesc: ResultDesc,
      receivedAt: now,
    };
    await storeSet(`audit:mpesa:${CheckoutRequestID}`, auditRecord);

    console.log(`[webhook/mpesa] Order ${orderReference} successfully marked as PAID with receipt ${completedOrder.receiptNumber}`);
    return { status: 200, body: { ResultCode: 0, ResultDesc: 'Accepted' } };
  }

  // ── 4. Handle Failed / Cancelled STK Push ──────────────────
  let internalStatus = 'failed';
  let friendlyReason = ResultDesc || 'Payment was not completed.';

  if (Number(ResultCode) === 1032) {
    internalStatus = 'cancelled';
    friendlyReason = 'The M-Pesa payment prompt was cancelled on the phone.';
  } else if (Number(ResultCode) === 1037) {
    internalStatus = 'timed_out';
    friendlyReason = 'The payment prompt timed out. Please ensure your phone is unlocked and try again.';
  } else if (Number(ResultCode) === 1 || Number(ResultCode) === 2001) {
    internalStatus = 'failed';
    friendlyReason = 'The M-Pesa transaction could not be completed due to insufficient balance.';
  }

  const failedOrder = {
    ...order,
    status: internalStatus,
    failureCode: ResultCode,
    failureReason: friendlyReason,
    updatedAt: now,
  };

  await storeSet(`order:ref:${orderReference}`, failedOrder);
  await storeSet(`order:id:${order.id}`, failedOrder);

  console.log(`[webhook/mpesa] Order ${orderReference} updated to ${internalStatus}: ${friendlyReason}`);
  return { status: 200, body: { ResultCode: 0, ResultDesc: 'Accepted' } };
}
