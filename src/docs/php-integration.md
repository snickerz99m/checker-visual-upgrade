# PHP Backend Integration Guide

## Quick Setup for Your PHP Backend

### 1. Update API Configuration
Edit `src/services/api.ts` and change the `baseUrl` to your PHP server:
```typescript
baseUrl: 'https://your-domain.com/api', // Your PHP backend URL
```

### 2. PHP File Structure
Create these PHP files on your server:

#### card-checker.php
```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

$input = json_decode(file_get_contents('php://input'), true);

$cardNumber = $input['cardNumber'] ?? '';
$expiry = $input['expiry'] ?? '';
$cvv = $input['cvv'] ?? '';
$checkerType = $input['checkerType'] ?? '';
$settings = $input['settings'] ?? [];
$stripeKey = $input['stripeKey'] ?? '';

// Your card checking logic here
$result = checkCard($cardNumber, $expiry, $cvv, $checkerType, $stripeKey);

echo json_encode($result);

function checkCard($card, $exp, $cvv, $type, $key) {
    // YOUR CHECKING LOGIC HERE
    // Return format:
    return [
        'status' => 'approved', // approved, declined, ccn, insufficient, unknown_decline, error
        'message' => 'Approved',
        'cardNumber' => $card,
        'responseCode' => '00',
        'responseText' => 'Transaction approved',
        'checkTime' => time()
    ];
}
?>
```

#### bin-checker.php
```php
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
```

### 3. Expected Response Formats

#### Card Checker Response
```json
{
    "status": "approved|declined|ccn|insufficient|unknown_decline|error",
    "message": "Response message",
    "cardNumber": "4242424242424242",
    "responseCode": "00",
    "responseText": "Transaction approved",
    "checkTime": 1234567890
}
```

#### BIN Checker Response
```json
{
    "valid": true,
    "scheme": "VISA",
    "type": "CREDIT",
    "brand": "VISA Classic",
    "country": {"name": "United States", "code": "US"},
    "bank": "Bank Name",
    "bin": "424242"
}
```

### 4. Testing Your Integration
1. Update the API URL in `src/services/api.ts`
2. Upload your PHP files to your server
3. Test with a few cards to ensure everything works

### 5. Error Handling
The frontend automatically handles:
- Network timeouts (30 seconds)
- Server errors
- Invalid responses
- Connection issues

Your PHP code just needs to return the correct JSON format!