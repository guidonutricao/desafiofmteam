import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateChallengeProgress } from '../useChallengeProgress';
import * as timezoneUtils from '../../lib/timezoneUtils';

// Mock the timezone utilities
vi.mock('../../lib/timezoneUtils');

const mockSafeGetChallengeDay = vi.mocked(timezoneUtils.safeGetChallengeDay);
const mockSafeIsChallengeCompleted = vi.mocked(timezoneUtils.safeIsChallengeCompleted);
const mockSafeIsChallengeNotStarted = vi.mocked(timezoneUtils.safeIsChallengeNotStarted);
const mockSafeCalculateChallengeProgress = vi.mocked(timezoneUtils.safeCalculateChallengeProgress);

describe('calculateChallengeProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when userStartDate is null', () => {
    it('should return not started state', () => {
      const result = calculateChallengeProgress(null);

      expect(result).toEqual({
        currentDay: 0,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: true,
        daysRemaining: 7,
        progressPercentage: 0,
        displayText: 'Desafio Shape Express - Não iniciado',
        hasError: false
      });
    });
  });

  describe('when challenge has not started', () => {
    it('should return "inicia amanhã" state', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockSafeCalculateChallengeProgress.mockReturnValue({
        currentDay: 0,
        isCompleted: false,
        isNotStarted: true,
        hasError: false
      });
      
      mockSafeGetChallengeDay.mockReturnValue(0);
      mockSafeIsChallengeCompleted.mockReturnValue(false);
      mockSafeIsChallengeNotStarted.mockReturnValue(true);

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 0,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: true,
        daysRemaining: 7,
        progressPercentage: 0,
        displayText: 'Desafio Shape Express - Inicia amanhã',
        hasError: false
      });
    });
  });

  describe('when challenge is in progress', () => {
    it('should return correct progress for day 1', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockSafeCalculateChallengeProgress.mockReturnValue({
        currentDay: 1,
        isCompleted: false,
        isNotStarted: false,
        hasError: false
      });
      
      mockSafeGetChallengeDay.mockReturnValue(1);
      mockSafeIsChallengeCompleted.mockReturnValue(false);
      mockSafeIsChallengeNotStarted.mockReturnValue(false);

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 1,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: false,
        daysRemaining: 6,
        progressPercentage: 14.29,
        displayText: 'Desafio Shape Express - Dia 1/7',
        hasError: false
      });
    });

    it('should return correct progress for day 3', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockSafeCalculateChallengeProgress.mockReturnValue({
        currentDay: 3,
        isCompleted: false,
        isNotStarted: false,
        hasError: false
      });
      
      mockSafeGetChallengeDay.mockReturnValue(3);
      mockSafeIsChallengeCompleted.mockReturnValue(false);
      mockSafeIsChallengeNotStarted.mockReturnValue(false);

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 3,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: false,
        daysRemaining: 4,
        progressPercentage: 42.86,
        displayText: 'Desafio Shape Express - Dia 3/7',
        hasError: false
      });
    });

    it('should return correct progress for day 7', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockSafeCalculateChallengeProgress.mockReturnValue({
        currentDay: 7,
        isCompleted: false,
        isNotStarted: false,
        hasError: false
      });
      
      mockSafeGetChallengeDay.mockReturnValue(7);
      mockSafeIsChallengeCompleted.mockReturnValue(false);
      mockSafeIsChallengeNotStarted.mockReturnValue(false);

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 7,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: false,
        daysRemaining: 0,
        progressPercentage: 100,
        displayText: 'Desafio Shape Express - Dia 7/7',
        hasError: false
      });
    });
  });

  describe('when challenge is completed', () => {
    it('should return completed state', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockSafeCalculateChallengeProgress.mockReturnValue({
        currentDay: 8,
        isCompleted: true,
        isNotStarted: false,
        hasError: false
      });
      
      mockSafeGetChallengeDay.mockReturnValue(8);
      mockSafeIsChallengeCompleted.mockReturnValue(true);
      mockSafeIsChallengeNotStarted.mockReturnValue(false);

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 7,
        totalDays: 7,
        isCompleted: true,
        isNotStarted: false,
        daysRemaining: 0,
        progressPercentage: 100,
        displayText: 'Desafio Shape Express - Concluído',
        hasError: false
      });
    });
  });

  describe('error handling', () => {
    it('should return error fallback state when timezone utils throw error', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockSafeGetChallengeDay.mockImplementation(() => {
        throw new Error('Timezone calculation error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = calculateChallengeProgress(startDate);

      expect(result.currentDay).toBe(0);
      expect(result.totalDays).toBe(7);
      expect(result.isCompleted).toBe(false);
      expect(result.isNotStarted).toBe(true);
      expect(result.daysRemaining).toBe(7);
      expect(result.progressPercentage).toBe(0);
      expect(result.displayText).toBe('Erro ao calcular progresso');
      expect(result.hasError).toBe(true);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in calculateChallengeProgress:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle safe calculation errors gracefully', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      // Mock safeCalculateChallengeProgress to return error state
      const mockSafeCalculate = vi.spyOn(timezoneUtils, 'safeCalculateChallengeProgress');
      mockSafeCalculate.mockReturnValue({
        currentDay: 0,
        isCompleted: false,
        isNotStarted: true,
        hasError: true,
        errorMessage: 'Data de início inválida'
      });

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 0,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: true,
        daysRemaining: 7,
        progressPercentage: 0,
        displayText: 'Erro ao calcular progresso',
        hasError: true,
        errorMessage: 'Data de início inválida'
      });

      mockSafeCalculate.mockRestore();
    });

    it('should handle invalid date objects', () => {
      const invalidDate = new Date('invalid');
      
      const result = calculateChallengeProgress(invalidDate);

      expect(result.hasError).toBe(true);
      expect(result.displayText).toBe('Erro ao calcular progresso');
      expect(result.currentDay).toBe(0);
      expect(result.isNotStarted).toBe(true);
    });

    it('should handle error states correctly', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockSafeGetChallengeDay.mockImplementation(() => {
        throw new Error('Calculation error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = calculateChallengeProgress(startDate);

      expect(result.hasError).toBe(true);
      expect(result.displayText).toBe('Erro ao calcular progresso');

      consoleSpy.mockRestore();
    });
  });

  describe('consistent behavior', () => {
    it('should return consistent results for same input', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockSafeCalculateChallengeProgress.mockReturnValue({
        currentDay: 3,
        isCompleted: false,
        isNotStarted: false,
        hasError: false
      });
      
      mockSafeGetChallengeDay.mockReturnValue(3);
      mockSafeIsChallengeCompleted.mockReturnValue(false);
      mockSafeIsChallengeNotStarted.mockReturnValue(false);

      const firstResult = calculateChallengeProgress(startDate);
      const secondResult = calculateChallengeProgress(startDate);

      expect(firstResult).toEqual(secondResult);
    });

    it('should return different results for different input', () => {
      const startDate1 = new Date('2024-01-01T00:00:00-03:00');
      const startDate2 = new Date('2024-01-02T00:00:00-03:00');
      
      mockSafeCalculateChallengeProgress.mockReturnValueOnce({
        currentDay: 3,
        isCompleted: false,
        isNotStarted: false,
        hasError: false
      });
      
      mockSafeGetChallengeDay.mockReturnValueOnce(3);
      mockSafeIsChallengeCompleted.mockReturnValueOnce(false);
      mockSafeIsChallengeNotStarted.mockReturnValueOnce(false);

      const firstResult = calculateChallengeProgress(startDate1);

      mockSafeCalculateChallengeProgress.mockReturnValueOnce({
        currentDay: 2,
        isCompleted: false,
        isNotStarted: false,
        hasError: false
      });
      
      mockSafeGetChallengeDay.mockReturnValueOnce(2);
      mockSafeIsChallengeCompleted.mockReturnValueOnce(false);
      mockSafeIsChallengeNotStarted.mockReturnValueOnce(false);

      const secondResult = calculateChallengeProgress(startDate2);

      expect(firstResult.currentDay).not.toBe(secondResult.currentDay);
    });
  });

  describe('edge cases', () => {
    it('should handle very large challenge day numbers', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockSafeCalculateChallengeProgress.mockReturnValue({
        currentDay: 100,
        isCompleted: true,
        isNotStarted: false,
        hasError: false
      });
      
      mockSafeGetChallengeDay.mockReturnValue(100);
      mockSafeIsChallengeCompleted.mockReturnValue(true);
      mockSafeIsChallengeNotStarted.mockReturnValue(false);

      const result = calculateChallengeProgress(startDate);

      expect(result.currentDay).toBe(7); // Should cap at 7
      expect(result.isCompleted).toBe(true);
      expect(result.displayText).toBe('Desafio Shape Express - Concluído');
    });

    it('should handle negative challenge day numbers', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockSafeCalculateChallengeProgress.mockReturnValue({
        currentDay: -1,
        isCompleted: false,
        isNotStarted: true,
        hasError: false
      });
      
      mockSafeGetChallengeDay.mockReturnValue(-1);
      mockSafeIsChallengeCompleted.mockReturnValue(false);
      mockSafeIsChallengeNotStarted.mockReturnValue(true);

      const result = calculateChallengeProgress(startDate);

      expect(result.currentDay).toBe(0);
      expect(result.isNotStarted).toBe(true);
      expect(result.displayText).toBe('Desafio Shape Express - Inicia amanhã');
    });
  });
});