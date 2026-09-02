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
  'General Inquiry': 'Thank you for reaching out to Instructify Kenya! We have received your message and our support desk is on it.',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, phone, organization, inquiryType, message } = req.body || {};

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required fields.' });
      return;
    }

    const ticketId = `IK-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();
    const type = inquiryType || 'General Inquiry';
    const instantReply = AUTO_REPLIES[type] || AUTO_REPLIES['General Inquiry'];

    const enquiryRecord = {
      ticketId,
      name,
      email,
      phone: phone || 'N/A',
      organization: organization || 'Individual Educator',
      inquiryType: type,
      message,
      status: 'Received',
      receivedAt: timestamp,
    };

    // Store in KV / in-memory store
    await storeSet(`enquiry:${ticketId}`, enquiryRecord);

    // Prepare direct WhatsApp follow-up link
    const waText = encodeURIComponent(
      `Hello Instructify Kenya, I just submitted an inquiry (Ticket #${ticketId}).\n` +
      `*Name:* ${name}\n` +
      `*Type:* ${type}\n` +
      `*Message:* ${message}`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUM}?text=${waText}`;

    res.status(200).json({
      success: true,
      ticketId,
      status: 'Delivered',
      recipient: `Instructify Kenya Support (${OFFICIAL_PHONE})`,
      instantReply,
      whatsappUrl,
      receivedAt: timestamp,
      details: enquiryRecord,
    });
  } catch (err) {
    console.error('[/api/contact Error]:', err);
    res.status(500).json({ error: 'Failed to process message', message: err.message });
  }
}
