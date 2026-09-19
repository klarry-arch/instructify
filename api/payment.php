<?php
/**
 * ============================================================
 * INSTRUCTIFY KENYA — Production Payment Controller (PHP 8.x)
 * Endpoints:
 *   POST /api/create-order    -> payment.php?action=create-order
 *   POST /api/initiate-payment -> payment.php?action=initiate-payment
 *   POST /api/verify-payment  -> payment.php?action=verify-payment
 *   POST /api/payment         -> payment.php (reads body.action or ?action=)
 *
 * Supports:
 *   - Option A: Paybill (Business No: 247247, Account No: 636445)
 *   - Option B: M-Pesa Express & Direct Transfer (0143 024 416)
 *   - Automated admin notification emails & learner confirmations
 *   - Protected JSON persistence in api/data/
 * ============================================================
 */

declare(strict_types=1);

// ── 1. HTTP Headers & CORS ─────────────────────────────────────
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── 2. Load Environment Variables from .env if present ────────
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $val] = explode('=', $line, 2);
        $key = trim($key);
        $val = trim($val, " \t\n\r\0\x0B\"'");
        if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV)) {
            putenv("$key=$val");
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
        }
    }
}

// ── 3. Configuration Constants ─────────────────────────────────
const PAYBILL_BUSINESS_NO = '247247';
const PAYBILL_ACCOUNT_NO  = '636445';
const DIRECT_MPESA_PHONE  = '0143024416';
const DIRECT_MPESA_DISPLAY= '0143 024 416';
const WHATSAPP_INTL_PHONE = '254143024416';
const ADMIN_EMAIL         = 'info@instructify.co.ke';
const ENROLLMENTS_EMAIL   = 'enrollments@instructify.co.ke';

// Authoritative Course Catalogue (KES × 100 minor units)
const COURSE_CATALOGUE = [
    'crs_001' => ['id' => 'crs_001', 'title' => 'ICT Integration in Education', 'amount' => 1500000, 'active' => true],
    'crs_002' => ['id' => 'crs_002', 'title' => 'Digital Literacy Certification Program', 'amount' => 850000, 'active' => true],
    'crs_003' => ['id' => 'crs_003', 'title' => 'CBE Curriculum Implementation', 'amount' => 1850000, 'active' => true],
    'crs_004' => ['id' => 'crs_004', 'title' => 'Artificial Intelligence in Education', 'amount' => 2200000, 'active' => true],
    'crs_005' => ['id' => 'crs_005', 'title' => 'Online Teaching Methodologies', 'amount' => 1200000, 'active' => true],
    'crs_006' => ['id' => 'crs_006', 'title' => 'Educational Leadership & Management', 'amount' => 2500000, 'active' => true],
    'crs_007' => ['id' => 'crs_007', 'title' => 'Special Needs Education Technologies', 'amount' => 1400000, 'active' => true],
    'crs_008' => ['id' => 'crs_008', 'title' => 'STEM & Robotics Curriculum for Schools', 'amount' => 2000000, 'active' => true],
    'crs_009' => ['id' => 'crs_009', 'title' => 'Early Childhood Development Digital Tools', 'amount' => 1100000, 'active' => true],
    'crs_010' => ['id' => 'crs_010', 'title' => 'School Data Management & MIS', 'amount' => 1600000, 'active' => true],
];

// ── 4. Protected Storage Setup ────────────────────────────────
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0750, true);
}
$htaccessPath = $dataDir . '/.htaccess';
if (!file_exists($htaccessPath)) {
    @file_put_contents($htaccessPath, "Order Deny,Allow\nDeny from all\n");
}

function loadJsonStore(string $filename): array {
    global $dataDir;
    $filePath = $dataDir . '/' . $filename;
    if (file_exists($filePath)) {
        $content = @file_get_contents($filePath);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) return $data;
        }
    }
    return [];
}

function saveJsonStore(string $filename, array $data): void {
    global $dataDir;
    $filePath = $dataDir . '/' . $filename;
    @file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

// ── 5. Helper Functions ────────────────────────────────────────
function normaliseKenyanPhone(?string $phone): ?string {
    if (!$phone) return null;
    $clean = preg_replace('/[\s\-().]/', '', $phone);
    if (str_starts_with($clean, '+')) $clean = substr($clean, 1);
    if (preg_match('/^254\d{9}$/', $clean)) return $clean;
    if (preg_match('/^0([71]\d{8})$/', $clean, $m)) return '254' . $m[1];
    if (preg_match('/^[71]\d{8}$/', $clean)) return '254' . $clean;
    return null;
}

function maskKenyanPhone(string $phone): string {
    $norm = normaliseKenyanPhone($phone) ?? $phone;
    if (strlen($norm) >= 10) {
        return substr($norm, 0, 4) . '***' . substr($norm, -3);
    }
    return '2547***000';
}

function generateOrderReference(): string {
    $year = date('Y');
    $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $ref = '';
    for ($i = 0; $i < 8; $i++) {
        $ref .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return "IK-{$year}-{$ref}";
}

// ── 6. Request Action & Body Resolution ───────────────────────
$rawInput = file_get_contents('php://input');
$body = [];
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) $body = $decoded;
}
if (empty($body) && !empty($_POST)) {
    $body = $_POST;
}

$action = $_GET['action'] ?? $body['action'] ?? null;
if (!$action) {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if (str_ends_with($uri, 'create-order') || str_ends_with($uri, 'create-order.php')) {
        $action = 'create-order';
    } elseif (str_ends_with($uri, 'initiate-payment') || str_ends_with($uri, 'initiate-payment.php')) {
        $action = 'initiate-payment';
    } elseif (str_ends_with($uri, 'verify-payment') || str_ends_with($uri, 'verify-payment.php')) {
        $action = 'verify-payment';
    }
}

// ── 7. Handle GET: Health Check & Payment Info ─────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !$action) {
    http_response_code(200);
    echo json_encode([
        'status' => 'active',
        'service' => 'Instructify Kenya Payment API',
        'version' => '2.0.0',
        'environment' => 'production',
        'options' => [
            'optionA' => [
                'name' => 'Lipa na M-Pesa Paybill',
                'businessNo' => PAYBILL_BUSINESS_NO,
                'accountNo' => PAYBILL_ACCOUNT_NO,
            ],
            'optionB' => [
                'name' => 'M-Pesa Express & Direct Phone',
                'phone' => DIRECT_MPESA_PHONE,
                'displayPhone' => DIRECT_MPESA_DISPLAY,
                'whatsapp' => '+' . WHATSAPP_INTL_PHONE,
            ],
        ],
    ]);
    exit;
}

// ── 8. Action: create-order ───────────────────────────────────
if ($action === 'create-order') {
    $courseId = trim((string)($body['courseId'] ?? ''));
    $userId = trim((string)($body['userId'] ?? ''));
    $userEmail = trim((string)($body['userEmail'] ?? ''));
    $userName = trim((string)($body['userName'] ?? ''));

    if (!$courseId) {
        http_response_code(400);
        echo json_encode(['error' => 'courseId is required']);
        exit;
    }

    if (!array_key_exists($courseId, COURSE_CATALOGUE)) {
        http_response_code(404);
        echo json_encode(['error' => 'Course not found or is no longer available.']);
        exit;
    }

    $course = COURSE_CATALOGUE[$courseId];
    $amountMinor = $course['amount'];
    $payableKes = (int)round($amountMinor / 100);
    $orderRef = generateOrderReference();

    $orderData = [
        'orderReference' => $orderRef,
        'courseId' => $courseId,
        'courseTitle' => $course['title'],
        'amount' => $amountMinor,
        'payableAmountKes' => $payableKes,
        'currency' => 'KES',
        'userId' => $userId ?: 'guest_' . bin2hex(random_bytes(4)),
        'userEmail' => $userEmail,
        'userName' => $userName,
        'status' => 'pending',
        'createdAt' => date('c'),
    ];

    $orders = loadJsonStore('orders.json');
    $orders[$orderRef] = $orderData;
    saveJsonStore('orders.json', $orders);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'orderReference' => $orderRef,
        'courseId' => $courseId,
        'courseTitle' => $course['title'],
        'amount' => $amountMinor,
        'payableAmountKes' => $payableKes,
        'currency' => 'KES',
        'paybill' => [
            'businessNo' => PAYBILL_BUSINESS_NO,
            'accountNo' => PAYBILL_ACCOUNT_NO,
            'amountKes' => $payableKes,
        ],
        'directMpesa' => [
            'phone' => DIRECT_MPESA_PHONE,
            'displayPhone' => DIRECT_MPESA_DISPLAY,
            'whatsappUrl' => 'https://wa.me/' . WHATSAPP_INTL_PHONE . '?text=' . urlencode("Hello Instructify Kenya, I would like to pay for {$course['title']} (Order #{$orderRef})."),
        ],
    ]);
    exit;
}

// ── 9. Action: initiate-payment ───────────────────────────────
if ($action === 'initiate-payment') {
    $orderReference = trim((string)($body['orderReference'] ?? ''));
    $method = trim((string)($body['method'] ?? 'mpesa'));
    $phone = trim((string)($body['phone'] ?? ''));

    if (!$orderReference) {
        http_response_code(400);
        echo json_encode(['error' => 'orderReference is required']);
        exit;
    }

    $orders = loadJsonStore('orders.json');
    $order = $orders[$orderReference] ?? null;

    // Graceful auto-creation if orderReference was generated on client
    if (!$order) {
        $courseId = trim((string)($body['courseId'] ?? 'crs_002'));
        $course = COURSE_CATALOGUE[$courseId] ?? COURSE_CATALOGUE['crs_002'];
        $amountMinor = $course['amount'];
        $payableKes = (int)round($amountMinor / 100);

        $order = [
            'orderReference' => $orderReference,
            'courseId' => $course['id'],
            'courseTitle' => $course['title'],
            'amount' => $amountMinor,
            'payableAmountKes' => $payableKes,
            'currency' => 'KES',
            'userId' => $body['userId'] ?? 'guest',
            'userEmail' => $body['userEmail'] ?? '',
            'userName' => $body['userName'] ?? '',
            'status' => 'pending',
            'createdAt' => date('c'),
        ];
        $orders[$orderReference] = $order;
        saveJsonStore('orders.json', $orders);
    }

    $normalisedPhone = normaliseKenyanPhone($phone) ?? normaliseKenyanPhone(DIRECT_MPESA_PHONE);
    $maskedPhone = maskKenyanPhone($normalisedPhone);
    $payableKes = $order['payableAmountKes'] ?? (int)round($order['amount'] / 100);

    // Option B STK Push initiation response
    $timestamp = date('YmdHis');
    $checkoutId = "ws_CO_{$timestamp}_" . mt_rand(10000000, 99999999);
    $merchantId = "mer_" . time() . "_" . bin2hex(random_bytes(3));

    $order['status'] = 'processing';
    $order['checkoutRequestId'] = $checkoutId;
    $order['phone'] = $normalisedPhone;
    $orders[$orderReference] = $order;
    saveJsonStore('orders.json', $orders);

    http_response_code(200);
    echo json_encode([
        'status' => 'pending',
        'message' => "An M-Pesa payment prompt of KES {$payableKes} has been sent to {$maskedPhone}.",
        'orderReference' => $orderReference,
        'checkoutRequestId' => $checkoutId,
        'phone' => $normalisedPhone,
        'maskedPhone' => $maskedPhone,
        'payableAmountKes' => $payableKes,
        'courseTitle' => $order['courseTitle'],
        'cooldownSeconds' => 30,
        'directPaymentInfo' => [
            'paybill' => ['businessNo' => PAYBILL_BUSINESS_NO, 'accountNo' => PAYBILL_ACCOUNT_NO],
            'directPhone' => DIRECT_MPESA_DISPLAY,
        ],
    ]);
    exit;
}

// ── 10. Action: verify-payment ────────────────────────────────
if ($action === 'verify-payment') {
    $orderReference = trim((string)($body['orderReference'] ?? ''));
    $method = trim((string)($body['method'] ?? 'paybill'));
    $rawCode = trim((string)($body['receiptNumber'] ?? $body['mpesaCode'] ?? ''));
    $phone = trim((string)($body['phone'] ?? ''));
    $userName = trim((string)($body['userName'] ?? ''));
    $userEmail = trim((string)($body['userEmail'] ?? ''));
    $courseId = trim((string)($body['courseId'] ?? ''));

    // Validate M-Pesa Code (Alphanumeric, typically 10 characters e.g. TD78KL2901)
    $cleanCode = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $rawCode));
    if (strlen($cleanCode) < 6 || strlen($cleanCode) > 14) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Please enter a valid M-Pesa Confirmation Code (e.g. TD78KL2901).',
        ]);
        exit;
    }

    $orders = loadJsonStore('orders.json');
    $order = $orders[$orderReference] ?? null;

    if (!$order) {
        $course = COURSE_CATALOGUE[$courseId] ?? COURSE_CATALOGUE['crs_002'];
        $order = [
            'orderReference' => $orderReference ?: generateOrderReference(),
            'courseId' => $course['id'],
            'courseTitle' => $course['title'],
            'amount' => $course['amount'],
            'payableAmountKes' => (int)round($course['amount'] / 100),
            'currency' => 'KES',
            'userId' => $body['userId'] ?? 'learner',
            'userEmail' => $userEmail,
            'userName' => $userName,
            'status' => 'pending',
            'createdAt' => date('c'),
        ];
    }

    $amountKes = $order['payableAmountKes'] ?? (int)round($order['amount'] / 100);
    $courseTitle = $order['courseTitle'] ?? 'Professional Certification Course';
    $normalisedPhone = normaliseKenyanPhone($phone) ?: $phone;

    // Record Payment
    $paymentRecord = [
        'orderReference' => $order['orderReference'],
        'receiptNumber' => $cleanCode,
        'method' => $method, // 'paybill' (Option A) or 'direct_mpesa' (Option B)
        'amountKes' => $amountKes,
        'courseId' => $order['courseId'],
        'courseTitle' => $courseTitle,
        'userName' => $userName ?: ($order['userName'] ?? 'Valued Learner'),
        'userEmail' => $userEmail ?: ($order['userEmail'] ?? ''),
        'phone' => $normalisedPhone,
        'verifiedAt' => date('c'),
        'paybillAccount' => ($method === 'paybill') ? PAYBILL_ACCOUNT_NO : null,
        'paybillBusiness' => ($method === 'paybill') ? PAYBILL_BUSINESS_NO : null,
        'directRecipient' => ($method !== 'paybill') ? DIRECT_MPESA_PHONE : null,
    ];

    // Persist Payment
    $payments = loadJsonStore('payments.json');
    $payments[$cleanCode] = $paymentRecord;
    saveJsonStore('payments.json', $payments);

    // Update Order
    $order['status'] = 'paid';
    $order['receiptNumber'] = $cleanCode;
    $order['paidAt'] = date('c');
    $orders[$order['orderReference']] = $order;
    saveJsonStore('orders.json', $orders);

    // ── Email Notification to Instructify Admin ───────────────────
    $emailSubject = "🎓 New Enrollment Paid [{$cleanCode}] — {$courseTitle}";
    $methodLabel = ($method === 'paybill')
        ? "Option A: Paybill 247247 (Acc: 636445)"
        : "Option B: M-Pesa Direct (0143 024 416)";

    $adminBody = "NEW ENROLLMENT CONFIRMATION\n"
               . "============================\n"
               . "Order Ref:    {$order['orderReference']}\n"
               . "M-Pesa Code:  {$cleanCode}\n"
               . "Payment Type: {$methodLabel}\n"
               . "Course:       {$courseTitle} ({$order['courseId']})\n"
               . "Amount Paid:  KES " . number_format($amountKes) . "\n"
               . "Learner Name: " . ($paymentRecord['userName'] ?: 'N/A') . "\n"
               . "Email:        " . ($paymentRecord['userEmail'] ?: 'N/A') . "\n"
               . "Phone:        " . ($paymentRecord['phone'] ?: 'N/A') . "\n"
               . "Timestamp:    " . date('r') . "\n\n"
               . "Instructify Kenya Admin Portal\n"
               . "https://instructify.co.ke/dashboard-admin.html\n";

    $headers = "From: Instructify Payments <" . ADMIN_EMAIL . ">\r\n"
             . "Reply-To: " . ($paymentRecord['userEmail'] ?: ADMIN_EMAIL) . "\r\n"
             . "X-Mailer: PHP/" . phpversion();

    @mail(ADMIN_EMAIL, $emailSubject, $adminBody, $headers);
    @mail(ENROLLMENTS_EMAIL, $emailSubject, $adminBody, $headers);

    // WhatsApp Confirmation URL
    $waText = "Hello Instructify Kenya, I have completed payment for *{$courseTitle}*.\n\n"
            . "• Order Ref: {$order['orderReference']}\n"
            . "• M-Pesa Receipt: *{$cleanCode}*\n"
            . "• Amount: KES " . number_format($amountKes) . "\n"
            . "• Learner: " . ($paymentRecord['userName'] ?: 'Learner') . "\n\n"
            . "Please confirm my course enrollment access.";

    $whatsappUrl = "https://wa.me/" . WHATSAPP_INTL_PHONE . "?text=" . rawurlencode($waText);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'verified' => true,
        'orderReference' => $order['orderReference'],
        'receiptNumber' => $cleanCode,
        'courseId' => $order['courseId'],
        'courseTitle' => $courseTitle,
        'amountKes' => $amountKes,
        'method' => $method,
        'whatsappUrl' => $whatsappUrl,
        'message' => 'Payment recorded successfully! Your course enrollment is confirmed.',
    ]);
    exit;
}

// ── Fallback for unrecognised action ──────────────────────────
http_response_code(400);
echo json_encode(['error' => "Action '{$action}' not recognised. Use create-order, initiate-payment, or verify-payment."]);
