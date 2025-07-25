import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateChallengeProgress } from '../useChallengeProgress';
import * as timezoneUtils from '../../lib/timezoneUtils';

// Mock the timezone utilities
vi.mock('../../lib/timezoneUtils');

const mockGetChallengeDay = vi.mocked(timezoneUtils.getChallengeDay);
const mockIsChallengeCompleted = vi.mocked(timezoneUtils.isChallengeCompleted);
const mockIsChallengeNotStarted = vi.mocked(timezoneUtils.isChallengeNotStarted);

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
        displayText: 'Desafio Shape Express - Não iniciado'
      });
    });
  });

  describe('when challenge has not started', () => {
    it('should return "inicia amanhã" state', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockGetChallengeDay.mockReturnValue(0);
      mockIsChallengeCompleted.mockReturnValue(false);
      mockIsChallengeNotStarted.mockReturnValue(true);

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 0,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: true,
        daysRemaining: 7,
        progressPercentage: 0,
        displayText: 'Desafio Shape Express - Inicia amanhã'
      });
    });
  });

  describe('when challenge is in progress', () => {
    it('should return correct progress for day 1', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockGetChallengeDay.mockReturnValue(1);
      mockIsChallengeCompleted.mockReturnValue(false);
      mockIsChallengeNotStarted.mockReturnValue(false);

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 1,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: false,
        daysRemaining: 6,
        progressPercentage: 14.29,
        displayText: 'Desafio Shape Express - Dia 1/7'
      });
    });

    it('should return correct progress for day 3', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockGetChallengeDay.mockReturnValue(3);
      mockIsChallengeCompleted.mockReturnValue(false);
      mockIsChallengeNotStarted.mockReturnValue(false);

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 3,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: false,
        daysRemaining: 4,
        progressPercentage: 42.86,
        displayText: 'Desafio Shape Express - Dia 3/7'
      });
    });

    it('should return correct progress for day 7', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockGetChallengeDay.mockReturnValue(7);
      mockIsChallengeCompleted.mockReturnValue(false);
      mockIsChallengeNotStarted.mockReturnValue(false);

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 7,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: false,
        daysRemaining: 0,
        progressPercentage: 100,
        displayText: 'Desafio Shape Express - Dia 7/7'
      });
    });
  });

  describe('when challenge is completed', () => {
    it('should return completed state', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockGetChallengeDay.mockReturnValue(8);
      mockIsChallengeCompleted.mockReturnValue(true);
      mockIsChallengeNotStarted.mockReturnValue(false);

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 7,
        totalDays: 7,
        isCompleted: true,
        isNotStarted: false,
        daysRemaining: 0,
        progressPercentage: 100,
        displayText: 'Desafio Shape Express - Concluído'
      });
    });
  });

  describe('error handling', () => {
    it('should return error fallback state when timezone utils throw error', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockGetChallengeDay.mockImplementation(() => {
        throw new Error('Timezone calculation error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = calculateChallengeProgress(startDate);

      expect(result).toEqual({
        currentDay: 0,
        totalDays: 7,
        isCompleted: false,
        isNotStarted: true,
        daysRemaining: 7,
        progressPercentage: 0,
        displayText: 'Erro ao calcular progresso'
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in calculateChallengeProgress:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('consistent behavior', () => {
    it('should return consistent results for same input', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockGetChallengeDay.mockReturnValue(3);
      mockIsChallengeCompleted.mockReturnValue(false);
      mockIsChallengeNotStarted.mockReturnValue(false);

      const firstResult = calculateChallengeProgress(startDate);
      const secondResult = calculateChallengeProgress(startDate);

      expect(firstResult).toEqual(secondResult);
    });

    it('should return different results for different input', () => {
      const startDate1 = new Date('2024-01-01T00:00:00-03:00');
      const startDate2 = new Date('2024-01-02T00:00:00-03:00');
      
      mockGetChallengeDay.mockReturnValueOnce(3);
      mockIsChallengeCompleted.mockReturnValueOnce(false);
      mockIsChallengeNotStarted.mockReturnValueOnce(false);

      const firstResult = calculateChallengeProgress(startDate1);

      mockGetChallengeDay.mockReturnValueOnce(2);
      mockIsChallengeCompleted.mockReturnValueOnce(false);
      mockIsChallengeNotStarted.mockReturnValueOnce(false);

      const secondResult = calculateChallengeProgress(startDate2);

      expect(firstResult.currentDay).not.toBe(secondResult.currentDay);
    });
  });

  describe('edge cases', () => {
    it('should handle very large challenge day numbers', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockGetChallengeDay.mockReturnValue(100);
      mockIsChallengeCompleted.mockReturnValue(true);
      mockIsChallengeNotStarted.mockReturnValue(false);

      const result = calculateChallengeProgress(startDate);

      expect(result.currentDay).toBe(7); // Should cap at 7
      expect(result.isCompleted).toBe(true);
      expect(result.displayText).toBe('Desafio Shape Express - Concluído');
    });

    it('should handle negative challenge day numbers', () => {
      const startDate = new Date('2024-01-01T00:00:00-03:00');
      
      mockGetChallengeDay.mockReturnValue(-1);
      mockIsChallengeCompleted.mockReturnValue(false);
      mockIsChallengeNotStarted.mockReturnValue(true);

      const result = calculateChallengeProgress(startDate);

      expect(result.currentDay).toBe(0);
      expect(result.isNotStarted).toBe(true);
      expect(result.displayText).toBe('Desafio Shape Express - Inicia amanhã');
    });
  });
});