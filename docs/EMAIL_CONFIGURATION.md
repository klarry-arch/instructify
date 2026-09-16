# Instructify Kenya — Business Email Configuration & Operational Guide

**Document Version:** 1.0.0  
**Effective Date:** 2026-09-16  
**Primary Domain:** `instructify.co.ke`  
**Hosting Infrastructure:** HOSTAFRICA Linux Server (`102.210.146.106`)  
**Control Panel:** DirectAdmin (`https://102.210.146.106:2222`)  

---

## 1. Executive Summary

This document serves as the standard operating procedure (SOP) and technical specification for the business email communication infrastructure of **Instructify Kenya Ltd**.

The system establishes two primary, role-based business mailboxes:
1. **`info@instructify.co.ke`** — Primary Commercial, Advisory & General Communication Desk.
2. **`support@instructify.co.ke`** — Platform, Technical Support & Account Assistance Desk.

All website forms, live chat assistants, and direct client interactions are systematically connected to these addresses with automated categorization, anti-spam filtering, rate limiting, and audit logging.

---

## 2. Mailbox Taxonomy & Routing Matrix

| Mailbox | Display Name | Primary Responsibilities | Website Enquiry Categories Routed |
| :--- | :--- | :--- | :--- |
| **`info@instructify.co.ke`** | *Instructify Kenya Team* | Commercial leads, institutional proposals, CBC workshops, consultancy audits, media queries | • General enquiry<br>• Consultancy services<br>• Teacher professional development<br>• ICT infrastructure & hardware<br>• Software & LMS deployment<br>• EdTech solutions & innovation<br>• Course development<br>• Partnership opportunity<br>• Media and corporate communication |
| **`support@instructify.co.ke`** | *Instructify Support Desk* | Learner onboarding, login issues, LMS troubleshooting, billing verification, teacher studio assistance | • Technical support<br>• Account and login problems<br>• Platform access issues<br>• Course creation or editing problems<br>• Billing or payment support<br>• Bug reports<br>• Resource access problems<br>• Feedback or complaint<br>• Other assistance |

---

## 3. HOSTAFRICA DirectAdmin Setup Guide

### 3.1. Accessing DirectAdmin
1. Navigate to: `https://102.210.146.106:2222` (or `https://cp.instructify.co.ke:2222`).
2. Log in using your HOSTAFRICA administrator credentials.

### 3.2. Creating the Mailboxes
1. In the DirectAdmin dashboard, locate **E-Mail Manager** &rarr; **E-Mail Accounts**.
2. Click **Create Account** for each mailbox:
   - **Mailbox 1:**
     - **Username:** `info`
     - **Domain:** `instructify.co.ke`
     - **Password:** Generate a 16+ character high-entropy password (e.g., `Ik_Inf0!2026#Secure`).
     - **E-Mail Quota:** Recommended `5000 MB` (or unlimited depending on hosting plan).
     - **Send Limit:** Standard server policy (typically 100–250 emails/hour).
   - **Mailbox 2:**
     - **Username:** `support`
     - **Domain:** `instructify.co.ke`
     - **Password:** Generate a 16+ character high-entropy password (e.g., `Ik_Supp0rt!2026#Secure`).
     - **E-Mail Quota:** Recommended `5000 MB`.

### 3.3. Webmail Access
Instructify team members can log into webmail directly via:
- **URL:** `https://webmail.instructify.co.ke` or `https://102.210.146.106:2222/roundcube`
- **Username:** Full email address (`info@instructify.co.ke` / `support@instructify.co.ke`)
- **Password:** The mailbox password created above.

---

## 4. DNS Authentication & Deliverability (SPF, DKIM, DMARC, MX)

To guarantee that outgoing emails land in client inboxes (and not spam/junk folders), the following DNS records must be active in your domain registrar / DNS zone manager (under `instructify.co.ke`):

### 4.1. Mail Exchanger (MX) Record
Directs incoming mail to the HOSTAFRICA server.
- **Name:** `@` (or `instructify.co.ke.`)
- **Type:** `MX`
- **Priority:** `10`
- **Target / Value:** `mail.instructify.co.ke.`

### 4.2. Sender Policy Framework (SPF)
Authorizes the HOSTAFRICA IP address (`102.210.146.106`) to send emails on behalf of `instructify.co.ke`.
- **Name:** `@`
- **Type:** `TXT`
- **TTL:** `3600`
- **Value:**
  ```text
  v=spf1 a mx ip4:102.210.146.106 ~all
  ```

### 4.3. DomainKeys Identified Mail (DKIM)
Provides cryptographic signature validation on outgoing emails.
1. In DirectAdmin, navigate to **E-Mail Manager** &rarr; **E-Mail Accounts** &rarr; **DKIM Keys** or **DNS Administration**.
2. If DKIM is enabled, DirectAdmin automatically creates a selector TXT record (typically `x._domainkey` or `default._domainkey`).
3. Verify the selector is present:
   - **Name:** `x._domainkey.instructify.co.ke.`
   - **Type:** `TXT`
   - **Value:** `v=DKIM1; k=rsa; p=<public_key_generated_by_server>`

### 4.4. Domain-based Message Authentication (DMARC)
Defines how receiving mail servers should handle unauthorized messages.
- **Name:** `_dmarc.instructify.co.ke.`
- **Type:** `TXT`
- **TTL:** `3600`
- **Value:**
  ```text
  v=DMARC1; p=quarantine; rua=mailto:info@instructify.co.ke; ruf=mailto:support@instructify.co.ke; sp=quarantine; pct=100; adkim=r; aspf=r
  ```

---

## 5. Client Email Setup (Outlook, Thunderbird, Gmail, Mobile)

To connect your desktop or mobile email apps (Outlook, Apple Mail, Gmail app):

| Setting | Configuration Parameter |
| :--- | :--- |
| **Incoming Mail Protocol** | **IMAP** (recommended) or POP3 |
| **Incoming Server Hostname** | `mail.instructify.co.ke` |
| **Incoming Port (SSL/TLS)** | **993** (IMAP with SSL/TLS) |
| **Incoming Username** | Full email address (e.g. `info@instructify.co.ke`) |
| **Incoming Password** | Mailbox password |
| **Outgoing Mail Protocol** | **SMTP** |
| **Outgoing Server Hostname** | `mail.instructify.co.ke` |
| **Outgoing Port (SSL/TLS)** | **465** (SSL) or **587** (STARTTLS) |
| **Outgoing Authentication** | Required (Same credentials as incoming) |

---

## 6. Website Email Engine Architecture

The website contact subsystem uses native PHP (`api/contact.php`) on the HOSTAFRICA Apache/LiteSpeed web server, with local Node.js API support (`api/contact.js`) for development.

### 6.1. Submission Pipeline Flow

```
[ Client on Website Form ]
           │
           ▼
[ Spam Honeypot & Rate Limit Check ]
     │ (IP Max 5/hr, bot field traps)
     ▼
[ Payload Validation & Sanitization ]
     │ (Name, Email, Category, Subject, Message)
     ▼
[ Intelligent Mailbox Routing ]
     ├─ Commercial / General ──► info@instructify.co.ke
     └─ Technical / Support   ──► support@instructify.co.ke
           │
           ▼
[ Email Dispatch & Autoresponder ]
     ├─ Internal Notification ──► Routed Mailbox (Reply-To: Client)
     └─ Client Confirmation  ──► Client Email (Ticket # & SLA)
           │
           ▼
[ Audit Log Persistence ] ──► api/data/enquiries.json (Protected by .htaccess)
           │
           ▼
[ Admin Dashboard Display ] ──► dashboard-admin.html (Real-time viewing & reply)
```

### 6.2. Security & Compliance Features
1. **Honeypot Trap (`_hp_instructify`):** Hidden from real humans using off-screen CSS; if filled by an automated bot, the request returns silent HTTP 200 without sending mail.
2. **IP Rate Limiting:** Enforces a maximum of 5 submissions per hour per unique IP address (`api/data/rate_limits.json`).
3. **Header Injection Protection:** All user input stripped of CR (`\r`) and LF (`\n`) characters before entering email headers.
4. **Data Privacy Protection:** Audit log files (`api/data/enquiries.json`) and configuration files (`.env`) are blocked from public browser access via Apache `.htaccess` rules (`Require all denied`).

---

## 7. Response Standards (Service Level Agreement)

- **General Inquiries (`info@`):** 24–48 business hours (Mon–Fri 8:00 AM – 6:00 PM EAT).
- **Critical Technical Support (`support@`):** Same business day response (under 4 hours for account/login lockouts).
- **WhatsApp Bridge:** Direct link (`0143 024 416` / `+254 143 024 416`) provided on instant receipts for expedited escalation.

---

## 8. Verification & Health Monitoring

To verify deliverability:
1. Submit a test enquiry through `https://instructify.co.ke/contact.html`.
2. Verify delivery to `info@instructify.co.ke` or `support@instructify.co.ke` via Roundcube webmail.
3. Check that the client email received the branded autoresponder confirmation.
4. Inspect `https://instructify.co.ke/dashboard-admin.html` under the **Client Enquiries & Tickets** tab to confirm the record was logged.
