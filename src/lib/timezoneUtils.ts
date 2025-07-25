import { toZonedTime, format } from 'date-fns-tz';
import { startOfDay, differenceInDays, isValid } from 'date-fns';

// Constants
export const BRASILIA_TIMEZONE = 'America/Sao_Paulo';
export const CHALLENGE_DURATION_DAYS = 7;

// Error types for timezone operations
export class TimezoneError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'TimezoneError';
  }
}

export class InvalidDateError extends TimezoneError {
  constructor(date: unknown) {
    super(`Invalid date provided: ${date}`);
    this.name = 'InvalidDateError';
  }
}

/**
 * Validate if a value is a valid Date object
 */
function validateDate(date: unknown, paramName: string = 'date'): Date {
  if (!date) {
    throw new InvalidDateError(date);
  }
  
  if (!(date instanceof Date)) {
    throw new InvalidDateError(date);
  }
  
  if (!isValid(date)) {
    throw new InvalidDateError(date);
  }
  
  return date;
}

/**
 * Get current date and time in Brasília timezone
 * @throws {TimezoneError} When timezone conversion fails
 */
export function getCurrentBrasiliaDate(): Date {
  try {
    const now = new Date();
    return toZonedTime(now, BRASILIA_TIMEZONE);
  } catch (error) {
    throw new TimezoneError(
      'Failed to get current Brasília date',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Safe wrapper for getCurrentBrasiliaDate with fallback
 * @returns Current Brasília date or current system date as fallback
 */
export function safeGetCurrentBrasiliaDate(): Date {
  try {
    return getCurrentBrasiliaDate();
  } catch (error) {
    console.error('Error getting Brasília date, using system date as fallback:', error);
    return new Date();
  }
}

/**
 * Convert any date to Brasília timezone
 * @throws {InvalidDateError} When date is invalid
 * @throws {TimezoneError} When timezone conversion fails
 */
export function toBrasiliaDate(date: Date): Date {
  const validDate = validateDate(date, 'date');
  
  try {
    return toZonedTime(validDate, BRASILIA_TIMEZONE);
  } catch (error) {
    throw new TimezoneError(
      'Failed to convert date to Brasília timezone',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Safe wrapper for toBrasiliaDate with fallback
 * @param date Date to convert
 * @returns Brasília date or original date as fallback
 */
export function safeToBrasiliaDate(date: Date | null | undefined): Date | null {
  if (!date) {
    return null;
  }
  
  try {
    return toBrasiliaDate(date);
  } catch (error) {
    console.error('Error converting to Brasília date, using original date as fallback:', error);
    return date instanceof Date && isValid(date) ? date : null;
  }
}

/**
 * Get start of day (00:00:00) for a date in Brasília timezone
 * @throws {InvalidDateError} When date is invalid
 * @throws {TimezoneError} When timezone conversion fails
 */
export function getStartOfDayBrasilia(date: Date): Date {
  const brasiliaDate = toBrasiliaDate(date);
  
  try {
    return startOfDay(brasiliaDate);
  } catch (error) {
    throw new TimezoneError(
      'Failed to get start of day in Brasília timezone',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Safe wrapper for getStartOfDayBrasilia with fallback
 * @param date Date to get start of day for
 * @returns Start of day in Brasília or null if conversion fails
 */
export function safeGetStartOfDayBrasilia(date: Date | null | undefined): Date | null {
  if (!date) {
    return null;
  }
  
  try {
    return getStartOfDayBrasilia(date);
  } catch (error) {
    console.error('Error getting start of day in Brasília, using fallback:', error);
    // Fallback: try to get start of day with system timezone
    try {
      return startOfDay(date);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return null;
    }
  }
}

/**
 * Calculate number of complete days elapsed since a start date
 * Both dates are considered in Brasília timezone
 * @throws {InvalidDateError} When startDate is invalid
 * @throws {TimezoneError} When timezone conversion fails
 */
export function calculateDaysSinceStart(startDate: Date): number {
  const brasiliaStartDate = getStartOfDayBrasilia(startDate);
  const currentBrasiliaDate = getStartOfDayBrasilia(getCurrentBrasiliaDate());
  
  try {
    return differenceInDays(currentBrasiliaDate, brasiliaStartDate);
  } catch (error) {
    throw new TimezoneError(
      'Failed to calculate days since start',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Safe wrapper for calculateDaysSinceStart with fallback
 * @param startDate Date to calculate from
 * @returns Number of days elapsed or -1 if calculation fails
 */
export function safeCalculateDaysSinceStart(startDate: Date | null | undefined): number {
  if (!startDate) {
    return -1;
  }
  
  try {
    return calculateDaysSinceStart(startDate);
  } catch (error) {
    console.error('Error calculating days since start, using fallback calculation:', error);
    
    // Fallback: simple calculation without timezone conversion
    try {
      const now = new Date();
      const start = new Date(startDate);
      
      if (!isValid(start)) {
        return -1;
      }
      
      const diffTime = now.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (fallbackError) {
      console.error('Fallback calculation also failed:', fallbackError);
      return -1;
    }
  }
}

/**
 * Determine current challenge day (1-7) based on user start date
 * Returns 0 if challenge hasn't started, 1-7 for active days, 8+ if completed
 * @throws {InvalidDateError} When userStartDate is invalid
 * @throws {TimezoneError} When timezone calculations fail
 */
export function getChallengeDay(userStartDate: Date): number {
  const daysSinceStart = calculateDaysSinceStart(userStartDate);
  
  // Challenge starts the day after registration
  // daysSinceStart = 0 means same day as registration (not started)
  // daysSinceStart = 1 means day 1 of challenge
  // daysSinceStart = 7 means day 7 of challenge
  // daysSinceStart = 8+ means challenge completed
  
  if (daysSinceStart <= 0) {
    return 0; // Not started yet
  }
  
  return daysSinceStart;
}

/**
 * Safe wrapper for getChallengeDay with fallback
 * @param userStartDate Date when user started challenge
 * @returns Challenge day (0-8+) or 0 if calculation fails
 */
export function safeGetChallengeDay(userStartDate: Date | null | undefined): number {
  if (!userStartDate) {
    return 0;
  }
  
  try {
    return getChallengeDay(userStartDate);
  } catch (error) {
    console.error('Error calculating challenge day, using fallback:', error);
    
    // Fallback calculation
    const daysSinceStart = safeCalculateDaysSinceStart(userStartDate);
    
    if (daysSinceStart === -1) {
      return 0; // Error state, treat as not started
    }
    
    if (daysSinceStart <= 0) {
      return 0; // Not started yet
    }
    
    return daysSinceStart;
  }
}

/**
 * Check if the challenge has been completed (7 days passed)
 * @throws {InvalidDateError} When userStartDate is invalid
 * @throws {TimezoneError} When timezone calculations fail
 */
export function isChallengeCompleted(userStartDate: Date): boolean {
  const challengeDay = getChallengeDay(userStartDate);
  return challengeDay > CHALLENGE_DURATION_DAYS;
}

/**
 * Safe wrapper for isChallengeCompleted with fallback
 * @param userStartDate Date when user started challenge
 * @returns true if completed, false otherwise (including error cases)
 */
export function safeIsChallengeCompleted(userStartDate: Date | null | undefined): boolean {
  if (!userStartDate) {
    return false;
  }
  
  try {
    return isChallengeCompleted(userStartDate);
  } catch (error) {
    console.error('Error checking if challenge completed, using fallback:', error);
    
    const challengeDay = safeGetChallengeDay(userStartDate);
    return challengeDay > CHALLENGE_DURATION_DAYS;
  }
}

/**
 * Check if the challenge has not started yet
 * @throws {InvalidDateError} When userStartDate is invalid
 * @throws {TimezoneError} When timezone calculations fail
 */
export function isChallengeNotStarted(userStartDate: Date): boolean {
  const daysSinceStart = calculateDaysSinceStart(userStartDate);
  // Challenge hasn't started if we're still on the registration day or before
  return daysSinceStart <= 0;
}

/**
 * Safe wrapper for isChallengeNotStarted with fallback
 * @param userStartDate Date when user started challenge
 * @returns true if not started, false otherwise (including error cases)
 */
export function safeIsChallengeNotStarted(userStartDate: Date | null | undefined): boolean {
  if (!userStartDate) {
    return true;
  }
  
  try {
    return isChallengeNotStarted(userStartDate);
  } catch (error) {
    console.error('Error checking if challenge not started, using fallback:', error);
    
    const daysSinceStart = safeCalculateDaysSinceStart(userStartDate);
    
    if (daysSinceStart === -1) {
      return true; // Error state, treat as not started
    }
    
    return daysSinceStart <= 0;
  }
}

/**
 * Format date in Brazilian Portuguese using Brasília timezone
 * @throws {InvalidDateError} When date is invalid
 * @throws {TimezoneError} When timezone conversion or formatting fails
 */
export function formatBrasiliaDate(date: Date, formatString: string): string {
  const brasiliaDate = toBrasiliaDate(date);
  
  try {
    return format(brasiliaDate, formatString, { timeZone: BRASILIA_TIMEZONE });
  } catch (error) {
    throw new TimezoneError(
      'Failed to format date in Brasília timezone',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Safe wrapper for formatBrasiliaDate with fallback
 * @param date Date to format
 * @param formatString Format string
 * @returns Formatted date string or fallback format
 */
export function safeFormatBrasiliaDate(
  date: Date | null | undefined, 
  formatString: string
): string {
  if (!date) {
    return 'Data inválida';
  }
  
  try {
    return formatBrasiliaDate(date, formatString);
  } catch (error) {
    console.error('Error formatting Brasília date, using fallback:', error);
    
    // Fallback: try to format with system timezone
    try {
      if (isValid(date)) {
        return format(date, formatString);
      } else {
        return 'Data inválida';
      }
    } catch (fallbackError) {
      console.error('Fallback formatting also failed:', fallbackError);
      return date.toLocaleDateString('pt-BR');
    }
  }
}

/**
 * Get user-friendly error message for timezone-related errors
 * @param error The error that occurred
 * @returns User-friendly error message in Portuguese
 */
export function getTimezoneErrorMessage(error: unknown): string {
  if (error instanceof InvalidDateError) {
    return 'Data inválida fornecida. Verifique se a data está no formato correto.';
  }
  
  if (error instanceof TimezoneError) {
    return 'Erro ao processar horário de Brasília. Tente recarregar a página.';
  }
  
  return 'Erro inesperado ao calcular datas. Tente novamente em alguns instantes.';
}

/**
 * Comprehensive safe challenge progress calculation
 * This function handles all edge cases and provides fallback values
 * @param userStartDate Date when user started challenge (can be null/undefined)
 * @returns Safe challenge progress data
 */
export function safeCalculateChallengeProgress(userStartDate: Date | null | undefined): {
  currentDay: number;
  isCompleted: boolean;
  isNotStarted: boolean;
  hasError: boolean;
  errorMessage?: string;
} {
  try {
    // Handle null/undefined case
    if (!userStartDate) {
      return {
        currentDay: 0,
        isCompleted: false,
        isNotStarted: true,
        hasError: false
      };
    }
    
    // Validate date
    if (!(userStartDate instanceof Date) || !isValid(userStartDate)) {
      return {
        currentDay: 0,
        isCompleted: false,
        isNotStarted: true,
        hasError: true,
        errorMessage: 'Data de início inválida'
      };
    }
    
    // Use safe functions for calculations
    const currentDay = safeGetChallengeDay(userStartDate);
    const isCompleted = safeIsChallengeCompleted(userStartDate);
    const isNotStarted = safeIsChallengeNotStarted(userStartDate);
    
    return {
      currentDay,
      isCompleted,
      isNotStarted,
      hasError: false
    };
  } catch (error) {
    console.error('Error in safeCalculateChallengeProgress:', error);
    
    return {
      currentDay: 0,
      isCompleted: false,
      isNotStarted: true,
      hasError: true,
      errorMessage: getTimezoneErrorMessage(error)
    };
  }
}