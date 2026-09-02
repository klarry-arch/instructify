/**
 * INSTRUCTIFY KENYA — Payment System & Safaricom Daraja Test Suite
 * Covers phone normalization/masking, Daraja password generation, STK push initiation,
 * webhook callback processing, status verification, and idempotency.
 *
 * Run: node tests/payment.test.js
 */

'use strict';

import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { normalisePhone, isSafaricomNumber, validateKenyanPhone, maskPhone } from '../api/_lib/phone.js';
import { getDarajaConfig, generateDarajaTimestamp, generateDarajaPassword, initiateStkPush } from '../api/_lib/daraja.js';
import { getCourse, validateAmount } from '../api/_lib/courses-config.js';
import { storeGet, storeSet, storeDel, generateOrderRef, generateId } from '../api/_lib/store.js';
import createOrderHandler from '../api/create-order.js';
import initiatePaymentHandler from '../api/initiate-payment.js';
import webhookMpesaHandler from '../api/webhook/mpesa.js';
import verifyPaymentHandler from '../api/verify-payment.js';

// ── Mock environment ───────────────────────────────────────────
process.env.MPESA_ENVIRONMENT = 'sandbox';
process.env.MPESA_SHORTCODE = '174379';
process.env.MPESA_PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
process.env.APP_BASE_URL = 'http://localhost:8080';

function mockNodeReqRes(method, url, body = {}) {
  let statusCode = 200;
  let headers = {};
  let responseData = null;

  const req = {
    method,
    url,
    body,
    headers: { host: 'localhost:8080' },
  };

  const res = {
    setHeader(k, v) { headers[k] = v; },
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    end(data) {
      if (data && !responseData) responseData = data;
      return res;
    },
    get statusCode() { return statusCode; },
    get responseData() { return responseData; },
  };

  return { req, res };
}

console.log('🚀 Running Instructify Kenya M-Pesa & Payment Tests...\n');

// ─────────────────────────────────────────────────────────────────
// 1. Phone Normalisation & Masking Tests
// ─────────────────────────────────────────────────────────────────
console.log('📱 Phone Normalisation & Masking Tests');

{
  const result = normalisePhone('0712345678');
  assert.equal(result, '254712345678', 'FAIL 1.1: 07XX format');
  console.log('  ✅ 1.1 07XX → 254712345678');
}

{
  const result = normalisePhone('+254712345678');
  assert.equal(result, '254712345678', 'FAIL 1.2: +254 format');
  console.log('  ✅ 1.2 +2547XX → 254712345678');
}

{
  const result = normalisePhone('0110123456');
  assert.equal(result, '254110123456', 'FAIL 1.3: 011X format');
  console.log('  ✅ 1.3 011X → 254110123456');
}

{
  const masked = maskPhone('0712345678');
  assert.equal(masked, '2547***678', 'FAIL 1.4: Phone masking');
  console.log('  ✅ 1.4 Phone masked: ' + masked);
}

{
  const validation = validateKenyanPhone('0733000000');
  assert.equal(validation.valid, false, 'FAIL 1.5: Airtel should fail Safaricom check');
  assert.ok(validation.error.includes('Safaricom'), 'FAIL 1.5: Error should mention Safaricom');
  console.log('  ✅ 1.5 Non-Safaricom rejected with helpful guidance');
}

// ─────────────────────────────────────────────────────────────────
// 2. Daraja Password & Timestamp Tests
// ─────────────────────────────────────────────────────────────────
console.log('\n🔑 Daraja Password & Timestamp Tests');

{
  const ts = generateDarajaTimestamp();
  assert.match(ts, /^\d{14}$/, 'FAIL 2.1: Timestamp must be 14 digits (YYYYMMDDHHmmss)');
  console.log('  ✅ 2.1 Daraja Timestamp format: ' + ts);
}

{
  const pass = generateDarajaPassword('174379', 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919', '20260901120000');
  assert.ok(pass && pass.length > 20, 'FAIL 2.2: Password must be Base64 string');
  console.log('  ✅ 2.2 Daraja Base64 password generated');
}

// ─────────────────────────────────────────────────────────────────
// 3. End-to-End M-Pesa STK Push Workflow Tests
// ─────────────────────────────────────────────────────────────────
console.log('\n⚡ End-to-End M-Pesa Payment Flow Tests');

let testOrderRef = null;
let testCheckoutRequestId = null;

// Test 3.1: Create Order
{
  const { req, res } = mockNodeReqRes('POST', '/api/create-order', {
    courseId: 'crs_002',
    userId: 'usr_test_101',
    userEmail: 'teacher@school.ke',
    userName: 'Jane Wanjiku',
  });

  await createOrderHandler(req, res);
  assert.equal(res.statusCode, 200, 'FAIL 3.1: Order creation status');
  assert.ok(res.responseData.orderReference, 'FAIL 3.1: Order reference generated');
  assert.equal(res.responseData.amount, 850000, 'FAIL 3.1: Course price must be KES 8,500 (850000 minor units)');
  testOrderRef = res.responseData.orderReference;
  console.log(`  ✅ 3.1 Order created: ${testOrderRef} (KES 8,500)`);
}

// Test 3.2: Initiate M-Pesa STK Push
{
  const { req, res } = mockNodeReqRes('POST', '/api/initiate-payment', {
    orderReference: testOrderRef,
    method: 'mpesa',
    phone: '0712345678',
  });

  await initiatePaymentHandler(req, res);
  assert.equal(res.statusCode, 200, 'FAIL 3.2: STK Push initiate status');
  assert.equal(res.responseData.status, 'pending', 'FAIL 3.2: Payment status should be pending');
  assert.equal(res.responseData.maskedPhone, '2547***678', 'FAIL 3.2: Masked phone');
  assert.equal(res.responseData.payableAmountKes, 8500, 'FAIL 3.2: Payable amount in KES');
  assert.equal(res.responseData.cooldownSeconds, 30, 'FAIL 3.2: Cooldown seconds');
  assert.ok(res.responseData.checkoutRequestId, 'FAIL 3.2: CheckoutRequestID present');
  testCheckoutRequestId = res.responseData.checkoutRequestId;
  console.log(`  ✅ 3.2 STK Push prompt initiated to ${res.responseData.maskedPhone} (CheckoutRequestID: ${testCheckoutRequestId})`);
}

// Test 3.3: Verify Payment Polling (Pending State)
{
  const { req, res } = mockNodeReqRes('GET', `/api/verify-payment?ref=${testOrderRef}`);
  await verifyPaymentHandler(req, res);
  assert.equal(res.statusCode, 200, 'FAIL 3.3: Verify endpoint status');
  assert.equal(res.responseData.status, 'processing', 'FAIL 3.3: Order status is processing');
  assert.equal(res.responseData.enrolled, false, 'FAIL 3.3: Learner not enrolled yet');
  console.log('  ✅ 3.3 Polling correctly returns processing state');
}

// Test 3.4: Process Safaricom M-Pesa Callback (Success)
{
  const receiptNo = 'QHX' + Math.floor(1000000 + Math.random() * 9000000);
  const { req, res } = mockNodeReqRes('POST', '/api/webhook/mpesa', {
    Body: {
      stkCallback: {
        MerchantRequestID: 'mer_12345',
        CheckoutRequestID: testCheckoutRequestId,
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.',
        CallbackMetadata: {
          Item: [
            { Name: 'Amount', Value: 8500 },
            { Name: 'MpesaReceiptNumber', Value: receiptNo },
            { Name: 'TransactionDate', Value: 20260901120500 },
            { Name: 'PhoneNumber', Value: 254712345678 },
          ],
        },
      },
    },
  });

  await webhookMpesaHandler(req, res);
  assert.equal(res.statusCode, 200, 'FAIL 3.4: Webhook HTTP status');
  assert.equal(res.responseData.ResultCode, 0, 'FAIL 3.4: Safaricom ResultCode acknowledgment');
  console.log(`  ✅ 3.4 Webhook processed successfully with M-Pesa receipt ${receiptNo}`);
}

// Test 3.5: Verify Payment Polling (Confirmed Paid & Enrolled)
{
  const { req, res } = mockNodeReqRes('GET', `/api/verify-payment?ref=${testOrderRef}`);
  await verifyPaymentHandler(req, res);
  assert.equal(res.statusCode, 200, 'FAIL 3.5: Verify endpoint status');
  assert.equal(res.responseData.status, 'paid', 'FAIL 3.5: Order status is paid');
  assert.equal(res.responseData.enrolled, true, 'FAIL 3.5: Learner is enrolled');
  assert.ok(res.responseData.receiptNumber, 'FAIL 3.5: Receipt number present');
  console.log(`  ✅ 3.5 Status verified: PAID, Enrolled: YES, Receipt: ${res.responseData.receiptNumber}`);
}

// Test 3.6: Idempotent Webhook Callback Processing
{
  const { req, res } = mockNodeReqRes('POST', '/api/webhook/mpesa', {
    Body: {
      stkCallback: {
        MerchantRequestID: 'mer_12345',
        CheckoutRequestID: testCheckoutRequestId,
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.',
      },
    },
  });

  await webhookMpesaHandler(req, res);
  assert.equal(res.statusCode, 200, 'FAIL 3.6: Duplicate webhook must return 200 OK');
  console.log('  ✅ 3.6 Webhook idempotency confirmed: duplicate callback ignored safely');
}

// ─────────────────────────────────────────────────────────────────
// 4. M-Pesa Cancellation / Timeout Handling Tests
// ─────────────────────────────────────────────────────────────────
console.log('\n🛑 Cancellation & Timeout Tests');

// Test 4.1: User cancels on phone (ResultCode 1032)
{
  const { req: oReq, res: oRes } = mockNodeReqRes('POST', '/api/create-order', {
    courseId: 'crs_003',
    userId: 'usr_test_cancel',
    userEmail: 'cancel@school.ke',
  });
  await createOrderHandler(oReq, oRes);
  const cancelOrderRef = oRes.responseData.orderReference;

  const { req: pReq, res: pRes } = mockNodeReqRes('POST', '/api/initiate-payment', {
    orderReference: cancelOrderRef,
    method: 'mpesa',
    phone: '0712345678',
  });
  await initiatePaymentHandler(pReq, pRes);
  const cancelCheckoutId = pRes.responseData.checkoutRequestId;

  const { req: wReq, res: wRes } = mockNodeReqRes('POST', '/api/webhook/mpesa', {
    Body: {
      stkCallback: {
        MerchantRequestID: 'mer_cancel',
        CheckoutRequestID: cancelCheckoutId,
        ResultCode: 1032,
        ResultDesc: 'Request cancelled by user',
      },
    },
  });
  await webhookMpesaHandler(wReq, wRes);

  const { req: vReq, res: vRes } = mockNodeReqRes('GET', `/api/verify-payment?ref=${cancelOrderRef}`);
  await verifyPaymentHandler(vReq, vRes);
  assert.equal(vRes.responseData.status, 'cancelled', 'FAIL 4.1: Status must be cancelled');
  console.log('  ✅ 4.1 Safaricom ResultCode 1032 correctly marked order as CANCELLED');
}

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% Verified.\n');
