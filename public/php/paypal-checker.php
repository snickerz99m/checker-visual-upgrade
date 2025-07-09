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
    // PAYPAL CHECKER - ADD YOUR IMPLEMENTATION HERE
    
    // Example PayPal API implementation:
    /*
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://api.sandbox.paypal.com/v1/payments/payment",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'intent' => 'authorize',
            'payer' => [
                'payment_method' => 'credit_card',
                'funding_instruments' => [[
                    'credit_card' => [
                        'number' => $cardNumber,
                        'type' => getBrandFromBin($cardNumber),
                        'expire_month' => substr($expiry, 0, 2),
                        'expire_year' => '20' . substr($expiry, -2),
                        'cvv2' => $cvv
                    ]
                ]]
            ],
            'transactions' => [[
                'amount' => [
                    'total' => '1.00',
                    'currency' => 'USD'
                ]
            ]]
        ]),
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer YOUR_PAYPAL_ACCESS_TOKEN" // Replace with your token
        ]
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    $data = json_decode($response, true);
    
    if ($httpCode == 201 && $data['state'] == 'approved') {
        echo json_encode([
            'status' => 'approved',
            'message' => 'PayPal Authorization Successful',
            'cardNumber' => $cardNumber,
            'bin' => substr($cardNumber, 0, 6),
            'brand' => getBrandFromBin($cardNumber),
            'country' => 'US'
        ]);
    } else {
        echo json_encode([
            'status' => 'declined',
            'message' => $data['message'] ?? 'PayPal declined',
            'cardNumber' => $cardNumber
        ]);
    }
    */
    
    // PLACEHOLDER RESPONSE - Replace with your PayPal implementation
    echo json_encode([
        'status' => 'error',
        'message' => 'PayPal checker - Add your implementation in paypal-checker.php',
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