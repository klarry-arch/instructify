/* ============================================================
   INSTRUCTIFY KENYA — Data Store Abstraction
   Uses Vercel KV (@vercel/kv) in production.
   Falls back to an in-memory Map for local development when
   KV environment variables are not present.
   ============================================================ */

'use strict';

import fs from 'fs';
import path from 'path';

// ── In-Memory & Local File Store Fallback ─────────────────────
// Used when KV_REST_API_URL is not set (cPanel / local dev).
const _mem = new Map();
const DATA_DIR = path.join(process.cwd(), 'api', 'data');
const DATA_FILE = path.join(DATA_DIR, 'node-store.json');

function loadStoreFromFile() {
  try {
    if (typeof process !== 'undefined' && fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (typeof data === 'object' && data !== null) {
        for (const [k, v] of Object.entries(data)) {
          if (v && v.__isSet && Array.isArray(v.items)) {
            _mem.set(k, new Set(v.items));
          } else {
            _mem.set(k, v);
          }
        }
      }
    }
  } catch {
    // Ignore initial file read errors
  }
}

let _saveTimeout = null;
function persistStoreToFile() {
  if (typeof process === 'undefined') return;
  if (_saveTimeout) return;
  _saveTimeout = setTimeout(() => {
    _saveTimeout = null;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const serialized = {};
      for (const [k, v] of _mem.entries()) {
        if (v instanceof Set) {
          serialized[k] = { __isSet: true, items: [...v] };
        } else {
          serialized[k] = v;
        }
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(serialized, null, 2), 'utf-8');
    } catch {
      // Ignore file persistence errors
    }
  }, 100);
}

loadStoreFromFile();

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
      console.warn('[store] @vercel/kv not available — using persistent local store');
    }
  }

  // Return a Map-backed shim that mirrors the KV interface
  kv = {
    async get(key) { return _mem.get(key) ?? null; },
    async set(key, value, opts) {
      _mem.set(key, value);
      persistStoreToFile();
      if (opts?.ex) {
        const timer = setTimeout(() => { _mem.delete(key); persistStoreToFile(); }, opts.ex * 1000);
        if (timer && typeof timer.unref === 'function') timer.unref();
      }
    },
    async del(...keys) {
      keys.forEach(k => _mem.delete(k));
      persistStoreToFile();
    },
    async sadd(key, ...members) {
      const set = _mem.get(key) || new Set();
      members.forEach(m => set.add(m));
      _mem.set(key, set);
      persistStoreToFile();
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
      if (set) {
        set.delete(member);
        persistStoreToFile();
      }
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
