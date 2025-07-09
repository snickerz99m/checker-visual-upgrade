<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$input = json_decode(file_get_contents('php://input'), true);

$cardNumber = $input['cardNumber'] ?? '';
$expiry = $input['expiry'] ?? '';
$cvv = $input['cvv'] ?? '';

try {
    // SHOPIFY CHECKER - ADD YOUR IMPLEMENTATION HERE
    
    // Example Shopify Payments API implementation:
    /*
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://YOUR_STORE.myshopify.com/admin/api/2023-10/payment_gateways.json",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'payment' => [
                'amount' => '1.00',
                'currency' => 'USD',
                'source' => [
                    'number' => $cardNumber,
                    'month' => substr($expiry, 0, 2),
                    'year' => '20' . substr($expiry, -2),
                    'verification_value' => $cvv
                ]
            ]
        ]),
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "X-Shopify-Access-Token: YOUR_SHOPIFY_ACCESS_TOKEN" // Replace with your token
        ]
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    $data = json_decode($response, true);
    
    if ($httpCode == 200 && isset($data['payment'])) {
        echo json_encode([
            'status' => 'approved',
            'message' => 'Shopify Payment Successful',
            'cardNumber' => $cardNumber,
            'bin' => substr($cardNumber, 0, 6),
            'brand' => getBrandFromBin($cardNumber),
            'country' => 'US'
        ]);
    } else {
        echo json_encode([
            'status' => 'declined',
            'message' => $data['errors'][0] ?? 'Shopify declined',
            'cardNumber' => $cardNumber
        ]);
    }
    */
    
    // PLACEHOLDER RESPONSE - Replace with your Shopify implementation
    echo json_encode([
        'status' => 'error',
        'message' => 'Shopify checker - Add your implementation in shopify-checker.php',
        'cardNumber' => $cardNumber
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'cardNumber' => $cardNumber
    ]);
}

function getBrandFromBin($cardNumber) {
    $firstDigit = substr($cardNumber, 0, 1);
    $firstTwo = substr($cardNumber, 0, 2);
    $firstFour = substr($cardNumber, 0, 4);
    
    if ($firstDigit == '4') return 'visa';
    if (in_array($firstTwo, ['51', '52', '53', '54', '55']) || ($firstFour >= '2221' && $firstFour <= '2720')) return 'mastercard';
    if (in_array($firstTwo, ['34', '37'])) return 'american_express';
    if ($firstFour == '6011' || $firstTwo == '65') return 'discover';
    
    return 'unknown';
}
?>