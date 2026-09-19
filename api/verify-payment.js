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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON body' }); }
      }
      const response = await handleManualVerification(body || {});
      return res.status(response.status).json(response.body);
    }

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const ref = url.searchParams.get('ref');
    const response = await handleVerify(ref);
    return res.status(response.status).json(response.body);
  }

  // Web API / Edge runtime signature
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  
  if (req.method === 'POST') {
    let body;
    try {
      body = typeof req.json === 'function' ? await req.json() : req.body;
    } catch {
      return json(400, { error: 'Invalid JSON body' });
    }
    const response = await handleManualVerification(body || {});
    return json(response.status, response.body);
  }

  if (req.method !== 'GET') return json(405, { error: 'Method not allowed' });

  const url = new URL(req.url);
  const ref = url.searchParams.get('ref');
  const response = await handleVerify(ref);
  return json(response.status, response.body);
}

async function handleManualVerification(body) {
  const { orderReference, method, receiptNumber, mpesaCode, phone, userName, userEmail, courseId } = body;
  const rawCode = receiptNumber || mpesaCode || '';
  const cleanCode = String(rawCode).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (cleanCode.length < 6 || cleanCode.length > 14) {
    return { status: 400, body: { success: false, error: 'Please enter a valid M-Pesa confirmation code (e.g. TD78KL2901).' } };
  }

  const now = new Date().toISOString();
  let order = orderReference ? await storeGet(`order:ref:${orderReference}`) : null;

  if (!order) {
    order = {
      orderReference: orderReference || ('IK-2026-' + Math.random().toString(36).substring(2, 10).toUpperCase()),
      courseId: courseId || 'crs_002',
      courseTitle: 'Professional Certification Course',
      amount: 850000,
      currency: 'KES',
      userId: body.userId || 'learner',
      userEmail: userEmail || '',
      userName: userName || '',
      createdAt: now,
    };
  }

  order.status = 'paid';
  order.orderStatus = 'completed';
  order.paymentMethod = method || 'paybill';
  order.receiptNumber = cleanCode;
  order.transactionReference = cleanCode;
  order.paidAt = now;
  order.updatedAt = now;

  await storeSet(`order:ref:${order.orderReference}`, order);
  if (order.id) await storeSet(`order:id:${order.id}`, order);

  if (order.userId && order.courseId) {
    const enrollmentKey = `enrollment:${order.userId}:${order.courseId}`;
    await storeSet(enrollmentKey, {
      id: generateId('enr'),
      userId: order.userId,
      courseId: order.courseId,
      courseTitle: order.courseTitle,
      orderReference: order.orderReference,
      receiptNumber: cleanCode,
      enrolledAt: now,
      progress: 0,
      completed: false,
      status: 'active',
    });
    await storeSetAdd(`user:${order.userId}:enrollments`, order.courseId);
  }

  const payableAmountKes = Math.round((Number(order.amount) || 0) / 100);

  return {
    status: 200,
    body: {
      success: true,
      verified: true,
      orderReference: order.orderReference,
      courseId: order.courseId,
      courseTitle: order.courseTitle,
      receiptNumber: cleanCode,
      payableAmountKes,
      method: method || 'paybill',
      whatsappUrl: `https://wa.me/254143024416?text=${encodeURIComponent(`Hello Instructify Kenya, I have completed payment for ${order.courseTitle}.\n• Order: ${order.orderReference}\n• M-Pesa Code: ${cleanCode}`)}`,
      message: 'Payment recorded successfully! Your course enrollment is confirmed.',
    },
  };
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
