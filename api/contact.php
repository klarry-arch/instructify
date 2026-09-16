<?php
/**
 * ============================================================
 * INSTRUCTIFY KENYA — Production Contact & Enquiry API
 * Endpoint: POST /api/contact (or /api/contact.php)
 * 
 * Handles:
 * - Commercial vs Technical Category Routing (info@ vs support@)
 * - Anti-spam honeypot traps & rate limiting
 * - Email header injection protection & RFC validation
 * - Team notification dispatch with client Reply-To
 * - Client autoresponder confirmation with Ticket Reference
 * - Secure local audit logging (protected from web access)
 * ============================================================
 */

declare(strict_types=1);

// ── 1. HTTP Headers & CORS ─────────────────────────────────────
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed. Only POST is accepted.']);
    exit;
}

// ── 2. Load Environment Variables from .env if present ────────
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
            continue;
        }
        list($key, $val) = explode('=', $line, 2);
        $key = trim($key);
        $val = trim($val, " \t\n\r\0\x0B\"'");
        if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV)) {
            putenv("$key=$val");
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

// ── Support GET for Admin Enquiries Retrieval ─────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $logFile = $dataDir . '/enquiries.json';
    $enquiries = [];
    if (file_exists($logFile)) {
        $existing = @file_get_contents($logFile);
        if ($existing) {
            $enquiries = json_decode($existing, true) ?: [];
        }
    }
    http_response_code(200);
    echo json_encode(['success' => true, 'enquiries' => $enquiries]);
    exit;
}

// ── 3. Parse Payload (JSON or Form-Data) ──────────────────────
$rawInput = file_get_contents('php://input');
$data = [];
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $data = $decoded;
    }
}
if (empty($data) && !empty($_POST)) {
    $data = $_POST;
}

// ── 4. Anti-Spam: Honeypot Trap ───────────────────────────────
// Bot fields that human visitors will not fill
if (!empty($data['_hp_instructify']) || !empty($data['website_hp_check']) || !empty($data['company_website_url'])) {
    // Return silent success to discard bot submissions without processing
    http_response_code(200);
    echo json_encode([
        'success'   => true,
        'ticketId'  => 'IK-REF-' . date('Y') . '-' . mt_rand(100000, 999999),
        'status'    => 'Received',
        'message'   => 'Thank you for contacting Instructify Kenya. Your message has been received.',
    ]);
    exit;
}

// ── 5. Client IP & Rate Limiting (Max 5 submissions per hour) ──
$clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (strpos($clientIp, ',') !== false) {
    $clientIp = trim(explode(',', $clientIp)[0]);
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    // Create protective .htaccess in data directory
    file_put_contents($dataDir . '/.htaccess', "Order allow,deny\nDeny from all\nRequire all denied\n");
}

$rateFile = $dataDir . '/rate_limits.json';
$rateLimits = [];
if (file_exists($rateFile)) {
    $rateContent = @file_get_contents($rateFile);
    if ($rateContent) {
        $rateLimits = json_decode($rateContent, true) ?: [];
    }
}

$now = time();
$ipHash = md5($clientIp);
// Clean up entries older than 3600 seconds
if (isset($rateLimits[$ipHash])) {
    $rateLimits[$ipHash] = array_filter($rateLimits[$ipHash], function($timestamp) use ($now) {
        return ($now - $timestamp) < 3600;
    });
    if (count($rateLimits[$ipHash]) >= 5) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error'   => 'Too many enquiries submitted from your network. Please wait a short while or email us directly at info@instructify.co.ke.'
        ]);
        exit;
    }
} else {
    $rateLimits[$ipHash] = [];
}
$rateLimits[$ipHash][] = $now;
@file_put_contents($rateFile, json_encode($rateLimits));

// ── 6. Sanitize & Validate Fields ─────────────────────────────
function sanitizeSingleLine(string $str): string {
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], '', strip_tags($str)));
}

$name      = sanitizeSingleLine((string)($data['name'] ?? $data['fullName'] ?? ''));
$email     = sanitizeSingleLine((string)($data['email'] ?? ''));
$phone     = sanitizeSingleLine((string)($data['phone'] ?? ''));
$org       = sanitizeSingleLine((string)($data['organization'] ?? $data['school'] ?? ''));
$category  = sanitizeSingleLine((string)($data['inquiryType'] ?? $data['category'] ?? 'General Enquiry'));
$subject   = sanitizeSingleLine((string)($data['subject'] ?? ''));
$preferred = sanitizeSingleLine((string)($data['preferredContact'] ?? 'Email'));
$message   = trim((string)($data['message'] ?? ''));

// Workshop registration fields
$isWorkshop    = ($category === 'Workshop Registration' || !empty($data['workshopTitle']));
$workshopTitle = sanitizeSingleLine((string)($data['workshopTitle'] ?? ''));
$workshopRole  = sanitizeSingleLine((string)($data['workshopRole'] ?? 'Participant'));
$workshopLang  = sanitizeSingleLine((string)($data['workshopLang'] ?? 'English'));
$workshopNeeds = sanitizeSingleLine((string)($data['workshopNeeds'] ?? 'None specified'));
$paymentMethod = sanitizeSingleLine((string)($data['paymentMethod'] ?? 'Free / Sponsored'));
$passId        = sanitizeSingleLine((string)($data['passId'] ?? 'INST-WKSP-' . mt_rand(100000, 999999)));

if ($isWorkshop) {
    $category = 'Workshop Registration';
    if ($message === '') {
        $message = "Workshop: {$workshopTitle}\nRole: {$workshopRole}\nLanguage: {$workshopLang}\nPayment: {$paymentMethod}\nNeeds: {$workshopNeeds}\nPass ID: {$passId}";
    }
}

// Required validation
$errors = [];
if ($name === '' || mb_strlen($name) < 2 || mb_strlen($name) > 100) {
    $errors[] = 'Please provide your full name (2–100 characters).';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 254) {
    $errors[] = 'Please provide a valid email address.';
}
if ($message === '' || mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    $errors[] = 'Please write a message of at least 10 characters (up to 5,000 characters).';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => implode(' ', $errors)]);
    exit;
}

if ($subject === '') {
    $subject = $isWorkshop ? "Workshop Registration: {$workshopTitle} ({$passId})" : ($category . ' from ' . $name);
}

// ── 7. Intelligent Email Routing ──────────────────────────────
// Support / Technical enquiries -> support@instructify.co.ke
// Commercial / General / Institutional / Workshops -> info@instructify.co.ke
$supportCategories = [
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

$categoryLower = strtolower($category);
$isSupport = false;
if (!$isWorkshop) {
    foreach ($supportCategories as $sc) {
        if (strpos($categoryLower, $sc) !== false) {
            $isSupport = true;
            break;
        }
    }
}

$recipientEmail = $isSupport ? 'support@instructify.co.ke' : 'info@instructify.co.ke';
$recipientName  = $isSupport ? 'Instructify Support Desk' : 'Instructify Kenya Team';

// Unique Reference / Ticket ID
$ticketId = 'IK-REF-' . date('Y') . '-' . mt_rand(100000, 999999);
$timestampStr = date('Y-m-d H:i:s T');
$dateFormatted = date('d M Y, h:i A');
$senderSystem = 'no-reply@instructify.co.ke';

// ── 8. Team Notification Email (HTML & Plain Text) ────────────
if ($isWorkshop) {
    $teamSubject = "[Workshop Pass #{$passId}] Registration: {$name} — {$workshopTitle}";
    $teamHtml = '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.6; color: #1E293B; background: #F8FAFC; margin: 0; padding: 24px; }
  .box { max-width: 650px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(15,23,42,0.06); }
  .header { background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #FF4D00 100%); color: #FFFFFF; padding: 24px 28px; }
  .ticket-badge { display: inline-block; background: rgba(255,255,255,0.22); color: #FFFFFF; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 700; font-family: monospace; }
  .content { padding: 28px; }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .meta-table td { padding: 8px 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
  .meta-table td.label { font-weight: 600; color: #64748B; width: 35%; }
  .meta-table td.value { color: #0F172A; font-weight: 500; }
  .footer { background: #F1F5F9; padding: 16px 28px; font-size: 13px; color: #64748B; border-top: 1px solid #E2E8F0; text-align: center; }
  .btn-reply { display: inline-block; background: #2145E6; color: #FFFFFF !important; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 14px; }
</style>
</head>
<body>
<div class="box">
  <div class="header">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0; font-size:20px;">🎓 New Workshop Registration</h2>
      <span class="ticket-badge">#' . htmlspecialchars($passId) . '</span>
    </div>
    <p style="margin:6px 0 0 0; opacity:0.9; font-size:14px;">Notification routed to <strong>' . htmlspecialchars($recipientEmail) . '</strong></p>
  </div>
  <div class="content">
    <table class="meta-table">
      <tr><td class="label">Attendee Name:</td><td class="value"><strong>' . htmlspecialchars($name) . '</strong></td></tr>
      <tr><td class="label">Email Address:</td><td class="value"><a href="mailto:' . htmlspecialchars($email) . '" style="color:#2145E6;">' . htmlspecialchars($email) . '</a></td></tr>
      <tr><td class="label">Phone / WhatsApp:</td><td class="value">' . htmlspecialchars($phone ?: 'Not provided') . '</td></tr>
      <tr><td class="label">Workshop Theme:</td><td class="value"><strong style="color:#2145E6;">' . htmlspecialchars($workshopTitle) . '</strong></td></tr>
      <tr><td class="label">Role:</td><td class="value">' . htmlspecialchars($workshopRole) . '</td></tr>
      <tr><td class="label">Preferred Language:</td><td class="value">' . htmlspecialchars($workshopLang) . '</td></tr>
      <tr><td class="label">Payment Option:</td><td class="value"><span style="background:#DCFCE7; color:#15803D; padding:2px 8px; border-radius:4px; font-weight:700;">' . htmlspecialchars($paymentMethod) . '</span></td></tr>
      <tr><td class="label">Dietary / Needs:</td><td class="value">' . htmlspecialchars($workshopNeeds) . '</td></tr>
      <tr><td class="label">Official Pass Code:</td><td class="value"><span style="font-family:monospace; font-weight:800; font-size:14px; color:#1E3A8A;">' . htmlspecialchars($passId) . '</span></td></tr>
      <tr><td class="label">Registered Date:</td><td class="value">' . htmlspecialchars($dateFormatted) . '</td></tr>
      <tr><td class="label">Origin:</td><td class="value">Workshop Registration Portal</td></tr>
    </table>

    <div style="margin-top:20px; text-align:center;">
      <a href="mailto:' . htmlspecialchars($email) . '?subject=' . rawurlencode('Re: [Workshop Pass #' . $passId . '] ' . $workshopTitle) . '" class="btn-reply">✉️ Reply to Attendee (' . htmlspecialchars($name) . ')</a>
    </div>
  </div>
  <div class="footer">
    Sent from the official Instructify Kenya Workshop Portal (<a href="https://instructify.co.ke/workshop-registration.html" style="color:#2145E6;">instructify.co.ke</a>).
  </div>
</div>
</body>
</html>';

    $teamPlain = "INSTRUCTIFY KENYA — NEW WORKSHOP REGISTRATION\n"
               . "=============================================\n"
               . "Pass Code:    #{$passId}\n"
               . "Workshop:     {$workshopTitle}\n"
               . "Date:         {$timestampStr}\n\n"
               . "ATTENDEE DETAILS:\n"
               . "---------------------------------------------\n"
               . "Name:         {$name}\n"
               . "Email:        {$email}\n"
               . "Phone:        " . ($phone ?: 'Not provided') . "\n"
               . "Role:         {$workshopRole}\n"
               . "Language:     {$workshopLang}\n"
               . "Payment:      {$paymentMethod}\n"
               . "Needs:        {$workshopNeeds}\n"
               . "Pass ID:      {$passId}\n\n"
               . "To reply directly, click Reply in your email client (Reply-To is set to {$email}).\n";

} else {
    $teamSubject = "[Ticket #{$ticketId}] {$category}: {$subject}";
    $teamHtml = '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.6; color: #1E293B; background: #F8FAFC; margin: 0; padding: 24px; }
  .box { max-width: 650px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(15,23,42,0.06); }
  .header { background: linear-gradient(135deg, #183AD6 0%, #2145E6 60%, #FF4D00 100%); color: #FFFFFF; padding: 24px 28px; }
  .ticket-badge { display: inline-block; background: rgba(255,255,255,0.22); color: #FFFFFF; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 700; font-family: monospace; }
  .content { padding: 28px; }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .meta-table td { padding: 8px 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
  .meta-table td.label { font-weight: 600; color: #64748B; width: 35%; }
  .meta-table td.value { color: #0F172A; font-weight: 500; }
  .message-card { background: #F8FAFC; border-left: 4px solid #2145E6; padding: 18px 20px; border-radius: 4px 8px 8px 4px; font-size: 15px; color: #0F172A; white-space: pre-wrap; word-break: break-word; }
  .footer { background: #F1F5F9; padding: 16px 28px; font-size: 13px; color: #64748B; border-top: 1px solid #E2E8F0; text-align: center; }
  .btn-reply { display: inline-block; background: #2145E6; color: #FFFFFF !important; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; }
</style>
</head>
<body>
<div class="box">
  <div class="header">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0; font-size:20px;">New Website Enquiry</h2>
      <span class="ticket-badge">#' . htmlspecialchars($ticketId) . '</span>
    </div>
    <p style="margin:6px 0 0 0; opacity:0.9; font-size:14px;">Routed automatically to <strong>' . htmlspecialchars($recipientEmail) . '</strong></p>
  </div>
  <div class="content">
    <table class="meta-table">
      <tr><td class="label">Client Name:</td><td class="value"><strong>' . htmlspecialchars($name) . '</strong></td></tr>
      <tr><td class="label">Email Address:</td><td class="value"><a href="mailto:' . htmlspecialchars($email) . '" style="color:#2145E6;">' . htmlspecialchars($email) . '</a></td></tr>
      <tr><td class="label">Phone / WhatsApp:</td><td class="value">' . htmlspecialchars($phone ?: 'Not provided') . '</td></tr>
      <tr><td class="label">Organization / School:</td><td class="value">' . htmlspecialchars($org ?: 'Individual / Not specified') . '</td></tr>
      <tr><td class="label">Category:</td><td class="value"><span style="background:#EFF6FF; color:#1E40AF; padding:3px 8px; border-radius:4px; font-size:12.5px; font-weight:600;">' . htmlspecialchars($category) . '</span></td></tr>
      <tr><td class="label">Preferred Contact:</td><td class="value">' . htmlspecialchars($preferred) . '</td></tr>
      <tr><td class="label">Submitted Date:</td><td class="value">' . htmlspecialchars($dateFormatted) . '</td></tr>
      <tr><td class="label">Origin Page:</td><td class="value">' . htmlspecialchars($_SERVER['HTTP_REFERER'] ?? 'https://instructify.co.ke/contact.html') . '</td></tr>
    </table>

    <h3 style="font-size:16px; margin:0 0 10px 0; color:#0F172A;">Client Message:</h3>
    <div class="message-card">' . nl2br(htmlspecialchars($message)) . '</div>

    <div style="margin-top:20px; text-align:center;">
      <a href="mailto:' . htmlspecialchars($email) . '?subject=' . rawurlencode('Re: [Ticket #' . $ticketId . '] ' . $subject) . '" class="btn-reply">✉️ Reply Directly to ' . htmlspecialchars($name) . '</a>
    </div>
  </div>
  <div class="footer">
    This message was sent from the official Instructify Kenya website contact portal (<a href="https://instructify.co.ke" style="color:#2145E6;">instructify.co.ke</a>).
  </div>
</div>
</body>
</html>';

    $teamPlain = "INSTRUCTIFY KENYA — NEW WEBSITE ENQUIRY\n"
               . "========================================\n"
               . "Ticket ID:    #{$ticketId}\n"
               . "Target Desk:  {$recipientEmail}\n"
               . "Date:         {$timestampStr}\n\n"
               . "CLIENT DETAILS:\n"
               . "----------------------------------------\n"
               . "Name:         {$name}\n"
               . "Email:        {$email}\n"
               . "Phone:        " . ($phone ?: 'Not provided') . "\n"
               . "Organization: " . ($org ?: 'Individual / Not specified') . "\n"
               . "Category:     {$category}\n"
               . "Subject:      {$subject}\n"
               . "Preferred:    {$preferred}\n\n"
               . "MESSAGE:\n"
               . "----------------------------------------\n"
               . "{$message}\n\n"
               . "========================================\n"
               . "To reply directly, click Reply in your email client (Reply-To is set to {$email}).\n";
}

// ── 9. Client Confirmation Autoresponder Email ─────────────────
if ($isWorkshop) {
    $clientSubject = "Your Workshop Entry Pass [Pass #{$passId}] — Instructify Kenya";
    $clientHtml = '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.65; color: #1E293B; background: #F8FAFC; margin: 0; padding: 24px; }
  .box { max-width: 620px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(15,23,42,0.06); }
  .header { background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2145E6 100%); color: #FFFFFF; padding: 28px; text-align: center; }
  .content { padding: 32px 28px; }
  .badge { display: inline-block; background: #DCFCE7; color: #15803D; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 13px; margin-bottom: 16px; border: 1px solid #BBF7D0; }
  .pass-card { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border-radius: 12px; padding: 22px 24px; color: #FFFFFF; margin: 22px 0; border: 1px solid #334155; }
  .pass-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 13.5px; }
  .pass-row:last-child { border-bottom: none; }
  .channels { display: flex; gap: 12px; margin-top: 24px; }
  .channel-btn { flex: 1; text-align: center; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; display: block; }
  .btn-wa { background: #25D366; color: #FFFFFF !important; }
  .btn-mail { background: #F1F5F9; color: #0F172A !important; border: 1px solid #CBD5E1; }
  .footer { background: #F8FAFC; padding: 20px 28px; font-size: 12.5px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0; }
</style>
</head>
<body>
<div class="box">
  <div class="header">
    <h1 style="margin:0; font-size:24px; font-weight:800; letter-spacing:-0.02em;">Instructify <span style="color:#FFAD00;">Kenya</span></h1>
    <p style="margin:6px 0 0 0; opacity:0.95; font-size:14.5px;">Hands-On Learning That Sticks</p>
  </div>
  <div class="content">
    <div style="text-align:center;">
      <span class="badge">🎉 Workshop Registration Confirmed</span>
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0F172A;">Karibu, ' . htmlspecialchars($name) . '!</h2>
      <p style="margin:0; color:#475569; font-size:15px;">Your place has been reserved. Here is your official Workshop Entry Pass:</p>
    </div>

    <div class="pass-card">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.15); padding-bottom:12px; margin-bottom:14px;">
        <div>
          <span style="font-size:11px; font-weight:800; color:#FFAD00; text-transform:uppercase; letter-spacing:1px;">Entry Pass</span>
          <h3 style="margin:4px 0 0; font-size:17px; color:#FFFFFF;">' . htmlspecialchars($workshopTitle) . '</h3>
        </div>
        <div style="background:rgba(255,255,255,0.15); padding:6px 12px; border-radius:8px; font-family:monospace; font-size:13px; font-weight:800; color:#93C5FD;">
          ' . htmlspecialchars($passId) . '
        </div>
      </div>
      <div class="pass-row"><span style="color:#94A3B8;">Attendee:</span><span style="font-weight:600; color:#FFFFFF;">' . htmlspecialchars($name) . '</span></div>
      <div class="pass-row"><span style="color:#94A3B8;">Role:</span><span style="font-weight:600; color:#FFFFFF;">' . htmlspecialchars($workshopRole) . '</span></div>
      <div class="pass-row"><span style="color:#94A3B8;">Language:</span><span style="font-weight:600; color:#FFAD00;">' . htmlspecialchars($workshopLang) . '</span></div>
      <div class="pass-row"><span style="color:#94A3B8;">Payment:</span><span style="font-weight:700; color:#4ADE80;">' . htmlspecialchars($paymentMethod) . '</span></div>
      <div class="pass-row"><span style="color:#94A3B8;">Registered Date:</span><span style="color:#E2E8F0;">' . htmlspecialchars($dateFormatted) . '</span></div>
    </div>

    <p style="font-size:14px; color:#475569; line-height:1.6; margin:16px 0 0 0;">
      Please save this email or note your Pass ID (<strong>' . htmlspecialchars($passId) . '</strong>). Our workshop team will follow up with timetable specifics, venue / digital links, and session preparatory materials.
    </p>

    <div class="channels">
      <a href="https://wa.me/254143024416?text=' . rawurlencode("Hello Instructify Kenya, I registered for " . $workshopTitle . " [Pass #" . $passId . "]. My name is " . $name . ".") . '" class="channel-btn btn-wa">💬 Chat on WhatsApp Desk</a>
      <a href="mailto:info@instructify.co.ke?subject=' . rawurlencode('Query: [Workshop Pass #' . $passId . '] ' . $workshopTitle) . '" class="channel-btn btn-mail">✉️ Email Coordinators</a>
    </div>
  </div>
  <div class="footer">
    Instructify Kenya &bull; Professional Development & EdTech Solutions &bull; Nairobi, Kenya<br>
    Website: <a href="https://instructify.co.ke" style="color:#2145E6;">instructify.co.ke</a> &bull; Support: <a href="mailto:info@instructify.co.ke" style="color:#2145E6;">info@instructify.co.ke</a>
  </div>
</div>
</body>
</html>';

    $clientPlain = "Hello {$name},\n\n"
                 . "Your registration for the following Instructify Kenya workshop has been confirmed:\n\n"
                 . "Workshop:     {$workshopTitle}\n"
                 . "Pass Code:    #{$passId}\n"
                 . "Attendee:     {$name}\n"
                 . "Role:         {$workshopRole}\n"
                 . "Language:     {$workshopLang}\n"
                 . "Payment:      {$paymentMethod}\n"
                 . "Date:         {$timestampStr}\n\n"
                 . "Please save your Pass ID (#{$passId}) for verification upon session entry.\n\n"
                 . "For questions, reach us via:\n"
                 . "- WhatsApp: +254 143 024 416\n"
                 . "- Email:    info@instructify.co.ke\n\n"
                 . "Best regards,\n"
                 . "The Instructify Kenya Team\n"
                 . "https://instructify.co.ke\n";

} else {
    $clientSubject = "We have received your enquiry [Ticket #{$ticketId}] — Instructify Kenya";
    $clientHtml = '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.65; color: #1E293B; background: #F8FAFC; margin: 0; padding: 24px; }
  .box { max-width: 620px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 16px rgba(15,23,42,0.06); }
  .header { background: linear-gradient(135deg, #183AD6 0%, #2145E6 60%, #FF4D00 100%); color: #FFFFFF; padding: 28px; text-align: center; }
  .content { padding: 32px 28px; }
  .badge { display: inline-block; background: #DCFCE7; color: #15803D; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 13px; margin-bottom: 16px; border: 1px solid #BBF7D0; }
  .summary-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px 20px; margin: 20px 0; }
  .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #EEF2F6; font-size: 13.5px; }
  .summary-row:last-child { border-bottom: none; }
  .channels { display: flex; gap: 12px; margin-top: 24px; }
  .channel-btn { flex: 1; text-align: center; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; display: block; }
  .btn-wa { background: #25D366; color: #FFFFFF !important; }
  .btn-mail { background: #F1F5F9; color: #0F172A !important; border: 1px solid #CBD5E1; }
  .footer { background: #F8FAFC; padding: 20px 28px; font-size: 12.5px; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0; }
</style>
</head>
<body>
<div class="box">
  <div class="header">
    <h1 style="margin:0; font-size:24px; font-weight:800; letter-spacing:-0.02em;">Instructify <span style="color:#FFD700;">Kenya</span></h1>
    <p style="margin:6px 0 0 0; opacity:0.95; font-size:14.5px;">Empowering Educators. Transforming Institutions.</p>
  </div>
  <div class="content">
    <div style="text-align:center;">
      <span class="badge">✓ Message Received Successfully</span>
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0F172A;">Thank you, ' . htmlspecialchars($name) . '!</h2>
      <p style="margin:0; color:#475569; font-size:15px;">Your enquiry has been assigned Reference Number <strong>#' . htmlspecialchars($ticketId) . '</strong>.</p>
    </div>

    <p style="margin:20px 0 0 0; font-size:14.5px; color:#334155;">
      Our team at <strong>' . htmlspecialchars($recipientEmail) . '</strong> has received your submission. An academic consultant or technical support advisor is reviewing your request and will respond as soon as possible.
    </p>

    <div class="summary-card">
      <div style="font-weight:700; color:#0F172A; margin-bottom:8px; font-size:14px;">Summary of Your Enquiry:</div>
      <div class="summary-row"><span style="color:#64748B;">Category:</span><span style="font-weight:600; color:#0F172A;">' . htmlspecialchars($category) . '</span></div>
      <div class="summary-row"><span style="color:#64748B;">Subject:</span><span style="font-weight:600; color:#0F172A;">' . htmlspecialchars($subject) . '</span></div>
      <div class="summary-row"><span style="color:#64748B;">Assigned Desk:</span><span style="font-weight:600; color:#2145E6;">' . htmlspecialchars($recipientEmail) . '</span></div>
      <div class="summary-row"><span style="color:#64748B;">Date Received:</span><span style="color:#0F172A;">' . htmlspecialchars($dateFormatted) . '</span></div>
    </div>

    <p style="font-size:14px; color:#475569; margin:16px 0 0 0;">
      Need immediate assistance or have urgent materials to share? Connect with us via WhatsApp or reply directly to this email:
    </p>

    <div class="channels">
      <a href="https://wa.me/254143024416?text=' . rawurlencode("Hello Instructify Kenya, I just submitted an enquiry [Ticket #" . $ticketId . "]. My name is " . $name . ".") . '" class="channel-btn btn-wa">💬 Chat on WhatsApp (0143 024 416)</a>
      <a href="mailto:' . htmlspecialchars($recipientEmail) . '?subject=' . rawurlencode('Update: [Ticket #' . $ticketId . '] ' . $subject) . '" class="channel-btn btn-mail">✉️ Email Support Desk</a>
    </div>
  </div>
  <div class="footer">
    Instructify Kenya &bull; Professional Development & EdTech Solutions &bull; Nairobi, Kenya<br>
    Website: <a href="https://instructify.co.ke" style="color:#2145E6;">instructify.co.ke</a> &bull; Phone: +254 143 024 416
  </div>
</div>
</body>
</html>';

    $clientPlain = "Hello {$name},\n\n"
                 . "Thank you for contacting Instructify Kenya! Your message has been received successfully.\n"
                 . "Reference Number: #{$ticketId}\n"
                 . "Assigned Desk:    {$recipientEmail}\n"
                 . "Category:         {$category}\n"
                 . "Date:             {$timestampStr}\n\n"
                 . "Our team is reviewing your enquiry and will respond as soon as possible.\n\n"
                 . "For urgent inquiries, you may reach us directly via:\n"
                 . "- WhatsApp: +254 143 024 416 (0143 024 416)\n"
                 . "- Email:    {$recipientEmail}\n\n"
                 . "Best regards,\n"
                 . "The Instructify Kenya Team\n"
                 . "https://instructify.co.ke\n";
}

// ── 10. Mail Dispatch Helper Function ──────────────────────────
function sendMimeEmail(string $to, string $subject, string $htmlBody, string $plainBody, string $from, string $replyTo): bool {
    $boundary = "==Multipart_Boundary_x" . md5((string)time()) . "x";

    $headers = [];
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "From: {$from}";
    $headers[] = "Reply-To: {$replyTo}";
    $headers[] = "X-Mailer: InstructifyKenyaMailer/1.0";
    $headers[] = "Content-Type: multipart/alternative; boundary=\"{$boundary}\"";

    $message = "--{$boundary}\r\n"
             . "Content-Type: text/plain; charset=\"UTF-8\"\r\n"
             . "Content-Transfer-Encoding: 8bit\r\n\r\n"
             . $plainBody . "\r\n\r\n"
             . "--{$boundary}\r\n"
             . "Content-Type: text/html; charset=\"UTF-8\"\r\n"
             . "Content-Transfer-Encoding: 8bit\r\n\r\n"
             . $htmlBody . "\r\n\r\n"
             . "--{$boundary}--";

    $headerStr = implode("\r\n", $headers);
    // Send via PHP native mail() which passes directly to local Exim/Postfix transport in cPanel/DirectAdmin
    return @mail($to, $subject, $message, $headerStr);
}

// ── 11. Send Notifications ─────────────────────────────────────
$fromSystem = "Instructify Kenya <{$senderSystem}>";
$clientReplyTo = "{$name} <{$email}>";

// 1. Send team notification
$teamSent = sendMimeEmail($recipientEmail, $teamSubject, $teamHtml, $teamPlain, $fromSystem, $clientReplyTo);

// 2. Send client autoresponder acknowledgement
$fromDesk = "Instructify Kenya <{$recipientEmail}>";
$autoresponderEnabled = getenv('EMAIL_ENABLE_AUTORESPONDER') !== 'false';
$clientSent = false;
if ($autoresponderEnabled) {
    $clientSent = sendMimeEmail($email, $clientSubject, $clientHtml, $clientPlain, $fromDesk, $recipientEmail);
}

// ── 12. Save Audit Log Record ──────────────────────────────────
$logFile = $dataDir . '/enquiries.json';
$enquiries = [];
if (file_exists($logFile)) {
    $existing = @file_get_contents($logFile);
    if ($existing) {
        $enquiries = json_decode($existing, true) ?: [];
    }
}

$newRecord = [
    'ticketId'        => $ticketId,
    'passId'          => $isWorkshop ? $passId : null,
    'isWorkshop'      => $isWorkshop,
    'workshopTitle'   => $isWorkshop ? $workshopTitle : null,
    'workshopRole'    => $isWorkshop ? $workshopRole : null,
    'workshopLang'    => $isWorkshop ? $workshopLang : null,
    'workshopNeeds'   => $isWorkshop ? $workshopNeeds : null,
    'paymentMethod'   => $isWorkshop ? $paymentMethod : null,
    'name'            => $name,
    'email'           => $email,
    'phone'           => $phone,
    'organization'    => $org,
    'category'        => $category,
    'subject'         => $subject,
    'message'         => $message,
    'preferred'       => $preferred,
    'targetMailbox'   => $recipientEmail,
    'status'          => 'New',
    'teamNotified'    => $teamSent,
    'clientConfirmed' => $clientSent,
    'clientIp'        => substr(md5($clientIp), 0, 10), // hashed for privacy compliance
    'createdAt'       => $timestampStr,
];

array_unshift($enquiries, $newRecord);
// Keep last 1,000 entries
if (count($enquiries) > 1000) {
    $enquiries = array_slice($enquiries, 0, 1000);
}
@file_put_contents($logFile, json_encode($enquiries, JSON_PRETTY_PRINT));

// ── 13. Return Success JSON Response ───────────────────────────
http_response_code(200);
echo json_encode([
    'success'       => true,
    'ticketId'      => $ticketId,
    'passId'        => $isWorkshop ? $passId : null,
    'routeEmail'    => $recipientEmail,
    'category'      => $category,
    'receivedAt'    => $timestampStr,
    'clientSent'    => $clientSent,
    'whatsappUrl'   => $isWorkshop 
        ? 'https://wa.me/254143024416?text=' . rawurlencode("Hello Instructify Kenya, I registered for {$workshopTitle} (Pass #{$passId}).\nName: {$name}")
        : 'https://wa.me/254143024416?text=' . rawurlencode("Hello Instructify Kenya, I just submitted an enquiry (Ticket #{$ticketId}).\n*Name:* {$name}\n*Category:* {$category}\n*Subject:* {$subject}"),
    'instantReply'  => $isWorkshop
        ? "Thank you {$name}! Your workshop registration has been confirmed under Pass #{$passId}. A confirmation pass has been dispatched to {$email} and our workshop team ({$recipientEmail})."
        : "Thank you {$name}! Your enquiry has been routed to our {$recipientName} ({$recipientEmail}) under Ticket #{$ticketId}. We will review and respond promptly.",
    'message'       => $isWorkshop
        ? "Registration confirmed! Pass #{$passId} generated and confirmation sent to {$email}."
        : 'Thank you for contacting Instructify Kenya. Your message has been received successfully. A confirmation has been sent to your email address.'
]);
exit;
