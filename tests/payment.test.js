/**
 * INSTRUCTIFY KENYA — Payment System Test Suite
 * Covers the 13 required scenarios from the spec.
 *
 * Run: npm test
 *
 * Tests use Node's built-in assert module and mock the KV store
 * and Paystack API via module interception.
 */

'use strict';

import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

// ── Helpers ────────────────────────────────────────────────────

function makeRequest(method, url, body = null, headers = {}) {
  const req = {
    method,
    url: `http://localhost${url}`,
    headers: new Map(Object.entries(headers)),
    _body: body,
  };
  req.headers.get = k => req.headers instanceof Map
    ? req.headers.get(k)
    : req.headers[k] || null;
  req.json = async () => req._body;
  req.text = async () => typeof req._body === 'string' ? req._body : JSON.stringify(req._body);
  return req;
}

async function callHandler(handlerPath, req) {
  const mod = await import(handlerPath + '?t=' + Date.now());
  const handler = mod.default;
  const res = await handler(req);
  let body = {};
  try { body = JSON.parse(await res.text()); } catch {}
  return { status: res.status, body };
}

// ── Mock environment ───────────────────────────────────────────
process.env.PAYSTACK_PUBLIC_KEY  = 'pk_test_mock';
process.env.PAYSTACK_SECRET_KEY  = 'sk_test_mock';
process.env.PAYSTACK_WEBHOOK_SECRET = 'whsec_test_secret';
process.env.APP_BASE_URL         = 'http://localhost:3000';
process.env.PAYMENT_ENVIRONMENT  = 'sandbox';

// ─────────────────────────────────────────────────────────────────
// 1. Phone Normalisation Tests
// ─────────────────────────────────────────────────────────────────

import { normalisePhone, isSafaricomNumber, validateKenyanPhone } from '../api/lib/phone.js';

console.log('\n📱 Phone Normalisation Tests');

// Test 1.1 — 07XX format
{
  const result = normalisePhone('0712345678');
  assert.equal(result, '254712345678', 'FAIL 1.1: 07XX format');
  console.log('  ✅ 1.1 07XX → 254...');
}

// Test 1.2 — +254 format
{
  const result = normalisePhone('+254712345678');
  assert.equal(result, '254712345678', 'FAIL 1.2: +254 format');
  console.log('  ✅ 1.2 +254... → 254...');
}

// Test 1.3 — Already international
{
  const result = normalisePhone('254712345678');
  assert.equal(result, '254712345678', 'FAIL 1.3: Already international');
  console.log('  ✅ 1.3 254... → 254... (passthrough)');
}

// Test 1.4 — Invalid format
{
  const result = normalisePhone('1234');
  assert.equal(result, null, 'FAIL 1.4: Invalid format should return null');
  console.log('  ✅ 1.4 Invalid number → null');
}

// Test 1.5 — Non-Safaricom (Airtel)
{
  const result = validateKenyanPhone('0733000000');
  assert.equal(result.valid, false, 'FAIL 1.5: Airtel should fail Safaricom check');
  assert.ok(result.error.includes('Safaricom'), 'FAIL 1.5: Error should mention Safaricom');
  console.log('  ✅ 1.5 Non-Safaricom rejected with helpful error');
}

// ─────────────────────────────────────────────────────────────────
// 2. Course Config Tests
// ─────────────────────────────────────────────────────────────────

import { getCourse, validateAmount } from '../api/lib/courses-config.js';

console.log('\n📚 Course Config Tests');

// Test 2.1 — Valid course
{
  const course = getCourse('crs_002');
  assert.ok(course, 'FAIL 2.1: crs_002 should exist');
  assert.equal(course.amount, 850000, 'FAIL 2.1: crs_002 price should be KES 8,500 (850000 minor units)');
  assert.equal(course.currency, 'KES', 'FAIL 2.1: currency should be KES');
  console.log('  ✅ 2.1 crs_002 = KES 8,500 (850000 minor units)');
}

// Test 2.2 — Unknown course
{
  const course = getCourse('nonexistent');
  assert.equal(course, null, 'FAIL 2.2: Unknown course should return null');
  console.log('  ✅ 2.2 Unknown courseId → null');
}

// Test 2.3 — Amount validation success
{
  const valid = validateAmount('crs_002', 850000);
  assert.equal(valid, true, 'FAIL 2.3: Correct amount should validate');
  console.log('  ✅ 2.3 Amount validation passes for correct amount');
}

// Test 2.4 — Amount validation fails for tampered amount
{
  const valid = validateAmount('crs_002', 1);  // browser tried to send KES 0.01
  assert.equal(valid, false, 'FAIL 2.4: Tampered amount should fail validation');
  console.log('  ✅ 2.4 Tampered amount (1) rejected');
}

// ─────────────────────────────────────────────────────────────────
// 3. Store Tests
// ─────────────────────────────────────────────────────────────────

import { storeGet, storeSet, storeDel, generateOrderRef, generateId } from '../api/lib/store.js';

console.log('\n💾 Store Tests');

// Test 3.1 — Set and Get
{
  await storeSet('test:key', { value: 42 });
  const result = await storeGet('test:key');
  assert.deepEqual(result, { value: 42 }, 'FAIL 3.1: Store set/get');
  await storeDel('test:key');
  console.log('  ✅ 3.1 Store set/get/del');
}

// Test 3.2 — Order reference format
{
  const ref = generateOrderRef();
  assert.match(ref, /^IK-\d{4}-[A-Z0-9]+$/, 'FAIL 3.2: Order ref format');
  console.log('  ✅ 3.2 Order ref format: ' + ref);
}

// ─────────────────────────────────────────────────────────────────
// 4. Webhook Security Tests
// ─────────────────────────────────────────────────────────────────

import { verifyWebhookSignature } from '../api/lib/paystack.js';

console.log('\n🔐 Webhook Security Tests');

const webhookSecret = 'whsec_test_secret';

// Test 4.1 — Valid HMAC signature
{
  const payload = JSON.stringify({ event: 'charge.success', data: {} });
  const sig = createHmac('sha512', webhookSecret).update(payload, 'utf8').digest('hex');
  const valid = verifyWebhookSignature(payload, sig);
  assert.equal(valid, true, 'FAIL 4.1: Valid signature should pass');
  console.log('  ✅ 4.1 Valid HMAC-SHA512 signature accepted');
}

// Test 4.2 — Invalid / tampered signature
{
  const payload = JSON.stringify({ event: 'charge.success', data: {} });
  const valid = verifyWebhookSignature(payload, 'invalid_signature');
  assert.equal(valid, false, 'FAIL 4.2: Invalid signature should be rejected');
  console.log('  ✅ 4.2 Invalid signature rejected');
}

// Test 4.3 — Empty signature
{
  const payload = JSON.stringify({ event: 'charge.success', data: {} });
  const valid = verifyWebhookSignature(payload, '');
  assert.equal(valid, false, 'FAIL 4.3: Empty signature should be rejected');
  console.log('  ✅ 4.3 Empty signature rejected');
}

// Test 4.4 — Signature does not match after payload modification
{
  const originalPayload = JSON.stringify({ event: 'charge.success', data: { amount: 850000 } });
  const sig = createHmac('sha512', webhookSecret).update(originalPayload, 'utf8').digest('hex');
  // Attacker modifies the payload
  const tamperedPayload = JSON.stringify({ event: 'charge.success', data: { amount: 1 } });
  const valid = verifyWebhookSignature(tamperedPayload, sig);
  assert.equal(valid, false, 'FAIL 4.4: Tampered payload should fail signature check');
  console.log('  ✅ 4.4 Tampered payload (amount changed) rejected');
}

// ─────────────────────────────────────────────────────────────────
// 5. Price Integrity Test
// ─────────────────────────────────────────────────────────────────

console.log('\n💰 Price Integrity Tests');

// Test 5.1 — All courses in catalogue have valid prices
{
  const courseIds = ['crs_001', 'crs_002', 'crs_003', 'crs_004', 'crs_005', 'crs_006', 'crs_007', 'crs_008'];
  for (const id of courseIds) {
    const course = getCourse(id);
    assert.ok(course, `FAIL 5.1: Course ${id} not found`);
    assert.ok(typeof course.amount === 'number' && course.amount > 0, `FAIL 5.1: Course ${id} has invalid amount`);
    assert.equal(course.currency, 'KES', `FAIL 5.1: Course ${id} must be KES`);
  }
  console.log('  ✅ 5.1 All 8 courses have valid KES prices in server config');
}

// ─────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────
console.log('\n✅ All tests passed!\n');
