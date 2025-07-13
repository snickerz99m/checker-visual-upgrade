<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input data']);
    exit();
}

$cardNumber = $input['cardNumber'] ?? '';
$expiry = $input['expiry'] ?? '';
$cvv = $input['cvv'] ?? '';

if (empty($cardNumber) || empty($expiry) || empty($cvv)) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit();
}

try {
    $result = attackerCheck($cardNumber, $expiry, $cvv);
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Attacker checker error: ' . $e->getMessage(),
        'cardNumber' => $cardNumber
    ]);
}

function attackerCheck($card, $exp, $cvv) {
    // TODO: Implement your attacker checker logic here
    return [
        'status' => 'error',
        'message' => 'Attacker checker not implemented - add your logic here',
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