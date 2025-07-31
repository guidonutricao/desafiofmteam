import { describe, it, expect } from 'vitest';
import {
  calculateDayCompletion,
  getTaskSummary,
  isChallengeSuccessful,
  getMotivationalMessage,
  formatScore,
  getTrendAnalysis,
  generateShareText
} from '../celebrationUtils';
import type { TasksCompleted, ChallengeStats, DailyProgress } from '@/hooks/useCelebrationData';

describe('celebrationUtils', () => {
  const mockTasks: TasksCompleted = {
    hidratacao: true,
    sono_qualidade: true,
    atividade_fisica: false,
    seguiu_dieta: true,
    registro_visual: false
  };

  const mockStats: ChallengeStats = {
    perfectDays: 2,
    averageScore: 45,
    improvementPercent: 15,
    streakRecord: 5
  };

  const mockDailyScores: DailyProgress[] = [
    {
      day: 1,
      score: 30,
      date: '2024-01-01',
      goals: ['Hidratação'],
      completed: true,
      tasks_completed: mockTasks
    },
    {
      day: 2,
      score: 50,
      date: '2024-01-02',
      goals: ['Hidratação', 'Dieta'],
      completed: true,
      tasks_completed: mockTasks
    }
  ];

  describe('calculateDayCompletion', () => {
    it('should calculate correct completion percentage', () => {
      expect(calculateDayCompletion(mockTasks)).toBe(60); // 3 out of 5 tasks = 60%
    });

    it('should return 0 for no completed tasks', () => {
      const emptyTasks: TasksCompleted = {
        hidratacao: false,
        sono_qualidade: false,
        atividade_fisica: false,
        seguiu_dieta: false,
        registro_visual: false
      };
      expect(calculateDayCompletion(emptyTasks)).toBe(0);
    });

    it('should return 100 for all completed tasks', () => {
      const allTasks: TasksCompleted = {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: true,
        seguiu_dieta: true,
        registro_visual: true
      };
      expect(calculateDayCompletion(allTasks)).toBe(100);
    });
  });

  describe('getTaskSummary', () => {
    it('should return correct task summary', () => {
      const summary = getTaskSummary(mockTasks);
      expect(summary.completed).toHaveLength(3);
      expect(summary.total).toBe(5);
      expect(summary.percentage).toBe(60);
      expect(summary.completed).toContain('Hidratação');
      expect(summary.completed).toContain('Sono de qualidade');
      expect(summary.completed).toContain('Dieta');
    });
  });

  describe('isChallengeSuccessful', () => {
    it('should return true for successful challenge with 5+ completed days', () => {
      const successfulDays = Array.from({ length: 7 }, (_, i) => ({
        ...mockDailyScores[0],
        day: i + 1,
        completed: i < 5 // 5 completed days
      }));
      expect(isChallengeSuccessful(mockStats, successfulDays)).toBe(true);
    });

    it('should return true for challenge with 2+ perfect days', () => {
      const statsWithPerfectDays = { ...mockStats, perfectDays: 3 };
      expect(isChallengeSuccessful(statsWithPerfectDays, mockDailyScores)).toBe(true);
    });

    it('should return true for high total score', () => {
      const highScoreDays = mockDailyScores.map(day => ({ ...day, score: 150 }));
      expect(isChallengeSuccessful(mockStats, highScoreDays)).toBe(true);
    });
  });

  describe('formatScore', () => {
    it('should format scores under 1000 as is', () => {
      expect(formatScore(500)).toBe('500');
      expect(formatScore(999)).toBe('999');
    });

    it('should format scores over 1000 with k suffix', () => {
      expect(formatScore(1000)).toBe('1.0k');
      expect(formatScore(1500)).toBe('1.5k');
      expect(formatScore(2000)).toBe('2.0k');
    });
  });

  describe('getTrendAnalysis', () => {
    it('should detect upward trend', () => {
      const upwardTrend: DailyProgress[] = [
        { ...mockDailyScores[0], score: 20 },
        { ...mockDailyScores[0], score: 30 },
        { ...mockDailyScores[0], score: 40 },
        { ...mockDailyScores[0], score: 50 }
      ];
      const analysis = getTrendAnalysis(upwardTrend);
      expect(analysis.direction).toBe('up');
      expect(analysis.percentage).toBeGreaterThan(0);
    });

    it('should detect downward trend', () => {
      const downwardTrend: DailyProgress[] = [
        { ...mockDailyScores[0], score: 50 },
        { ...mockDailyScores[0], score: 40 },
        { ...mockDailyScores[0], score: 30 },
        { ...mockDailyScores[0], score: 20 }
      ];
      const analysis = getTrendAnalysis(downwardTrend);
      expect(analysis.direction).toBe('down');
      expect(analysis.percentage).toBeLessThan(0);
    });

    it('should handle stable trend', () => {
      const stableTrend: DailyProgress[] = [
        { ...mockDailyScores[0], score: 40 },
        { ...mockDailyScores[0], score: 42 },
        { ...mockDailyScores[0], score: 38 },
        { ...mockDailyScores[0], score: 41 }
      ];
      const analysis = getTrendAnalysis(stableTrend);
      expect(analysis.direction).toBe('stable');
    });
  });

  describe('generateShareText', () => {
    it('should generate appropriate share text', () => {
      const shareData = {
        patientName: 'João',
        challengeDuration: 7,
        totalScore: 350,
        stats: mockStats
      };
      
      const shareText = generateShareText(shareData);
      expect(shareText).toContain('desafio de 7 dias');
      expect(shareText).toContain('350 pontos');
      expect(shareText).toContain('2 dias perfeitos');
      expect(shareText).toContain('#ShapeExpress');
    });
  });
});