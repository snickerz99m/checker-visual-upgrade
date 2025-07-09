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
$checkerType = $input['checkerType'] ?? '';
$settings = $input['settings'] ?? [];
$stripeKey = $input['stripeKey'] ?? '';

try {
    switch($checkerType) {
        case 'stripe':
            $result = checkStripe($cardNumber, $expiry, $cvv);
            break;
        case 'stripe_sk':
            $result = checkStripeSK($cardNumber, $expiry, $cvv, $stripeKey);
            break;
        case 'paypal':
            $result = checkPayPal($cardNumber, $expiry, $cvv);
            break;
        case 'square':
            $result = checkSquare($cardNumber, $expiry, $cvv);
            break;
        case 'braintree':
            $result = checkBraintree($cardNumber, $expiry, $cvv);
            break;
        case 'authorize':
            $result = checkAuthorizeNet($cardNumber, $expiry, $cvv);
            break;
        case 'shopify':
            $result = checkShopify($cardNumber, $expiry, $cvv);
            break;
        default:
            throw new Exception("Unknown checker type");
    }
    
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'cardNumber' => $cardNumber
    ]);
}

// STRIPE BASIC CHECKER
function checkStripe($card, $exp, $cvv) {
    // Replace YOUR_STRIPE_PK with your publishable key
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://api.stripe.com/v1/payment_methods",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'type' => 'card',
            'card[number]' => $card,
            'card[exp_month]' => substr($exp, 0, 2),
            'card[exp_year]' => '20' . substr($exp, -2),
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
        return [
            'status' => 'approved',
            'message' => 'Payment method created - Live Card',
            'cardNumber' => $card,
            'bin' => substr($card, 0, 6),
            'brand' => strtoupper($data['card']['brand'] ?? 'unknown'),
            'country' => $data['card']['country'] ?? 'unknown'
        ];
    } else {
        return [
            'status' => 'declined',
            'message' => $data['error']['message'] ?? 'Card declined',
            'cardNumber' => $card
        ];
    }
}

// STRIPE SECRET KEY CHECKER
function checkStripeSK($card, $exp, $cvv, $key) {
    if (empty($key)) {
        throw new Exception("Stripe Secret Key required");
    }
    
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://api.stripe.com/v1/charges",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'amount' => 100, // $1 authorization
            'currency' => 'usd',
            'source[object]' => 'card',
            'source[number]' => $card,
            'source[exp_month]' => substr($exp, 0, 2),
            'source[exp_year]' => '20' . substr($exp, -2),
            'source[cvc]' => $cvv,
            'capture' => 'false' // Authorization only
        ]),
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer $key",
            "Content-Type: application/x-www-form-urlencoded"
        ]
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    $data = json_decode($response, true);
    
    if ($httpCode == 200 && isset($data['id'])) {
        return [
            'status' => 'approved',
            'message' => 'Card authorized - CVV: ' . ($data['source']['cvc_check'] ?? 'unknown'),
            'cardNumber' => $card,
            'bin' => substr($card, 0, 6),
            'brand' => strtoupper($data['source']['brand'] ?? 'unknown'),
            'country' => $data['source']['country'] ?? 'unknown'
        ];
    } else {
        $error = $data['error']['message'] ?? 'Card declined';
        return [
            'status' => determineDeclineType($error),
            'message' => $error,
            'cardNumber' => $card
        ];
    }
}

// PAYPAL CHECKER (Template)
function checkPayPal($card, $exp, $cvv) {
    // Add your PayPal implementation here
    return [
        'status' => 'error',
        'message' => 'PayPal checker - Add your implementation',
        'cardNumber' => $card
    ];
}

// SQUARE CHECKER (Template)
function checkSquare($card, $exp, $cvv) {
    // Add your Square implementation here
    return [
        'status' => 'error',
        'message' => 'Square checker - Add your implementation',
        'cardNumber' => $card
    ];
}

// BRAINTREE CHECKER (Template)
function checkBraintree($card, $exp, $cvv) {
    // Add your Braintree implementation here
    return [
        'status' => 'error',
        'message' => 'Braintree checker - Add your implementation',
        'cardNumber' => $card
    ];
}

// AUTHORIZE.NET CHECKER (Template)
function checkAuthorizeNet($card, $exp, $cvv) {
    // Add your Authorize.Net implementation here
    return [
        'status' => 'error',
        'message' => 'Authorize.Net checker - Add your implementation',
        'cardNumber' => $card
    ];
}

// SHOPIFY CHECKER (Template)
function checkShopify($card, $exp, $cvv) {
    // Add your Shopify implementation here
    return [
        'status' => 'error',
        'message' => 'Shopify checker - Add your implementation',
        'cardNumber' => $card
    ];
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