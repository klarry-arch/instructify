<?php
/**
 * Safaricom Daraja M-Pesa STK Push Webhook Handler
 * Endpoint: POST /api/webhook/mpesa or /api/webhook/mpesa.php
 */
declare(strict_types=1);

$_GET['action'] = 'webhook-mpesa';
require_once __DIR__ . '/../payment.php';
