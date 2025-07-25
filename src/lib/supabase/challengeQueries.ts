/**
 * Supabase query functions for challenge tracking with caching
 * Requirements: 4.1, 4.2, 4.3, 5.1, 5.2 - Multi-user challenge management with individual timelines
 * Requirements: 4.3, 4.4, 5.1, 5.2 - Performance optimization with caching
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  safeGetCurrentBrasiliaDate, 
  getTimezoneErrorMessage,
  TimezoneError,
  InvalidDateError 
} from '../timezoneUtils';
import { calculateChallengeProgress, type ChallengeProgress } from '../../hooks/useChallengeProgress';
import {
  getCachedChallengeProgress,
  setCachedChallengeProgress,
  getCachedUserPoints,
  setCachedUserPoints,
  getCachedRankingData,
  setCachedRankingData,
  invalidateUserCache,
  invalidateRankingCache,
  createBatchCacheOperation
} from '../challengeCache';
import { timeAsync, OPERATIONS } from '../performanceMonitor';

// Types for database operations
export interface UserChallengeData {
  user_id: string;
  challenge_start_date: string | null;
  challenge_completed_at: string | null;
  nome: string;
  foto_url: string | null;
}

export interface DailyProgressData {
  id: string;
  user_id: string;
  challenge_day: number;
  date: string;
  tasks_completed: Record<string, boolean>;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

export interface RankingUser {
  id: string;
  name: string;
  avatar?: string | null;
  totalPoints: number;
  challengeStartDate: Date | null;
  challengeProgress: ChallengeProgress;
}

/**
 * Initialize user challenge by setting start date with cache invalidation
 * Requirement 4.1: Multiple users with different start dates
 * Requirement 4.3: Performance optimization with caching
 */
export async function startChallenge(userId: string): Promise<void> {
  try {
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }
    
    // Use safe function to get current Brasília date
    const startDate = safeGetCurrentBrasiliaDate();
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        challenge_start_date: startDate.toISOString(),
        challenge_completed_at: null 
      })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to start challenge: ${error.message}`);
    }
    
    // Invalidate cache after successful update
    invalidateUserCache(userId);
    invalidateRankingCache();
  } catch (error) {
    console.error('Error starting challenge:', error);
    
    // Provide user-friendly error message for timezone errors
    if (error instanceof TimezoneError || error instanceof InvalidDateError) {
      throw new Error(getTimezoneErrorMessage(error));
    }
    
    throw error;
  }
}

/**
 * Get user's challenge progress data from database with caching
 * Requirement 4.2: Individual challenge timeline calculation
 * Requirement 4.3: Performance optimization with caching
 */
export async function getUserChallengeProgress(userId: string): Promise<ChallengeProgress | null> {
  return timeAsync(OPERATIONS.GET_CHALLENGE_PROGRESS, async () => {
    try {
      // Validate userId
      if (!userId || typeof userId !== 'string') {
        console.error('Invalid user ID provided to getUserChallengeProgress');
        return null;
      }
      
      // Check cache first
      const cachedProgress = getCachedChallengeProgress(userId);
      if (cachedProgress) {
        return cachedProgress;
      }
      
      // Get user's challenge data
      const { data: profile, error: profileError } = await timeAsync(
        OPERATIONS.DATABASE_QUERY,
        () => supabase
          .from('profiles')
          .select('challenge_start_date, challenge_completed_at')
          .eq('user_id', userId)
          .single(),
        { table: 'profiles', operation: 'select', userId }
      );

    if (profileError) {
      console.error('Database error fetching user profile:', profileError);
      
      // Return error state instead of null for better UX
      return {
        currentDay: 0,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: true,
        daysRemaining: 7,
        progressPercentage: 0,
        displayText: 'Erro ao carregar progresso',
        hasError: true,
        errorMessage: 'Não foi possível carregar seus dados. Tente recarregar a página.'
      };
    }

    if (!profile?.challenge_start_date) {
      return null;
    }

      // Safely parse and calculate progress using the challenge start date
      try {
        const startDate = new Date(profile.challenge_start_date);
        const progress = calculateChallengeProgress(startDate);
        
        // Cache the result
        setCachedChallengeProgress(userId, progress);
        
        return progress;
      } catch (dateError) {
        console.error('Error parsing challenge start date:', dateError);
        
        const errorProgress = {
          currentDay: 0,
          totalDays: 7,
          isCompleted: false,
          isNotStarted: true,
          daysRemaining: 7,
          progressPercentage: 0,
          displayText: 'Erro ao calcular progresso',
          hasError: true,
          errorMessage: 'Data de início inválida. Entre em contato com o suporte.'
        };
        
        // Cache error state for short duration to avoid repeated failures
        setCachedChallengeProgress(userId, errorProgress);
        
        return errorProgress;
      }
    } catch (error) {
      console.error('Error getting user challenge progress:', error);
      
      // Return error state with user-friendly message
      return {
        currentDay: 0,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: true,
        daysRemaining: 7,
        progressPercentage: 0,
        displayText: 'Erro ao carregar dados',
        hasError: true,
        errorMessage: getTimezoneErrorMessage(error)
      };
    }
  }, { userId });
}

/**
 * Get ranking data with individual challenge progress for all users with caching
 * Requirements 4.3, 5.1, 5.2: Multi-user ranking with individual progress and points persistence
 * Requirement 4.3: Performance optimization with caching
 */
export async function getRankingData(): Promise<RankingUser[]> {
  return timeAsync(OPERATIONS.GET_RANKING_DATA, async () => {
    try {
      // Check cache first
      const cachedRanking = getCachedRankingData();
      if (cachedRanking) {
        return cachedRanking;
      }
      
      // Use optimized view for better performance
      const { data: users, error: usersError } = await timeAsync(
        OPERATIONS.DATABASE_QUERY,
        () => supabase
          .from('ranking_with_challenge_progress')
          .select('*')
          .order('total_points', { ascending: false }),
        { table: 'ranking_with_challenge_progress', operation: 'select' }
      );

    if (usersError) {
      console.error('Database error fetching users for ranking:', usersError);
      return [];
    }

    if (!users || users.length === 0) {
      const emptyRanking: RankingUser[] = [];
      setCachedRankingData(emptyRanking);
      return emptyRanking;
    }

    // Process users with batch caching for efficiency
    const batchCache = createBatchCacheOperation();
    
    const rankingUsers: RankingUser[] = users.map((user) => {
      try {
        // Safely parse start date
        let startDate: Date | null = null;
        if (user.challenge_start_date) {
          try {
            startDate = new Date(user.challenge_start_date);
            // Validate the parsed date
            if (isNaN(startDate.getTime())) {
              console.error(`Invalid start date for user ${user.user_id}:`, user.challenge_start_date);
              startDate = null;
            }
          } catch (dateError) {
            console.error(`Error parsing start date for user ${user.user_id}:`, dateError);
            startDate = null;
          }
        }
        
        // Calculate challenge progress with error handling
        const challengeProgress = calculateChallengeProgress(startDate);
        
        // Use total_points from the optimized view
        const totalPoints = user.total_points || 0;
        
        // Cache individual user data
        batchCache.setChallengeProgress(user.user_id, challengeProgress);
        batchCache.setUserPoints(user.user_id, totalPoints);
        
        return {
          id: user.user_id,
          name: user.nome || 'Usuário sem nome',
          avatar: user.foto_url,
          totalPoints,
          challengeStartDate: startDate,
          challengeProgress
        };
      } catch (userError) {
        console.error(`Error processing user ${user.user_id} for ranking:`, userError);
        
        // Return safe fallback for this user
        return {
          id: user.user_id,
          name: user.nome || 'Usuário sem nome',
          avatar: user.foto_url,
          totalPoints: 0,
          challengeStartDate: null,
          challengeProgress: {
            currentDay: 0,
            totalDays: 7,
            isCompleted: false,
            isNotStarted: true,
            daysRemaining: 7,
            progressPercentage: 0,
            displayText: 'Erro ao calcular progresso',
            hasError: true,
            errorMessage: 'Erro ao processar dados do usuário'
          }
        };
      }
    });

    // Execute batch cache operations
    batchCache.execute();
    
    // Data is already sorted by the database view
    const sortedRanking = rankingUsers.sort((a, b) => {
      const pointsA = a.totalPoints || 0;
      const pointsB = b.totalPoints || 0;
      return pointsB - pointsA;
    });
    
      // Cache the final ranking
      setCachedRankingData(sortedRanking);
      
      return sortedRanking;
    } catch (error) {
      console.error('Error getting ranking data:', error);
      return [];
    }
  });
}

/**
 * Record daily progress for a user's challenge day with cache invalidation
 * Requirements 5.1, 5.2, 5.3: Points persistence across days without reset
 * Requirement 4.3: Performance optimization with caching
 */
export async function recordDailyProgress(
  userId: string,
  challengeDay: number,
  tasksCompleted: Record<string, boolean>,
  pointsEarned: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        challenge_day: challengeDay,
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        tasks_completed: tasksCompleted,
        points_earned: pointsEarned
      }, {
        onConflict: 'user_id,challenge_day'
      });

    if (error) {
      throw new Error(`Failed to record daily progress: ${error.message}`);
    }
    
    // Invalidate cache after successful update
    invalidateUserCache(userId);
    invalidateRankingCache();
  } catch (error) {
    console.error('Error recording daily progress:', error);
    throw error;
  }
}

/**
 * Update daily progress while preserving cumulative points
 * Requirements 5.1, 5.2: Decouple task reset from points persistence
 */
export async function updateDailyProgress(
  userId: string,
  challengeDay: number,
  tasksCompleted: Record<string, boolean>,
  pointsEarned: number
): Promise<void> {
  try {
    // Get existing progress to preserve cumulative scoring
    const { data: existingProgress } = await supabase
      .from('daily_progress')
      .select('points_earned')
      .eq('user_id', userId)
      .eq('challenge_day', challengeDay)
      .single();

    // If this is an update to existing progress, preserve the points
    // Only update tasks_completed, keep points_earned intact unless explicitly changed
    const finalPointsEarned = existingProgress ? existingProgress.points_earned : pointsEarned;

    const { error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        challenge_day: challengeDay,
        date: new Date().toISOString().split('T')[0],
        tasks_completed: tasksCompleted,
        points_earned: finalPointsEarned
      }, {
        onConflict: 'user_id,challenge_day'
      });

    if (error) {
      throw new Error(`Failed to update daily progress: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating daily progress:', error);
    throw error;
  }
}

/**
 * Calculate total points across all challenge days for a user with caching
 * Requirements 5.4, 5.5: Cumulative scoring across all days
 * Requirement 4.3: Performance optimization with caching
 */
export async function calculateTotalChallengePoints(userId: string): Promise<number> {
  return timeAsync(OPERATIONS.CALCULATE_TOTAL_POINTS, async () => {
    try {
      // Check cache first
      const cachedPoints = getCachedUserPoints(userId);
      if (cachedPoints !== null) {
        return cachedPoints;
      }
      
      const { data, error } = await timeAsync(
        OPERATIONS.DATABASE_QUERY,
        () => supabase
          .from('daily_progress')
          .select('points_earned')
          .eq('user_id', userId),
        { table: 'daily_progress', operation: 'select', userId }
      );

      if (error) {
        throw new Error(`Failed to calculate total points: ${error.message}`);
      }

      if (!data || data.length === 0) {
        setCachedUserPoints(userId, 0);
        return 0;
      }

      // Sum all points earned across all challenge days
      const totalPoints = data.reduce((total, progress) => total + (progress.points_earned || 0), 0);
      
      // Cache the result
      setCachedUserPoints(userId, totalPoints);
      
      return totalPoints;
    } catch (error) {
      console.error('Error calculating total challenge points:', error);
      return 0;
    }
  }, { userId });
}

/**
 * Get points breakdown by challenge day
 * Requirement 5.3: Track points across all challenge days
 */
export async function getChallengePointsBreakdown(userId: string): Promise<Array<{
  challengeDay: number;
  pointsEarned: number;
  tasksCompleted: Record<string, boolean>;
  date: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('challenge_day, points_earned, tasks_completed, date')
      .eq('user_id', userId)
      .order('challenge_day', { ascending: true });

    if (error) {
      throw new Error(`Failed to get points breakdown: ${error.message}`);
    }

    return data?.map(progress => ({
      challengeDay: progress.challenge_day,
      pointsEarned: progress.points_earned || 0,
      tasksCompleted: progress.tasks_completed || {},
      date: progress.date
    })) || [];
  } catch (error) {
    console.error('Error getting challenge points breakdown:', error);
    return [];
  }
}

/**
 * Reset daily tasks without affecting points persistence
 * Requirements 5.1, 5.2: Decouple daily task reset from points persistence
 */
export async function resetDailyTasks(userId: string, challengeDay: number): Promise<void> {
  try {
    // Get current progress to preserve points
    const { data: currentProgress } = await supabase
      .from('daily_progress')
      .select('points_earned')
      .eq('user_id', userId)
      .eq('challenge_day', challengeDay)
      .single();

    // Reset tasks but keep points earned
    const { error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        challenge_day: challengeDay,
        date: new Date().toISOString().split('T')[0],
        tasks_completed: {}, // Reset all tasks to incomplete
        points_earned: currentProgress?.points_earned || 0 // Preserve existing points
      }, {
        onConflict: 'user_id,challenge_day'
      });

    if (error) {
      throw new Error(`Failed to reset daily tasks: ${error.message}`);
    }
  } catch (error) {
    console.error('Error resetting daily tasks:', error);
    throw error;
  }
}

/**
 * Add points to existing daily progress without resetting tasks
 * Requirements 5.1, 5.2: Points accumulation without task reset
 */
export async function addPointsToDay(
  userId: string,
  challengeDay: number,
  additionalPoints: number
): Promise<void> {
  try {
    // Get current progress
    const { data: currentProgress } = await supabase
      .from('daily_progress')
      .select('points_earned, tasks_completed')
      .eq('user_id', userId)
      .eq('challenge_day', challengeDay)
      .single();

    const currentPoints = currentProgress?.points_earned || 0;
    const currentTasks = currentProgress?.tasks_completed || {};

    // Update points while preserving tasks
    const { error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        challenge_day: challengeDay,
        date: new Date().toISOString().split('T')[0],
        tasks_completed: currentTasks, // Preserve current task state
        points_earned: currentPoints + additionalPoints // Add to existing points
      }, {
        onConflict: 'user_id,challenge_day'
      });

    if (error) {
      throw new Error(`Failed to add points: ${error.message}`);
    }
  } catch (error) {
    console.error('Error adding points to day:', error);
    throw error;
  }
}

/**
 * Get user's daily progress history
 * Requirement 5.3: Track progress across all challenge days
 */
export async function getUserDailyProgress(userId: string): Promise<DailyProgressData[]> {
  try {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .order('challenge_day', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch daily progress: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user daily progress:', error);
    return [];
  }
}

/**
 * Complete user's challenge by setting completion date with cache invalidation
 * Requirement 4.4: Mark challenge as completed
 * Requirement 4.3: Performance optimization with caching
 */
export async function completeChallenge(userId: string): Promise<void> {
  try {
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided');
    }
    
    // Use safe function to get completion date
    const completionDate = safeGetCurrentBrasiliaDate();
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        challenge_completed_at: completionDate.toISOString()
      })
      .eq('user_id', userId)
      .not('challenge_start_date', 'is', null)
      .is('challenge_completed_at', null);

    if (error) {
      throw new Error(`Failed to complete challenge: ${error.message}`);
    }
    
    // Invalidate cache after successful update
    invalidateUserCache(userId);
    invalidateRankingCache();
  } catch (error) {
    console.error('Error completing challenge:', error);
    
    // Provide user-friendly error message for timezone errors
    if (error instanceof TimezoneError || error instanceof InvalidDateError) {
      throw new Error(getTimezoneErrorMessage(error));
    }
    
    throw error;
  }
}

/**
 * Get total points earned by a user across all challenge days
 * Requirements 5.4, 5.5: Calculate cumulative points across all days
 */
export async function getUserTotalPoints(userId: string): Promise<number> {
  // Use the new cumulative calculation function
  return await calculateTotalChallengePoints(userId);
}

/**
 * Check if user has an active challenge
 * Requirement 4.5: Validate challenge state
 */
export async function hasActiveChallenge(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('challenge_start_date, challenge_completed_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to check challenge status: ${error.message}`);
    }

    return !!(data?.challenge_start_date && !data?.challenge_completed_at);
  } catch (error) {
    console.error('Error checking active challenge:', error);
    return false;
  }
}

/**
 * Sync challenge points with legacy points system
 * Requirements 5.1, 5.2: Maintain compatibility while ensuring points persistence
 */
export async function syncChallengePointsWithLegacy(userId: string): Promise<void> {
  try {
    // Get total challenge points
    const challengePoints = await calculateTotalChallengePoints(userId);
    
    // Get legacy points from pontuacoes table
    const { data: legacyPoints } = await supabase
      .from('pontuacoes')
      .select('pontuacao_total')
      .eq('user_id', userId)
      .single();

    const currentLegacyPoints = legacyPoints?.pontuacao_total || 0;
    
    // Update legacy system with combined points (legacy + challenge)
    const { error } = await supabase
      .from('pontuacoes')
      .upsert({
        user_id: userId,
        pontuacao_total: currentLegacyPoints + challengePoints,
        ultima_data_participacao: new Date().toISOString().split('T')[0]
      });

    if (error) {
      throw new Error(`Failed to sync points with legacy system: ${error.message}`);
    }
  } catch (error) {
    console.error('Error syncing challenge points with legacy:', error);
    throw error;
  }
}

/**
 * Get combined points from both legacy and challenge systems
 * Requirements 5.4, 5.5: Total points across all systems
 */
export async function getCombinedUserPoints(userId: string): Promise<{
  legacyPoints: number;
  challengePoints: number;
  totalPoints: number;
}> {
  try {
    // Get challenge points
    const challengePoints = await calculateTotalChallengePoints(userId);
    
    // Get legacy points
    const { data: legacyData } = await supabase
      .from('pontuacoes')
      .select('pontuacao_total')
      .eq('user_id', userId)
      .single();

    const legacyPoints = legacyData?.pontuacao_total || 0;
    
    return {
      legacyPoints,
      challengePoints,
      totalPoints: legacyPoints + challengePoints
    };
  } catch (error) {
    console.error('Error getting combined user points:', error);
    return {
      legacyPoints: 0,
      challengePoints: 0,
      totalPoints: 0
    };
  }
}