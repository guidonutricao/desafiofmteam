# Implementation Plan

- [x] 1. Install timezone dependencies and setup utilities





  - Install `date-fns-tz` package for timezone manipulation
  - Create `src/lib/timezoneUtils.ts` with core timezone functions
  - Implement constants and basic date conversion functions
  - _Requirements: 1.1, 1.2, 6.1, 6.2_

- [x] 2. Implement core timezone calculation functions





  - Code `getCurrentBrasiliaDate()` function using America/Sao_Paulo timezone
  - Implement `calculateDaysSinceStart()` for days elapsed calculation
  - Create `getChallengeDay()` function to determine current challenge day (1-7)
  - Add `isChallengeCompleted()` and `isChallengeNotStarted()` validation functions
  - _Requirements: 1.1, 1.3, 1.4, 6.3, 6.4_

- [x] 3. Create comprehensive unit tests for timezone utilities





  - Write tests for timezone conversion accuracy
  - Test edge cases like midnight transitions and daylight saving time
  - Verify challenge day calculations for different scenarios
  - Test completion and start validation logic
  - _Requirements: 1.1, 1.5, 6.1, 6.2, 6.3, 6.4_

- [x] 4. Implement challenge progress hook





  - Create `src/hooks/useChallengeProgress.ts` with ChallengeProgress interface
  - Implement hook logic using timezone utilities
  - Add error handling and fallback states
  - Include display text generation logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2_

- [x] 5. Create database migration for challenge tracking





  - Write SQL migration to add `challenge_start_date` and `challenge_completed_at` columns to profiles
  - Create `daily_progress` table with proper indexes
  - Add database constraints and foreign key relationships
  - _Requirements: 4.1, 4.2, 5.3, 5.4_

- [x] 6. Implement Supabase query functions





  - Create `src/lib/supabase/challengeQueries.ts` with database interaction functions
  - Implement `startChallenge()` function to initialize user challenge
  - Code `getUserChallengeProgress()` to fetch and calculate user progress
  - Create `getRankingData()` function for multi-user ranking with individual progress
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2_

- [x] 7. Update Daily Challenge page component





  - Modify `src/pages/DesafioDiario.tsx` to use `useChallengeProgress` hook
  - Update page header to display "Desafio Shape Express - Dia X/7" format
  - Handle different states: not started, in progress, completed
  - Ensure proper error handling and loading states
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 8. Update Ranking page component





  - Modify `src/pages/Ranking.tsx` to display individual challenge progress
  - Show each user's current day (Dia X/7) alongside their points
  - Handle users in different challenge days correctly
  - Display appropriate status for completed and not-started challenges
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 9. Implement points persistence logic





  - Update daily progress tracking to maintain cumulative scoring
  - Ensure points accumulate across days without reset
  - Decouple daily task reset from points persistence
  - Create functions to calculate total points across all challenge days
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Create integration tests for multi-user scenarios





  - Write tests for multiple users with different start dates
  - Verify independent challenge timelines work correctly
  - Test ranking calculations with users in different challenge days
  - Validate points persistence across day transitions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 11. Add error handling and edge case management
  - ✅ Implement safe wrappers for timezone calculations
    - Created `safeGetCurrentBrasiliaDate()`, `safeToBrasiliaDate()`, `safeCalculateDaysSinceStart()` functions
    - Added `safeGetChallengeDay()`, `safeIsChallengeCompleted()`, `safeIsChallengeNotStarted()` wrappers
    - Implemented `safeFormatBrasiliaDate()` and `safeCalculateChallengeProgress()` functions
  - ✅ Add fallback UI states for calculation errors
    - Created comprehensive `ChallengeErrorDisplay` component with multiple variants (card, alert, inline)
    - Implemented specialized `TimezoneErrorDisplay` for timezone-specific errors
    - Added `ChallengeErrorBoundary` with error type classification (timezone, network, data, calculation)
    - Created `ChallengeFallbackDisplay` for graceful degradation when calculations fail
  - ✅ Handle null/undefined start dates gracefully
    - All safe functions handle null/undefined inputs without throwing errors
    - `useChallengeProgress` hook returns appropriate fallback states for missing data
    - Database queries handle missing challenge start dates properly
  - ✅ Create user-friendly error messages for timezone issues
    - Implemented `getTimezoneErrorMessage()` function with Portuguese error messages
    - Added specific error types: `TimezoneError` and `InvalidDateError` classes
    - Error messages provide actionable guidance for users
  - ✅ Comprehensive testing coverage
    - Added 15+ test cases for error handling scenarios in timezone utils
    - Tested safe wrapper functions with invalid inputs and edge cases
    - Verified error message generation and console logging behavior
    - Tested challenge progress hook error states and fallback behavior
  - ✅ Integration with UI components
    - `DesafioDiario.tsx` uses error boundary with proper error type detection
    - `Ranking.tsx` implements error handling with retry functionality
    - Error states are properly displayed with user-friendly messages and retry options
  - _Requirements: 1.1, 1.2, 6.1, 6.2, 6.3_

- [x] 12. Optimize performance with caching
  - ✅ Implement comprehensive caching strategy for challenge progress calculations
    - Created `challengeCache.ts` with intelligent caching system supporting TTL, LRU eviction, and batch operations
    - Implemented cache for challenge progress, user points, ranking data, and timezone calculations
    - Added cache statistics tracking with hit/miss ratios and memory usage monitoring
    - Created batch cache operations for efficient bulk updates
  - ✅ Add database indexes for efficient queries
    - Added composite indexes for common query patterns (`idx_profiles_challenge_status`, `idx_daily_progress_ranking`)
    - Created partial indexes for active challenges only (`idx_profiles_active_challenges_only`)
    - Optimized daily progress queries with points-specific indexes (`idx_daily_progress_points_lookup`)
  - ✅ Create optimized ranking queries for multiple users
    - Converted ranking view to materialized view with automatic refresh triggers
    - Added optimized database functions: `get_ranking_bulk()`, `get_user_challenge_summary()`, `get_points_breakdown()`
    - Implemented efficient bulk ranking queries with position numbers and cumulative calculations
  - ✅ Add performance monitoring for timezone calculations
    - Created comprehensive `performanceMonitor.ts` with operation timing and statistics
    - Added performance tracking for all major operations (database queries, cache operations, timezone calculations)
    - Implemented slow operation detection and memory usage monitoring
    - Added automatic performance logging in development mode
  - ✅ Integration and testing
    - Updated all challenge query functions to use caching with proper invalidation
    - Added performance monitoring to critical operations with detailed metrics
    - Created comprehensive performance tests covering cache efficiency and concurrent operations
    - Implemented cache invalidation strategies for data consistency
  - _Requirements: 4.3, 4.4, 5.1, 5.2_