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
      const { fastMode, threadCount = 1, requestDelay = 2 } = settings;
      
      if (fastMode || threadCount > 1) {
        // Parallel processing (Fast Mode or Multi-threading)
        await this.processCardsParallel(
          cards, 
          checkerType, 
          settings, 
          stripeKey, 
          onResult, 
          onProgress
        );
      } else {
        // Sequential processing (Traditional)
        await this.processCardsSequential(
          cards, 
          checkerType, 
          settings, 
          stripeKey, 
          onResult, 
          onProgress
        );
      }
    } finally {
      this.isRunning = false;
      this.abortController = null;
    }
  }

  private static async processCardsSequential(
    cards: string[],
    checkerType: string,
    settings: any,
    stripeKey?: string,
    onResult?: (result: CardCheckResponse & { index: number }) => void,
    onProgress?: (current: number, total: number) => void
  ) {
    for (let i = 0; i < cards.length; i++) {
      // Check if stopped
      if (!this.isRunning || this.abortController?.signal.aborted) {
        break;
      }

      await this.processCard(i, cards[i], checkerType, settings, stripeKey, onResult);

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
    }
  }

  private static async processCardsParallel(
    cards: string[],
    checkerType: string,
    settings: any,
    stripeKey?: string,
    onResult?: (result: CardCheckResponse & { index: number }) => void,
    onProgress?: (current: number, total: number) => void
  ) {
    const { threadCount = 10, fastMode, requestDelay = 0 } = settings;
    let completedCount = 0;

    // Proper concurrent processing based on user settings
    const maxConcurrent = fastMode ? cards.length : Math.min(threadCount, cards.length);
    
    // Split cards into chunks for each thread
    const chunkSize = Math.ceil(cards.length / maxConcurrent);
    const chunks: string[][] = [];
    
    for (let i = 0; i < cards.length; i += chunkSize) {
      chunks.push(cards.slice(i, i + chunkSize));
    }

    // Process each chunk concurrently
    const promises = chunks.map(async (chunk, chunkIndex) => {
      for (let i = 0; i < chunk.length; i++) {
        if (!this.isRunning || this.abortController?.signal.aborted) {
          break;
        }

        const cardIndex = chunkIndex * chunkSize + i;
        const card = chunk[i];
        
        try {
          await this.processCard(cardIndex, card, checkerType, settings, stripeKey, onResult);
        } catch (error) {
          console.error(`Error processing card at index ${cardIndex}:`, error);
        }
        
        completedCount++;
        
        // Update progress
        if (onProgress) {
          onProgress(completedCount, cards.length);
        }

        // Apply delay only if not in fast mode
        if (!fastMode && requestDelay > 0 && i < chunk.length - 1) {
          await new Promise(resolve => setTimeout(resolve, requestDelay * 1000));
        }
      }
    });

    await Promise.all(promises);
  }

  private static async processCard(
    index: number,
    card: string,
    checkerType: string,
    settings: any,
    stripeKey?: string,
    onResult?: (result: CardCheckResponse & { index: number }) => void
  ) {
    const cardParts = card.split('|');
    const cardNumber = cardParts[0]?.trim();
    const expiry = cardParts[1]?.trim() || '12/28';
    const cvv = cardParts[2]?.trim() || '123';

    if (!cardNumber) return;

    try {
      // For localhost testing, simulate response if PHP backend not available
      let result: CardCheckResponse;
      
      try {
        // Call your PHP backend
        result = await ApiService.checkCard({
          cardNumber,
          expiry,
          cvv,
          checkerType,
          settings,
          stripeKey
        });
      } catch (error) {
        // Check if it's a network error (no PHP backend)
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('PHP backend not available, using test response');
          result = {
            status: Math.random() > 0.7 ? 'approved' : Math.random() > 0.5 ? 'declined' : 'ccn',
            message: 'Test response - configure your PHP backend',
            cardNumber,
            bin: cardNumber.substring(0, 6),
            brand: 'VISA',
            country: 'US'
          };
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        } else {
          // Re-throw actual API errors (like from working PHP backend)
          throw error;
        }
      }

      // Notify parent component of result
      if (onResult) {
        onResult({ ...result, index });
      }

    } catch (error) {
      // Handle individual card error
      if (onResult) {
        onResult({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          cardNumber,
          index
        });
      }
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