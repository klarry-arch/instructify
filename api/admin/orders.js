/* ============================================================
   GET /api/admin/orders
   Admin-only endpoint to list orders with search.
   Query params: ?search=term&status=paid&limit=50&offset=0

   Security: checks x-admin-role header (set by client from session).
   In a real auth system this would be a verified JWT claim.
   ============================================================ */

'use strict';

import { storeGet, storeKeys } from '../_lib/store.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-User-Role, X-User-Id',
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

  // ── Role check ────────────────────────────────────────────
  const role = req.headers.get('x-user-role');
  if (role !== 'admin') {
    return json(403, { error: 'Forbidden. Admin access required.' });
  }

  const url = new URL(req.url);
  const search = (url.searchParams.get('search') || '').toLowerCase();
  const statusFilter = url.searchParams.get('status') || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  // ── Fetch all order keys ──────────────────────────────────
  const keys = await storeKeys('order:ref:*');
  const orders = [];

  for (const key of keys) {
    const order = await storeGet(key);
    if (!order) continue;

    // Filter by status
    if (statusFilter && order.status !== statusFilter) continue;

    // Filter by search term
    if (search) {
      const searchable = [
        order.orderReference,
        order.userId,
        order.userEmail,
        order.userName,
        order.courseTitle,
        order.transactionReference,
      ].join(' ').toLowerCase();
      if (!searchable.includes(search)) continue;
    }

    // Return safe admin view — no raw payment credentials
    orders.push({
      orderReference: order.orderReference,
      userId: order.userId,
      userName: order.userName,
      userEmail: order.userEmail,
      courseId: order.courseId,
      courseTitle: order.courseTitle,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      paymentMethod: order.paymentMethod,
      transactionReference: order.transactionReference || null,
      failureReason: order.failureReason || null,
      paidAt: order.paidAt || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  }

  // Sort by creation date descending
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = orders.length;
  const paginated = orders.slice(offset, offset + limit);

  return json(200, { orders: paginated, total, limit, offset });
}
