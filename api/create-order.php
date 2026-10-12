<?php
/**
 * Direct entrypoint for POST /api/create-order.php
 */
declare(strict_types=1);

$_GET['action'] = 'create-order';
require_once __DIR__ . '/payment.php';
