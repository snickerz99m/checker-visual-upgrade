# 🔥 Card Checker Setup Guide

## 📁 File Structure
```
public/php/
├── stripe-checker.php          # Stripe Basic Checker
├── stripe-sk-checker.php       # Stripe Secret Key Checker  
├── paypal-checker.php          # PayPal Checker
├── square-checker.php          # Square Checker
├── braintree-checker.php       # Braintree Checker
├── authorize-checker.php       # Authorize.Net Checker
└── shopify-checker.php         # Shopify Payments Checker
```

## 🚀 Quick Setup Steps

### 1. Upload PHP Files
Upload all PHP files from `public/php/` folder to your web server directory.

### 2. Update API Configuration
Edit `src/services/api.ts` and change the base URL:
```typescript
baseUrl: 'https://your-domain.com/api', // Your PHP backend URL
```

### 3. Configure Each Checker

#### Stripe Checker (`stripe-checker.php`)
- Replace `pk_test_YOUR_STRIPE_PK` with your Stripe publishable key
- No additional setup required

#### Stripe SK Checker (`stripe-sk-checker.php`)
- Users input their secret key in the frontend
- Performs $1 authorization charges

#### PayPal Checker (`paypal-checker.php`)
- Uncomment the example code
- Add your PayPal access token
- Configure sandbox/production environment

#### Square Checker (`square-checker.php`)
- Uncomment the example code  
- Add your Square access token
- Set sandbox/production environment

#### Braintree Checker (`braintree-checker.php`)
- Install Braintree SDK: `composer require braintree/braintree_php`
- Add your merchant credentials
- Uncomment the example code

#### Authorize.Net Checker (`authorize-checker.php`)
- Uncomment the example code
- Add your API login ID and transaction key
- Set sandbox/production endpoint

#### Shopify Checker (`shopify-checker.php`)
- Uncomment the example code
- Add your Shopify store URL and access token
- Configure API version

## 🔧 How to Add New Checker Types

### Step 1: Create PHP File
Create new PHP file in `public/php/` folder:
```php
// Example: public/php/new-checker.php
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
    // ADD YOUR CHECKER LOGIC HERE
    
    echo json_encode([
        'status' => 'approved', // or 'declined', 'error'
        'message' => 'Success message',
        'cardNumber' => $cardNumber,
        'bin' => substr($cardNumber, 0, 6),
        'brand' => 'VISA',
        'country' => 'US'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'cardNumber' => $cardNumber
    ]);
}
?>
```

### Step 2: Update Frontend Options
Edit `src/components/CardChecker.tsx` and add your checker to the options:
```typescript
const checkerOptions = [
    { value: 'stripe', label: 'Stripe Checker' },
    { value: 'stripe_sk', label: 'Stripe SK Checker' },
    { value: 'paypal', label: 'PayPal Checker' },
    { value: 'square', label: 'Square Checker' },
    { value: 'braintree', label: 'Braintree Checker' },
    { value: 'authorize', label: 'Authorize.net' },
    { value: 'shopify', label: 'Shopify Payments' },
    { value: 'new-checker', label: 'Your New Checker' }, // ADD THIS LINE
];
```

### Step 3: Update API Service
Edit `src/services/api.ts` to handle your new checker:
```typescript
// Add endpoint mapping
endpoints: {
    cardChecker: '/card-checker.php',
    binChecker: '/bin-checker.php',
    'new-checker': '/new-checker.php', // ADD THIS LINE
}
```

## 📋 Expected Response Format
All checkers must return JSON in this format:
```json
{
    "status": "approved|declined|ccn|insufficient|error",
    "message": "Response message",
    "cardNumber": "4242424242424242",
    "bin": "424242",
    "brand": "VISA",
    "country": "US",
    "bank": "Bank Name"
}
```

## 🎯 Status Types
- `approved` - Card is live/valid
- `declined` - Card is dead/invalid  
- `ccn` - CVV/Security code issue
- `insufficient` - Insufficient funds
- `error` - System error

## 🔐 Security Tips
1. Always use HTTPS for your PHP endpoints
2. Implement rate limiting to prevent abuse
3. Log all transactions for monitoring
4. Use strong API keys and rotate them regularly
5. Validate all input data before processing

## 🎨 Frontend Customization
The checker automatically handles:
- Progress tracking
- Sound alerts for approved cards
- Copy/download results
- Error handling
- Matrix rain background animation

## 📞 Support
For implementation help, contact: [@x5pqt](https://t.me/x5pqt)