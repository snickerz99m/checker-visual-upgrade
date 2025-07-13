# Easy Checker Management Guide

This system makes it super easy to add new checkers without knowing HTML/JS!

## 🚀 Quick Start

### Adding a New Checker (3 Simple Steps):

1. **Add to config file**: Open `src/config/checkers.ts` and add your checker:
   ```typescript
   { value: 'your-new-checker.php', label: 'Your Checker Name', category: CHECKER_CATEGORIES.CHARGE },
   ```

2. **Create PHP file**: Copy `public/php/_template.php` to `public/php/your-new-checker.php`

3. **Add your logic**: Edit the new PHP file and replace the TODO comments with your checker code

That's it! Your checker will automatically appear in the dropdown.

## 📁 File Structure

```
public/php/
├── _template.php           # Copy this for new checkers
├── create-all-checkers.php # Run once to create all missing files
├── attacker.php           # Example checker
├── STRIPE-AUTH.php        # Example checker
└── ... (all your checkers)
```

## 🔧 Categories

Your checkers are organized in categories:
- **BASIC**: `CHECKER_CATEGORIES.BASIC` - Basic checkers
- **AUTH**: `CHECKER_CATEGORIES.AUTH` - Authentication checkers  
- **CHARGE**: `CHECKER_CATEGORIES.CHARGE` - Charge/payment checkers

## 📝 Example: Adding PAYPAL-NEW Checker

1. **Edit `src/config/checkers.ts`**:
   ```typescript
   { value: 'PAYPAL-NEW.php', label: 'PayPal New Method', category: CHECKER_CATEGORIES.CHARGE },
   ```

2. **Copy template**:
   ```bash
   cp public/php/_template.php public/php/PAYPAL-NEW.php
   ```

3. **Edit `public/php/PAYPAL-NEW.php`**:
   ```php
   function checkCard($card, $exp, $cvv) {
       // Your PayPal API logic here
       $curl = curl_init();
       curl_setopt_array($curl, [
           CURLOPT_URL => 'https://api.paypal.com/...',
           // ... your API call
       ]);
       
       $response = curl_exec($curl);
       // Process response and return result
   }
   ```

## 🎯 PHP Response Format

Your checker must return this JSON format:

```php
return [
    'status' => 'approved|declined|ccn|insufficient|error',
    'message' => 'Response message',
    'cardNumber' => $card,
    'bin' => substr($card, 0, 6),
    'last4' => substr($card, -4),
    'brand' => 'Visa|Mastercard|...',
    'country' => 'US', // optional
    'bank' => 'Bank Name', // optional
    'checkTime' => time()
];
```

## ⚡ Status Types

- `approved` = Live/Working card (✅ green)
- `declined` = Dead card (❌ red) 
- `ccn` = CCN/Incorrect info (🔄 blue)
- `insufficient` = Insufficient funds (💰 orange)
- `error` = Checker error (⚠️ red)

## 🛠️ Bulk Creation

To create all missing PHP files at once:
1. Visit: `http://localhost/your-path/create-all-checkers.php`
2. This will create template files for all checkers in your config

## 🔄 How It Works

1. **Config File** (`src/config/checkers.ts`) - Contains all checker definitions
2. **API Service** (`src/services/api.ts`) - Automatically maps checkers to PHP files
3. **UI Component** (`src/components/CardChecker.tsx`) - Automatically builds dropdown from config
4. **PHP Files** (`public/php/*.php`) - Your actual checker logic

## 💡 Tips

- **File naming**: Use exact filename in config (e.g., `STRIPE-NEW.php`)
- **Testing**: Each PHP file works independently - test at `http://localhost/your-path/php/your-checker.php`
- **Categories**: Use existing categories or add new ones in the config
- **Templates**: Always start with `_template.php` for consistency

## 🚨 Common Issues

1. **Checker not showing**: Check filename matches exactly in config
2. **PHP errors**: Check your PHP syntax and API calls
3. **CORS errors**: Template includes proper headers
4. **Path issues**: Use relative paths `./php/filename.php`

## 📞 Need Help?

1. Check `_template.php` for proper structure
2. Look at existing checkers like `STRIPE-AUTH.php`
3. Test your PHP file directly in browser first
4. Verify config entry matches filename exactly

---

**🎉 That's it! You can now easily add unlimited checkers without touching HTML/JS code!**