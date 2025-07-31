/**
 * Retry utilities for handling failed operations
 * Requirements: 3.5, 5.4 - Add retry mechanisms for failed operations
 */

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

export interface RetryState {
  attempt: number;
  isRetrying: boolean;
  lastError: Error | null;
  canRetry: boolean;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential',
  onRetry: () => {},
  shouldRetry: (error: Error) => {
    // Don't retry authentication errors
    if (error.message.includes('JWT') || error.message.includes('Unauthorized')) {
      return false;
    }
    // Don't retry client errors (4xx)
    if (error.message.includes('400') || error.message.includes('404')) {
      return false;
    }
    // Retry network errors and server errors
    return true;
  }
};

/**
 * Calculate delay for retry attempt
 */
function calculateDelay(attempt: number, baseDelay: number, backoff: 'linear' | 'exponential'): number {
  if (backoff === 'exponential') {
    return baseDelay * Math.pow(2, attempt - 1);
  }
  return baseDelay * attempt;
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with configurable options
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry this error
      if (!config.shouldRetry(lastError)) {
        throw lastError;
      }

      // Don't retry on the last attempt
      if (attempt === config.maxAttempts) {
        throw lastError;
      }

      // Call retry callback
      config.onRetry(attempt, lastError);

      // Wait before retrying
      const delay = calculateDelay(attempt, config.delay, config.backoff);
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Hook for managing retry state in React components
 */
export function useRetryState(options: RetryOptions = {}): {
  retryState: RetryState;
  executeWithRetry: <T>(operation: () => Promise<T>) => Promise<T>;
  reset: () => void;
} {
  const [retryState, setRetryState] = React.useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    lastError: null,
    canRetry: true
  });

  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };

  const executeWithRetry = React.useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setRetryState(prev => ({ ...prev, isRetrying: true, lastError: null }));

    try {
      const result = await retryAsync(operation, {
        ...config,
        onRetry: (attempt, error) => {
          setRetryState(prev => ({
            ...prev,
            attempt,
            lastError: error,
            canRetry: attempt < config.maxAttempts
          }));
          config.onRetry(attempt, error);
        }
      });

      setRetryState(prev => ({
        ...prev,
        isRetrying: false,
        attempt: 0,
        lastError: null,
        canRetry: true
      }));

      return result;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error(String(error));
      setRetryState(prev => ({
        ...prev,
        isRetrying: false,
        lastError: finalError,
        canRetry: config.shouldRetry(finalError) && prev.attempt < config.maxAttempts
      }));
      throw finalError;
    }
  }, [config]);

  const reset = React.useCallback(() => {
    setRetryState({
      attempt: 0,
      isRetrying: false,
      lastError: null,
      canRetry: true
    });
  }, []);

  return { retryState, executeWithRetry, reset };
}

/**
 * Specialized retry configurations for different types of operations
 */
export const RETRY_CONFIGS = {
  // For data fetching operations
  dataFetch: {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential' as const,
    shouldRetry: (error: Error) => {
      // Retry network errors and server errors
      return !error.message.includes('JWT') && 
             !error.message.includes('Unauthorized') &&
             !error.message.includes('404');
    }
  },

  // For sharing operations
  sharing: {
    maxAttempts: 2,
    delay: 500,
    backoff: 'linear' as const,
    shouldRetry: (error: Error) => {
      // Only retry network-related sharing errors
      return error.message.includes('network') || 
             error.message.includes('clipboard') ||
             error.message.includes('share');
    }
  },

  // For authentication operations
  auth: {
    maxAttempts: 2,
    delay: 1000,
    backoff: 'linear' as const,
    shouldRetry: (error: Error) => {
      // Don't retry auth errors - they need user intervention
      return false;
    }
  }
} as const;

// Import React for the hook
import React from 'react';