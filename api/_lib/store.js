/* ============================================================
   INSTRUCTIFY KENYA — Data Store Abstraction
   Uses Vercel KV (@vercel/kv) in production.
   Falls back to an in-memory Map for local development when
   KV environment variables are not present.
   ============================================================ */

'use strict';

// ── In-Memory Fallback Store ─────────────────────────────────
// Used only when KV_REST_API_URL is not set (local dev without Vercel CLI).
const _mem = new Map();

let kv = null;

async function getKV() {
  if (kv) return kv;

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { createClient } = await import('@vercel/kv');
      kv = createClient({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      });
      return kv;
    } catch {
      console.warn('[store] @vercel/kv not available — using in-memory store');
    }
  } else {
    console.warn('[store] KV_REST_API_URL not set — using in-memory store (data resets on restart)');
  }

  // Return a Map-backed shim that mirrors the KV interface
  kv = {
    async get(key) { return _mem.get(key) ?? null; },
    async set(key, value, opts) {
      _mem.set(key, value);
      if (opts?.ex) setTimeout(() => _mem.delete(key), opts.ex * 1000);
    },
    async del(...keys) { keys.forEach(k => _mem.delete(k)); },
    async sadd(key, ...members) {
      const set = _mem.get(key) || new Set();
      members.forEach(m => set.add(m));
      _mem.set(key, set);
    },
    async sismember(key, member) {
      const set = _mem.get(key);
      return set ? set.has(member) : false;
    },
    async smembers(key) {
      const set = _mem.get(key);
      return set ? [...set] : [];
    },
    async srem(key, member) {
      const set = _mem.get(key);
      if (set) set.delete(member);
    },
    async keys(pattern) {
      // Simple prefix match (pattern = 'prefix:*')
      const prefix = pattern.replace('*', '');
      return [..._mem.keys()].filter(k => k.startsWith(prefix));
    },
  };
  return kv;
}

// ── Public API ───────────────────────────────────────────────

export async function storeGet(key) {
  const db = await getKV();
  return db.get(key);
}

export async function storeSet(key, value, ttlSeconds = null) {
  const db = await getKV();
  if (ttlSeconds) return db.set(key, value, { ex: ttlSeconds });
  return db.set(key, value);
}

export async function storeDel(...keys) {
  const db = await getKV();
  return db.del(...keys);
}

/** Add members to a Redis Set (for unique-collection tracking). */
export async function storeSetAdd(key, ...members) {
  const db = await getKV();
  return db.sadd(key, ...members);
}

export async function storeSetHas(key, member) {
  const db = await getKV();
  return db.sismember(key, member);
}

export async function storeSetMembers(key) {
  const db = await getKV();
  return db.smembers(key);
}

export async function storeSetRemove(key, member) {
  const db = await getKV();
  return db.srem(key, member);
}

export async function storeKeys(pattern) {
  const db = await getKV();
  return db.keys(pattern);
}

// ── Helpers ──────────────────────────────────────────────────

/** Generate a unique order reference, e.g. IK-2026-A8F3C1E2. */
export function generateOrderRef() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `IK-${year}-${rand}`;
}

/** Generate a short unique ID with a given prefix. */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
