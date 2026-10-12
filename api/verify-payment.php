<?php
/**
 * Direct entrypoint for GET|POST /api/verify-payment.php
 */
declare(strict_types=1);

$_GET['action'] = 'verify-payment';
require_once __DIR__ . '/payment.php';
