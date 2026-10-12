/* ============================================================
   GET /api/check-enrollment?userId=USER_ID&courseId=COURSE_ID
   Server-side enrollment verification endpoint.

   Returns:
   - { enrolled: true, enrollment: {...} }   if enrolled
   - { enrolled: false }                     if not enrolled
   ============================================================ */

'use strict';

import { storeGet } from '../lib/store.js';

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
    const userId = url.searchParams.get('userId');
    const courseId = url.searchParams.get('courseId');

    const response = await handleCheck(userId, courseId);
    return res.status(response.status).json(response.body);
  }

  // Web API / Edge runtime signature
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'GET') return json(405, { error: 'Method not allowed' });

  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const courseId = url.searchParams.get('courseId');

  const response = await handleCheck(userId, courseId);
  return json(response.status, response.body);
}

async function handleCheck(userId, courseId) {
  if (!userId || !courseId) {
    return { status: 400, body: { error: 'userId and courseId are required query parameters.' } };
  }

  const enrollmentKey = `enrollment:${userId}:${courseId}`;
  const enrollment = await storeGet(enrollmentKey);

  if (enrollment) {
    return {
      status: 200,
      body: {
        enrolled: true,
        courseId: enrollment.courseId,
        courseTitle: enrollment.courseTitle || null,
        enrolledAt: enrollment.enrolledAt || null,
        receiptNumber: enrollment.receiptNumber || null,
        progress: enrollment.progress || 0,
        status: enrollment.status || 'active',
      },
    };
  }

  return {
    status: 200,
    body: {
      enrolled: false,
      courseId,
      userId,
    },
  };
}
