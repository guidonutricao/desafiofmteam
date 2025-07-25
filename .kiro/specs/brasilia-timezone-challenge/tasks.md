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

- [ ] 11. Add error handling and edge case management




  - Implement safe wrappers for timezone calculations
  - Add fallback UI states for calculation errors
  - Handle null/undefined start dates gracefully
  - Create user-friendly error messages for timezone issues
  - _Requirements: 1.1, 1.2, 6.1, 6.2, 6.3_

- [ ] 12. Optimize performance with caching
  - Implement caching strategy for challenge progress calculations
  - Add database indexes for efficient queries
  - Create optimized ranking queries for multiple users
  - Add performance monitoring for timezone calculations
  - _Requirements: 4.3, 4.4, 5.1, 5.2_