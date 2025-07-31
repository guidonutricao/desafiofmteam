import { describe, it, expect, vi, beforeEach } from 'vitest';
import { retryAsync, RETRY_CONFIGS } from '../retryUtils';

describe('retryUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('retryAsync', () => {
    it('returns result on first success', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      
      const result = await retryAsync(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and eventually succeeds', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const result = await retryAsync(operation, { maxAttempts: 3, delay: 10 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('throws error after max attempts', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(retryAsync(operation, { maxAttempts: 2, delay: 10 }))
        .rejects.toThrow('Persistent failure');
      
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('calls onRetry callback for each retry', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success');
      const onRetry = vi.fn();
      
      await retryAsync(operation, { maxAttempts: 2, delay: 10, onRetry });
      
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('respects shouldRetry function', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('JWT token expired'));
      const shouldRetry = vi.fn().mockReturnValue(false);
      
      await expect(retryAsync(operation, { shouldRetry, delay: 10 }))
        .rejects.toThrow('JWT token expired');
      
      expect(operation).toHaveBeenCalledTimes(1);
      expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error));
    });

    it('uses exponential backoff by default', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      await retryAsync(operation, { maxAttempts: 3, delay: 100 });
      const endTime = Date.now();
      
      // Should take at least 100ms (first retry) + 200ms (second retry) = 300ms
      expect(endTime - startTime).toBeGreaterThan(250);
    });

    it('uses linear backoff when specified', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      await retryAsync(operation, { 
        maxAttempts: 3, 
        delay: 100, 
        backoff: 'linear' 
      });
      const endTime = Date.now();
      
      // Should take at least 100ms (first retry) + 200ms (second retry) = 300ms
      expect(endTime - startTime).toBeGreaterThan(250);
    });
  });

  describe('RETRY_CONFIGS', () => {
    it('has correct configuration for data fetch operations', () => {
      const config = RETRY_CONFIGS.dataFetch;
      
      expect(config.maxAttempts).toBe(3);
      expect(config.delay).toBe(1000);
      expect(config.backoff).toBe('exponential');
      
      // Should retry network errors but not auth errors
      expect(config.shouldRetry(new Error('Network error'))).toBe(true);
      expect(config.shouldRetry(new Error('JWT token expired'))).toBe(false);
      expect(config.shouldRetry(new Error('404 Not Found'))).toBe(false);
    });

    it('has correct configuration for sharing operations', () => {
      const config = RETRY_CONFIGS.sharing;
      
      expect(config.maxAttempts).toBe(2);
      expect(config.delay).toBe(500);
      expect(config.backoff).toBe('linear');
      
      // Should only retry specific sharing errors
      expect(config.shouldRetry(new Error('network error'))).toBe(true);
      expect(config.shouldRetry(new Error('clipboard error'))).toBe(true);
      expect(config.shouldRetry(new Error('share failed'))).toBe(true);
      expect(config.shouldRetry(new Error('JWT error'))).toBe(false);
    });

    it('has correct configuration for auth operations', () => {
      const config = RETRY_CONFIGS.auth;
      
      expect(config.maxAttempts).toBe(2);
      expect(config.delay).toBe(1000);
      expect(config.backoff).toBe('linear');
      
      // Should not retry any auth errors
      expect(config.shouldRetry(new Error('Any error'))).toBe(false);
    });
  });

  describe('default shouldRetry function', () => {
    it('does not retry JWT errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('JWT token expired'));
      
      await expect(retryAsync(operation)).rejects.toThrow('JWT token expired');
    });

    it('does not retry Unauthorized errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Unauthorized access'));
      
      await expect(retryAsync(operation)).rejects.toThrow('Unauthorized access');
    });

    it('does not retry 400 errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('400 Bad Request'));
      
      await expect(retryAsync(operation)).rejects.toThrow('400 Bad Request');
    });

    it('does not retry 404 errors', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('404 Not Found'));
      
      await expect(retryAsync(operation)).rejects.toThrow('404 Not Found');
    });

    it('retries network errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Network request failed'))
        .mockResolvedValue('success');
      
      const result = await retryAsync(operation, { delay: 10 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('retries server errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('500 Internal Server Error'))
        .mockResolvedValue('success');
      
      const result = await retryAsync(operation, { delay: 10 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
});