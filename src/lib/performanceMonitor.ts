/**
 * Performance monitoring for challenge system
 * Requirements: 4.3, 4.4, 5.1, 5.2 - Performance optimization and monitoring
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  totalCalls: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  lastCall: number;
  errorCount: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private activeMetrics: Map<string, PerformanceMetric> = new Map();
  private maxMetricsPerOperation = 100; // Keep last 100 metrics per operation

  /**
   * Start timing an operation
   */
  startTiming(operationName: string, metadata?: Record<string, any>): string {
    const metricId = `${operationName}_${Date.now()}_${Math.random()}`;
    const metric: PerformanceMetric = {
      name: operationName,
      startTime: performance.now(),
      metadata
    };
    
    this.activeMetrics.set(metricId, metric);
    return metricId;
  }

  /**
   * End timing an operation
   */
  endTiming(metricId: string): number | null {
    const metric = this.activeMetrics.get(metricId);
    if (!metric) {
      console.warn(`Performance metric not found: ${metricId}`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Store completed metric
    const operationMetrics = this.metrics.get(metric.name) || [];
    operationMetrics.push(metric);

    // Keep only the last N metrics to prevent memory leaks
    if (operationMetrics.length > this.maxMetricsPerOperation) {
      operationMetrics.shift();
    }

    this.metrics.set(metric.name, operationMetrics);
    this.activeMetrics.delete(metricId);

    return metric.duration;
  }

  /**
   * Time an async operation
   */
  async timeAsync<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const metricId = this.startTiming(operationName, metadata);
    
    try {
      const result = await operation();
      this.endTiming(metricId);
      return result;
    } catch (error) {
      this.endTiming(metricId);
      this.recordError(operationName, error);
      throw error;
    }
  }

  /**
   * Time a synchronous operation
   */
  timeSync<T>(
    operationName: string,
    operation: () => T,
    metadata?: Record<string, any>
  ): T {
    const metricId = this.startTiming(operationName, metadata);
    
    try {
      const result = operation();
      this.endTiming(metricId);
      return result;
    } catch (error) {
      this.endTiming(metricId);
      this.recordError(operationName, error);
      throw error;
    }
  }

  /**
   * Record an error for an operation
   */
  recordError(operationName: string, error: any): void {
    const errorMetric: PerformanceMetric = {
      name: `${operationName}_error`,
      startTime: performance.now(),
      endTime: performance.now(),
      duration: 0,
      metadata: {
        error: error?.message || 'Unknown error',
        stack: error?.stack
      }
    };

    const errorMetrics = this.metrics.get(errorMetric.name) || [];
    errorMetrics.push(errorMetric);

    if (errorMetrics.length > this.maxMetricsPerOperation) {
      errorMetrics.shift();
    }

    this.metrics.set(errorMetric.name, errorMetrics);
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operationName: string): PerformanceStats | null {
    const operationMetrics = this.metrics.get(operationName);
    if (!operationMetrics || operationMetrics.length === 0) {
      return null;
    }

    const durations = operationMetrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);

    if (durations.length === 0) {
      return null;
    }

    const errorMetrics = this.metrics.get(`${operationName}_error`) || [];

    return {
      totalCalls: durations.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      lastCall: operationMetrics[operationMetrics.length - 1]?.startTime || 0,
      errorCount: errorMetrics.length
    };
  }

  /**
   * Get all performance statistics
   */
  getAllStats(): Record<string, PerformanceStats> {
    const stats: Record<string, PerformanceStats> = {};
    
    for (const operationName of this.metrics.keys()) {
      if (!operationName.endsWith('_error')) {
        const operationStats = this.getStats(operationName);
        if (operationStats) {
          stats[operationName] = operationStats;
        }
      }
    }

    return stats;
  }

  /**
   * Get slow operations (above threshold)
   */
  getSlowOperations(thresholdMs: number = 1000): Array<{
    operation: string;
    averageDuration: number;
    maxDuration: number;
    callCount: number;
  }> {
    const allStats = this.getAllStats();
    
    return Object.entries(allStats)
      .filter(([_, stats]) => stats.averageDuration > thresholdMs)
      .map(([operation, stats]) => ({
        operation,
        averageDuration: stats.averageDuration,
        maxDuration: stats.maxDuration,
        callCount: stats.totalCalls
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.activeMetrics.clear();
  }

  /**
   * Get memory usage of the monitor
   */
  getMemoryUsage(): {
    totalMetrics: number;
    activeMetrics: number;
    estimatedMemoryKB: number;
  } {
    let totalMetrics = 0;
    for (const metrics of this.metrics.values()) {
      totalMetrics += metrics.length;
    }

    // Rough estimation: each metric ~200 bytes
    const estimatedMemoryKB = (totalMetrics * 200) / 1024;

    return {
      totalMetrics,
      activeMetrics: this.activeMetrics.size,
      estimatedMemoryKB: Math.round(estimatedMemoryKB * 100) / 100
    };
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    const stats = this.getAllStats();
    const slowOps = this.getSlowOperations(500); // Operations slower than 500ms
    const memoryUsage = this.getMemoryUsage();

    console.group('🚀 Challenge System Performance Summary');
    
    console.log('📊 Memory Usage:', memoryUsage);
    
    if (Object.keys(stats).length > 0) {
      console.log('⚡ Operation Statistics:');
      Object.entries(stats).forEach(([operation, stat]) => {
        const avgMs = Math.round(stat.averageDuration * 100) / 100;
        const maxMs = Math.round(stat.maxDuration * 100) / 100;
        console.log(`  ${operation}: ${stat.totalCalls} calls, avg: ${avgMs}ms, max: ${maxMs}ms, errors: ${stat.errorCount}`);
      });
    }

    if (slowOps.length > 0) {
      console.warn('🐌 Slow Operations (>500ms):');
      slowOps.forEach(op => {
        const avgMs = Math.round(op.averageDuration * 100) / 100;
        const maxMs = Math.round(op.maxDuration * 100) / 100;
        console.warn(`  ${op.operation}: avg: ${avgMs}ms, max: ${maxMs}ms, calls: ${op.callCount}`);
      });
    }

    console.groupEnd();
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

// Operation names for consistent monitoring
export const OPERATIONS = {
  GET_CHALLENGE_PROGRESS: 'getChallengeProgress',
  GET_RANKING_DATA: 'getRankingData',
  CALCULATE_TOTAL_POINTS: 'calculateTotalPoints',
  TIMEZONE_CALCULATION: 'timezoneCalculation',
  DATABASE_QUERY: 'databaseQuery',
  CACHE_OPERATION: 'cacheOperation',
  START_CHALLENGE: 'startChallenge',
  RECORD_PROGRESS: 'recordProgress',
  COMPLETE_CHALLENGE: 'completeChallenge'
} as const;

/**
 * Decorator for timing async functions
 */
export function timed(operationName: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;
    
    descriptor.value = (async function (this: any, ...args: any[]) {
      return await performanceMonitor.timeAsync(
        operationName,
        () => method.apply(this, args),
        { function: propertyName, args: args.length }
      );
    }) as T;
  };
}

/**
 * Time an async operation
 */
export async function timeAsync<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.timeAsync(operationName, operation, metadata);
}

/**
 * Time a synchronous operation
 */
export function timeSync<T>(
  operationName: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  return performanceMonitor.timeSync(operationName, operation, metadata);
}

/**
 * Start timing an operation manually
 */
export function startTiming(operationName: string, metadata?: Record<string, any>): string {
  return performanceMonitor.startTiming(operationName, metadata);
}

/**
 * End timing an operation manually
 */
export function endTiming(metricId: string): number | null {
  return performanceMonitor.endTiming(metricId);
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(operationName?: string) {
  if (operationName) {
    return performanceMonitor.getStats(operationName);
  }
  return performanceMonitor.getAllStats();
}

/**
 * Get slow operations
 */
export function getSlowOperations(thresholdMs?: number) {
  return performanceMonitor.getSlowOperations(thresholdMs);
}

/**
 * Log performance summary
 */
export function logPerformanceSummary(): void {
  performanceMonitor.logSummary();
}

/**
 * Clear all performance metrics
 */
export function clearPerformanceMetrics(): void {
  performanceMonitor.clear();
}

// Auto-log summary every 5 minutes in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = performanceMonitor.getAllStats();
    if (Object.keys(stats).length > 0) {
      performanceMonitor.logSummary();
    }
  }, 5 * 60 * 1000);
}

export { performanceMonitor };