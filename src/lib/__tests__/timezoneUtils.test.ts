import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCurrentBrasiliaDate,
  toBrasiliaDate,
  getStartOfDayBrasilia,
  calculateDaysSinceStart,
  getChallengeDay,
  isChallengeCompleted,
  isChallengeNotStarted,
  formatBrasiliaDate,
  BRASILIA_TIMEZONE,
  CHALLENGE_DURATION_DAYS
} from '../timezoneUtils';

describe('timezoneUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constants', () => {
    it('should have correct timezone constant', () => {
      expect(BRASILIA_TIMEZONE).toBe('America/Sao_Paulo');
    });

    it('should have correct challenge duration', () => {
      expect(CHALLENGE_DURATION_DAYS).toBe(7);
    });
  });

  describe('getCurrentBrasiliaDate', () => {
    it('should return current date in Brasília timezone', () => {
      // Mock current date to January 5, 2024 at 12:00 PM Brasília time
      const mockDate = new Date('2024-01-05T15:00:00.000Z'); // 12:00 PM in Brasília (UTC-3)
      vi.setSystemTime(mockDate);

      const brasiliaDate = getCurrentBrasiliaDate();
      expect(brasiliaDate).toBeInstanceOf(Date);
      // The date should be converted to Brasília timezone
      expect(brasiliaDate.getFullYear()).toBe(2024);
      expect(brasiliaDate.getMonth()).toBe(0); // January
      expect(brasiliaDate.getDate()).toBe(5);
    });

    it('should handle UTC midnight correctly', () => {
      // UTC midnight should be 9 PM previous day in Brasília (UTC-3)
      const mockDate = new Date('2024-01-05T00:00:00.000Z');
      vi.setSystemTime(mockDate);

      const brasiliaDate = getCurrentBrasiliaDate();
      expect(brasiliaDate.getDate()).toBe(4); // Previous day in Brasília
      expect(brasiliaDate.getHours()).toBe(21); // 9 PM
    });

    it('should handle Brasília midnight correctly', () => {
      // 3 AM UTC should be midnight in Brasília
      const mockDate = new Date('2024-01-05T03:00:00.000Z');
      vi.setSystemTime(mockDate);

      const brasiliaDate = getCurrentBrasiliaDate();
      expect(brasiliaDate.getDate()).toBe(5);
      expect(brasiliaDate.getHours()).toBe(0); // Midnight
    });
  });

  describe('toBrasiliaDate', () => {
    it('should convert UTC date to Brasília timezone', () => {
      const utcDate = new Date('2024-01-05T15:00:00.000Z'); // 3 PM UTC
      const brasiliaDate = toBrasiliaDate(utcDate);
      
      expect(brasiliaDate.getDate()).toBe(5);
      expect(brasiliaDate.getHours()).toBe(12); // 12 PM in Brasília (UTC-3)
    });

    it('should handle date with different timezone', () => {
      const easternDate = new Date('2024-01-05T10:00:00-05:00'); // 10 AM Eastern (UTC-5)
      const brasiliaDate = toBrasiliaDate(easternDate);
      
      expect(brasiliaDate.getDate()).toBe(5);
      expect(brasiliaDate.getHours()).toBe(12); // 12 PM in Brasília
    });

    it('should handle cross-day conversion', () => {
      const lateUtcDate = new Date('2024-01-05T01:00:00.000Z'); // 1 AM UTC
      const brasiliaDate = toBrasiliaDate(lateUtcDate);
      
      expect(brasiliaDate.getDate()).toBe(4); // Previous day in Brasília
      expect(brasiliaDate.getHours()).toBe(22); // 10 PM
    });
  });

  describe('getStartOfDayBrasilia', () => {
    it('should return start of day in Brasília timezone', () => {
      const date = new Date('2024-01-05T15:30:45.123Z'); // Afternoon UTC
      const startOfDay = getStartOfDayBrasilia(date);
      
      expect(startOfDay.getHours()).toBe(0);
      expect(startOfDay.getMinutes()).toBe(0);
      expect(startOfDay.getSeconds()).toBe(0);
      expect(startOfDay.getMilliseconds()).toBe(0);
    });

    it('should handle midnight edge case', () => {
      const midnightUtc = new Date('2024-01-05T03:00:00.000Z'); // Midnight in Brasília
      const startOfDay = getStartOfDayBrasilia(midnightUtc);
      
      expect(startOfDay.getDate()).toBe(5);
      expect(startOfDay.getHours()).toBe(0);
    });

    it('should handle late night edge case', () => {
      const lateNight = new Date('2024-01-05T02:59:59.999Z'); // Just before midnight in Brasília
      const startOfDay = getStartOfDayBrasilia(lateNight);
      
      expect(startOfDay.getDate()).toBe(4); // Previous day
      expect(startOfDay.getHours()).toBe(0);
    });
  });

  describe('calculateDaysSinceStart', () => {
    beforeEach(() => {
      // Mock current date to January 5, 2024 at 12:00 PM Brasília time
      const mockDate = new Date('2024-01-05T15:00:00.000Z'); // 12:00 PM in Brasília (UTC-3)
      vi.setSystemTime(mockDate);
    });

    it('should return 0 for same day registration', () => {
      const startDate = new Date('2024-01-05T10:00:00-03:00'); // Same day, earlier time
      const daysSince = calculateDaysSinceStart(startDate);
      expect(daysSince).toBe(0);
    });

    it('should return 1 for registration yesterday', () => {
      const startDate = new Date('2024-01-04T10:00:00-03:00'); // Yesterday
      const daysSince = calculateDaysSinceStart(startDate);
      expect(daysSince).toBe(1);
    });

    it('should return 7 for registration 7 days ago', () => {
      const startDate = new Date('2023-12-29T10:00:00-03:00'); // 7 days ago
      const daysSince = calculateDaysSinceStart(startDate);
      expect(daysSince).toBe(7);
    });

    it('should handle midnight transition correctly', () => {
      // Set current time to just after midnight in Brasília
      const justAfterMidnight = new Date('2024-01-05T03:01:00.000Z'); // 00:01 in Brasília
      vi.setSystemTime(justAfterMidnight);

      const startDate = new Date('2024-01-04T23:59:00-03:00'); // Yesterday, just before midnight
      const daysSince = calculateDaysSinceStart(startDate);
      expect(daysSince).toBe(1);
    });

    it('should handle registration at midnight', () => {
      const startDate = new Date('2024-01-04T03:00:00.000Z'); // Midnight in Brasília (3 AM UTC)
      const daysSince = calculateDaysSinceStart(startDate);
      expect(daysSince).toBe(1);
    });

    it('should handle future dates correctly', () => {
      const futureDate = new Date('2024-01-06T10:00:00-03:00'); // Tomorrow
      const daysSince = calculateDaysSinceStart(futureDate);
      expect(daysSince).toBe(-1);
    });

    it('should handle different input timezone formats', () => {
      // UTC format
      const utcDate = new Date('2024-01-04T13:00:00.000Z'); // 10 AM in Brasília
      const daysSinceUtc = calculateDaysSinceStart(utcDate);
      expect(daysSinceUtc).toBe(1);

      // Brasília format
      const brasiliaDate = new Date('2024-01-04T10:00:00-03:00');
      const daysSinceBrasilia = calculateDaysSinceStart(brasiliaDate);
      expect(daysSinceBrasilia).toBe(1);

      // Should be the same result
      expect(daysSinceUtc).toBe(daysSinceBrasilia);
    });
  });

  describe('getChallengeDay', () => {
    beforeEach(() => {
      // Mock current date to January 5, 2024 at 12:00 PM Brasília time
      const mockDate = new Date('2024-01-05T15:00:00.000Z'); // 12:00 PM in Brasília (UTC-3)
      vi.setSystemTime(mockDate);
    });

    it('should return 0 for same day registration (not started)', () => {
      const startDate = new Date('2024-01-05T10:00:00-03:00'); // Same day
      const challengeDay = getChallengeDay(startDate);
      expect(challengeDay).toBe(0);
    });

    it('should return 1 for day 1 of challenge (registered yesterday)', () => {
      const startDate = new Date('2024-01-04T10:00:00-03:00'); // Yesterday
      const challengeDay = getChallengeDay(startDate);
      expect(challengeDay).toBe(1);
    });

    it('should return 7 for day 7 of challenge', () => {
      const startDate = new Date('2023-12-29T10:00:00-03:00'); // 7 days ago
      const challengeDay = getChallengeDay(startDate);
      expect(challengeDay).toBe(7);
    });

    it('should return 8 for completed challenge', () => {
      const startDate = new Date('2023-12-28T10:00:00-03:00'); // 8 days ago
      const challengeDay = getChallengeDay(startDate);
      expect(challengeDay).toBe(8);
    });

    it('should handle midnight edge cases', () => {
      // Set current time to just after midnight on day 2
      const justAfterMidnight = new Date('2024-01-05T03:01:00.000Z'); // 00:01 in Brasília
      vi.setSystemTime(justAfterMidnight);

      const startDate = new Date('2024-01-03T23:59:00-03:00'); // 2 days ago, just before midnight
      const challengeDay = getChallengeDay(startDate);
      expect(challengeDay).toBe(2);
    });

    it('should handle registration exactly at midnight', () => {
      const startDate = new Date('2024-01-04T03:00:00.000Z'); // Midnight in Brasília (3 AM UTC)
      const challengeDay = getChallengeDay(startDate);
      expect(challengeDay).toBe(1);
    });

    it('should handle future registration dates', () => {
      const futureDate = new Date('2024-01-06T10:00:00-03:00'); // Tomorrow
      const challengeDay = getChallengeDay(futureDate);
      expect(challengeDay).toBe(0); // Not started
    });

    it('should handle very old registration dates', () => {
      const oldDate = new Date('2023-12-01T10:00:00-03:00'); // 35 days ago
      const challengeDay = getChallengeDay(oldDate);
      expect(challengeDay).toBe(35); // Way past completion
    });
  });

  describe('isChallengeCompleted', () => {
    beforeEach(() => {
      // Mock current date to January 5, 2024 at 12:00 PM Brasília time
      const mockDate = new Date('2024-01-05T15:00:00.000Z'); // 12:00 PM in Brasília (UTC-3)
      vi.setSystemTime(mockDate);
    });

    it('should return false for not started challenge', () => {
      const startDate = new Date('2024-01-05T10:00:00-03:00'); // Same day
      expect(isChallengeCompleted(startDate)).toBe(false);
    });

    it('should return false for active challenge (day 1)', () => {
      const startDate = new Date('2024-01-04T10:00:00-03:00'); // Yesterday (day 1)
      expect(isChallengeCompleted(startDate)).toBe(false);
    });

    it('should return false for active challenge (day 7)', () => {
      const startDate = new Date('2023-12-29T10:00:00-03:00'); // 7 days ago (day 7)
      expect(isChallengeCompleted(startDate)).toBe(false);
    });

    it('should return true for completed challenge (day 8)', () => {
      const startDate = new Date('2023-12-28T10:00:00-03:00'); // 8 days ago
      expect(isChallengeCompleted(startDate)).toBe(true);
    });

    it('should return true for long completed challenge', () => {
      const startDate = new Date('2023-12-01T10:00:00-03:00'); // 35 days ago
      expect(isChallengeCompleted(startDate)).toBe(true);
    });

    it('should handle midnight completion edge case', () => {
      // Set current time to just after midnight on day 8
      const justAfterMidnight = new Date('2024-01-05T03:01:00.000Z'); // 00:01 in Brasília
      vi.setSystemTime(justAfterMidnight);

      const startDate = new Date('2023-12-28T10:00:00-03:00'); // 8 days ago
      expect(isChallengeCompleted(startDate)).toBe(true);
    });

    it('should handle completion exactly at midnight', () => {
      // Set current time to exactly midnight on day 8
      const exactMidnight = new Date('2024-01-05T03:00:00.000Z'); // 00:00 in Brasília
      vi.setSystemTime(exactMidnight);

      const startDate = new Date('2023-12-28T10:00:00-03:00'); // 8 days ago
      expect(isChallengeCompleted(startDate)).toBe(true);
    });
  });

  describe('isChallengeNotStarted', () => {
    beforeEach(() => {
      // Mock current date to January 5, 2024 at 12:00 PM Brasília time
      const mockDate = new Date('2024-01-05T15:00:00.000Z'); // 12:00 PM in Brasília (UTC-3)
      vi.setSystemTime(mockDate);
    });

    it('should return true for same day registration', () => {
      const startDate = new Date('2024-01-05T10:00:00-03:00'); // Same day
      expect(isChallengeNotStarted(startDate)).toBe(true);
    });

    it('should return true for future registration', () => {
      const futureDate = new Date('2024-01-06T10:00:00-03:00'); // Tomorrow
      expect(isChallengeNotStarted(futureDate)).toBe(true);
    });

    it('should return false for day 1 of challenge', () => {
      const startDate = new Date('2024-01-04T10:00:00-03:00'); // Yesterday
      expect(isChallengeNotStarted(startDate)).toBe(false);
    });

    it('should return false for completed challenge', () => {
      const startDate = new Date('2023-12-28T10:00:00-03:00'); // 8 days ago
      expect(isChallengeNotStarted(startDate)).toBe(false);
    });

    it('should handle midnight start edge case', () => {
      // Set current time to just before midnight (still same day)
      const justBeforeMidnight = new Date('2024-01-05T02:59:00.000Z'); // 23:59 in Brasília
      vi.setSystemTime(justBeforeMidnight);

      const startDate = new Date('2024-01-04T10:00:00-03:00'); // Yesterday
      expect(isChallengeNotStarted(startDate)).toBe(true); // Still same day as registration
    });

    it('should handle start exactly at midnight', () => {
      // Set current time to exactly midnight (challenge starts)
      const exactMidnight = new Date('2024-01-05T03:00:00.000Z'); // 00:00 in Brasília
      vi.setSystemTime(exactMidnight);

      const startDate = new Date('2024-01-04T10:00:00-03:00'); // Yesterday
      expect(isChallengeNotStarted(startDate)).toBe(false); // Challenge has started
    });
  });

  describe('formatBrasiliaDate', () => {
    it('should format date in Brasília timezone', () => {
      const date = new Date('2024-01-05T15:30:00.000Z'); // 12:30 PM in Brasília
      const formatted = formatBrasiliaDate(date, 'yyyy-MM-dd HH:mm:ss');
      expect(formatted).toBe('2024-01-05 12:30:00');
    });

    it('should handle different format strings', () => {
      const date = new Date('2024-01-05T15:30:00.000Z'); // 12:30 PM in Brasília
      
      expect(formatBrasiliaDate(date, 'dd/MM/yyyy')).toBe('05/01/2024');
      expect(formatBrasiliaDate(date, 'HH:mm')).toBe('12:30');
      expect(formatBrasiliaDate(date, 'yyyy-MM-dd')).toBe('2024-01-05');
    });

    it('should handle cross-day formatting', () => {
      const utcDate = new Date('2024-01-05T01:30:00.000Z'); // 22:30 previous day in Brasília
      const formatted = formatBrasiliaDate(utcDate, 'yyyy-MM-dd HH:mm');
      expect(formatted).toBe('2024-01-04 22:30');
    });

    it('should handle midnight formatting', () => {
      const midnightUtc = new Date('2024-01-05T03:00:00.000Z'); // Midnight in Brasília
      const formatted = formatBrasiliaDate(midnightUtc, 'yyyy-MM-dd HH:mm:ss');
      expect(formatted).toBe('2024-01-05 00:00:00');
    });
  });

  describe('Daylight Saving Time Edge Cases', () => {
    // Note: Brazil's DST typically runs from October to February
    // These tests simulate DST transitions
    
    it('should handle DST start transition correctly', () => {
      // Simulate DST start (clocks spring forward)
      // In Brazil, DST typically starts in October
      const dstStartDate = new Date('2024-10-20T06:00:00.000Z'); // Around DST start
      vi.setSystemTime(dstStartDate);

      const registrationDate = new Date('2024-10-19T06:00:00.000Z'); // Day before
      const challengeDay = getChallengeDay(registrationDate);
      expect(challengeDay).toBe(1);
    });

    it('should handle DST end transition correctly', () => {
      // Simulate DST end (clocks fall back)
      // In Brazil, DST typically ends in February
      const dstEndDate = new Date('2024-02-25T05:00:00.000Z'); // Around DST end
      vi.setSystemTime(dstEndDate);

      const registrationDate = new Date('2024-02-24T05:00:00.000Z'); // Day before
      const challengeDay = getChallengeDay(registrationDate);
      expect(challengeDay).toBe(1);
    });

    it('should maintain consistent day counting across DST changes', () => {
      // Test a 7-day challenge that spans DST transition
      const beforeDst = new Date('2024-02-20T15:00:00.000Z'); // Before DST ends
      vi.setSystemTime(beforeDst);

      const registrationDate = new Date('2024-02-14T15:00:00.000Z'); // 6 days before
      let challengeDay = getChallengeDay(registrationDate);
      expect(challengeDay).toBe(6);

      // Move to after DST ends
      const afterDst = new Date('2024-02-26T15:00:00.000Z'); // After DST ends
      vi.setSystemTime(afterDst);

      challengeDay = getChallengeDay(registrationDate);
      expect(challengeDay).toBe(12); // 12 days later
    });
  });

  describe('Multiple Timezone Input Handling', () => {
    beforeEach(() => {
      // Mock current date to January 5, 2024 at 12:00 PM Brasília time
      const mockDate = new Date('2024-01-05T15:00:00.000Z'); // 12:00 PM in Brasília (UTC-3)
      vi.setSystemTime(mockDate);
    });

    it('should handle UTC input correctly', () => {
      const utcDate = new Date('2024-01-04T13:00:00.000Z'); // 10 AM in Brasília
      const challengeDay = getChallengeDay(utcDate);
      expect(challengeDay).toBe(1);
    });

    it('should handle Eastern Time input correctly', () => {
      const easternDate = new Date('2024-01-04T08:00:00-05:00'); // 8 AM Eastern = 10 AM Brasília
      const challengeDay = getChallengeDay(easternDate);
      expect(challengeDay).toBe(1);
    });

    it('should handle Pacific Time input correctly', () => {
      const pacificDate = new Date('2024-01-04T05:00:00-08:00'); // 5 AM Pacific = 10 AM Brasília
      const challengeDay = getChallengeDay(pacificDate);
      expect(challengeDay).toBe(1);
    });

    it('should handle European Time input correctly', () => {
      const europeanDate = new Date('2024-01-04T14:00:00+01:00'); // 2 PM CET = 10 AM Brasília
      const challengeDay = getChallengeDay(europeanDate);
      expect(challengeDay).toBe(1);
    });

    it('should produce consistent results regardless of input timezone', () => {
      // All these dates represent the same moment in time
      const utcDate = new Date('2024-01-04T13:00:00.000Z');
      const easternDate = new Date('2024-01-04T08:00:00-05:00');
      const pacificDate = new Date('2024-01-04T05:00:00-08:00');
      const europeanDate = new Date('2024-01-04T14:00:00+01:00');

      const utcDay = getChallengeDay(utcDate);
      const easternDay = getChallengeDay(easternDate);
      const pacificDay = getChallengeDay(pacificDate);
      const europeanDay = getChallengeDay(europeanDate);

      expect(utcDay).toBe(easternDay);
      expect(easternDay).toBe(pacificDay);
      expect(pacificDay).toBe(europeanDay);
      expect(utcDay).toBe(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      // Mock current date to January 5, 2024 at 12:00 PM Brasília time
      const mockDate = new Date('2024-01-05T15:00:00.000Z'); // 12:00 PM in Brasília (UTC-3)
      vi.setSystemTime(mockDate);
    });

    it('should handle very old dates', () => {
      const veryOldDate = new Date('2020-01-01T10:00:00-03:00');
      const challengeDay = getChallengeDay(veryOldDate);
      expect(challengeDay).toBeGreaterThan(1000); // Many days past completion
      expect(isChallengeCompleted(veryOldDate)).toBe(true);
      expect(isChallengeNotStarted(veryOldDate)).toBe(false);
    });

    it('should handle far future dates', () => {
      const futureDate = new Date('2030-01-01T10:00:00-03:00');
      const challengeDay = getChallengeDay(futureDate);
      expect(challengeDay).toBe(0); // Not started
      expect(isChallengeCompleted(futureDate)).toBe(false);
      expect(isChallengeNotStarted(futureDate)).toBe(true);
    });

    it('should handle leap year dates correctly', () => {
      // Test around February 29, 2024 (leap year)
      const leapYearDate = new Date('2024-02-29T15:00:00.000Z'); // Leap day
      vi.setSystemTime(leapYearDate);

      const registrationDate = new Date('2024-02-28T10:00:00-03:00'); // Day before leap day
      const challengeDay = getChallengeDay(registrationDate);
      expect(challengeDay).toBe(1);
    });

    it('should handle year boundary correctly', () => {
      // Test New Year transition
      const newYearDate = new Date('2024-01-01T15:00:00.000Z'); // New Year's Day
      vi.setSystemTime(newYearDate);

      const lastYearDate = new Date('2023-12-31T10:00:00-03:00'); // Previous year
      const challengeDay = getChallengeDay(lastYearDate);
      expect(challengeDay).toBe(1);
    });

    it('should handle month boundary correctly', () => {
      // Test month transition
      const firstOfMonth = new Date('2024-02-01T15:00:00.000Z'); // First of February
      vi.setSystemTime(firstOfMonth);

      const lastOfPrevMonth = new Date('2024-01-31T10:00:00-03:00'); // Last day of January
      const challengeDay = getChallengeDay(lastOfPrevMonth);
      expect(challengeDay).toBe(1);
    });

    it('should handle millisecond precision correctly', () => {
      // Test with precise timestamps
      const preciseDate = new Date('2024-01-04T13:30:45.123Z');
      const challengeDay = getChallengeDay(preciseDate);
      expect(challengeDay).toBe(1);

      // Milliseconds shouldn't affect day calculation
      const slightlyLaterDate = new Date('2024-01-04T13:30:45.999Z');
      const laterChallengeDay = getChallengeDay(slightlyLaterDate);
      expect(laterChallengeDay).toBe(challengeDay);
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency across all functions', () => {
      const mockDate = new Date('2024-01-10T15:00:00.000Z'); // Day 10
      vi.setSystemTime(mockDate);

      const registrationDate = new Date('2024-01-05T10:00:00-03:00'); // 5 days ago

      const daysSince = calculateDaysSinceStart(registrationDate);
      const challengeDay = getChallengeDay(registrationDate);
      const isCompleted = isChallengeCompleted(registrationDate);
      const isNotStarted = isChallengeNotStarted(registrationDate);

      // Verify consistency
      expect(daysSince).toBe(5);
      expect(challengeDay).toBe(5);
      expect(isCompleted).toBe(false); // Day 5 is not completed
      expect(isNotStarted).toBe(false); // Day 5 has started

      // Test completion boundary
      const completedRegistration = new Date('2024-01-02T10:00:00-03:00'); // 8 days ago
      const completedDay = getChallengeDay(completedRegistration);
      const completedStatus = isChallengeCompleted(completedRegistration);

      expect(completedDay).toBe(8);
      expect(completedStatus).toBe(true);
    });

    it('should handle complete challenge lifecycle', () => {
      const registrationDate = new Date('2024-01-01T10:00:00-03:00');

      // Test each day of the challenge
      for (let day = 0; day <= 8; day++) {
        const testDate = new Date('2024-01-01T15:00:00.000Z');
        testDate.setDate(testDate.getDate() + day);
        vi.setSystemTime(testDate);

        const challengeDay = getChallengeDay(registrationDate);
        const isCompleted = isChallengeCompleted(registrationDate);
        const isNotStarted = isChallengeNotStarted(registrationDate);

        if (day === 0) {
          // Registration day - not started
          expect(challengeDay).toBe(0);
          expect(isCompleted).toBe(false);
          expect(isNotStarted).toBe(true);
        } else if (day <= 7) {
          // Active challenge days 1-7
          expect(challengeDay).toBe(day);
          expect(isCompleted).toBe(false);
          expect(isNotStarted).toBe(false);
        } else {
          // Completed challenge (day 8+)
          expect(challengeDay).toBe(day);
          expect(isCompleted).toBe(true);
          expect(isNotStarted).toBe(false);
        }
      }
    });
  });
});