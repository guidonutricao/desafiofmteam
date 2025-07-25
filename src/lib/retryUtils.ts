import { isRetryableError, AppError, ErrorType } from './errorUtils';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

/**
 * Default retry configuration for network operations
 */
export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  onRetry: () => {},
  shouldRetry: (error: Error) => {
    // Check if it's a retryable error type
    if (error && typeof error === 'object' && 'type' in error) {
      return isRetryableError(error as AppError);
    }
    
    // Check for common network error patterns
    const errorMessage = error?.message?.toLowerCase() || '';
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('502') ||
      errorMessage.includes('503') ||
      errorMessage.includes('504')
    );
  }
};

/**
 * Implements exponential backoff retry mechanism for network failures
 * Requirements: Implement retry mechanisms for network failures
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await operation();
      return {
        success: true,
        data: result,
        attempts: attempt
      };
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry this error
      if (!config.shouldRetry(lastError)) {
        break;
      }
      
      // Don't retry on the last attempt
      if (attempt === config.maxAttempts) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
      );
      
      // Call retry callback
      config.onRetry(attempt, lastError);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: config.maxAttempts
  };
}

/**
 * Retry hook for React components
 */
export function useRetry() {
  const retry = async <T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> => {
    const result = await withRetry(operation, options);
    
    if (result.success && result.data !== undefined) {
      return result.data;
    }
    
    throw result.error || new Error('Retry failed');
  };
  
  return { retry };
}

/**
 * Specialized retry for Supabase operations
 */
export async function retrySupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: unknown }>,
  options?: RetryOptions
): Promise<T> {
  const result = await withRetry(async () => {
    const { data, error } = await operation();
    
    if (error) {
      throw error;
    }
    
    return data;
  }, {
    ...options,
    shouldRetry: (error) => {
      // Supabase-specific retry logic
      const errorMessage = error?.message?.toLowerCase() || '';
      
      // Don't retry authentication errors
      if (errorMessage.includes('invalid login') || 
          errorMessage.includes('email not confirmed') ||
          errorMessage.includes('user already registered')) {
        return false;
      }
      
      // Don't retry validation errors
      if (errorMessage.includes('duplicate key') ||
          errorMessage.includes('foreign key') ||
          errorMessage.includes('not null')) {
        return false;
      }
      
      // Retry network and temporary errors
      return (
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('502') ||
        errorMessage.includes('503') ||
        errorMessage.includes('504') ||
        errorMessage.includes('temporary')
      );
    }
  });
  
  if (result.success && result.data !== undefined) {
    return result.data;
  }
  
  throw result.error || new Error('Supabase operation failed');
}

/**
 * Retry configuration for different operation types
 */
export const RETRY_CONFIGS = {
  // Quick operations (form submissions, updates)
  QUICK: {
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 2000,
    backoffFactor: 2
  } as RetryOptions,
  
  // Standard operations (data loading, file uploads)
  STANDARD: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2
  } as RetryOptions,
  
  // Long operations (large file uploads, complex queries)
  LONG: {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 15000,
    backoffFactor: 1.5
  } as RetryOptions
};

/**
 * Creates a retry-enabled version of an async function
 */
export function createRetryableFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options?: RetryOptions
) {
  return async (...args: T): Promise<R> => {
    const result = await withRetry(() => fn(...args), options);
    
    if (result.success && result.data !== undefined) {
      return result.data;
    }
    
    throw result.error || new Error('Operation failed');
  };
}

/**
 * Utility to check if an operation should be retried based on error type
 */
export function shouldRetryOperation(error: unknown): boolean {
  if (!error) return false;
  
  // Check AppError type
  if (error.type) {
    return error.type === ErrorType.NETWORK;
  }
  
  // Check error message patterns
  const message = (error as Error)?.message?.toLowerCase() || '';
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('fetch failed') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504')
  );
}