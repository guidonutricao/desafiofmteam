import { useMemo } from 'react';
import {
  safeCalculateChallengeProgress,
  safeGetChallengeDay,
  safeIsChallengeCompleted,
  safeIsChallengeNotStarted,
  getTimezoneErrorMessage,
  CHALLENGE_DURATION_DAYS
} from '../lib/timezoneUtils';

export interface ChallengeProgress {
  currentDay: number;
  totalDays: number;
  isCompleted: boolean;
  isNotStarted: boolean;
  daysRemaining: number;
  progressPercentage: number;
  displayText: string;
  hasError: boolean;
  errorMessage?: string;
}

/**
 * Pure function to calculate challenge progress with comprehensive error handling
 * This function contains the core business logic and can be tested independently
 * 
 * @param userStartDate - The date when user registered for the challenge (can be null)
 * @returns ChallengeProgress object with current progress information
 */
export function calculateChallengeProgress(userStartDate: Date | null): ChallengeProgress {
  try {
    // Use safe calculation function for initial validation
    const safeProgress = safeCalculateChallengeProgress(userStartDate);
    
    // Handle case where user hasn't started challenge yet
    if (!userStartDate) {
      return {
        currentDay: 0,
        totalDays: CHALLENGE_DURATION_DAYS,
        isCompleted: false,
        isNotStarted: true,
        daysRemaining: CHALLENGE_DURATION_DAYS,
        progressPercentage: 0,
        displayText: 'Desafio Shape Express - Não iniciado',
        hasError: false
      };
    }

    // Handle error cases from safe calculation
    if (safeProgress.hasError) {
      return {
        currentDay: 0,
        totalDays: CHALLENGE_DURATION_DAYS,
        isCompleted: false,
        isNotStarted: true,
        daysRemaining: CHALLENGE_DURATION_DAYS,
        progressPercentage: 0,
        displayText: 'Erro ao calcular progresso',
        hasError: true,
        errorMessage: safeProgress.errorMessage
      };
    }

    // Use safe functions for all calculations
    const currentDay = safeGetChallengeDay(userStartDate);
    const isCompleted = safeIsChallengeCompleted(userStartDate);
    const isNotStarted = safeIsChallengeNotStarted(userStartDate);

    // Calculate progress values
    let displayCurrentDay: number;
    let daysRemaining: number;
    let progressPercentage: number;
    let displayText: string;

    if (isNotStarted) {
      // Challenge hasn't started yet (still on registration day)
      displayCurrentDay = 0;
      daysRemaining = CHALLENGE_DURATION_DAYS;
      progressPercentage = 0;
      displayText = 'Desafio Shape Express - Inicia amanhã';
    } else if (isCompleted) {
      // Challenge completed (more than 7 days)
      displayCurrentDay = CHALLENGE_DURATION_DAYS;
      daysRemaining = 0;
      progressPercentage = 100;
      displayText = 'Desafio Shape Express - Concluído';
    } else {
      // Challenge in progress (days 1-7)
      displayCurrentDay = Math.min(Math.max(currentDay, 0), CHALLENGE_DURATION_DAYS);
      daysRemaining = Math.max(0, CHALLENGE_DURATION_DAYS - currentDay);
      progressPercentage = (displayCurrentDay / CHALLENGE_DURATION_DAYS) * 100;
      displayText = `Desafio Shape Express - Dia ${displayCurrentDay}/${CHALLENGE_DURATION_DAYS}`;
    }

    return {
      currentDay: displayCurrentDay,
      totalDays: CHALLENGE_DURATION_DAYS,
      isCompleted,
      isNotStarted,
      daysRemaining,
      progressPercentage: Math.round(progressPercentage * 100) / 100, // Round to 2 decimal places
      displayText,
      hasError: false
    };
  } catch (error) {
    // Error handling: return safe fallback state with error information
    console.error('Error in calculateChallengeProgress:', error);
    
    const errorMessage = getTimezoneErrorMessage(error);
    
    return {
      currentDay: 0,
      totalDays: CHALLENGE_DURATION_DAYS,
      isCompleted: false,
      isNotStarted: true,
      daysRemaining: CHALLENGE_DURATION_DAYS,
      progressPercentage: 0,
      displayText: 'Erro ao calcular progresso',
      hasError: true,
      errorMessage
    };
  }
}

/**
 * Hook to calculate and provide challenge progress information
 * Based on user's challenge start date and current Brasília time
 * 
 * @param userStartDate - The date when user registered for the challenge (can be null)
 * @returns ChallengeProgress object with current progress information
 */
export function useChallengeProgress(userStartDate: Date | null): ChallengeProgress {
  return useMemo(() => calculateChallengeProgress(userStartDate), [userStartDate]);
}