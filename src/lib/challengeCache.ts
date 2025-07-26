/**
 * Challenge Progress Caching System
 * Requirements: 4.3, 4.4, 5.1, 5.2 - Performance optimization with caching
 */

import { ChallengeProgress } from '../hooks/useChallengeProgress';
import { RankingUser } from './supabase/challengeQueries';

// Cache configuration
const CACHE_DURATION = {
  CHALLENGE_PROGRESS: 5 * 60 * 1000, // 5 minutes
  RANKING_DATA: 2 * 60 * 1000, // 2 minutes
  USER_POINTS: 3 * 60 * 1000, // 3 minutes
  TIMEZONE_CALCULATIONS: 10 * 60 * 1000, // 10 minutes
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

class ChallengeCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  private maxSize = 1000; // Maximum cache entries
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Get cached data if valid, otherwise return null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      this.updateSize();
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  /**
   * Set cached data with expiration
   */
  set<T>(key: string, data: T, duration: number): void {
    const now = Date.now();
    
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration
    });
    
    this.updateSize();
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateSize();
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.updateSize();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Update cache size statistics
   */
  private updateSize(): void {
    this.stats.size = this.cache.size;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Run every minute
  }

  /**
   * Remove expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    let evicted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        evicted++;
      }
    }

    this.stats.evictions += evicted;
    this.updateSize();
  }

  /**
   * Stop cleanup interval (for cleanup)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Global cache instance
const challengeCache = new ChallengeCache();

/**
 * Cache keys generators
 */
export const CacheKeys = {
  challengeProgress: (userId: string) => `challenge_progress:${userId}`,
  userPoints: (userId: string) => `user_points:${userId}`,
  rankingData: () => 'ranking_data',
  timezoneCalculation: (date: string) => `timezone_calc:${date}`,
  userChallengeData: (userId: string) => `user_challenge:${userId}`,
  dailyProgress: (userId: string, day: number) => `daily_progress:${userId}:${day}`,
} as const;

/**
 * Cached challenge progress retrieval
 */
export function getCachedChallengeProgress(userId: string): ChallengeProgress | null {
  return challengeCache.get<ChallengeProgress>(CacheKeys.challengeProgress(userId));
}

/**
 * Cache challenge progress data
 */
export function setCachedChallengeProgress(userId: string, progress: ChallengeProgress): void {
  challengeCache.set(CacheKeys.challengeProgress(userId), progress, CACHE_DURATION.CHALLENGE_PROGRESS);
}

/**
 * Cached user points retrieval
 */
export function getCachedUserPoints(userId: string): number | null {
  return challengeCache.get<number>(CacheKeys.userPoints(userId));
}

/**
 * Cache user points data
 */
export function setCachedUserPoints(userId: string, points: number): void {
  challengeCache.set(CacheKeys.userPoints(userId), points, CACHE_DURATION.USER_POINTS);
}

/**
 * Cached ranking data retrieval
 */
export function getCachedRankingData(): RankingUser[] | null {
  return challengeCache.get<RankingUser[]>(CacheKeys.rankingData());
}

/**
 * Cache ranking data
 */
export function setCachedRankingData(ranking: RankingUser[]): void {
  challengeCache.set(CacheKeys.rankingData(), ranking, CACHE_DURATION.RANKING_DATA);
}

/**
 * Cached timezone calculation retrieval
 */
export function getCachedTimezoneCalculation(dateKey: string): any | null {
  return challengeCache.get(CacheKeys.timezoneCalculation(dateKey));
}

/**
 * Cache timezone calculation result
 */
export function setCachedTimezoneCalculation(dateKey: string, result: any): void {
  challengeCache.set(CacheKeys.timezoneCalculation(dateKey), result, CACHE_DURATION.TIMEZONE_CALCULATIONS);
}

/**
 * Invalidate user-specific cache entries
 */
export function invalidateUserCache(userId: string): void {
  challengeCache.delete(CacheKeys.challengeProgress(userId));
  challengeCache.delete(CacheKeys.userPoints(userId));
  challengeCache.delete(CacheKeys.userChallengeData(userId));
  
  // Also invalidate ranking data since it includes this user
  challengeCache.delete(CacheKeys.rankingData());
}

/**
 * Invalidate all ranking-related cache
 */
export function invalidateRankingCache(): void {
  challengeCache.delete(CacheKeys.rankingData());
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return challengeCache.getStats();
}

/**
 * Clear all cache (for testing or reset)
 */
export function clearAllCache(): void {
  challengeCache.clear();
}

/**
 * Batch cache operations for efficiency
 */
export class BatchCacheOperation {
  private operations: Array<() => void> = [];

  /**
   * Add cache set operation to batch
   */
  setChallengeProgress(userId: string, progress: ChallengeProgress): this {
    this.operations.push(() => setCachedChallengeProgress(userId, progress));
    return this;
  }

  /**
   * Add user points cache operation to batch
   */
  setUserPoints(userId: string, points: number): this {
    this.operations.push(() => setCachedUserPoints(userId, points));
    return this;
  }

  /**
   * Add ranking data cache operation to batch
   */
  setRankingData(ranking: RankingUser[]): this {
    this.operations.push(() => setCachedRankingData(ranking));
    return this;
  }

  /**
   * Execute all batched operations
   */
  execute(): void {
    this.operations.forEach(op => op());
    this.operations = [];
  }
}

/**
 * Create a new batch cache operation
 */
export function createBatchCacheOperation(): BatchCacheOperation {
  return new BatchCacheOperation();
}

// Export cache instance for advanced usage
export { challengeCache };

// Cleanup on module unload (for testing)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    challengeCache.destroy();
  });
}