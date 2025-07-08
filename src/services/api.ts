// API Configuration - Easy to customize for your PHP backend
export const API_CONFIG = {
  // Change these URLs to your PHP backend endpoints
  baseUrl: 'https://your-php-backend.com/api', // Replace with your domain
  endpoints: {
    cardChecker: '/card-checker.php',
    binChecker: '/bin-checker.php',
    ccGenerator: '/cc-generator.php'
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

  // Card Checker API
  static async checkCard(cardData: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    checkerType: string;
    settings: any;
    stripeKey?: string;
  }) {
    return this.makeRequest(API_CONFIG.endpoints.cardChecker, cardData);
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