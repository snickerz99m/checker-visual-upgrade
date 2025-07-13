import { getAllDynamicCheckerFiles } from '@/config/dynamicCheckers';

// API Configuration - Easy to customize for your PHP backend
export const API_CONFIG = {
  // IMPORTANT: Works with any deployment path (public_html, subfolders, etc.)
  // Uses relative paths to work in any directory structure
  baseUrl: '', // Empty for relative paths
  endpoints: {
    // Legacy endpoints for backward compatibility
    stripe: './php/stripe-checker.php',
    stripe_sk: './php/stripe-sk-checker.php', 
    paypal: './php/paypal-checker.php',
    square: './php/square-checker.php',
    braintree: './php/braintree-checker.php',
    authorize: './php/authorize-checker.php',
    shopify: './php/shopify-checker.php',
    binChecker: './php/bin-checker.php',
    ccGenerator: './php/cc-generator.php',
    
    // Dynamic endpoints - will be updated when custom checkers are added
    ...(() => {
      try {
        return Object.fromEntries(
          getAllDynamicCheckerFiles().map(filename => [
            filename.replace('.php', ''),
            `./php/${filename}`
          ])
        );
      } catch (error) {
        console.warn('Failed to load dynamic checkers:', error);
        return {};
      }
    })()
  },
  timeout: 30000, // 30 seconds timeout
};

// API Service for easy PHP integration
export class ApiService {
  private static async makeRequest(endpoint: string, data: any, options: RequestInit = {}) {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(API_CONFIG.timeout),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // Card Checker API - Routes to specific PHP files
  static async checkCard(cardData: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    checkerType: string;
    settings: any;
    stripeKey?: string;
  }) {
    // First, refresh the dynamic endpoints to include newly added checkers
    const dynamicEndpoints = Object.fromEntries(
      getAllDynamicCheckerFiles().map(filename => [
        filename.replace('.php', ''),
        `./php/${filename}`
      ])
    );
    
    // Merge all endpoints
    const allEndpoints = { ...API_CONFIG.endpoints, ...dynamicEndpoints };
    
    // Route to specific checker PHP file based on type
    const endpoint = allEndpoints[cardData.checkerType as keyof typeof allEndpoints];
    if (!endpoint) {
      throw new Error(`Unknown checker type: ${cardData.checkerType}. Available types: ${Object.keys(allEndpoints).join(', ')}`);
    }
    return this.makeRequest(endpoint, cardData);
  }

  // BIN Checker API
  static async checkBin(binData: {
    bin: string;
  }) {
    return this.makeRequest(API_CONFIG.endpoints.binChecker, binData);
  }

  // CC Generator API
  static async generateCards(genData: {
    bin: string;
    quantity: number;
    format: string;
  }) {
    return this.makeRequest(API_CONFIG.endpoints.ccGenerator, genData);
  }
}

// Response interfaces for your PHP backend
export interface CardCheckResponse {
  status: 'approved' | 'declined' | 'ccn' | 'insufficient' | 'unknown_decline' | 'error';
  message: string;
  cardNumber: string;
  responseCode?: string;
  responseText?: string;
  bin?: string;
  last4?: string;
  brand?: string;
  country?: string;
  bank?: string;
  type?: string;
  level?: string;
  checkTime?: number;
}

export interface BinCheckResponse {
  valid: boolean;
  scheme: string;
  type: string;
  brand: string;
  country: {
    name: string;
    code: string;
  };
  bank: string;
  bin: string;
}

export interface CCGenResponse {
  cards: string[];
  count: number;
  format: string;
}