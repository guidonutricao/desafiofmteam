/**
 * Tests for challenge query functions
 * Requirements: 4.1, 4.2, 4.3, 5.1, 5.2 - Multi-user challenge management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  startChallenge, 
  getUserChallengeProgress, 
  getRankingData,
  recordDailyProgress,
  updateDailyProgress,
  getUserDailyProgress,
  completeChallenge,
  getUserTotalPoints,
  hasActiveChallenge,
  calculateTotalChallengePoints,
  getChallengePointsBreakdown,
  resetDailyTasks,
  addPointsToDay,
  syncChallengePointsWithLegacy,
  getCombinedUserPoints
} from '../challengeQueries';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentBrasiliaDate } from '../../timezoneUtils';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          not: vi.fn(() => ({
            is: vi.fn()
          })),
          in: vi.fn(),
          order: vi.fn()
        })),
        not: vi.fn(() => ({
          is: vi.fn()
        })),
        in: vi.fn()
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          not: vi.fn(() => ({
            is: vi.fn()
          }))
        }))
      })),
      upsert: vi.fn()
    }))
  }
}));

// Mock timezone utils
vi.mock('../../timezoneUtils', () => ({
  getCurrentBrasiliaDate: vi.fn(() => new Date('2024-01-15T10:00:00-03:00'))
}));

// Mock challenge progress hook
vi.mock('../../../hooks/useChallengeProgress', () => ({
  calculateChallengeProgress: vi.fn((startDate) => ({
    currentDay: startDate ? 3 : 0,
    totalDays: 7,
    isCompleted: false,
    isNotStarted: !startDate,
    daysRemaining: startDate ? 4 : 7,
    progressPercentage: startDate ? 42.86 : 0,
    displayText: startDate ? 'Desafio Shape Express - Dia 3/7' : 'Desafio Shape Express - Não iniciado'
  }))
}));

describe('challengeQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('startChallenge', () => {
    it('should start challenge for user', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any);

      await startChallenge('user-123');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(getCurrentBrasiliaDate).toHaveBeenCalled();
    });

    it('should throw error if update fails', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: { message: 'Update failed' } });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate
      } as any);

      await expect(startChallenge('user-123')).rejects.toThrow('Failed to start challenge: Update failed');
    });
  });

  describe('getUserChallengeProgress', () => {
    it('should return challenge progress for user with start date', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { challenge_start_date: '2024-01-10T00:00:00Z', challenge_completed_at: null },
        error: null
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await getUserChallengeProgress('user-123');

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

    it('should return null for user without start date', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { challenge_start_date: null, challenge_completed_at: null },
        error: null
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await getUserChallengeProgress('user-123');

      expect(result).toBeNull();
    });
  });

  describe('getRankingData', () => {
    it('should return ranking data with challenge progress', async () => {
      // Create a more realistic mock setup
      const usersData = [
        {
          user_id: 'user-1',
          nome: 'User One',
          foto_url: 'photo1.jpg',
          challenge_start_date: '2024-01-10T00:00:00Z',
          challenge_completed_at: null
        },
        {
          user_id: 'user-2',
          nome: 'User Two',
          foto_url: null,
          challenge_start_date: '2024-01-12T00:00:00Z',
          challenge_completed_at: null
        }
      ];

      const progressData = [
        { user_id: 'user-1', points_earned: 100 },
        { user_id: 'user-1', points_earned: 150 },
        { user_id: 'user-2', points_earned: 80 }
      ];

      // Mock the supabase calls sequentially
      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            not: vi.fn().mockResolvedValue({
              data: usersData,
              error: null
            })
          })
        } as any)
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: progressData,
              error: null
            })
          })
        } as any);

      const result = await getRankingData();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'user-1',
        name: 'User One',
        avatar: 'photo1.jpg',
        totalPoints: 250,
        challengeStartDate: new Date('2024-01-10T00:00:00Z'),
        challengeProgress: expect.any(Object)
      });
      expect(result[1]).toEqual({
        id: 'user-2',
        name: 'User Two',
        avatar: null,
        totalPoints: 80,
        challengeStartDate: new Date('2024-01-12T00:00:00Z'),
        challengeProgress: expect.any(Object)
      });
    });

    it('should return empty array if no users found', async () => {
      const mockNot = vi.fn().mockResolvedValue({
        data: [],
        error: null
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          not: vi.fn().mockReturnValue(mockNot)
        })
      } as any);

      const result = await getRankingData();

      expect(result).toEqual([]);
    });
  });

  describe('recordDailyProgress', () => {
    it('should record daily progress successfully', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      
      vi.mocked(supabase.from).mockReturnValue({
        upsert: mockUpsert
      } as any);

      const tasksCompleted = { hydration: true, workout: false };
      await recordDailyProgress('user-123', 3, tasksCompleted, 150);

      expect(supabase.from).toHaveBeenCalledWith('daily_progress');
      expect(mockUpsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        challenge_day: 3,
        date: expect.any(String),
        tasks_completed: tasksCompleted,
        points_earned: 150
      }, {
        onConflict: 'user_id,challenge_day'
      });
    });
  });

  describe('getUserTotalPoints', () => {
    it('should calculate total points for user', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [
          { points_earned: 100 },
          { points_earned: 150 },
          { points_earned: 80 }
        ],
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await getUserTotalPoints('user-123');

      expect(result).toBe(330);
      expect(supabase.from).toHaveBeenCalledWith('daily_progress');
    });

    it('should return 0 if no progress found', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [],
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await getUserTotalPoints('user-123');

      expect(result).toBe(0);
    });
  });

  describe('hasActiveChallenge', () => {
    it('should return true for user with active challenge', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { challenge_start_date: '2024-01-10T00:00:00Z', challenge_completed_at: null },
        error: null
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await hasActiveChallenge('user-123');

      expect(result).toBe(true);
    });

    it('should return false for user with completed challenge', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { 
          challenge_start_date: '2024-01-10T00:00:00Z', 
          challenge_completed_at: '2024-01-17T00:00:00Z' 
        },
        error: null
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await hasActiveChallenge('user-123');

      expect(result).toBe(false);
    });

    it('should return false for user without challenge', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { challenge_start_date: null, challenge_completed_at: null },
        error: null
      });

      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const result = await hasActiveChallenge('user-123');

      expect(result).toBe(false);
    });
  });

  // Tests for new points persistence functionality
  describe('Points Persistence Functions', () => {
    describe('calculateTotalChallengePoints', () => {
      it('should calculate total points across all challenge days', async () => {
        const mockEq = vi.fn().mockResolvedValue({
          data: [
            { points_earned: 100 },
            { points_earned: 150 },
            { points_earned: 80 },
            { points_earned: 200 }
          ],
          error: null
        });

        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        
        vi.mocked(supabase.from).mockReturnValue({
          select: mockSelect
        } as any);

        const result = await calculateTotalChallengePoints('user-123');

        expect(result).toBe(530);
        expect(supabase.from).toHaveBeenCalledWith('daily_progress');
      });

      it('should return 0 if no progress found', async () => {
        const mockEq = vi.fn().mockResolvedValue({
          data: [],
          error: null
        });

        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        
        vi.mocked(supabase.from).mockReturnValue({
          select: mockSelect
        } as any);

        const result = await calculateTotalChallengePoints('user-123');

        expect(result).toBe(0);
      });
    });

    describe('updateDailyProgress', () => {
      it('should preserve existing points when updating tasks', async () => {
        // Mock existing progress query
        const mockSingle = vi.fn().mockResolvedValue({
          data: { points_earned: 150 },
          error: null
        });
        const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

        // Mock upsert
        const mockUpsert = vi.fn().mockResolvedValue({ error: null });

        vi.mocked(supabase.from)
          .mockReturnValueOnce({
            select: mockSelect
          } as any)
          .mockReturnValueOnce({
            upsert: mockUpsert
          } as any);

        const tasksCompleted = { hydration: true, workout: true };
        await updateDailyProgress('user-123', 3, tasksCompleted, 200);

        expect(mockUpsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          challenge_day: 3,
          date: expect.any(String),
          tasks_completed: tasksCompleted,
          points_earned: 150 // Should preserve existing points
        }, {
          onConflict: 'user_id,challenge_day'
        });
      });

      it('should use new points if no existing progress', async () => {
        // Mock no existing progress
        const mockSingle = vi.fn().mockResolvedValue({
          data: null,
          error: null
        });
        const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

        // Mock upsert
        const mockUpsert = vi.fn().mockResolvedValue({ error: null });

        vi.mocked(supabase.from)
          .mockReturnValueOnce({
            select: mockSelect
          } as any)
          .mockReturnValueOnce({
            upsert: mockUpsert
          } as any);

        const tasksCompleted = { hydration: true, workout: false };
        await updateDailyProgress('user-123', 1, tasksCompleted, 100);

        expect(mockUpsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          challenge_day: 1,
          date: expect.any(String),
          tasks_completed: tasksCompleted,
          points_earned: 100 // Should use new points
        }, {
          onConflict: 'user_id,challenge_day'
        });
      });
    });

    describe('getChallengePointsBreakdown', () => {
      it('should return points breakdown by challenge day', async () => {
        const mockOrder = vi.fn().mockResolvedValue({
          data: [
            {
              challenge_day: 1,
              points_earned: 100,
              tasks_completed: { hydration: true },
              date: '2024-01-10'
            },
            {
              challenge_day: 2,
              points_earned: 150,
              tasks_completed: { hydration: true, workout: true },
              date: '2024-01-11'
            }
          ],
          error: null
        });

        const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        
        vi.mocked(supabase.from).mockReturnValue({
          select: mockSelect
        } as any);

        const result = await getChallengePointsBreakdown('user-123');

        expect(result).toEqual([
          {
            challengeDay: 1,
            pointsEarned: 100,
            tasksCompleted: { hydration: true },
            date: '2024-01-10'
          },
          {
            challengeDay: 2,
            pointsEarned: 150,
            tasksCompleted: { hydration: true, workout: true },
            date: '2024-01-11'
          }
        ]);
      });
    });

    describe('resetDailyTasks', () => {
      it('should reset tasks while preserving points', async () => {
        // Mock existing progress query
        const mockSingle = vi.fn().mockResolvedValue({
          data: { points_earned: 200 },
          error: null
        });
        const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

        // Mock upsert
        const mockUpsert = vi.fn().mockResolvedValue({ error: null });

        vi.mocked(supabase.from)
          .mockReturnValueOnce({
            select: mockSelect
          } as any)
          .mockReturnValueOnce({
            upsert: mockUpsert
          } as any);

        await resetDailyTasks('user-123', 3);

        expect(mockUpsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          challenge_day: 3,
          date: expect.any(String),
          tasks_completed: {}, // Should reset tasks
          points_earned: 200 // Should preserve points
        }, {
          onConflict: 'user_id,challenge_day'
        });
      });
    });

    describe('addPointsToDay', () => {
      it('should add points while preserving tasks', async () => {
        // Mock existing progress query
        const mockSingle = vi.fn().mockResolvedValue({
          data: { 
            points_earned: 100,
            tasks_completed: { hydration: true, workout: false }
          },
          error: null
        });
        const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

        // Mock upsert
        const mockUpsert = vi.fn().mockResolvedValue({ error: null });

        vi.mocked(supabase.from)
          .mockReturnValueOnce({
            select: mockSelect
          } as any)
          .mockReturnValueOnce({
            upsert: mockUpsert
          } as any);

        await addPointsToDay('user-123', 2, 50);

        expect(mockUpsert).toHaveBeenCalledWith({
          user_id: 'user-123',
          challenge_day: 2,
          date: expect.any(String),
          tasks_completed: { hydration: true, workout: false }, // Should preserve tasks
          points_earned: 150 // Should add to existing points (100 + 50)
        }, {
          onConflict: 'user_id,challenge_day'
        });
      });
    });

    describe('getCombinedUserPoints', () => {
      it('should return combined points from legacy and challenge systems', async () => {
        // Mock challenge points calculation
        vi.mocked(supabase.from)
          .mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [
                  { points_earned: 100 },
                  { points_earned: 150 }
                ],
                error: null
              })
            })
          } as any)
          .mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { pontuacao_total: 500 },
                  error: null
                })
              })
            })
          } as any);

        const result = await getCombinedUserPoints('user-123');

        expect(result).toEqual({
          legacyPoints: 500,
          challengePoints: 250,
          totalPoints: 750
        });
      });

      it('should handle missing legacy points', async () => {
        // Mock challenge points calculation
        vi.mocked(supabase.from)
          .mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ points_earned: 100 }],
                error: null
              })
            })
          } as any)
          .mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null
                })
              })
            })
          } as any);

        const result = await getCombinedUserPoints('user-123');

        expect(result).toEqual({
          legacyPoints: 0,
          challengePoints: 100,
          totalPoints: 100
        });
      });
    });
  });
});