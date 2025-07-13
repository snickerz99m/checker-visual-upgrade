// Checker Configuration - Easy to add new checkers
// Just add new entries here and the system will automatically include them

export interface CheckerConfig {
  value: string;
  label: string;
  category: string;
  requiresKey?: boolean;
  keyLabel?: string;
  description?: string;
}

export const CHECKER_CATEGORIES = {
  BASIC: '3mk baqer CHeckers 😈 🔥♛',
  AUTH: '3mk baqer AUTH CHeckers 😈 🔥♛', 
  CHARGE: '3mk baqer CHARGE CHeckers 😈 🔥♛'
} as const;

// Add your checkers here - the system will automatically create the dropdown options
export const CHECKER_CONFIGS: CheckerConfig[] = [
  // Basic Checkers
  { value: 'attacker.php', label: 'attacker', category: CHECKER_CATEGORIES.BASIC },
  { value: 'captest.php', label: 'captest', category: CHECKER_CATEGORIES.BASIC },
  { value: 'solve.php', label: 'capsolve', category: CHECKER_CATEGORIES.BASIC },
  { value: 'AUTH-B3steal.php', label: 'AUTH-B3steal', category: CHECKER_CATEGORIES.BASIC },
  { value: 'b3woo.php', label: 'b3woo', category: CHECKER_CATEGORIES.BASIC },

  // AUTH Checkers
  { value: 'UNK-STRONG.SITE.php', label: 'UNK-STRONG.SITE', category: CHECKER_CATEGORIES.AUTH },
  { value: 'PAYEEZY-AUTH.php', label: 'PAYEEZY-AUTH', category: CHECKER_CATEGORIES.AUTH },
  { value: 'AUTH-ADYEN.php', label: 'AUTH-ADYEN', category: CHECKER_CATEGORIES.AUTH },
  { value: 'AUTH-ADYENccn.php', label: 'AUTH-ADYENccn', category: CHECKER_CATEGORIES.AUTH },
  { value: 'AUTHWOO-CYBER.php', label: 'AUTHWOO-CYBER', category: CHECKER_CATEGORIES.AUTH },
  { value: 'CYBERAUTH-PAYMENT.php', label: 'CYBERAUTH-PAYMENT', category: CHECKER_CATEGORIES.AUTH },
  { value: 'CYBERAUTH-PAYMENT CCN.php', label: 'CYBERAUTH-PAYMENT CCN', category: CHECKER_CATEGORIES.AUTH },
  { value: 'AUTH-B3.php', label: 'AUTH-BRAINTREE', category: CHECKER_CATEGORIES.AUTH },
  { value: 'AUTH-B3-2.php', label: 'AUTH-BRAINTREE-2', category: CHECKER_CATEGORIES.AUTH },
  { value: 'AUTH-B3-3.php', label: 'AUTH-BRAINTREE-3', category: CHECKER_CATEGORIES.AUTH },
  { value: 'AUTH-B3-4.php', label: 'AUTH-BRAINTREE-4', category: CHECKER_CATEGORIES.AUTH },
  { value: 'AUTH-B3-5.php', label: 'AUTH-BRAINTREE-5', category: CHECKER_CATEGORIES.AUTH },
  { value: 'AUTH-B3-CCN.php', label: 'AUTH-B3-CCN', category: CHECKER_CATEGORIES.AUTH },
  { value: 'AUTH-SQUAREUP.php', label: 'AUTH-SQUAREUP', category: CHECKER_CATEGORIES.AUTH },
  { value: 'STRIPE-AUTH.php', label: 'Stripe-AUTH', category: CHECKER_CATEGORIES.AUTH },
  { value: 'STRIPE-AUTH2.php', label: 'Stripe-AUTH2', category: CHECKER_CATEGORIES.AUTH },

  // CHARGE Checkers
  { value: 'UNK-CAP.php', label: 'UNK-CAP', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'ADYEN-FAMOUSsite.php', label: 'ADYEN-FAMOUSsite', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'ADYEN-FAMOUSsite-2.php', label: 'ADYEN-FAMOUSsite-2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'ADYEN-FAMOUSsite-3.php', label: 'ADYEN-FAMOUSsite-3', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'ADYEN-FAMOUSsite-4.php', label: 'ADYEN-FAMOUSsite-4', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'adyen.php', label: 'adyen', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'adyen-2.php', label: 'adyen-2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'ADYEN-CCN.php', label: 'ADYEN-CCN', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'SYSCARE-FAMOUSsite.php', label: 'SYSCARE-FAMOUSsite', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'BLUE-SNAP.php', label: 'BLUE-SNAP', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'STARZPLAY-CC-CHECKER.php', label: 'STARZPLAY-CC-CHECKER', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'SHAHID-CC-CHECKER.php', label: 'SHAHID-CC-CHECKER', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'SHAHID-CC-CHECKER - SA BUG.php', label: 'SHAHID-CC-CHECKER - SA BUG', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'SHAHID-CC-CHECKER - SA BUGultimate.php', label: 'SHAHID-CC-CHECKER - SA BUGultimate', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'SHAHID-CC-CHECKER - SA BUG-month.php', label: 'SHAHID-CC-CHECKER - SA BUG-month', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'B3-BIG.SITE.php', label: 'B3-BIG.SITE', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'PAYPAL+WOO.php', label: 'PAYPAL+WOO', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'CHASE-PAYMENT.php', label: 'CHASE-PAYMENT', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'CHASE-MAGENTO.php', label: 'CHASE-MAGENTO', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'CHASE-MAGENTO2.php', label: 'CHASE-MAGENTO2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'CHASE-CCN.php', label: 'CHASE-CCN', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'CHASE-PAYMENT-CCNAUTH.php', label: 'CHASE-PAYMENT-CCNAUTH', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'CYBERSURCE-PAYMENT.php', label: 'CYBERSURCE-PAYMENT', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'STRIPE-STRONG.php', label: 'STRIPE-STRONG', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'STRIPE-UNK.php', label: 'STRIPE-UNK', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'SHOPIFY.php', label: 'SHOPIFY', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'SHOPIFY-2.php', label: 'SHOPIFY-2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'SHOPIFY + B3.php', label: 'SHOPIFY + B3', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'BRAINTREE-DONATE.php', label: 'BRAINTREE-DONATE', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'B3-CCN-CHARGE.php', label: 'B3-CCN-CHARGE', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'B3-CCN-CHARGE 2.php', label: 'B3-CCN-CHARGE 2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'B3-CCN-CHARGE 3.php', label: 'B3-CCN-CHARGE 3', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'BRAINTREE-WOO.php', label: 'BRAINTREE-WOO', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'BRAINTREE-WOO2.php', label: 'BRAINTREE-WOO2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'BRAINTREE-WOO3.php', label: 'BRAINTREE-WOO3', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'BRAINTREE-WOO4.php', label: 'BRAINTREE-WOO4', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'BRAINTREE-WOO5.php', label: 'BRAINTREE-WOO5', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'B3.php', label: 'BRAINTREE', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'B32.php', label: 'BRAINTREE2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'B33.php', label: 'BRAINTREE3', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'B34.php', label: 'BRAINTREE4', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'MONERIS-WOO.php', label: 'MONERIS-WOO', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'MONERIS-WOO 2.php', label: 'MONERIS-WOO 2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'moners.php', label: 'moners', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'moners2.php', label: 'moners2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'moners3.php', label: 'moners3', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'stripe.php', label: 'STRIPE', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'STRIPE-2.php', label: 'STRIPE-2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'STRIPE-CVV.php', label: 'Stripe-CVV&CCN', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'PAYFLOW.php', label: 'PAYFLOW', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'UNKNOWN-CCN CHARGE.php', label: 'UNKNOWN-CCN CHARGE', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'UNKNOWN.php', label: 'UNKNOWN', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'UNKNOWN-2.php', label: 'UNKNOWN-2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'UNKNOWN-3.php', label: 'UNKNOWN-3', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'STRIPE-WOO.php', label: 'STRIPE-WOO', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'STRIPE-WOO2.php', label: 'STRIPE-WOO2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'STRIPE-WOO3.php', label: 'STRIPE-WOO3', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'STRIPE-WOO4.php', label: 'STRIPE-WOO4', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'STRIPE-WOO5.php', label: 'STRIPE-WOO5', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'UNKNOWN-WOO.php', label: 'UNKNOWN-WOO', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'UNKNOWN-WOO 2.php', label: 'UNKNOWN-WOO2', category: CHECKER_CATEGORIES.CHARGE },
  { value: '2-3req.php', label: '2-3req', category: CHECKER_CATEGORIES.CHARGE },
  { value: '2-3req-2.php', label: '2-3req-2', category: CHECKER_CATEGORIES.CHARGE },
  { value: '2-3req-3.php', label: '2-3req-3', category: CHECKER_CATEGORIES.CHARGE },
  { value: '2-3req-4.php', label: '2-3req-4', category: CHECKER_CATEGORIES.CHARGE },
  { value: '2-3req-5.php', label: '2-3req-5', category: CHECKER_CATEGORIES.CHARGE },
  { value: '2-3req-6.php', label: '2-3req-6', category: CHECKER_CATEGORIES.CHARGE },
  { value: '2-3req-7.php', label: '2-3req-7', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'v3.php', label: 'v3', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'Cybersource.php', label: 'Cybersource', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'Cybersource-2.php', label: 'Cybersource-2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'payway.php', label: 'PAYWAY', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'sk based.php', label: 'sk based', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'ccn charge.php', label: 'ccn charge', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'shit.php', label: 'shit', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'api.php', label: 'api', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test1.php', label: 'test1', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test2.php', label: 'test2', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test3.php', label: 'test3', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test4.php', label: 'test4', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test5.php', label: 'test5', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test6.php', label: 'test6', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test7.php', label: 'test7', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test8.php', label: 'test8', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test9.php', label: 'test9', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test10.php', label: 'test10', category: CHECKER_CATEGORIES.CHARGE },
  { value: 'test11.php', label: 'test11', category: CHECKER_CATEGORIES.CHARGE },
];

// Group checkers by category for display
export const getGroupedCheckers = () => {
  const grouped: Record<string, CheckerConfig[]> = {};
  
  CHECKER_CONFIGS.forEach(checker => {
    if (!grouped[checker.category]) {
      grouped[checker.category] = [];
    }
    grouped[checker.category].push(checker);
  });
  
  return grouped;
};

// Get all checker file names for API endpoints
export const getAllCheckerFiles = () => {
  return CHECKER_CONFIGS.map(checker => checker.value);
};