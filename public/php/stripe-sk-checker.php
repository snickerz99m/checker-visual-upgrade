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
$stripeKey = $input['stripeKey'] ?? '';

try {
    if (empty($stripeKey)) {
        throw new Exception("Stripe Secret Key required");
    }
    
    // STRIPE SECRET KEY CHECKER
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://api.stripe.com/v1/charges",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'amount' => 100, // $1 authorization
            'currency' => 'usd',
            'source[object]' => 'card',
            'source[number]' => $cardNumber,
            'source[exp_month]' => substr($expiry, 0, 2),
            'source[exp_year]' => '20' . substr($expiry, -2),
            'source[cvc]' => $cvv,
            'capture' => 'false' // Authorization only
        ]),
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer $stripeKey",
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
            'message' => 'Card authorized - CVV: ' . ($data['source']['cvc_check'] ?? 'unknown'),
            'cardNumber' => $cardNumber,
            'bin' => substr($cardNumber, 0, 6),
            'brand' => strtoupper($data['source']['brand'] ?? 'unknown'),
            'country' => $data['source']['country'] ?? 'unknown'
        ]);
    } else {
        $error = $data['error']['message'] ?? 'Card declined';
        echo json_encode([
            'status' => determineDeclineType($error),
            'message' => $error,
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

// Helper function to determine decline type
function determineDeclineType($error) {
    $error = strtolower($error);
    
    if (strpos($error, 'insufficient') !== false) {
        return 'insufficient';
    } elseif (strpos($error, 'cvc') !== false || strpos($error, 'security') !== false) {
        return 'ccn';
    } elseif (strpos($error, 'expired') !== false) {
        return 'declined';
    } else {
        return 'declined';
    }
}
?>