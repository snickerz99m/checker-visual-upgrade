import { ApiService, CardCheckResponse } from './api';

export class CheckerService {
  private static abortController: AbortController | null = null;
  private static isRunning = false;

  static async checkCardsList(
    cards: string[],
    checkerType: string,
    settings: any,
    stripeKey?: string,
    onResult?: (result: CardCheckResponse & { index: number }) => void,
    onProgress?: (current: number, total: number) => void
  ) {
    // Create new abort controller for this session
    this.abortController = new AbortController();
    this.isRunning = true;

    try {
      for (let i = 0; i < cards.length; i++) {
        // Check if stopped
        if (!this.isRunning || this.abortController.signal.aborted) {
          break;
        }

        const cardParts = cards[i].split('|');
        const cardNumber = cardParts[0]?.trim();
        const expiry = cardParts[1]?.trim() || '12/28';
        const cvv = cardParts[2]?.trim() || '123';

        if (!cardNumber) continue;

        try {
          // Call your PHP backend
          const result = await ApiService.checkCard({
            cardNumber,
            expiry,
            cvv,
            checkerType,
            settings,
            stripeKey
          });

          // Notify parent component of result
          if (onResult) {
            onResult({ ...result, index: i });
          }

          // Update progress
          if (onProgress) {
            onProgress(i + 1, cards.length);
          }

          // Wait between requests (configurable delay)
          if (settings.requestDelay && i < cards.length - 1) {
            await new Promise(resolve => 
              setTimeout(resolve, settings.requestDelay * 1000)
            );
          }

        } catch (error) {
          // Handle individual card error
          if (onResult) {
            onResult({
              status: 'error',
              message: error instanceof Error ? error.message : 'Unknown error',
              cardNumber,
              index: i
            });
          }
        }
      }
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }

  static stopChecking() {
    this.isRunning = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  static isChecking() {
    return this.isRunning;
  }
}