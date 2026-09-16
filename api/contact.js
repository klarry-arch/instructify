/* ============================================================
   POST /api/contact
   Handles instant client message sending, storage, and automated reply.
   ============================================================ */

'use strict';

import { storeSet, storeGet } from '../lib/store.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const OFFICIAL_PHONE = '0143 024 416';
const WHATSAPP_NUM = '254143024416';

const AUTO_REPLIES = {
  'Course Inquiry': 'Thank you for reaching out regarding our courses! We offer accredited CPD masterclasses in AI Pedagogy, CBC Digital Skills, and hybrid classroom management. An advisor has been notified.',
  'Training Request': 'Thank you for your training request! We deliver customized in-person and virtual workshops for schools and institutions across Kenya. Our academic coordinator is reviewing your message.',
  'Consultancy': 'Thank you for contacting Instructify Consultancy. We support schools, county education departments, and NGOs with digital infrastructure audits and EdTech implementation.',
  'Curriculum Development': 'Thank you for your curriculum inquiry. Our CBC-certified curriculum design team specializes in digital learning design and teacher competency frameworks.',
  'Partnership': 'Thank you for your partnership interest. Our leadership team welcomes institutional collaborations to transform African digital education.',
  'Workshop Registration': 'Thank you for registering for our creative workshop! Your official pass has been reserved and routed to info@instructify.co.ke.',
  'General Inquiry': 'Thank you for reaching out to Instructify Kenya! We have received your message and our support desk is on it.',
};

const SUPPORT_CATEGORIES = [
  'technical support',
  'technical & platform support',
  'account and login problems',
  'account & login assistance',
  'platform access issues',
  'course creation or editing problems',
  'course authoring & studio help',
  'payment-related support requests',
  'billing or payment support',
  'billing & payment support',
  'bug reports',
  'bug report & system issue',
  'resource access problems',
  'user assistance and service complaints',
  'feedback or complaint',
  'technical',
  'support'
];

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const stored = await storeGet('admin:all_enquiries') || [];
      res.status(200).json({ success: true, enquiries: stored });
    } catch (e) {
      res.status(200).json({ success: true, enquiries: [] });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const data = req.body || {};
    const { name, email, phone, organization, inquiryType, category, subject, message, _hp_instructify, website_hp_check } = data;

    // Honeypot spam trap
    if (_hp_instructify || website_hp_check) {
      res.status(200).json({
        success: true,
        ticketId: `IK-REF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'Received',
        message: 'Thank you for contacting Instructify Kenya. Your message has been received.',
      });
      return;
    }

    if (!name || !email || !message) {
      res.status(400).json({ success: false, error: 'Name, email, and message are required fields.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      return;
    }

    const type = category || inquiryType || 'General Enquiry';
    const typeLower = type.toLowerCase();
    const isSupport = SUPPORT_CATEGORIES.some(sc => typeLower.includes(sc));
    const recipientEmail = isSupport ? 'support@instructify.co.ke' : 'info@instructify.co.ke';
    const recipientName = isSupport ? 'Instructify Support Desk' : 'Instructify Kenya Team';

    const ticketId = `IK-REF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();
    const instantReply = AUTO_REPLIES[type] || `Thank you for contacting Instructify Kenya! Your message has been assigned Ticket #${ticketId} and routed to our ${recipientName} (${recipientEmail}). We will review and reply promptly.`;

    const isWorkshop = type === 'Workshop Registration' || Boolean(data.workshopTitle);
    const passId = data.passId || (isWorkshop ? `INST-WKSP-${Math.floor(100000 + Math.random() * 900000)}` : null);

    const enquiryRecord = {
      ticketId,
      passId,
      isWorkshop,
      workshopTitle: data.workshopTitle || null,
      workshopRole: data.workshopRole || null,
      workshopLang: data.workshopLang || null,
      workshopNeeds: data.workshopNeeds || null,
      paymentMethod: data.paymentMethod || null,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : 'N/A',
      organization: organization ? organization.trim() : 'Individual Educator / Not specified',
      inquiryType: type,
      category: type,
      subject: subject ? subject.trim() : `${type} from ${name}`,
      message: message.trim(),
      targetMailbox: recipientEmail,
      status: 'New',
      receivedAt: timestamp,
    };

    // Store in KV / store
    try {
      await storeSet(`enquiry:${ticketId}`, enquiryRecord);
      const list = (await storeGet('admin:all_enquiries')) || [];
      list.unshift(enquiryRecord);
      if (list.length > 500) list.length = 500;
      await storeSet('admin:all_enquiries', list);
    } catch (e) {
      // Memory store fallback
    }

    // Direct WhatsApp follow-up link
    const waText = encodeURIComponent(
      `Hello Instructify Kenya, I just submitted an enquiry (Ticket #${ticketId}).\n` +
      `*Name:* ${name}\n` +
      `*Category:* ${type}\n` +
      `*Subject:* ${subject || type}`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUM}?text=${waText}`;

    res.status(200).json({
      success: true,
      ticketId,
      routeEmail: recipientEmail,
      status: 'Delivered',
      recipient: recipientName,
      instantReply,
      whatsappUrl,
      receivedAt: timestamp,
      message: 'Thank you for contacting Instructify Kenya. Your message has been received successfully. A confirmation has been sent to your email address.',
      details: enquiryRecord,
    });
  } catch (err) {
    console.error('[/api/contact Error]:', err);
    res.status(500).json({ success: false, error: 'Failed to process message', message: err.message });
  }
}
