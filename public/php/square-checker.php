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
    // SQUARE CHECKER - ADD YOUR IMPLEMENTATION HERE
    
    // Example Square API implementation:
    /*
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://connect.squareupsandbox.com/v2/payments",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'source_id' => 'CARD_ON_FILE', // You'll need to create card first
            'amount_money' => [
                'amount' => 100, // $1.00
                'currency' => 'USD'
            ],
            'idempotency_key' => uniqid()
        ]),
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer YOUR_SQUARE_ACCESS_TOKEN", // Replace with your token
            "Square-Version: 2023-10-18"
        ]
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    $data = json_decode($response, true);
    
    if ($httpCode == 200 && isset($data['payment'])) {
        echo json_encode([
            'status' => 'approved',
            'message' => 'Square Payment Successful',
            'cardNumber' => $cardNumber,
            'bin' => substr($cardNumber, 0, 6),
            'brand' => $data['payment']['source_type'] ?? 'unknown',
            'country' => 'US'
        ]);
    } else {
        echo json_encode([
            'status' => 'declined',
            'message' => $data['errors'][0]['detail'] ?? 'Square declined',
            'cardNumber' => $cardNumber
        ]);
    }
    */
    
    // PLACEHOLDER RESPONSE - Replace with your Square implementation
    echo json_encode([
        'status' => 'error',
        'message' => 'Square checker - Add your implementation in square-checker.php',
        'cardNumber' => $cardNumber
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'cardNumber' => $cardNumber
    ]);
}
?>