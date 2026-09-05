/* ============================================================
   /api/wishlist
   GET  ?userId=xxx              → list wishlist courseIds
   POST  { userId, courseId }    → add to wishlist
   DELETE { userId, courseId }   → remove from wishlist

   Authentication: userId comes from the client session.
   A user can only access their own wishlist.
   ============================================================ */

'use strict';

import { storeSetAdd, storeSetHas, storeSetRemove, storeSetMembers } from '../lib/store.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default async function handler(req, res) {
  // Support Node.js runtime
  if (res && typeof res.status === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();

    if (req.method === 'GET') {
      let userId = req.query?.userId;
      if (!userId && req.url) {
        try {
          const u = new URL(req.url, 'http://localhost');
          userId = u.searchParams.get('userId');
        } catch {}
      }
      if (!userId) return res.status(400).json({ error: 'userId is required' });

      const members = await storeSetMembers(`wishlist:${userId}`);
      return res.status(200).json({ wishlist: members });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
    }
    body = body || {};

    const { userId, courseId } = body;
    if (!userId || !courseId) return res.status(400).json({ error: 'userId and courseId are required' });

    if (req.method === 'POST') {
      await storeSetAdd(`wishlist:${userId}`, courseId);
      return res.status(200).json({ added: true, courseId });
    }

    if (req.method === 'DELETE') {
      await storeSetRemove(`wishlist:${userId}`, courseId);
      return res.status(200).json({ removed: true, courseId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Fallback for Web standard Fetch Request/Response
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost');
    const userId = url.searchParams.get('userId');
    if (!userId) return json(400, { error: 'userId is required' });

    const members = await storeSetMembers(`wishlist:${userId}`);
    return json(200, { wishlist: members });
  }

  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'Invalid JSON' }); }

  const { userId, courseId } = body;
  if (!userId || !courseId) return json(400, { error: 'userId and courseId are required' });

  if (req.method === 'POST') {
    await storeSetAdd(`wishlist:${userId}`, courseId);
    return json(200, { added: true, courseId });
  }

  if (req.method === 'DELETE') {
    await storeSetRemove(`wishlist:${userId}`, courseId);
    return json(200, { removed: true, courseId });
  }

  return json(405, { error: 'Method not allowed' });
}
