<?php
/**
 * ============================================================
 * INSTRUCTIFY KENYA — Coding Boot Camp Registration API (PHP)
 * Endpoint: GET, POST, PATCH, DELETE /api/bootcamp-registration.php
 *
 * Programme: Instructify Coding Boot Camp (Mon 9th Nov – Dec 2026)
 * Charges: KES 2,500 per week
 * ============================================================
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-User-Role, X-User-Id');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
    $htaccess = $dataDir . '/.htaccess';
    if (!file_exists($htaccess)) {
        @file_put_contents($htaccess, "Deny from all\n");
    }
}
$storeFile = $dataDir . '/bootcamp-registrations.json';

function getBootcampRegistrations(string $file): array {
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function saveBootcampRegistrations(string $file, array $records): bool {
    $tmp = $file . '.tmp.' . mt_rand(1000, 9999);
    $json = json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (@file_put_contents($tmp, $json, LOCK_EX) !== false) {
        return @rename($tmp, $file);
    }
    return false;
}

function computeBootcampStats(array $records): array {
    $active = array_filter($records, fn($r) => ($r['status'] ?? '') !== 'Cancelled');
    $confirmed = array_filter($records, fn($r) => in_array($r['status'] ?? '', ['Confirmed', 'Payment Verified', 'Completed'], true) || !empty($r['paymentVerified']));
    $confirmedRevenue = 0;
    foreach ($records as $r) {
        if (($r['status'] ?? '') !== 'Cancelled') {
            $confirmedRevenue += (int)($r['amountPaid'] ?? 0);
        }
    }
    $projectedRevenue = 0;
    $totalWeeksBooked = 0;
    foreach ($active as $r) {
        $projectedRevenue += (int)($r['totalFee'] ?? 2500);
        $totalWeeksBooked += (int)($r['weeksCount'] ?? 1);
    }

    return [
        'total'            => count($records),
        'new'              => count(array_filter($records, fn($r) => ($r['status'] ?? '') === 'New')),
        'underReview'      => count(array_filter($records, fn($r) => ($r['status'] ?? '') === 'Under Review')),
        'awaitingPayment'  => count(array_filter($records, fn($r) => ($r['status'] ?? '') === 'Awaiting Payment')),
        'paymentVerified'  => count(array_filter($records, fn($r) => ($r['status'] ?? '') === 'Payment Verified')),
        'confirmed'        => count($confirmed),
        'waitlisted'       => count(array_filter($records, fn($r) => ($r['status'] ?? '') === 'Waitlisted')),
        'completed'        => count(array_filter($records, fn($r) => ($r['status'] ?? '') === 'Completed')),
        'cancelled'        => count(array_filter($records, fn($r) => ($r['status'] ?? '') === 'Cancelled')),
        'totalWeeksBooked' => $totalWeeksBooked,
        'confirmedRevenue' => $confirmedRevenue,
        'projectedRevenue' => $projectedRevenue
    ];
}

// ── GET: List or Lookup Registrations ─────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $records = getBootcampRegistrations($storeFile);
    $passIdQuery = strtoupper(trim($_GET['passId'] ?? ''));

    if ($passIdQuery !== '') {
        foreach ($records as $r) {
            if (strtoupper($r['passId'] ?? '') === $passIdQuery) {
                http_response_code(200);
                echo json_encode(['success' => true, 'registration' => $r]);
                exit;
            }
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => "Registration {$passIdQuery} not found."]);
        exit;
    }

    $search        = trim($_GET['search'] ?? '');
    $track         = trim($_GET['track'] ?? '');
    $category      = trim($_GET['category'] ?? '');
    $mode          = trim($_GET['mode'] ?? '');
    $status        = trim($_GET['status'] ?? '');
    $paymentStatus = trim($_GET['paymentStatus'] ?? '');
    $county        = trim($_GET['county'] ?? '');

    $filtered = array_filter($records, function ($r) use ($search, $track, $category, $mode, $status, $paymentStatus, $county) {
        if ($search !== '') {
            $q = mb_strtolower($search);
            $haystack = mb_strtolower(($r['fullName'] ?? '') . ' ' . ($r['email'] ?? '') . ' ' . ($r['phone'] ?? '') . ' ' . ($r['institution'] ?? '') . ' ' . ($r['passId'] ?? '') . ' ' . ($r['paymentReference'] ?? '') . ' ' . ($r['learningTrack'] ?? ''));
            if (strpos($haystack, $q) === false) return false;
        }
        if ($track !== '' && stripos($r['learningTrack'] ?? '', $track) === false) return false;
        if ($category !== '' && mb_strtolower($r['participantCategory'] ?? '') !== mb_strtolower($category)) return false;
        if ($mode !== '' && mb_strtolower($r['attendanceMode'] ?? '') !== mb_strtolower($mode)) return false;
        if ($status !== '' && mb_strtolower($r['status'] ?? '') !== mb_strtolower($status)) return false;
        if ($paymentStatus !== '' && mb_strtolower($r['paymentStatus'] ?? '') !== mb_strtolower($paymentStatus)) return false;
        if ($county !== '' && mb_strtolower($r['county'] ?? '') !== mb_strtolower($county)) return false;
        return true;
    });

    http_response_code(200);
    echo json_encode([
        'success'       => true,
        'count'         => count($filtered),
        'stats'         => computeBootcampStats($records),
        'registrations' => array_values($filtered)
    ]);
    exit;
}

// ── PATCH: Update Status, Verify Payment, Notes, or Proof ─────
if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true) ?: [];
    $passId = trim((string)($payload['passId'] ?? ''));

    if ($passId === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing passId.']);
        exit;
    }

    $records = getBootcampRegistrations($storeFile);
    $foundIndex = -1;
    foreach ($records as $i => $r) {
        if (($r['passId'] ?? '') === $passId) {
            $foundIndex = $i;
            break;
        }
    }

    if ($foundIndex === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => "Registration {$passId} not found."]);
        exit;
    }

    $allowedStatuses = ['New', 'Under Review', 'Awaiting Payment', 'Payment Verified', 'Confirmed', 'Waitlisted', 'Completed', 'Cancelled'];
    if (!empty($payload['status']) && in_array($payload['status'], $allowedStatuses, true)) {
        $records[$foundIndex]['status'] = $payload['status'];
        if (in_array($payload['status'], ['Payment Verified', 'Confirmed'], true)) {
            $records[$foundIndex]['paymentVerified'] = true;
        }
    }
    if (isset($payload['paymentVerified'])) {
        $records[$foundIndex]['paymentVerified'] = (bool)$payload['paymentVerified'];
        if ($records[$foundIndex]['paymentVerified'] && in_array($records[$foundIndex]['status'] ?? '', ['New', 'Under Review', 'Awaiting Payment'], true)) {
            $records[$foundIndex]['status'] = 'Confirmed';
        }
    }
    if (isset($payload['paymentStatus'])) {
        $records[$foundIndex]['paymentStatus'] = trim((string)$payload['paymentStatus']);
    }
    if (isset($payload['amountPaid'])) {
        $records[$foundIndex]['amountPaid'] = max(0, (int)$payload['amountPaid']);
    }
    if (isset($payload['paymentReference'])) {
        $records[$foundIndex]['paymentReference'] = strtoupper(trim((string)$payload['paymentReference']));
    }
    if (isset($payload['paymentSmsText'])) {
        $records[$foundIndex]['paymentSmsText'] = trim((string)$payload['paymentSmsText']);
    }
    if (isset($payload['proofDataUrl'])) {
        $records[$foundIndex]['proofDataUrl'] = (string)$payload['proofDataUrl'];
        $records[$foundIndex]['proofFileName'] = (string)($payload['proofFileName'] ?? 'payment_proof');
        $records[$foundIndex]['proofFileType'] = (string)($payload['proofFileType'] ?? 'image/png');
        $records[$foundIndex]['proofFileSize'] = (int)($payload['proofFileSize'] ?? 0);
        if (($records[$foundIndex]['status'] ?? '') === 'Awaiting Payment') {
            $records[$foundIndex]['status'] = 'Under Review';
        }
    }
    if (isset($payload['internalNotes'])) {
        $records[$foundIndex]['internalNotes'] = trim((string)$payload['internalNotes']);
    }
    $records[$foundIndex]['updatedAt'] = date('c');

    saveBootcampRegistrations($storeFile, $records);

    http_response_code(200);
    echo json_encode([
        'success'      => true,
        'registration' => $records[$foundIndex],
        'stats'        => computeBootcampStats($records)
    ]);
    exit;
}

// ── DELETE: Remove or Anonymize Registration ──────────────────
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true) ?: [];
    $passId = trim((string)($_GET['passId'] ?? $payload['passId'] ?? ''));
    $anonymize = !empty($_GET['anonymize']) || !empty($payload['anonymize']);

    if ($passId === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing passId.']);
        exit;
    }

    $records = getBootcampRegistrations($storeFile);
    $found = false;
    foreach ($records as $i => $r) {
        if (($r['passId'] ?? '') === $passId) {
            $found = true;
            if ($anonymize) {
                $records[$i]['fullName'] = 'Anonymized Participant';
                $records[$i]['guardianName'] = '';
                $records[$i]['guardianPhone'] = '';
                $records[$i]['email'] = 'anonymized@gdpr.internal';
                $records[$i]['phone'] = '+254700000000';
                $records[$i]['whatsapp'] = '+254700000000';
                $records[$i]['institution'] = 'Anonymized Institution';
                $records[$i]['proofDataUrl'] = '';
                $records[$i]['proofFileName'] = '';
                $records[$i]['status'] = 'Cancelled';
                $records[$i]['anonymizedAt'] = date('c');
            } else {
                array_splice($records, $i, 1);
            }
            break;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Record not found.']);
        exit;
    }

    saveBootcampRegistrations($storeFile, $records);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Record {$passId} processed.",
        'stats'   => computeBootcampStats($records)
    ]);
    exit;
}

// ── POST: Create New Registration ─────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data) && !empty($_POST)) {
        $data = $_POST;
    }
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON payload.']);
        exit;
    }

    if (!empty($data['_hp_instructify']) || !empty($data['website_hp_check'])) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'passId'  => 'IK-BC-2026-' . mt_rand(100000, 999999),
            'status'  => 'Received',
            'message' => 'Registration received.'
        ]);
        exit;
    }

    $fullName            = trim((string)($data['fullName'] ?? ''));
    $ageGroup            = trim((string)($data['ageGroup'] ?? 'Young Adult (18–24 yrs)'));
    $participantCategory = trim((string)($data['participantCategory'] ?? ''));
    $guardianName        = trim((string)($data['guardianName'] ?? ''));
    $guardianPhone       = trim((string)($data['guardianPhone'] ?? ''));
    $phone               = trim((string)($data['phone'] ?? ''));
    $whatsapp            = trim((string)($data['whatsapp'] ?? $phone));
    $email               = strtolower(trim((string)($data['email'] ?? '')));
    $county              = trim((string)($data['county'] ?? ''));
    $town                = trim((string)($data['town'] ?? ''));
    $institution         = trim((string)($data['institution'] ?? ''));

    $learningTrack       = trim((string)($data['learningTrack'] ?? ''));
    $experienceLevel     = trim((string)($data['experienceLevel'] ?? 'Complete Beginner — No prior coding experience'));
    $startWeek           = trim((string)($data['startWeek'] ?? 'Week 1: Mon 9th Nov – Fri 13th Nov 2026'));
    $weeksCount          = max(1, min(6, (int)($data['weeksCount'] ?? 1)));
    $weeklyRate          = 2500;
    $totalFee            = $weeksCount * $weeklyRate;
    $sessionTime         = trim((string)($data['sessionTime'] ?? ''));
    $attendanceMode      = trim((string)($data['attendanceMode'] ?? ''));
    $preferredHub        = trim((string)($data['preferredHub'] ?? ''));
    $devicesRaw          = $data['deviceAccess'] ?? [];
    $deviceAccess        = is_array($devicesRaw) ? array_map('trim', $devicesRaw) : array_filter(array_map('trim', explode(',', (string)$devicesRaw)));
    $internetAccess      = trim((string)($data['internetAccess'] ?? 'Yes'));
    $projectGoals        = trim((string)($data['projectGoals'] ?? ''));
    $accessibilityNeeds  = trim((string)($data['accessibilityNeeds'] ?? 'No'));
    $accessibilityDetails = trim((string)($data['accessibilityDetails'] ?? ''));

    $paymentStatus       = trim((string)($data['paymentStatus'] ?? ''));
    $paymentMethod       = trim((string)($data['paymentMethod'] ?? 'M-Pesa'));
    $paymentReference    = strtoupper(trim((string)($data['paymentReference'] ?? '')));
    $paymentSmsText      = trim((string)($data['paymentSmsText'] ?? ''));
    $amountPaid          = isset($data['amountPaid']) ? max(0, (int)$data['amountPaid']) : ($paymentStatus === 'Paid in Full' ? $totalFee : ($paymentStatus === 'Paid Weekly Installment' ? 2500 : 0));

    $proofFileName       = trim((string)($data['proofFileName'] ?? ''));
    $proofFileType       = trim((string)($data['proofFileType'] ?? ''));
    $proofFileSize       = (int)($data['proofFileSize'] ?? 0);
    $proofDataUrl        = (string)($data['proofDataUrl'] ?? '');

    $accuracyConsent      = !empty($data['accuracyConsent']);
    $guardianConsent      = !empty($data['guardianConsent']);
    $communicationConsent = !empty($data['communicationConsent']);
    $privacyConsent       = !empty($data['privacyConsent']);
    $updatesConsent       = !empty($data['updatesConsent']);

    if ($fullName === '' || mb_strlen($fullName) < 3) {
        http_response_code(422);
        echo json_encode(['success' => false, 'error' => 'Full name is required.']);
        exit;
    }
    if ($learningTrack === '' || $sessionTime === '' || $attendanceMode === '') {
        http_response_code(422);
        echo json_encode(['success' => false, 'error' => 'Please select your learning track, schedule, and attendance mode.']);
        exit;
    }

    $passId = 'IK-BC-2026-' . mt_rand(100000, 999999);
    $initialStatus = in_array($paymentStatus, ['Paid in Full', 'Paid Weekly Installment'], true) ? 'Under Review' : 'Awaiting Payment';

    $newRecord = [
        'passId'               => $passId,
        'registeredAt'         => date('c'),
        'updatedAt'            => date('c'),
        'fullName'             => $fullName,
        'ageGroup'             => $ageGroup,
        'participantCategory'  => $participantCategory,
        'guardianName'         => $guardianName,
        'guardianPhone'        => $guardianPhone,
        'phone'                => $phone,
        'whatsapp'             => $whatsapp,
        'email'                => $email,
        'county'               => $county,
        'town'                 => $town,
        'institution'          => $institution,
        'learningTrack'        => $learningTrack,
        'experienceLevel'      => $experienceLevel,
        'startWeek'            => $startWeek,
        'weeksCount'           => $weeksCount,
        'weeklyRate'           => $weeklyRate,
        'totalFee'             => $totalFee,
        'sessionTime'          => $sessionTime,
        'attendanceMode'       => $attendanceMode,
        'preferredHub'         => $preferredHub,
        'deviceAccess'         => array_values($deviceAccess),
        'internetAccess'       => $internetAccess,
        'projectGoals'         => $projectGoals,
        'accessibilityNeeds'   => $accessibilityNeeds,
        'accessibilityDetails' => $accessibilityDetails,
        'paymentStatus'        => $paymentStatus,
        'paymentMethod'        => $paymentMethod,
        'amountPaid'           => $amountPaid,
        'paymentReference'     => $paymentReference,
        'paymentSmsText'       => $paymentSmsText,
        'proofFileName'        => $proofFileName,
        'proofFileType'        => $proofFileType,
        'proofFileSize'        => $proofFileSize,
        'proofDataUrl'         => $proofDataUrl,
        'paymentVerified'      => false,
        'status'               => $initialStatus,
        'internalNotes'        => '',
        'accuracyConsent'      => $accuracyConsent,
        'guardianConsent'      => $guardianConsent,
        'communicationConsent' => $communicationConsent,
        'privacyConsent'       => $privacyConsent,
        'updatesConsent'       => $updatesConsent
    ];

    $records = getBootcampRegistrations($storeFile);
    array_unshift($records, $newRecord);
    saveBootcampRegistrations($storeFile, $records);

    // Optional email notification
    $adminEmail = 'info@instructify.co.ke';
    $subject = "New Coding Boot Camp Registration: {$fullName} ({$passId})";
    $headers = "From: Instructify Coding Boot Camp <no-reply@instructify.co.ke>\r\nReply-To: {$email}\r\nContent-Type: text/plain; charset=UTF-8";
    $msg = "New Coding Boot Camp Registration\nPass ID: {$passId}\nParticipant: {$fullName} ({$participantCategory})\nTrack: {$learningTrack}\nSchedule: {$startWeek} ({$weeksCount} week(s) @ KES 2,500/wk = KES {$totalFee})\nMode: {$attendanceMode} - {$sessionTime}\nPayment Status: {$paymentStatus} (Ref: {$paymentReference})\n";
    @mail($adminEmail, $subject, $msg, $headers);

    http_response_code(201);
    echo json_encode([
        'success'      => true,
        'passId'       => $passId,
        'status'       => $initialStatus,
        'registration' => $newRecord,
        'message'      => 'Your Coding Boot Camp registration has been received successfully.'
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method Not Allowed.']);

