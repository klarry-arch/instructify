/* ============================================================
   INSTRUCTIFY KENYA — Teacher CPD Registration Node.js API
   Endpoint: /api/cpd-registration (GET, POST, PATCH, DELETE)
   ============================================================ */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', 'data');
const storeFile = path.join(dataDir, 'cpd-registrations.json');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

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

const KENYAN_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 'Garissa', 'Wajir', 'Mandera',
  'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua',
  'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia',
  'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado',
  'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay',
  'Migori', 'Kisii', 'Nyamira', 'Nairobi'
];

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  // Parse Body
  let body = {};
  if (req.body) {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } else if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE') {
    body = await new Promise((resolve) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
      });
    });
  }

  // ── GET: List Registrations (Admin View) ─────────────────────
  if (req.method === 'GET') {
    const urlObj = new URL(req.url, 'http://localhost');
    const search = (urlObj.searchParams.get('search') || '').trim().toLowerCase();
    const county = (urlObj.searchParams.get('county') || '').trim().toLowerCase();
    const institution = (urlObj.searchParams.get('institution') || '').trim().toLowerCase();
    const period = (urlObj.searchParams.get('period') || '').trim().toLowerCase();
    const mode   = (urlObj.searchParams.get('mode') || '').trim().toLowerCase();
    const status = (urlObj.searchParams.get('status') || '').trim().toLowerCase();
    const pay    = (urlObj.searchParams.get('paymentStatus') || '').trim().toLowerCase();
    const competence = (urlObj.searchParams.get('competence') || '').trim().toLowerCase();

    const records = getStoredRegistrations();
    const filtered = records.filter(r => {
      if (search) {
        const text = `${r.fullName || ''} ${r.email || ''} ${r.phone || ''} ${r.school || ''} ${r.passId || ''}`.toLowerCase();
        if (!text.includes(search)) return false;
      }
      if (county && (r.county || '').toLowerCase() !== county) return false;
      if (institution && !(r.school || '').toLowerCase().includes(institution)) return false;
      if (period && (r.trainingPeriod || '').toLowerCase() !== period) return false;
      if (mode && (r.trainingMode || '').toLowerCase() !== mode) return false;
      if (status && (r.status || '').toLowerCase() !== status) return false;
      if (pay && (r.paymentStatus || '').toLowerCase() !== pay) return false;
      if (competence && (r.digitalCompetence || '').toLowerCase() !== competence) return false;
      return true;
    });

    const stats = {
      total: records.length,
      new: records.filter(r => r.status === 'New').length,
      underReview: records.filter(r => r.status === 'Under Review').length,
      awaitingPayment: records.filter(r => r.status === 'Awaiting Payment').length,
      paymentConfirmed: records.filter(r => r.status === 'Payment Confirmed').length,
      confirmed: records.filter(r => r.status === 'Confirmed').length,
      waitlisted: records.filter(r => r.status === 'Waitlisted').length,
      completed: records.filter(r => r.status === 'Completed').length,
      cancelled: records.filter(r => r.status === 'Cancelled').length,
    };

    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: filtered.length,
      stats,
      registrations: filtered
    }));
    return;
  }

  // ── PATCH: Update Registration Status or Internal Notes ─────
  if (req.method === 'PATCH') {
    const passId = (body.passId || '').trim();
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

    const allowed = ['New', 'Under Review', 'Awaiting Payment', 'Payment Confirmed', 'Confirmed', 'Waitlisted', 'Cancelled', 'Completed'];
    if (body.status && allowed.includes(body.status)) {
      records[idx].status = body.status;
    }
    if (body.internalNotes !== undefined) {
      records[idx].internalNotes = String(body.internalNotes).trim();
    }
    records[idx].updatedAt = new Date().toISOString();

    saveStoredRegistrations(records);

    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, registration: records[idx] }));
    return;
  }

  // ── DELETE: Anonymize or Remove Record ───────────────────────
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
      records[idx].email = 'anonymized@gdpr.internal';
      records[idx].phone = '+254700000000';
      records[idx].whatsapp = '+254700000000';
      records[idx].idNumber = null;
      records[idx].school = 'Anonymized School';
      records[idx].status = 'Cancelled';
      records[idx].anonymizedAt = new Date().toISOString();
    } else {
      records.splice(idx, 1);
    }

    saveStoredRegistrations(records);

    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: `Record ${passId} processed.` }));
    return;
  }

  // ── POST: New Participant Registration ───────────────────────
  if (req.method === 'POST') {
    // Spam check
    if (body._hp_instructify || body.website_hp_check || body.company_website_url) {
      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        passId: 'IK-CPD-2026-' + Math.floor(100000 + Math.random() * 900000),
        status: 'Received',
        message: 'Registration received.'
      }));
      return;
    }

    const fullName = String(body.fullName || '').trim();
    const idNumber = String(body.idNumber || '').trim();
    const phone = String(body.phone || '').trim();
    const whatsapp = String(body.whatsapp || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const county = String(body.county || '').trim();
    const town = String(body.town || body.location || '').trim();

    const school = String(body.school || '').trim();
    const role = String(body.role || '').trim();
    const otherRole = String(body.otherRole || '').trim();
    const levelsTaught = Array.isArray(body.levelsTaught || body.levels)
      ? (body.levelsTaught || body.levels)
      : String(body.levelsTaught || body.levels || '').split(',').map(s => s.trim()).filter(Boolean);
    const mainSubject = String(body.mainSubject || body.subject || '').trim();
    const experience = String(body.experience || '').trim();

    const trainingPeriod = String(body.trainingPeriod || '').trim();
    const trainingMode = String(body.trainingMode || '').trim();
    const trainingLocation = String(body.trainingLocation || '').trim();
    const devices = Array.isArray(body.devices)
      ? body.devices
      : String(body.devices || '').split(',').map(s => s.trim()).filter(Boolean);
    const internet = String(body.internet || body.internetAccess || '').trim();
    const competence = String(body.competence || body.digitalCompetence || '').trim();
    const learnGoals = String(body.learnGoals || body.learningGoals || '').trim();
    const supportNeeded = String(body.supportNeeded || body.accessibilityNeeds || '').trim();
    const supportDetails = String(body.supportDetails || body.accessibilitySupport || '').trim();

    const paymentStatus = String(body.paymentStatus || '').trim();
    const paymentReference = String(body.paymentReference || '').trim();

    const accuracyConsent = Boolean(body.accuracyConsent || body.declarationAccuracy);
    const communicationConsent = Boolean(body.communicationConsent || body.consentCommunication);
    const privacyConsent = Boolean(body.privacyConsent || body.consentPrivacy);
    const updatesConsent = Boolean(body.updatesConsent !== undefined ? body.updatesConsent : body.marketingUpdates);

    const errors = {};

    if (!fullName || fullName.length < 3) errors.fullName = 'Full name is required (min 3 chars).';
    const phoneClean = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(?:254|\+254|0)?([71][0-9]{8})$/;
    if (!phoneRegex.test(phoneClean)) errors.phone = 'Valid Kenyan phone number required (e.g. 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX).';
    if (!whatsapp) errors.whatsapp = 'WhatsApp number is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Valid email address is required.';
    
    const matchedCounty = KENYAN_COUNTIES.find(c => c.toLowerCase() === county.toLowerCase());
    if (!matchedCounty) errors.county = 'Please select a valid Kenyan county.';
    if (!town) errors.town = 'Town or location is required.';

    if (!school) errors.school = 'School or institution name is required.';
    if (!role) errors.role = 'Current role is required.';
    if (role === 'Other' && !otherRole) errors.otherRole = 'Please specify your role.';
    if (!levelsTaught.length) errors.levelsTaught = 'Please select at least one level taught.';
    if (!mainSubject) errors.mainSubject = 'Main subject or learning area is required.';
    if (!experience) errors.experience = 'Teaching experience is required.';

    if (!['November 2026', 'December 2026', 'Either November or December 2026'].includes(trainingPeriod)) {
      errors.trainingPeriod = 'Please select preferred training period.';
    }
    if (!['Physical workshop', 'Live online training', 'Blended learning', 'No preference'].includes(trainingMode)) {
      errors.trainingMode = 'Please select preferred training mode.';
    }
    if (!['Yes', 'Sometimes', 'No'].includes(internet)) errors.internet = 'Internet availability is required.';
    if (!['Beginner', 'Developing', 'Competent', 'Confident', 'Advanced'].includes(competence)) {
      errors.competence = 'Digital competence level is required.';
    }
    if (!learnGoals) errors.learnGoals = 'Please describe what you would most like to learn.';
    if (!['Yes', 'No', 'Prefer not to say'].includes(supportNeeded)) errors.supportNeeded = 'Accessibility choice is required.';
    if (supportNeeded === 'Yes' && !supportDetails) errors.supportDetails = 'Please specify support required.';

    if (!['I have not yet paid', 'I would like to receive payment instructions', 'I have already paid'].includes(paymentStatus)) {
      errors.paymentStatus = 'Payment status is required.';
    }
    if (paymentStatus === 'I have already paid' && !paymentReference) {
      errors.paymentReference = 'Payment reference is required when already paid.';
    }

    if (!accuracyConsent) errors.accuracyConsent = 'Accuracy declaration is required.';
    if (!communicationConsent) errors.communicationConsent = 'Communication consent is required.';
    if (!privacyConsent) errors.privacyConsent = 'Privacy terms consent is required.';

    if (Object.keys(errors).length > 0) {
      res.writeHead(422, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Validation failed', errors }));
      return;
    }

    const passId = 'IK-CPD-2026-' + crypto.randomBytes(3).toString('hex').toUpperCase();

    let initialStatus = 'New';
    if (paymentStatus === 'I have already paid' && paymentReference) {
      initialStatus = 'Under Review';
    } else if (paymentStatus === 'I would like to receive payment instructions') {
      initialStatus = 'Awaiting Payment';
    }

    const record = {
      passId,
      programme: 'Foundations of Digital Literacy and ICT Integration for CBC Teachers',
      fullName,
      idNumber: idNumber || null,
      phone,
      whatsapp,
      email,
      county: matchedCounty,
      town,
      location: town,
      school,
      role,
      otherRole: role === 'Other' ? otherRole : null,
      levelsTaught,
      levels: levelsTaught,
      mainSubject,
      subject: mainSubject,
      experience,
      trainingPeriod,
      trainingMode,
      trainingLocation: trainingLocation || null,
      devices,
      internet,
      internetAccess: internet,
      competence,
      digitalCompetence: competence,
      learnGoals,
      learningGoals: learnGoals,
      supportNeeded,
      accessibilityNeeds: supportNeeded,
      supportDetails: supportNeeded === 'Yes' ? supportDetails : null,
      accessibilitySupport: supportNeeded === 'Yes' ? supportDetails : null,
      fee: 2500,
      currency: 'KES',
      paymentStatus,
      paymentReference: paymentReference || null,
      accuracyConsent,
      declarationAccuracy: accuracyConsent,
      communicationConsent,
      consentCommunication: communicationConsent,
      privacyConsent,
      consentPrivacy: privacyConsent,
      updatesConsent,
      marketingUpdates: updatesConsent,
      status: initialStatus,
      internalNotes: '',
      registeredAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const records = getStoredRegistrations();
    records.unshift(record);
    saveStoredRegistrations(records);

    // Confirmation text response
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      passId,
      status: initialStatus,
      fullName,
      email,
      trainingPeriod,
      trainingMode,
      fee: 'KES 2,500',
      message: 'Thank you for registering for the Instructify Kenya CPD Training Programme.\n\nYour registration has been received successfully. A confirmation message and further information about the training schedule, payment, and participation requirements will be sent to the email address you provided.\n\nFor enquiries, contact info@instructify.co.ke.'
    }));
  }
}
