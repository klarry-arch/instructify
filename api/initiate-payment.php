<?php
/**
 * Direct entrypoint for POST /api/initiate-payment.php
 */
declare(strict_types=1);

$_GET['action'] = 'initiate-payment';
require_once __DIR__ . '/payment.php';
