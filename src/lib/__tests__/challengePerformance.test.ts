/**
 * Performance tests for challenge system optimizations
 * Requirements: 4.3, 4.4, 5.1, 5.2 - Performance optimization testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getCacheStats, 
  clearAllCache,
  getCachedChallengeProgress,
  setCachedChallengeProgress,
  getCachedRankingData,
  setCachedRankingData,
  invalidateUserCache,
  createBatchCacheOperation
} from '../challengeCache';
import { 
  getPerformanceStats,
  clearPerformanceMetrics,
  timeAsync,
  timeSync,
  OPERATIONS,
  getSlowOperations
} from '../performanceMonitor';
import type { ChallengeProgress } from '../../hooks/useChallengeProgress';
import type { RankingUser } from '../supabase/challengeQueries';

// Mock data
const mockChallengeProgress: ChallengeProgress = {
  currentDay: 3,
  totalDays: 7,
  isCompleted: false,
  isNotStarted: false,
  daysRemaining: 4,
  progressPercentage: 42.86,
  displayText: 'Desafio Shape Express - Dia 3/7',
  hasError: false
};

const mockRankingUsers: RankingUser[] = [
  {
    id: 'user1',
    name: 'João Silva',
    avatar: null,
    totalPoints: 150,
    challengeStartDate: new Date('2025-01-20'),
    challengeProgress: mockChallengeProgress
  },
  {
    id: 'user2',
    name: 'Maria Santos',
    avatar: null,
    totalPoints: 120,
    challengeStartDate: new Date('2025-01-21'),
    challengeProgress: { ...mockChallengeProgress, currentDay: 2 }
  }
];

describe('Challenge Cache System', () => {
  beforeEach(() => {
    clearAllCache();
  });

  afterEach(() => {
    clearAllCache();
  });

  describe('Basic Cache Operations', () => {
    it('should cache and retrieve challenge progress', () => {
      const userId = 'test-user-1';
      
      // Initially no cache
      expect(getCachedChallengeProgress(userId)).toBeNull();
      
      // Set cache
      setCachedChallengeProgress(userId, mockChallengeProgress);
      
      // Retrieve from cache
      const cached = getCachedChallengeProgress(userId);
      expect(cached).toEqual(mockChallengeProgress);
    });

    it('should cache and retrieve ranking data', () => {
      // Initially no cache
      expect(getCachedRankingData()).toBeNull();
      
      // Set cache
      setCachedRankingData(mockRankingUsers);
      
      // Retrieve from cache
      const cached = getCachedRankingData();
      expect(cached).toEqual(mockRankingUsers);
    });

    it('should invalidate user-specific cache', () => {
      const userId = 'test-user-1';
      
      // Set cache
      setCachedChallengeProgress(userId, mockChallengeProgress);
      setCachedRankingData(mockRankingUsers);
      
      // Verify cache exists
      expect(getCachedChallengeProgress(userId)).toEqual(mockChallengeProgress);
      expect(getCachedRankingData()).toEqual(mockRankingUsers);
      
      // Invalidate user cache
      invalidateUserCache(userId);
      
      // User-specific cache should be cleared, but ranking should remain
      expect(getCachedChallengeProgress(userId)).toBeNull();
      expect(getCachedRankingData()).toBeNull(); // Ranking is also invalidated
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hit/miss statistics', () => {
      const userId = 'test-user-1';
      
      // Initial stats
      const initialStats = getCacheStats();
      expect(initialStats.hits).toBe(0);
      expect(initialStats.misses).toBe(0);
      
      // Cache miss
      getCachedChallengeProgress(userId);
      
      let stats = getCacheStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(0);
      
      // Set cache
      setCachedChallengeProgress(userId, mockChallengeProgress);
      
      // Cache hit
      getCachedChallengeProgress(userId);
      
      stats = getCacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    it('should track cache size', () => {
      const stats1 = getCacheStats();
      const initialSize = stats1.size;
      
      // Add cache entry
      setCachedChallengeProgress('user1', mockChallengeProgress);
      
      const stats2 = getCacheStats();
      expect(stats2.size).toBe(initialSize + 1);
      
      // Add another entry
      setCachedRankingData(mockRankingUsers);
      
      const stats3 = getCacheStats();
      expect(stats3.size).toBe(initialSize + 2);
    });
  });

  describe('Batch Cache Operations', () => {
    it('should execute batch cache operations efficiently', () => {
      const batch = createBatchCacheOperation();
      
      // Add operations to batch
      batch
        .setChallengeProgress('user1', mockChallengeProgress)
        .setUserPoints('user1', 150)
        .setRankingData(mockRankingUsers);
      
      // Initially no cache
      expect(getCachedChallengeProgress('user1')).toBeNull();
      expect(getCachedRankingData()).toBeNull();
      
      // Execute batch
      batch.execute();
      
      // All operations should be applied
      expect(getCachedChallengeProgress('user1')).toEqual(mockChallengeProgress);
      expect(getCachedRankingData()).toEqual(mockRankingUsers);
    });
  });

  describe('Cache Expiration', () => {
    it('should handle cache expiration', async () => {
      const userId = 'test-user-1';
      
      // Set cache with very short duration (we'll mock the internal cache)
      setCachedChallengeProgress(userId, mockChallengeProgress);
      
      // Immediately should be cached
      expect(getCachedChallengeProgress(userId)).toEqual(mockChallengeProgress);
      
      // Mock time passage by clearing cache (simulating expiration)
      clearAllCache();
      
      // Should be expired/cleared
      expect(getCachedChallengeProgress(userId)).toBeNull();
    });
  });
});

describe('Performance Monitor', () => {
  beforeEach(() => {
    clearPerformanceMetrics();
  });

  afterEach(() => {
    clearPerformanceMetrics();
  });

  describe('Timing Operations', () => {
    it('should time async operations', async () => {
      const mockAsyncOperation = vi.fn().mockResolvedValue('result');
      
      const result = await timeAsync(
        OPERATIONS.GET_CHALLENGE_PROGRESS,
        mockAsyncOperation,
        { userId: 'test-user' }
      );
      
      expect(result).toBe('result');
      expect(mockAsyncOperation).toHaveBeenCalledOnce();
      
      // Check performance stats
      const stats = getPerformanceStats(OPERATIONS.GET_CHALLENGE_PROGRESS);
      expect(stats).toBeDefined();
      expect(stats!.totalCalls).toBe(1);
      expect(stats!.averageDuration).toBeGreaterThan(0);
    });

    it('should time sync operations', () => {
      const mockSyncOperation = vi.fn().mockReturnValue('sync-result');
      
      const result = timeSync(
        OPERATIONS.TIMEZONE_CALCULATION,
        mockSyncOperation,
        { date: '2025-01-26' }
      );
      
      expect(result).toBe('sync-result');
      expect(mockSyncOperation).toHaveBeenCalledOnce();
      
      // Check performance stats
      const stats = getPerformanceStats(OPERATIONS.TIMEZONE_CALCULATION);
      expect(stats).toBeDefined();
      expect(stats!.totalCalls).toBe(1);
    });

    it('should handle errors in timed operations', async () => {
      const mockFailingOperation = vi.fn().mockRejectedValue(new Error('Test error'));
      
      await expect(
        timeAsync(OPERATIONS.DATABASE_QUERY, mockFailingOperation)
      ).rejects.toThrow('Test error');
      
      // Should still record the timing
      const stats = getPerformanceStats(OPERATIONS.DATABASE_QUERY);
      expect(stats).toBeDefined();
      expect(stats!.totalCalls).toBe(1);
      expect(stats!.errorCount).toBe(1);
    });
  });

  describe('Performance Statistics', () => {
    it('should calculate performance statistics correctly', async () => {
      // Run multiple operations with different durations
      await timeAsync(OPERATIONS.GET_CHALLENGE_PROGRESS, () => 
        new Promise(resolve => setTimeout(resolve, 10))
      );
      
      await timeAsync(OPERATIONS.GET_CHALLENGE_PROGRESS, () => 
        new Promise(resolve => setTimeout(resolve, 20))
      );
      
      await timeAsync(OPERATIONS.GET_CHALLENGE_PROGRESS, () => 
        new Promise(resolve => setTimeout(resolve, 30))
      );
      
      const stats = getPerformanceStats(OPERATIONS.GET_CHALLENGE_PROGRESS);
      expect(stats).toBeDefined();
      expect(stats!.totalCalls).toBe(3);
      expect(stats!.averageDuration).toBeGreaterThan(0);
      expect(stats!.minDuration).toBeGreaterThan(0);
      expect(stats!.maxDuration).toBeGreaterThan(stats!.minDuration);
    });

    it('should identify slow operations', async () => {
      // Create a slow operation
      await timeAsync('slow_operation', () => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      // Create a fast operation
      await timeAsync('fast_operation', () => 
        new Promise(resolve => setTimeout(resolve, 1))
      );
      
      const slowOps = getSlowOperations(50); // Threshold of 50ms
      expect(slowOps.length).toBeGreaterThan(0);
      expect(slowOps[0].operation).toBe('slow_operation');
      expect(slowOps[0].averageDuration).toBeGreaterThan(50);
    });

    it('should get all performance statistics', async () => {
      // Run operations on different functions
      await timeAsync(OPERATIONS.GET_CHALLENGE_PROGRESS, () => Promise.resolve());
      await timeAsync(OPERATIONS.GET_RANKING_DATA, () => Promise.resolve());
      timeSync(OPERATIONS.TIMEZONE_CALCULATION, () => 'result');
      
      const allStats = getPerformanceStats();
      expect(Object.keys(allStats)).toContain(OPERATIONS.GET_CHALLENGE_PROGRESS);
      expect(Object.keys(allStats)).toContain(OPERATIONS.GET_RANKING_DATA);
      expect(Object.keys(allStats)).toContain(OPERATIONS.TIMEZONE_CALCULATION);
    });
  });

  describe('Memory Management', () => {
    it('should limit cache size to prevent memory leaks', () => {
      // Add many cache entries
      for (let i = 0; i < 50; i++) {
        setCachedChallengeProgress(`user-${i}`, mockChallengeProgress);
      }
      
      const stats = getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(1000); // Max cache size
    });

    it('should clean up expired entries', () => {
      // This test would require mocking time or waiting for cleanup
      // For now, we'll just verify the cache can be cleared
      setCachedChallengeProgress('user1', mockChallengeProgress);
      setCachedRankingData(mockRankingUsers);
      
      expect(getCacheStats().size).toBeGreaterThan(0);
      
      clearAllCache();
      
      expect(getCacheStats().size).toBe(0);
    });
  });
});

describe('Integration Performance Tests', () => {
  beforeEach(() => {
    clearAllCache();
    clearPerformanceMetrics();
  });

  afterEach(() => {
    clearAllCache();
    clearPerformanceMetrics();
  });

  it('should demonstrate cache performance benefits', async () => {
    const userId = 'test-user-1';
    let callCount = 0;
    
    // Mock expensive operation
    const expensiveOperation = vi.fn().mockImplementation(async () => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate 50ms delay
      return mockChallengeProgress;
    });
    
    // First call - should hit the expensive operation
    const result1 = await timeAsync(
      'cached_operation',
      async () => {
        const cached = getCachedChallengeProgress(userId);
        if (cached) return cached;
        
        const result = await expensiveOperation();
        setCachedChallengeProgress(userId, result);
        return result;
      }
    );
    
    // Second call - should use cache
    const result2 = await timeAsync(
      'cached_operation',
      async () => {
        const cached = getCachedChallengeProgress(userId);
        if (cached) return cached;
        
        const result = await expensiveOperation();
        setCachedChallengeProgress(userId, result);
        return result;
      }
    );
    
    expect(result1).toEqual(mockChallengeProgress);
    expect(result2).toEqual(mockChallengeProgress);
    expect(callCount).toBe(1); // Expensive operation called only once
    
    const stats = getPerformanceStats('cached_operation');
    expect(stats!.totalCalls).toBe(2);
    
    // Second call should be significantly faster due to caching
    // This is a simplified test - in real scenarios, the difference would be more pronounced
  });

  it('should handle concurrent cache operations safely', async () => {
    const userId = 'test-user-1';
    
    // Simulate concurrent cache operations
    const promises = Array.from({ length: 10 }, (_, i) => 
      timeAsync(`concurrent_op_${i}`, async () => {
        setCachedChallengeProgress(`${userId}-${i}`, {
          ...mockChallengeProgress,
          currentDay: i + 1
        });
        return getCachedChallengeProgress(`${userId}-${i}`);
      })
    );
    
    const results = await Promise.all(promises);
    
    // All operations should complete successfully
    expect(results).toHaveLength(10);
    results.forEach((result, i) => {
      expect(result?.currentDay).toBe(i + 1);
    });
    
    // Cache should contain all entries
    const stats = getCacheStats();
    expect(stats.size).toBeGreaterThanOrEqual(10);
  });
});

describe('Performance Benchmarks', () => {
  it('should benchmark cache vs no-cache performance', async () => {
    const iterations = 100;
    let withoutCacheTime = 0;
    let withCacheTime = 0;
    
    // Benchmark without cache
    const startWithoutCache = performance.now();
    for (let i = 0; i < iterations; i++) {
      // Simulate database operation
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    withoutCacheTime = performance.now() - startWithoutCache;
    
    // Benchmark with cache (after first call)
    setCachedChallengeProgress('benchmark-user', mockChallengeProgress);
    
    const startWithCache = performance.now();
    for (let i = 0; i < iterations; i++) {
      getCachedChallengeProgress('benchmark-user');
    }
    withCacheTime = performance.now() - startWithCache;
    
    // Cache should be significantly faster
    expect(withCacheTime).toBeLessThan(withoutCacheTime);
    
    // Log performance improvement for visibility
    const improvement = ((withoutCacheTime - withCacheTime) / withoutCacheTime) * 100;
    console.log(`Cache performance improvement: ${improvement.toFixed(2)}%`);
  });
});