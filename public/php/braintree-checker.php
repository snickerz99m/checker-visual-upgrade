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
    // BRAINTREE CHECKER - ADD YOUR IMPLEMENTATION HERE
    
    // Example Braintree API implementation:
    /*
    require_once 'vendor/autoload.php'; // Include Braintree SDK
    
    \Braintree\Configuration::environment('sandbox'); // or 'production'
    \Braintree\Configuration::merchantId('YOUR_MERCHANT_ID');
    \Braintree\Configuration::publicKey('YOUR_PUBLIC_KEY');
    \Braintree\Configuration::privateKey('YOUR_PRIVATE_KEY');
    
    $result = \Braintree\Transaction::sale([
        'amount' => '1.00',
        'creditCard' => [
            'number' => $cardNumber,
            'expirationMonth' => substr($expiry, 0, 2),
            'expirationYear' => '20' . substr($expiry, -2),
            'cvv' => $cvv
        ],
        'options' => [
            'submitForSettlement' => false // Authorization only
        ]
    ]);
    
    if ($result->success) {
        echo json_encode([
            'status' => 'approved',
            'message' => 'Braintree Authorization Successful',
            'cardNumber' => $cardNumber,
            'bin' => substr($cardNumber, 0, 6),
            'brand' => $result->transaction->creditCard['cardType'],
            'country' => 'US'
        ]);
    } else {
        echo json_encode([
            'status' => 'declined',
            'message' => $result->message,
            'cardNumber' => $cardNumber
        ]);
    }
    */
    
    // PLACEHOLDER RESPONSE - Replace with your Braintree implementation
    echo json_encode([
        'status' => 'error',
        'message' => 'Braintree checker - Add your implementation in braintree-checker.php',
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