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
    // STRIPE BASIC CHECKER
    // Replace YOUR_STRIPE_PK with your publishable key
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://api.stripe.com/v1/payment_methods",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'type' => 'card',
            'card[number]' => $cardNumber,
            'card[exp_month]' => substr($expiry, 0, 2),
            'card[exp_year]' => '20' . substr($expiry, -2),
            'card[cvc]' => $cvv
        ]),
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer pk_test_YOUR_STRIPE_PK", // REPLACE WITH YOUR KEY
            "Content-Type: application/x-www-form-urlencoded"
        ]
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    $data = json_decode($response, true);
    
    if ($httpCode == 200 && isset($data['id'])) {
        echo json_encode([
            'status' => 'approved',
            'message' => 'Payment method created - Live Card',
            'cardNumber' => $cardNumber,
            'bin' => substr($cardNumber, 0, 6),
            'brand' => strtoupper($data['card']['brand'] ?? 'unknown'),
            'country' => $data['card']['country'] ?? 'unknown'
        ]);
    } else {
        echo json_encode([
            'status' => 'declined',
            'message' => $data['error']['message'] ?? 'Card declined',
            'cardNumber' => $cardNumber
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'cardNumber' => $cardNumber
    ]);
}
?>