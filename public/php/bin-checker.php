<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$input = json_decode(file_get_contents('php://input'), true);
$bin = $input['bin'] ?? '';

// Your BIN checking logic here
$result = checkBin($bin);

echo json_encode($result);

function checkBin($bin) {
    // YOUR BIN LOGIC HERE
    return [
        'valid' => true,
        'scheme' => 'VISA',
        'type' => 'CREDIT',
        'brand' => 'VISA Classic',
        'country' => ['name' => 'United States', 'code' => 'US'],
        'bank' => 'Bank Name',
        'bin' => $bin
    ];
}
?>