/* ============================================================
   INSTRUCTIFY KENYA — Coding Boot Camp Registration Node.js API
   Endpoint: /api/bootcamp-registration (GET, POST, PATCH, DELETE)
   Dates: Monday 9th November 2026 – December 2026
   Weekly Fee: KES 2,500 per week
   ============================================================ */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', 'data');
const storeFile = path.join(dataDir, 'bootcamp-registrations.json');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-User-Role, X-User-Id',
};

const WEEKLY_RATE = 2500;

const KENYAN_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 'Garissa', 'Wajir', 'Mandera',
  'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
  'Nyeri', 'Kirinyaga', "Murang'a", 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia',
  'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado',
  'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay',
  'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];

function ensureStoreFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    const htaccess = path.join(dataDir, '.htaccess');
    if (!fs.existsSync(htaccess)) {
      fs.writeFileSync(htaccess, 'Deny from all\n', 'utf8');
    }
  }
  if (!fs.existsSync(storeFile)) {
    fs.writeFileSync(storeFile, '[]', 'utf8');
  }
}

function getStoredRegistrations() {
  ensureStoreFile();
  try {
    const raw = fs.readFileSync(storeFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredRegistrations(records) {
  ensureStoreFile();
  const tmp = storeFile + '.tmp.' + Math.random().toString(36).slice(2, 6);
  fs.writeFileSync(tmp, JSON.stringify(records, null, 2), 'utf8');
  fs.renameSync(tmp, storeFile);
}

function computeStats(records) {
  const activeRecords = records.filter(r => r.status !== 'Cancelled');
  const confirmedList = records.filter(r => r.status === 'Confirmed' || r.status === 'Payment Verified' || r.status === 'Completed' || r.paymentVerified === true);
  const confirmedRevenue = records.reduce((sum, r) => {
    if (r.status === 'Cancelled') return sum;
    return sum + (Number(r.amountPaid) || 0);
  }, 0);
  const projectedRevenue = activeRecords.reduce((sum, r) => sum + (Number(r.totalFee) || WEEKLY_RATE), 0);
  const totalWeeksBooked = activeRecords.reduce((sum, r) => sum + (Number(r.weeksCount) || 1), 0);

  return {
    total: records.length,
    new: records.filter(r => r.status === 'New').length,
    underReview: records.filter(r => r.status === 'Under Review').length,
    awaitingPayment: records.filter(r => r.status === 'Awaiting Payment').length,
    paymentVerified: records.filter(r => r.status === 'Payment Verified').length,
    confirmed: confirmedList.length,
    waitlisted: records.filter(r => r.status === 'Waitlisted').length,
    completed: records.filter(r => r.status === 'Completed').length,
    cancelled: records.filter(r => r.status === 'Cancelled').length,
    totalWeeksBooked,
    confirmedRevenue,
    projectedRevenue
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  let body = {};
  if (req.body) {
    body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : req.body;
  } else if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE') {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
      });
    });
  }

  // ── GET: List or Lookup Coding Boot Camp Registrations ──────
  if (req.method === 'GET') {
    const urlObj = new URL(req.url, 'http://localhost');
    const passIdQuery = (urlObj.searchParams.get('passId') || '').trim().toUpperCase();
    const search = (urlObj.searchParams.get('search') || '').trim().toLowerCase();
    const track = (urlObj.searchParams.get('track') || '').trim().toLowerCase();
    const category = (urlObj.searchParams.get('category') || '').trim().toLowerCase();
    const mode = (urlObj.searchParams.get('mode') || '').trim().toLowerCase();
    const status = (urlObj.searchParams.get('status') || '').trim().toLowerCase();
    const paymentStatus = (urlObj.searchParams.get('paymentStatus') || '').trim().toLowerCase();
    const county = (urlObj.searchParams.get('county') || '').trim().toLowerCase();

    const records = getStoredRegistrations();

    if (passIdQuery) {
      const found = records.find(r => (r.passId || '').toUpperCase() === passIdQuery);
      if (!found) {
        res.writeHead(404, { ...CORS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: `Registration ${passIdQuery} not found.` }));
        return;
      }
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, registration: found }));
      return;
    }

    const filtered = records.filter(r => {
      if (search) {
        const text = `${r.fullName || ''} ${r.email || ''} ${r.phone || ''} ${r.institution || ''} ${r.passId || ''} ${r.paymentReference || ''} ${r.learningTrack || ''} ${r.guardianName || ''}`.toLowerCase();
        if (!text.includes(search)) return false;
      }
      if (track && !(r.learningTrack || '').toLowerCase().includes(track)) return false;
      if (category && (r.participantCategory || '').toLowerCase() !== category) return false;
      if (mode && (r.attendanceMode || '').toLowerCase() !== mode) return false;
      if (status && (r.status || '').toLowerCase() !== status) return false;
      if (paymentStatus && (r.paymentStatus || '').toLowerCase() !== paymentStatus) return false;
      if (county && (r.county || '').toLowerCase() !== county) return false;
      return true;
    });

    const stats = computeStats(records);

    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: filtered.length,
      stats,
      registrations: filtered
    }));
    return;
  }

  // ── PATCH: Admin Review / Status Update / Proof Upload ──────
  if (req.method === 'PATCH') {
    const passId = String(body.passId || '').trim();
    if (!passId) {
      res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing passId.' }));
      return;
    }

    const records = getStoredRegistrations();
    const idx = records.findIndex(r => r.passId === passId);
    if (idx === -1) {
      res.writeHead(404, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: `Registration ${passId} not found.` }));
      return;
    }

    const allowedStatuses = ['New', 'Under Review', 'Awaiting Payment', 'Payment Verified', 'Confirmed', 'Waitlisted', 'Completed', 'Cancelled'];
    if (body.status && allowedStatuses.includes(body.status)) {
      records[idx].status = body.status;
      if (body.status === 'Payment Verified' || body.status === 'Confirmed') {
        records[idx].paymentVerified = true;
      }
    }
    if (typeof body.paymentVerified === 'boolean') {
      records[idx].paymentVerified = body.paymentVerified;
      if (body.paymentVerified && (records[idx].status === 'New' || records[idx].status === 'Under Review' || records[idx].status === 'Awaiting Payment')) {
        records[idx].status = 'Confirmed';
      }
    }
    if (body.paymentStatus !== undefined) {
      records[idx].paymentStatus = String(body.paymentStatus).trim();
    }
    if (body.amountPaid !== undefined) {
      records[idx].amountPaid = Math.max(0, Number(body.amountPaid) || 0);
    }
    if (body.paymentReference !== undefined) {
      records[idx].paymentReference = String(body.paymentReference).trim().toUpperCase();
    }
    if (body.paymentSmsText !== undefined) {
      records[idx].paymentSmsText = String(body.paymentSmsText).trim();
    }
    if (body.proofDataUrl !== undefined) {
      records[idx].proofDataUrl = String(body.proofDataUrl);
      records[idx].proofFileName = String(body.proofFileName || 'payment_proof');
      records[idx].proofFileType = String(body.proofFileType || 'image/png');
      records[idx].proofFileSize = Number(body.proofFileSize || 0);
      if (records[idx].status === 'Awaiting Payment') {
        records[idx].status = 'Under Review';
      }
    }
    if (body.internalNotes !== undefined) {
      records[idx].internalNotes = String(body.internalNotes).trim();
    }
    records[idx].updatedAt = new Date().toISOString();

    saveStoredRegistrations(records);

    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      registration: records[idx],
      stats: computeStats(records)
    }));
    return;
  }

  // ── DELETE: Remove or Anonymize Registration ────────────────
  if (req.method === 'DELETE') {
    const urlObj = new URL(req.url, 'http://localhost');
    const passId = (urlObj.searchParams.get('passId') || body.passId || '').trim();
    const anonymize = urlObj.searchParams.get('anonymize') === 'true' || body.anonymize === true;

    if (!passId) {
      res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing passId.' }));
      return;
    }

    const records = getStoredRegistrations();
    const idx = records.findIndex(r => r.passId === passId);
    if (idx === -1) {
      res.writeHead(404, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Record not found.' }));
      return;
    }

    if (anonymize) {
      records[idx].fullName = 'Anonymized Participant';
      records[idx].guardianName = '';
      records[idx].guardianPhone = '';
      records[idx].email = 'anonymized@gdpr.internal';
      records[idx].phone = '+254700000000';
      records[idx].whatsapp = '+254700000000';
      records[idx].institution = 'Anonymized Institution';
      records[idx].proofDataUrl = '';
      records[idx].proofFileName = '';
      records[idx].status = 'Cancelled';
      records[idx].anonymizedAt = new Date().toISOString();
    } else {
      records.splice(idx, 1);
    }

    saveStoredRegistrations(records);

    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Record ${passId} processed.`,
      stats: computeStats(records)
    }));
    return;
  }

  // ── POST: Create New Coding Boot Camp Registration ──────────
  if (req.method === 'POST') {
    if (body._hp_instructify || body.website_hp_check) {
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        passId: 'IK-BC-2026-' + Math.floor(100000 + Math.random() * 900000),
        status: 'Received',
        message: 'Registration received.'
      }));
      return;
    }

    const fullName = String(body.fullName || '').trim();
    const ageGroup = String(body.ageGroup || '').trim();
    const participantCategory = String(body.participantCategory || '').trim();
    const guardianName = String(body.guardianName || '').trim();
    const guardianPhone = String(body.guardianPhone || '').trim();
    const phone = String(body.phone || '').trim();
    const whatsapp = String(body.whatsapp || phone || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const county = String(body.county || '').trim();
    const town = String(body.town || '').trim();
    const institution = String(body.institution || '').trim();

    const learningTrack = String(body.learningTrack || '').trim();
    const experienceLevel = String(body.experienceLevel || 'Complete Beginner — No prior coding experience').trim();
    const startWeek = String(body.startWeek || 'Week 1: Mon 9th Nov – Fri 13th Nov 2026').trim();
    const weeksCount = Math.min(Math.max(parseInt(body.weeksCount || '1', 10) || 1, 1), 6);
    const weeklyRate = WEEKLY_RATE;
    const totalFee = weeksCount * weeklyRate;
    const sessionTime = String(body.sessionTime || '').trim();
    const attendanceMode = String(body.attendanceMode || '').trim();
    const preferredHub = String(body.preferredHub || '').trim();
    const deviceAccess = Array.isArray(body.deviceAccess)
      ? body.deviceAccess
      : String(body.deviceAccess || '').split(',').map(s => s.trim()).filter(Boolean);
    const internetAccess = String(body.internetAccess || 'Yes').trim();
    const projectGoals = String(body.projectGoals || '').trim();
    const accessibilityNeeds = String(body.accessibilityNeeds || 'No').trim();
    const accessibilityDetails = String(body.accessibilityDetails || '').trim();

    const paymentStatus = String(body.paymentStatus || '').trim();
    const paymentMethod = String(body.paymentMethod || 'M-Pesa').trim();
    const paymentReference = String(body.paymentReference || '').trim().toUpperCase();
    const paymentSmsText = String(body.paymentSmsText || '').trim();
    const amountPaidRaw = Number(body.amountPaid);
    const amountPaid = !isNaN(amountPaidRaw) && amountPaidRaw >= 0
      ? amountPaidRaw
      : (paymentStatus === 'Paid in Full' ? totalFee : (paymentStatus === 'Paid Weekly Installment' ? WEEKLY_RATE : 0));

    const proofFileName = String(body.proofFileName || '').trim();
    const proofFileType = String(body.proofFileType || '').trim();
    const proofFileSize = Number(body.proofFileSize || 0);
    const proofDataUrl = String(body.proofDataUrl || '');

    const accuracyConsent = Boolean(body.accuracyConsent);
    const guardianConsent = Boolean(body.guardianConsent);
    const communicationConsent = Boolean(body.communicationConsent);
    const privacyConsent = Boolean(body.privacyConsent);
    const updatesConsent = Boolean(body.updatesConsent);

    const errors = {};
    if (!fullName || fullName.length < 3) errors.fullName = 'Full name is required (minimum 3 characters).';
    if (!learningTrack) errors.learningTrack = 'Please select a learning track.';
    if (!sessionTime) errors.sessionTime = 'Please select a preferred session schedule.';
    if (!attendanceMode) errors.attendanceMode = 'Please select an attendance mode.';
    if (!participantCategory) errors.participantCategory = 'Please select a participant category.';

    const phoneClean = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(?:254|\+254|0)?([71][0-9]{8})$/;
    if (!phoneRegex.test(phoneClean)) {
      errors.phone = 'Valid Kenyan phone number required (e.g. 0712 345 678 or +254712345678).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Valid email address is required.';
    }
    const matchedCounty = KENYAN_COUNTIES.find(c => c.toLowerCase() === county.toLowerCase());
    if (!matchedCounty) {
      errors.county = 'Please select a valid Kenyan county.';
    }
    if (!paymentStatus) {
      errors.paymentStatus = 'Please select a payment declaration option.';
    }
    if ((paymentStatus === 'Paid in Full' || paymentStatus === 'Paid Weekly Installment') && !paymentReference && !proofDataUrl && !paymentSmsText) {
      errors.paymentReference = 'Please provide a transaction reference code or upload proof of payment.';
    }
    if (!accuracyConsent || !communicationConsent || !privacyConsent) {
      errors.consent = 'Please accept the required registration and privacy declarations.';
    }

    if (Object.keys(errors).length > 0) {
      res.writeHead(422, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: Object.values(errors)[0],
        errors
      }));
      return;
    }

    const passId = 'IK-BC-2026-' + Math.floor(100000 + Math.random() * 900000);
    const initialStatus = (paymentStatus === 'Paid in Full' || paymentStatus === 'Paid Weekly Installment')
      ? 'Under Review'
      : 'Awaiting Payment';

    const newRecord = {
      passId,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fullName,
      ageGroup: ageGroup || 'Young Adult (18–24 yrs)',
      participantCategory,
      guardianName,
      guardianPhone,
      phone,
      whatsapp,
      email,
      county: matchedCounty || county,
      town,
      institution,
      learningTrack,
      experienceLevel,
      startWeek,
      weeksCount,
      weeklyRate,
      totalFee,
      sessionTime,
      attendanceMode,
      preferredHub,
      deviceAccess,
      internetAccess,
      projectGoals,
      accessibilityNeeds,
      accessibilityDetails,
      paymentStatus,
      paymentMethod,
      amountPaid,
      paymentReference,
      paymentSmsText,
      proofFileName,
      proofFileType,
      proofFileSize,
      proofDataUrl,
      paymentVerified: false,
      status: initialStatus,
      internalNotes: '',
      accuracyConsent,
      guardianConsent,
      communicationConsent,
      privacyConsent,
      updatesConsent
    };

    const records = getStoredRegistrations();
    records.unshift(newRecord);
    saveStoredRegistrations(records);

    res.writeHead(201, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      passId,
      status: initialStatus,
      registration: newRecord,
      message: 'Your Coding Boot Camp registration has been received successfully.'
    }));
    return;
  }

  res.writeHead(405, { ...CORS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
}

