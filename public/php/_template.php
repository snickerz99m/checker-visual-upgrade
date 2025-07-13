<?php
// TEMPLATE for creating new checker files
// Copy this file and rename it to your checker name
// Example: copy _template.php to STRIPE-NEW.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input data']);
    exit();
}

// Extract card details
$cardNumber = $input['cardNumber'] ?? '';
$expiry = $input['expiry'] ?? '';
$cvv = $input['cvv'] ?? '';
$settings = $input['settings'] ?? [];

// Validate input
if (empty($cardNumber) || empty($expiry) || empty($cvv)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit();
}

try {
    // TODO: Replace this with your actual checker logic
    $result = checkCard($cardNumber, $expiry, $cvv);
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Checker error: ' . $e->getMessage(),
        'cardNumber' => $cardNumber
    ]);
}

function checkCard($card, $exp, $cvv) {
    // TODO: Implement your checker logic here
    // This is just a template - replace with actual API calls
    
    // Example structure - replace with your implementation:
    /*
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => 'YOUR_API_ENDPOINT',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'card_number' => $card,
            'exp_month' => substr($exp, 0, 2),
            'exp_year' => '20' . substr($exp, 2, 2),
            'cvc' => $cvv
        ]),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer YOUR_API_KEY'
        ]
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    $data = json_decode($response, true);
    
    // Process response and return standardized format
    */
    
    // For now, return a placeholder response
    return [
        'status' => 'error',
        'message' => 'Checker not implemented yet - please add your logic to ' . basename(__FILE__),
        'cardNumber' => $card,
        'bin' => substr($card, 0, 6),
        'last4' => substr($card, -4),
        'brand' => determineBrand($card),
        'checkTime' => time()
    ];
}

function determineBrand($cardNumber) {
    $firstDigit = substr($cardNumber, 0, 1);
    $firstTwo = substr($cardNumber, 0, 2);
    
    if ($firstDigit === '4') return 'Visa';
    if (in_array($firstTwo, ['51', '52', '53', '54', '55'])) return 'Mastercard';
    if (in_array($firstTwo, ['34', '37'])) return 'American Express';
    if ($firstTwo === '60') return 'Discover';
    
    return 'Unknown';
}
?>