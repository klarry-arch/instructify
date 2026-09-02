/* ============================================================
   POST /api/create-order
   Creates a pending order for a course purchase.

   Body: { courseId, userId, userEmail, userName }

   Checks:
   1. Course exists and is active (server-side price lookup)
   2. User is not already enrolled
   3. No duplicate pending order for same user+course within 5 min
   4. Creates order record in KV store

   Returns: { orderReference, courseTitle, amount, currency }
   ============================================================ */

'use strict';

import { getCourse } from './_lib/courses-config.js';
import {
  storeGet, storeSet, storeSetHas, generateOrderRef, generateId,
} from './_lib/store.js';

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
  // Check if standard Node.js req/res signature
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

    const { courseId, userId, userEmail, userName } = body;
    if (!courseId || typeof courseId !== 'string') return res.status(400).json({ error: 'courseId is required' });
    if (!userId || typeof userId !== 'string') return res.status(400).json({ error: 'userId is required. Please log in.' });
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) return res.status(400).json({ error: 'A valid email address is required.' });

    const course = getCourse(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found or is no longer available.' });

    const enrollmentKey = `enrollment:${userId}:${courseId}`;
    const existingEnrollment = await storeGet(enrollmentKey);
    if (existingEnrollment) {
      return res.status(409).json({
        error: 'already_enrolled',
        message: 'You are already enrolled in this course.',
        dashboardUrl: 'dashboard-learner.html',
      });
    }

    const pendingKey = `pending_order:${userId}:${courseId}`;
    const existingPending = await storeGet(pendingKey);
    if (existingPending) {
      return res.status(200).json({
        orderReference: existingPending.orderReference,
        courseId: course.id,
        courseTitle: course.title,
        amount: course.amount,
        currency: course.currency,
        paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
        resumed: true,
      });
    }

    const orderReference = generateOrderRef();
    const orderId = generateId('ord');
    const now = new Date().toISOString();

    const order = {
      id: orderId,
      orderReference,
      userId,
      userEmail,
      userName: userName || '',
      courseId: course.id,
      courseTitle: course.title,
      amount: course.amount,
      currency: course.currency,
      status: 'pending',
      paymentMethod: null,
      createdAt: now,
      updatedAt: now,
    };

    await storeSet(`order:ref:${orderReference}`, order);
    await storeSet(`order:id:${orderId}`, order);
    await storeSet(pendingKey, { orderReference }, 300);

    return res.status(200).json({
      orderReference,
      courseId: course.id,
      courseTitle: course.title,
      amount: course.amount,
      currency: course.currency,
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    });
  }

  // Web API / Edge runtime fallback
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = typeof req.json === 'function' ? await req.json() : req.body;
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const { courseId, userId, userEmail, userName } = body;

  // ── Input validation ──────────────────────────────────────
  if (!courseId || typeof courseId !== 'string') {
    return json(400, { error: 'courseId is required' });
  }
  if (!userId || typeof userId !== 'string') {
    return json(400, { error: 'userId is required. Please log in.' });
  }
  if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    return json(400, { error: 'A valid email address is required.' });
  }

  // ── Course lookup (server-side price) ─────────────────────
  const course = getCourse(courseId);
  if (!course) {
    return json(404, { error: 'Course not found or is no longer available.' });
  }

  // ── Check existing enrollment ─────────────────────────────
  const enrollmentKey = `enrollment:${userId}:${courseId}`;
  const existingEnrollment = await storeGet(enrollmentKey);
  if (existingEnrollment) {
    return json(409, {
      error: 'already_enrolled',
      message: 'You are already enrolled in this course.',
      dashboardUrl: 'dashboard-learner.html',
    });
  }

  // ── Check for recent duplicate pending order ──────────────
  // Prevent duplicate charges from rapid clicks (idempotency window: 5 min)
  const pendingKey = `pending_order:${userId}:${courseId}`;
  const existingPending = await storeGet(pendingKey);
  if (existingPending) {
    // Re-use the same order reference so the user can resume payment
    return json(200, {
      orderReference: existingPending.orderReference,
      courseId: course.id,
      courseTitle: course.title,
      amount: course.amount,
      currency: course.currency,
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
      resumed: true,
    });
  }

  // ── Create order ──────────────────────────────────────────
  const orderReference = generateOrderRef();
  const orderId = generateId('ord');
  const now = new Date().toISOString();

  const order = {
    id: orderId,
    orderReference,
    userId,
    userEmail,
    userName: userName || '',
    courseId: course.id,
    courseTitle: course.title,
    amount: course.amount,         // authoritative — from server config
    currency: course.currency,
    status: 'pending',
    paymentMethod: null,
    createdAt: now,
    updatedAt: now,
  };

  // Store order by reference (primary key) and by ID
  await storeSet(`order:ref:${orderReference}`, order);
  await storeSet(`order:id:${orderId}`, order);
  // Store pending marker with 5-minute TTL
  await storeSet(pendingKey, { orderReference }, 300);

  return json(200, {
    orderReference,
    courseId: course.id,
    courseTitle: course.title,
    amount: course.amount,
    currency: course.currency,
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  });
}
