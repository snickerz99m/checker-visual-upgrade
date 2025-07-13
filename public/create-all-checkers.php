<?php
// Helper script to create all missing checker PHP files
// Run this once to generate all the PHP files from your checker list

$checkers = [
    'captest.php', 'solve.php', 'AUTH-B3steal.php', 'b3woo.php',
    'UNK-STRONG.SITE.php', 'PAYEEZY-AUTH.php', 'AUTH-ADYEN.php', 'AUTH-ADYENccn.php',
    'AUTHWOO-CYBER.php', 'CYBERAUTH-PAYMENT.php', 'CYBERAUTH-PAYMENT CCN.php',
    'AUTH-B3.php', 'AUTH-B3-2.php', 'AUTH-B3-3.php', 'AUTH-B3-4.php', 'AUTH-B3-5.php',
    'AUTH-B3-CCN.php', 'AUTH-SQUAREUP.php', 'STRIPE-AUTH2.php',
    'UNK-CAP.php', 'ADYEN-FAMOUSsite-2.php', 'ADYEN-FAMOUSsite-3.php', 'ADYEN-FAMOUSsite-4.php',
    'adyen.php', 'adyen-2.php', 'ADYEN-CCN.php', 'SYSCARE-FAMOUSsite.php', 'BLUE-SNAP.php',
    'STARZPLAY-CC-CHECKER.php', 'SHAHID-CC-CHECKER.php', 'SHAHID-CC-CHECKER - SA BUG.php',
    'SHAHID-CC-CHECKER - SA BUGultimate.php', 'SHAHID-CC-CHECKER - SA BUG-month.php',
    'B3-BIG.SITE.php', 'PAYPAL+WOO.php', 'CHASE-PAYMENT.php', 'CHASE-MAGENTO.php',
    'CHASE-MAGENTO2.php', 'CHASE-CCN.php', 'CHASE-PAYMENT-CCNAUTH.php', 'CYBERSURCE-PAYMENT.php',
    'STRIPE-STRONG.php', 'STRIPE-UNK.php', 'SHOPIFY.php', 'SHOPIFY-2.php', 'SHOPIFY + B3.php',
    'BRAINTREE-DONATE.php', 'B3-CCN-CHARGE.php', 'B3-CCN-CHARGE 2.php', 'B3-CCN-CHARGE 3.php',
    'BRAINTREE-WOO2.php', 'BRAINTREE-WOO3.php', 'BRAINTREE-WOO4.php', 'BRAINTREE-WOO5.php',
    'B3.php', 'B32.php', 'B33.php', 'B34.php', 'MONERIS-WOO.php', 'MONERIS-WOO 2.php',
    'moners.php', 'moners2.php', 'moners3.php', 'stripe.php', 'STRIPE-2.php', 'STRIPE-CVV.php',
    'PAYFLOW.php', 'UNKNOWN-CCN CHARGE.php', 'UNKNOWN.php', 'UNKNOWN-2.php', 'UNKNOWN-3.php',
    'STRIPE-WOO.php', 'STRIPE-WOO2.php', 'STRIPE-WOO3.php', 'STRIPE-WOO4.php', 'STRIPE-WOO5.php',
    'UNKNOWN-WOO.php', 'UNKNOWN-WOO 2.php', '2-3req.php', '2-3req-2.php', '2-3req-3.php',
    '2-3req-4.php', '2-3req-5.php', '2-3req-6.php', '2-3req-7.php', 'v3.php',
    'Cybersource.php', 'Cybersource-2.php', 'payway.php', 'sk based.php', 'ccn charge.php',
    'shit.php', 'api.php', 'test1.php', 'test2.php', 'test3.php', 'test4.php', 'test5.php',
    'test6.php', 'test7.php', 'test8.php', 'test9.php', 'test10.php', 'test11.php'
];

$template = '<?php
header(\'Content-Type: application/json\');
header(\'Access-Control-Allow-Origin: *\');
header(\'Access-Control-Allow-Methods: POST, OPTIONS\');
header(\'Access-Control-Allow-Headers: Content-Type\');

if ($_SERVER[\'REQUEST_METHOD\'] === \'OPTIONS\') {
    exit();
}

$input = json_decode(file_get_contents(\'php://input\'), true);

if (!$input) {
    echo json_encode([\'status\' => \'error\', \'message\' => \'Invalid input data\']);
    exit();
}

$cardNumber = $input[\'cardNumber\'] ?? \'\';
$expiry = $input[\'expiry\'] ?? \'\';
$cvv = $input[\'cvv\'] ?? \'\';

if (empty($cardNumber) || empty($expiry) || empty($cvv)) {
    echo json_encode([\'status\' => \'error\', \'message\' => \'Missing required fields\']);
    exit();
}

try {
    $result = {{FUNCTION_NAME}}($cardNumber, $expiry, $cvv);
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        \'status\' => \'error\',
        \'message\' => \'{{CHECKER_NAME}} error: \' . $e->getMessage(),
        \'cardNumber\' => $cardNumber
    ]);
}

function {{FUNCTION_NAME}}($card, $exp, $cvv) {
    // TODO: Add your {{CHECKER_NAME}} checker logic here
    
    return [
        \'status\' => \'error\',
        \'message\' => \'{{CHECKER_NAME}} checker not implemented - add your logic here\',
        \'cardNumber\' => $card,
        \'bin\' => substr($card, 0, 6),
        \'last4\' => substr($card, -4),
        \'brand\' => determineBrand($card),
        \'checkTime\' => time()
    ];
}

function determineBrand($cardNumber) {
    $firstDigit = substr($cardNumber, 0, 1);
    $firstTwo = substr($cardNumber, 0, 2);
    
    if ($firstDigit === \'4\') return \'Visa\';
    if (in_array($firstTwo, [\'51\', \'52\', \'53\', \'54\', \'55\'])) return \'Mastercard\';
    if (in_array($firstTwo, [\'34\', \'37\'])) return \'American Express\';
    if ($firstTwo === \'60\') return \'Discover\';
    
    return \'Unknown\';
}
?>';

$created = 0;
$skipped = 0;

foreach ($checkers as $filename) {
    $filepath = __DIR__ . '/php/' . $filename;
    
    // Skip if file already exists
    if (file_exists($filepath)) {
        echo "Skipped: $filename (already exists)\n";
        $skipped++;
        continue;
    }
    
    // Create function name from filename
    $funcName = str_replace(['.php', '-', ' ', '+'], ['', '', '', ''], $filename) . 'Check';
    $funcName = lcfirst($funcName);
    
    // Create checker name for messages
    $checkerName = str_replace('.php', '', $filename);
    
    // Replace placeholders
    $content = str_replace('{{FUNCTION_NAME}}', $funcName, $template);
    $content = str_replace('{{CHECKER_NAME}}', $checkerName, $content);
    
    // Create directory if it doesn\'t exist
    $dir = dirname($filepath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    // Write file
    if (file_put_contents($filepath, $content)) {
        echo "Created: $filename\n";
        $created++;
    } else {
        echo "Failed to create: $filename\n";
    }
}

echo "\nSummary:\n";
echo "Created: $created files\n";
echo "Skipped: $skipped files\n";
echo "Total: " . ($created + $skipped) . " files\n";
echo "\nTo add a new checker:\n";
echo "1. Add entry to src/config/checkers.ts\n";
echo "2. Copy _template.php to your-checker-name.php\n";
echo "3. Edit the PHP file with your logic\n";
?>