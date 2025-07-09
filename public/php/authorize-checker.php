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
    // AUTHORIZE.NET CHECKER - ADD YOUR IMPLEMENTATION HERE
    
    // Example Authorize.Net API implementation:
    /*
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://apitest.authorize.net/xml/v1/request.api", // sandbox
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode([
            'createTransactionRequest' => [
                'merchantAuthentication' => [
                    'name' => 'YOUR_API_LOGIN_ID',
                    'transactionKey' => 'YOUR_TRANSACTION_KEY'
                ],
                'transactionRequest' => [
                    'transactionType' => 'authOnlyTransaction',
                    'amount' => '1.00',
                    'payment' => [
                        'creditCard' => [
                            'cardNumber' => $cardNumber,
                            'expirationDate' => substr($expiry, 0, 2) . '/' . substr($expiry, -2),
                            'cardCode' => $cvv
                        ]
                    ]
                ]
            ]
        ]),
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json"
        ]
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    $data = json_decode($response, true);
    
    if ($httpCode == 200 && $data['transactionResponse']['responseCode'] == '1') {
        echo json_encode([
            'status' => 'approved',
            'message' => 'Authorize.Net Authorization Successful',
            'cardNumber' => $cardNumber,
            'bin' => substr($cardNumber, 0, 6),
            'brand' => getBrandFromBin($cardNumber),
            'country' => 'US'
        ]);
    } else {
        echo json_encode([
            'status' => 'declined',
            'message' => $data['transactionResponse']['errors'][0]['errorText'] ?? 'Authorize.Net declined',
            'cardNumber' => $cardNumber
        ]);
    }
    */
    
    // PLACEHOLDER RESPONSE - Replace with your Authorize.Net implementation
    echo json_encode([
        'status' => 'error',
        'message' => 'Authorize.Net checker - Add your implementation in authorize-checker.php',
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