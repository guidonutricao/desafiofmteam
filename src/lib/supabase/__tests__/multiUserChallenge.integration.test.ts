/**
 * Integration tests for multi-user challenge scenarios
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5 - Multi-user challenge management with independent timelines
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  startChallenge, 
  getUserChallengeProgress, 
  getRankingData,
  recordDailyProgress,
  calculateTotalChallengePoints,
  hasActiveChallenge,
  completeChallenge,
  getChallengePointsBreakdown,
  addPointsToDay,
  resetDailyTasks
} from '../challengeQueries';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentBrasiliaDate } from '../../timezoneUtils';
import { calculateChallengeProgress } from '../../../hooks/useChallengeProgress';

// Mock Supabase client with comprehensive multi-user data
vi.mock('@/integrations/supabase/client', () => {
  const createChainableMock = () => ({
    select: vi.fn(() => createChainableMock()),
    eq: vi.fn(() => createChainableMock()),
    not: vi.fn(() => createChainableMock()),
    is: vi.fn(() => createChainableMock()),
    in: vi.fn(() => createChainableMock()),
    order: vi.fn(() => createChainableMock()),
    single: vi.fn(),
    update: vi.fn(() => createChainableMock()),
    upsert: vi.fn()
  });

  return {
    supabase: {
      from: vi.fn(() => createChainableMock())
    }
  };
});

// Mock timezone utils with controllable dates
vi.mock('../../timezoneUtils', () => ({
  getCurrentBrasiliaDate: vi.fn()
}));

// Mock challenge progress calculation
vi.mock('../../../hooks/useChallengeProgress', () => ({
  calculateChallengeProgress: vi.fn()
}));

describe('Multi-User Challenge Integration Tests', () => {
  // Test data for multiple users with different scenarios
  const testUsers = {
    user1: {
      id: 'user-1',
      name: 'Alice Silva',
      avatar: 'alice.jpg',
      startDate: '2024-01-10T10:00:00-03:00', // Started 5 days ago
      completedAt: null,
      currentDay: 5
    },
    user2: {
      id: 'user-2', 
      name: 'Bob Santos',
      avatar: null,
      startDate: '2024-01-12T14:30:00-03:00', // Started 3 days ago
      completedAt: null,
      currentDay: 3
    },
    user3: {
      id: 'user-3',
      name: 'Carol Lima',
      avatar: 'carol.jpg',
      startDate: '2024-01-05T09:15:00-03:00', // Started 10 days ago (completed)
      completedAt: '2024-01-12T09:15:00-03:00',
      currentDay: 8
    },
    user4: {
      id: 'user-4',
      name: 'David Costa',
      avatar: 'david.jpg',
      startDate: '2024-01-14T16:45:00-03:00', // Started 1 day ago
      completedAt: null,
      currentDay: 1
    },
    user5: {
      id: 'user-5',
      name: 'Eva Oliveira',
      avatar: null,
      startDate: null, // Not started yet
      completedAt: null,
      currentDay: 0
    }
  };

  // Mock daily progress data for each user
  const dailyProgressData = {
    'user-1': [
      { challenge_day: 1, points_earned: 100, tasks_completed: { hydration: true, workout: true } },
      { challenge_day: 2, points_earned: 150, tasks_completed: { hydration: true, workout: true, diet: true } },
      { challenge_day: 3, points_earned: 120, tasks_completed: { hydration: true, workout: false, diet: true } },
      { challenge_day: 4, points_earned: 180, tasks_completed: { hydration: true, workout: true, diet: true, sleep: true } },
      { challenge_day: 5, points_earned: 90, tasks_completed: { hydration: true, workout: false } }
    ],
    'user-2': [
      { challenge_day: 1, points_earned: 80, tasks_completed: { hydration: true, workout: false } },
      { challenge_day: 2, points_earned: 160, tasks_completed: { hydration: true, workout: true, diet: true, sleep: true } },
      { challenge_day: 3, points_earned: 140, tasks_completed: { hydration: true, workout: true, diet: true } }
    ],
    'user-3': [
      { challenge_day: 1, points_earned: 120, tasks_completed: { hydration: true, workout: true, diet: true } },
      { challenge_day: 2, points_earned: 200, tasks_completed: { hydration: true, workout: true, diet: true, sleep: true, photo: true } },
      { challenge_day: 3, points_earned: 180, tasks_completed: { hydration: true, workout: true, diet: true, sleep: true } },
      { challenge_day: 4, points_earned: 160, tasks_completed: { hydration: true, workout: true, diet: true } },
      { challenge_day: 5, points_earned: 190, tasks_completed: { hydration: true, workout: true, diet: true, sleep: true, photo: true } },
      { challenge_day: 6, points_earned: 170, tasks_completed: { hydration: true, workout: true, diet: true, sleep: true } },
      { challenge_day: 7, points_earned: 210, tasks_completed: { hydration: true, workout: true, diet: true, sleep: true, photo: true } }
    ],
    'user-4': [
      { challenge_day: 1, points_earned: 110, tasks_completed: { hydration: true, workout: true, diet: false } }
    ],
    'user-5': []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock current date to January 15, 2024 at 12:00 PM Brasília time
    vi.mocked(getCurrentBrasiliaDate).mockReturnValue(new Date('2024-01-15T15:00:00.000Z'));
    
    // Mock challenge progress calculations for each user
    vi.mocked(calculateChallengeProgress).mockImplementation((startDate) => {
      if (!startDate) {
        return {
          currentDay: 0,
          totalDays: 7,
          isCompleted: false,
          isNotStarted: true,
          daysRemaining: 7,
          progressPercentage: 0,
          displayText: 'Desafio Shape Express - Não iniciado'
        };
      }

      const user = Object.values(testUsers).find(u => 
        u.startDate && new Date(u.startDate).getTime() === startDate.getTime()
      );

      if (!user) {
        return {
          currentDay: 1,
          totalDays: 7,
          isCompleted: false,
          isNotStarted: false,
          daysRemaining: 6,
          progressPercentage: 14.29,
          displayText: 'Desafio Shape Express - Dia 1/7'
        };
      }

      const isCompleted = user.currentDay > 7;
      const currentDay = Math.min(user.currentDay, 7);

      return {
        currentDay: isCompleted ? 7 : user.currentDay,
        totalDays: 7,
        isCompleted,
        isNotStarted: user.currentDay === 0,
        daysRemaining: Math.max(0, 7 - user.currentDay),
        progressPercentage: Math.min((user.currentDay / 7) * 100, 100),
        displayText: isCompleted 
          ? 'Desafio Shape Express - Concluído'
          : user.currentDay === 0
            ? 'Desafio Shape Express - Inicia amanhã'
            : `Desafio Shape Express - Dia ${user.currentDay}/7`
      };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Multiple users with different start dates', () => {
    it('should handle users starting challenges on different dates', async () => {
      // Mock database responses for different users
      const mockSingle = vi.fn();
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      // Test each user's challenge progress
      for (const [userId, userData] of Object.entries(testUsers)) {
        mockSingle.mockResolvedValueOnce({
          data: {
            challenge_start_date: userData.startDate,
            challenge_completed_at: userData.completedAt
          },
          error: null
        });

        const progress = await getUserChallengeProgress(userId);

        if (userData.startDate) {
          expect(progress).toBeDefined();
          expect(progress?.currentDay).toBe(userData.currentDay > 7 ? 7 : userData.currentDay);
          expect(progress?.isCompleted).toBe(userData.currentDay > 7);
        } else {
          expect(progress).toBeNull();
        }
      }

      // Verify each user was queried independently
      expect(mockSelect).toHaveBeenCalledTimes(5);
      expect(mockEq).toHaveBeenCalledTimes(5);
    });

    it('should allow multiple users to start challenges simultaneously', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any);

      // Start challenges for multiple users at the same time
      const startPromises = [
        startChallenge('user-1'),
        startChallenge('user-2'),
        startChallenge('user-3')
      ];

      await Promise.all(startPromises);

      // Verify all users were processed independently
      expect(mockUpdate).toHaveBeenCalledTimes(3);
      expect(mockEq).toHaveBeenCalledTimes(3);
    });

    it('should maintain independent challenge timelines for users starting on different days', async () => {
      // Mock ranking data query
      const mockNot = vi.fn().mockResolvedValue({
        data: Object.entries(testUsers)
          .filter(([_, user]) => user.startDate)
          .map(([userId, user]) => ({
            user_id: userId,
            nome: user.name,
            foto_url: user.avatar,
            challenge_start_date: user.startDate,
            challenge_completed_at: user.completedAt
          })),
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        not: vi.fn().mockReturnValue(mockNot)
      });

      // Mock points calculation for each user
      const mockEq = vi.fn();
      Object.entries(dailyProgressData).forEach(([userId, progress]) => {
        mockEq.mockResolvedValueOnce({
          data: progress,
          error: null
        });
      });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect
        } as any)
        .mockReturnValue({
          select: vi.fn().mockReturnValue({ eq: mockEq })
        } as any);

      const rankingData = await getRankingData();

      // Verify each user has independent timeline
      expect(rankingData).toHaveLength(4); // 4 users with started challenges
      
      // Check that each user has correct challenge progress
      const alice = rankingData.find(u => u.id === 'user-1');
      const bob = rankingData.find(u => u.id === 'user-2');
      const carol = rankingData.find(u => u.id === 'user-3');
      const david = rankingData.find(u => u.id === 'user-4');

      expect(alice?.challengeProgress.currentDay).toBe(5);
      expect(bob?.challengeProgress.currentDay).toBe(3);
      expect(carol?.challengeProgress.isCompleted).toBe(true);
      expect(david?.challengeProgress.currentDay).toBe(1);
    });
  });

  describe('Independent challenge timeline verification', () => {
    it('should calculate correct challenge days for users with different start dates', async () => {
      // Test that users starting on different dates have independent day calculations
      const testCases = [
        { userId: 'user-1', expectedDay: 5, startDate: testUsers.user1.startDate },
        { userId: 'user-2', expectedDay: 3, startDate: testUsers.user2.startDate },
        { userId: 'user-4', expectedDay: 1, startDate: testUsers.user4.startDate }
      ];

      const mockSingle = vi.fn();
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      for (const testCase of testCases) {
        mockSingle.mockResolvedValueOnce({
          data: {
            challenge_start_date: testCase.startDate,
            challenge_completed_at: null
          },
          error: null
        });

        const progress = await getUserChallengeProgress(testCase.userId);
        expect(progress?.currentDay).toBe(testCase.expectedDay);
      }
    });

    it('should handle users completing challenges at different times', async () => {
      const mockSingle = vi.fn();
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      // Test completed user
      mockSingle.mockResolvedValueOnce({
        data: {
          challenge_start_date: testUsers.user3.startDate,
          challenge_completed_at: testUsers.user3.completedAt
        },
        error: null
      });

      const completedProgress = await getUserChallengeProgress('user-3');
      expect(completedProgress?.isCompleted).toBe(true);

      // Test active user
      mockSingle.mockResolvedValueOnce({
        data: {
          challenge_start_date: testUsers.user1.startDate,
          challenge_completed_at: null
        },
        error: null
      });

      const activeProgress = await getUserChallengeProgress('user-1');
      expect(activeProgress?.isCompleted).toBe(false);
      expect(activeProgress?.currentDay).toBe(5);
    });

    it('should verify challenge state consistency across multiple queries', async () => {
      const mockSingle = vi.fn();
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      // Query the same user multiple times
      const userData = testUsers.user2;
      
      for (let i = 0; i < 3; i++) {
        mockSingle.mockResolvedValueOnce({
          data: {
            challenge_start_date: userData.startDate,
            challenge_completed_at: userData.completedAt
          },
          error: null
        });

        const progress = await getUserChallengeProgress('user-2');
        expect(progress?.currentDay).toBe(3);
        expect(progress?.isCompleted).toBe(false);
        expect(progress?.displayText).toBe('Desafio Shape Express - Dia 3/7');
      }
    });
  });

  describe('Ranking calculations with users in different challenge days', () => {
    it('should correctly rank users based on total points regardless of challenge day', async () => {
      // Mock users query
      const mockNot = vi.fn().mockResolvedValue({
        data: Object.entries(testUsers)
          .filter(([_, user]) => user.startDate)
          .map(([userId, user]) => ({
            user_id: userId,
            nome: user.name,
            foto_url: user.avatar,
            challenge_start_date: user.startDate,
            challenge_completed_at: user.completedAt
          })),
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        not: vi.fn().mockReturnValue(mockNot)
      });

      // Mock points calculation for each user
      const mockEq = vi.fn();
      Object.entries(dailyProgressData).forEach(([userId, progress]) => {
        mockEq.mockResolvedValueOnce({
          data: progress,
          error: null
        });
      });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect
        } as any)
        .mockReturnValue({
          select: vi.fn().mockReturnValue({ eq: mockEq })
        } as any);

      const rankingData = await getRankingData();

      // Calculate expected total points for each user
      const expectedPoints = {
        'user-1': 640, // 100+150+120+180+90
        'user-2': 380, // 80+160+140
        'user-3': 1230, // 120+200+180+160+190+170+210
        'user-4': 110  // 110
      };

      // Verify ranking is sorted by total points (descending)
      expect(rankingData[0].id).toBe('user-3'); // Highest points (completed challenge)
      expect(rankingData[0].totalPoints).toBe(expectedPoints['user-3']);
      
      expect(rankingData[1].id).toBe('user-1'); // Second highest
      expect(rankingData[1].totalPoints).toBe(expectedPoints['user-1']);
      
      expect(rankingData[2].id).toBe('user-2'); // Third
      expect(rankingData[2].totalPoints).toBe(expectedPoints['user-2']);
      
      expect(rankingData[3].id).toBe('user-4'); // Lowest (just started)
      expect(rankingData[3].totalPoints).toBe(expectedPoints['user-4']);
    });

    it('should display correct challenge progress for each user in ranking', async () => {
      // Mock the same data as previous test
      const mockNot = vi.fn().mockResolvedValue({
        data: Object.entries(testUsers)
          .filter(([_, user]) => user.startDate)
          .map(([userId, user]) => ({
            user_id: userId,
            nome: user.name,
            foto_url: user.avatar,
            challenge_start_date: user.startDate,
            challenge_completed_at: user.completedAt
          })),
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        not: vi.fn().mockReturnValue(mockNot)
      });

      const mockEq = vi.fn();
      Object.entries(dailyProgressData).forEach(([userId, progress]) => {
        mockEq.mockResolvedValueOnce({
          data: progress,
          error: null
        });
      });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect
        } as any)
        .mockReturnValue({
          select: vi.fn().mockReturnValue({ eq: mockEq })
        } as any);

      const rankingData = await getRankingData();

      // Verify each user shows correct challenge progress
      const alice = rankingData.find(u => u.id === 'user-1');
      expect(alice?.challengeProgress.displayText).toBe('Desafio Shape Express - Dia 5/7');
      expect(alice?.challengeProgress.progressPercentage).toBe((5/7) * 100);

      const bob = rankingData.find(u => u.id === 'user-2');
      expect(bob?.challengeProgress.displayText).toBe('Desafio Shape Express - Dia 3/7');
      expect(bob?.challengeProgress.progressPercentage).toBe((3/7) * 100);

      const carol = rankingData.find(u => u.id === 'user-3');
      expect(carol?.challengeProgress.displayText).toBe('Desafio Shape Express - Concluído');
      expect(carol?.challengeProgress.isCompleted).toBe(true);

      const david = rankingData.find(u => u.id === 'user-4');
      expect(david?.challengeProgress.displayText).toBe('Desafio Shape Express - Dia 1/7');
      expect(david?.challengeProgress.progressPercentage).toBe((1/7) * 100);
    });

    it('should handle mixed user states in ranking (active, completed, not started)', async () => {
      // Include user who hasn't started
      const allUsersData = Object.entries(testUsers).map(([userId, user]) => ({
        user_id: userId,
        nome: user.name,
        foto_url: user.avatar,
        challenge_start_date: user.startDate,
        challenge_completed_at: user.completedAt
      }));

      const mockNot = vi.fn().mockResolvedValue({
        data: allUsersData.filter(u => u.challenge_start_date), // Only users who started
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        not: vi.fn().mockReturnValue(mockNot)
      });

      const mockEq = vi.fn();
      Object.entries(dailyProgressData).forEach(([userId, progress]) => {
        mockEq.mockResolvedValueOnce({
          data: progress,
          error: null
        });
      });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect
        } as any)
        .mockReturnValue({
          select: vi.fn().mockReturnValue({ eq: mockEq })
        } as any);

      const rankingData = await getRankingData();

      // Should only include users who started challenges
      expect(rankingData).toHaveLength(4);
      expect(rankingData.find(u => u.id === 'user-5')).toBeUndefined();

      // Verify different states are represented
      const activeUsers = rankingData.filter(u => !u.challengeProgress.isCompleted && u.challengeProgress.currentDay > 0);
      const completedUsers = rankingData.filter(u => u.challengeProgress.isCompleted);

      expect(activeUsers).toHaveLength(3); // user-1, user-2, user-4
      expect(completedUsers).toHaveLength(1); // user-3
    });
  });

  describe('Points persistence across day transitions', () => {
    it('should maintain cumulative points when users progress through challenge days', async () => {
      const userId = 'user-1';
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert
      } as any);

      // Simulate recording progress for multiple days
      await recordDailyProgress(userId, 1, { hydration: true }, 100);
      await recordDailyProgress(userId, 2, { hydration: true, workout: true }, 150);
      await recordDailyProgress(userId, 3, { hydration: true, diet: true }, 120);

      // Verify each day was recorded independently
      expect(mockUpsert).toHaveBeenCalledTimes(3);
      
      // Verify points are recorded for each day
      expect(mockUpsert).toHaveBeenNthCalledWith(1, expect.objectContaining({
        user_id: userId,
        challenge_day: 1,
        points_earned: 100
      }), expect.any(Object));

      expect(mockUpsert).toHaveBeenNthCalledWith(2, expect.objectContaining({
        user_id: userId,
        challenge_day: 2,
        points_earned: 150
      }), expect.any(Object));

      expect(mockUpsert).toHaveBeenNthCalledWith(3, expect.objectContaining({
        user_id: userId,
        challenge_day: 3,
        points_earned: 120
      }), expect.any(Object));
    });

    it('should calculate correct total points across all challenge days', async () => {
      const userId = 'user-1';
      const userProgress = dailyProgressData[userId];
      
      const mockEq = vi.fn().mockResolvedValue({
        data: userProgress,
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const totalPoints = await calculateTotalChallengePoints(userId);
      
      const expectedTotal = userProgress.reduce((sum, day) => sum + day.points_earned, 0);
      expect(totalPoints).toBe(expectedTotal); // 640 total points
    });

    it('should preserve points when tasks are reset for a day', async () => {
      const userId = 'user-2';
      const challengeDay = 3;
      
      // Mock existing progress query
      const mockSingle = vi.fn().mockResolvedValue({
        data: { points_earned: 140 },
        error: null
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Mock upsert for reset
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect
        } as any)
        .mockReturnValueOnce({
          upsert: mockUpsert
        } as any);

      await resetDailyTasks(userId, challengeDay);

      // Verify points were preserved while tasks were reset
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          challenge_day: challengeDay,
          tasks_completed: {}, // Tasks reset
          points_earned: 140 // Points preserved
        }),
        expect.any(Object)
      );
    });

    it('should allow adding points without affecting existing tasks', async () => {
      const userId = 'user-1';
      const challengeDay = 2;
      const additionalPoints = 50;
      
      // Mock existing progress
      const mockSingle = vi.fn().mockResolvedValue({
        data: { 
          points_earned: 150,
          tasks_completed: { hydration: true, workout: true, diet: true }
        },
        error: null
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      // Mock upsert for adding points
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect
        } as any)
        .mockReturnValueOnce({
          upsert: mockUpsert
        } as any);

      await addPointsToDay(userId, challengeDay, additionalPoints);

      // Verify points were added while tasks were preserved
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          challenge_day: challengeDay,
          tasks_completed: { hydration: true, workout: true, diet: true }, // Tasks preserved
          points_earned: 200 // 150 + 50
        }),
        expect.any(Object)
      );
    });

    it('should maintain points history across multiple day transitions', async () => {
      const userId = 'user-3'; // Completed user with full 7-day history
      const userProgress = dailyProgressData[userId];
      
      const mockOrder = vi.fn().mockResolvedValue({
        data: userProgress.map(day => ({
          challenge_day: day.challenge_day,
          points_earned: day.points_earned,
          tasks_completed: day.tasks_completed,
          date: `2024-01-${4 + day.challenge_day}` // Sequential dates
        })),
        error: null
      });

      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const pointsBreakdown = await getChallengePointsBreakdown(userId);

      // Verify all 7 days are present with correct points
      expect(pointsBreakdown).toHaveLength(7);
      
      // Verify points progression
      expect(pointsBreakdown[0].pointsEarned).toBe(120); // Day 1
      expect(pointsBreakdown[1].pointsEarned).toBe(200); // Day 2
      expect(pointsBreakdown[6].pointsEarned).toBe(210); // Day 7

      // Verify total points across all days
      const totalPoints = pointsBreakdown.reduce((sum, day) => sum + day.pointsEarned, 0);
      expect(totalPoints).toBe(1230);
    });
  });

  describe('Challenge state management across multiple users', () => {
    it('should correctly identify active challenges for multiple users', async () => {
      const testCases = [
        { userId: 'user-1', hasActive: true },
        { userId: 'user-2', hasActive: true },
        { userId: 'user-3', hasActive: false }, // Completed
        { userId: 'user-4', hasActive: true },
        { userId: 'user-5', hasActive: false }  // Not started
      ];

      const mockSingle = vi.fn();
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      for (const testCase of testCases) {
        const userData = testUsers[testCase.userId as keyof typeof testUsers];
        
        if (userData) {
          mockSingle.mockResolvedValueOnce({
            data: {
              challenge_start_date: userData.startDate,
              challenge_completed_at: userData.completedAt
            },
            error: null
          });

          const hasActive = await hasActiveChallenge(testCase.userId);
          expect(hasActive).toBe(testCase.hasActive);
        }
      }
    });

    it('should handle challenge completion for multiple users independently', async () => {
      const usersToComplete = ['user-1', 'user-2'];
      
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockNot = vi.fn().mockReturnValue({
        is: vi.fn().mockReturnValue(mockEq)
      });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          not: mockNot
        })
      });
      
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any);

      // Complete challenges for multiple users
      for (const userId of usersToComplete) {
        await completeChallenge(userId);
      }

      // Verify each user was processed independently
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    it('should maintain data consistency during concurrent operations', async () => {
      // Simulate concurrent operations on different users
      const operations = [
        recordDailyProgress('user-1', 6, { hydration: true, workout: true }, 160),
        recordDailyProgress('user-2', 4, { hydration: true, diet: true }, 130),
        addPointsToDay('user-4', 1, 25),
        resetDailyTasks('user-1', 5)
      ];

      // Mock all database operations
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      const mockSingle = vi.fn().mockResolvedValue({
        data: { points_earned: 90, tasks_completed: { hydration: true } },
        error: null
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert,
        select: mockSelect
      } as any);

      // Execute all operations concurrently
      await Promise.all(operations);

      // Verify all operations completed successfully
      expect(mockUpsert).toHaveBeenCalledTimes(4);
    });
  });

  describe('Error handling in multi-user scenarios', () => {
    it('should handle database errors gracefully for individual users', async () => {
      const mockSingle = vi.fn()
        .mockResolvedValueOnce({
          data: { challenge_start_date: testUsers.user1.startDate, challenge_completed_at: null },
          error: null
        })
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Database connection failed' }
        });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      // First user should succeed
      const progress1 = await getUserChallengeProgress('user-1');
      expect(progress1).toBeDefined();

      // Second user should fail gracefully
      const progress2 = await getUserChallengeProgress('user-2');
      expect(progress2).toBeNull();
    });

    it('should return empty array when ranking query fails', async () => {
      // Mock database error for users query
      const mockNot = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const mockSelect = vi.fn().mockReturnValue({
        not: vi.fn().mockReturnValue(mockNot)
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const rankingData = await getRankingData();

      // Should return empty array when there's a database error
      expect(rankingData).toEqual([]);
    });

    it('should handle points calculation errors for individual users', async () => {
      // Mock successful users query
      const mockNot = vi.fn().mockResolvedValue({
        data: [
          {
            user_id: 'user-1',
            nome: testUsers.user1.name,
            foto_url: testUsers.user1.avatar,
            challenge_start_date: testUsers.user1.startDate,
            challenge_completed_at: null
          }
        ],
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        not: vi.fn().mockReturnValue(mockNot)
      });

      // Mock points calculation error
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Points calculation failed' }
      });

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect
        } as any)
        .mockReturnValue({
          select: vi.fn().mockReturnValue({ eq: mockEq })
        } as any);

      const rankingData = await getRankingData();

      // Should return empty array when points calculation fails
      // (because the error in calculateTotalChallengePoints causes the Promise.all to fail)
      expect(rankingData).toEqual([]);
    });
  });
});