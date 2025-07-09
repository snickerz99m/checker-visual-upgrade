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
    const { threadCount = 10, fastMode } = settings;
    let completedCount = 0;
    const promises: Promise<void>[] = [];

    // Optimize for heavy workloads - limit max concurrent for stability
    const maxConcurrent = Math.min(
      fastMode ? Math.min(threadCount, 20) : threadCount, // Cap fast mode at 20 concurrent
      cards.length,
      50 // Hard limit to prevent browser crashes
    );
    let currentIndex = 0;

    // Batch progress updates to prevent UI lag
    let progressBatchCount = 0;
    const PROGRESS_BATCH_SIZE = fastMode ? 10 : 5;

    // Function to process a single card
    const processNext = async (): Promise<void> => {
      while (currentIndex < cards.length && this.isRunning && !this.abortController?.signal.aborted) {
        const index = currentIndex++;
        const card = cards[index];
        
        try {
          await this.processCard(index, card, checkerType, settings, stripeKey, onResult);
        } catch (error) {
          console.error(`Error processing card at index ${index}:`, error);
        }
        
        completedCount++;
        progressBatchCount++;
        
        // Batch progress updates for performance
        if (progressBatchCount >= PROGRESS_BATCH_SIZE || completedCount === cards.length) {
          if (onProgress) {
            onProgress(completedCount, cards.length);
          }
          progressBatchCount = 0;
        }

        // Adaptive delay based on completion rate and system performance
        const baseDelay = fastMode ? 50 : settings.requestDelay * 1000;
        const adaptiveDelay = cards.length > 500 ? Math.max(baseDelay, 100) : baseDelay;
        
        if (adaptiveDelay > 0) {
          await new Promise(resolve => 
            setTimeout(resolve, fastMode ? adaptiveDelay : adaptiveDelay / maxConcurrent)
          );
        }

        // Memory cleanup for very large lists
        if (completedCount % 100 === 0 && typeof window !== 'undefined' && window.gc) {
          window.gc(); // Force garbage collection if available
        }
      }
    };

    // Start multiple workers with staggered startup for heavy loads
    for (let i = 0; i < maxConcurrent; i++) {
      if (cards.length > 200) {
        // Stagger worker startup for large lists to prevent initial spike
        await new Promise(resolve => setTimeout(resolve, i * 10));
      }
      promises.push(processNext());
    }

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
        // Fallback for localhost testing when PHP backend is not available
        console.warn('PHP backend not available, using test response:', error);
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