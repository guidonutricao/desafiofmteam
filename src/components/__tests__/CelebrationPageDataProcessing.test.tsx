import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CelebrationPage from '@/pages/CelebrationPage';
import { type ChallengeData } from '@/hooks/useCelebrationData';

// Mock dependencies
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false
  })
}));

vi.mock('@/hooks/useChallengeStatus', () => ({
  useChallengeStatus: () => ({
    isCompleted: true,
    loading: false
  })
}));

vi.mock('@/hooks/useCelebrationData', () => ({
  useCelebrationData: () => ({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn()
  })
}));

vi.mock('@/components/Confetti', () => ({
  Confetti: () => <div data-testid="confetti">Confetti</div>
}));

vi.mock('@/lib/socialMetaTags', () => ({
  updateSocialMetaTags: vi.fn(),
  generateCelebrationMetaTags: vi.fn(() => ({})),
  addStructuredData: vi.fn(),
  cleanupSocialMetaTags: vi.fn()
}));

vi.mock('@/lib/accessibilityUtils', () => ({
  announceToScreenReader: vi.fn(() => document.createElement('div')),
  manageFocus: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>
}));

describe('CelebrationPage Data Processing Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Challenge Statistics Calculations', () => {
    it('should calculate perfect days correctly', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 100,
        dailyScores: [
          {
            day: 1,
            score: 20,
            date: '2024-01-01',
            goals: ['hidratacao', 'sono_qualidade', 'atividade_fisica', 'seguiu_dieta', 'registro_visual'],
            completed: true,
            tasks_completed: {
              hidratacao: true,
              sono_qualidade: true,
              atividade_fisica: true,
              seguiu_dieta: true,
              registro_visual: true
            }
          },
          {
            day: 2,
            score: 15,
            date: '2024-01-02',
            goals: ['hidratacao', 'sono_qualidade', 'atividade_fisica'],
            completed: true,
            tasks_completed: {
              hidratacao: true,
              sono_qualidade: true,
              atividade_fisica: true,
              seguiu_dieta: false,
              registro_visual: false
            }
          },
          {
            day: 3,
            score: 20,
            date: '2024-01-03',
            goals: ['hidratacao', 'sono_qualidade', 'atividade_fisica', 'seguiu_dieta', 'registro_visual'],
            completed: true,
            tasks_completed: {
              hidratacao: true,
              sono_qualidade: true,
              atividade_fisica: true,
              seguiu_dieta: true,
              registro_visual: true
            }
          }
        ],
        stats: {
          perfectDays: 2, // Days 1 and 3 have all 5 tasks completed
          averageScore: 18.3,
          improvementPercent: 25,
          streakRecord: 3
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Verify perfect days are displayed correctly
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Dias Perfeitos')).toBeInTheDocument();
    });

    it('should handle zero perfect days', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 50,
        dailyScores: [
          {
            day: 1,
            score: 10,
            date: '2024-01-01',
            goals: ['hidratacao', 'sono_qualidade'],
            completed: true,
            tasks_completed: {
              hidratacao: true,
              sono_qualidade: true,
              atividade_fisica: false,
              seguiu_dieta: false,
              registro_visual: false
            }
          },
          {
            day: 2,
            score: 15,
            date: '2024-01-02',
            goals: ['hidratacao', 'atividade_fisica', 'seguiu_dieta'],
            completed: true,
            tasks_completed: {
              hidratacao: true,
              sono_qualidade: false,
              atividade_fisica: true,
              seguiu_dieta: true,
              registro_visual: false
            }
          }
        ],
        stats: {
          perfectDays: 0, // No days with all 5 tasks completed
          averageScore: 12.5,
          improvementPercent: 10,
          streakRecord: 2
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should display 0 perfect days
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Dias Perfeitos')).toBeInTheDocument();
    });

    it('should calculate and display total score correctly', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 125,
        dailyScores: [
          { day: 1, score: 18, date: '2024-01-01', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } },
          { day: 2, score: 17, date: '2024-01-02', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: true, registro_visual: true } },
          { day: 3, score: 19, date: '2024-01-03', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true } },
          { day: 4, score: 16, date: '2024-01-04', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: false, atividade_fisica: true, seguiu_dieta: true, registro_visual: true } },
          { day: 5, score: 18, date: '2024-01-05', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: true } },
          { day: 6, score: 17, date: '2024-01-06', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: true, registro_visual: true } },
          { day: 7, score: 20, date: '2024-01-07', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true } }
        ],
        stats: {
          perfectDays: 2, // Days 3 and 7
          averageScore: 17.9,
          improvementPercent: 40,
          streakRecord: 7
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Verify total score calculation
      const calculatedTotal = challengeData.dailyScores.reduce((sum, day) => sum + day.score, 0);
      expect(calculatedTotal).toBe(125);
      expect(screen.getByText('125')).toBeInTheDocument();
      expect(screen.getByText('pontos conquistados')).toBeInTheDocument();
    });

    it('should handle average score calculation and display', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 91,
        dailyScores: [
          { day: 1, score: 13, date: '2024-01-01', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: true, registro_visual: false } },
          { day: 2, score: 13, date: '2024-01-02', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: false, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } },
          { day: 3, score: 13, date: '2024-01-03', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: false, registro_visual: true } },
          { day: 4, score: 13, date: '2024-01-04', goals: [], completed: true, tasks_completed: { hidratacao: false, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } },
          { day: 5, score: 13, date: '2024-01-05', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: false, atividade_fisica: false, seguiu_dieta: true, registro_visual: true } },
          { day: 6, score: 13, date: '2024-01-06', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false } },
          { day: 7, score: 13, date: '2024-01-07', goals: [], completed: true, tasks_completed: { hidratacao: false, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } }
        ],
        stats: {
          perfectDays: 0,
          averageScore: 13,
          improvementPercent: 0,
          streakRecord: 7
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Average should be 91/7 = 13
      expect(screen.getByText('13')).toBeInTheDocument();
      expect(screen.getByText('Média de Pontos')).toBeInTheDocument();
    });

    it('should display improvement percentage correctly', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 100,
        dailyScores: [],
        stats: {
          perfectDays: 3,
          averageScore: 14.3,
          improvementPercent: 45,
          streakRecord: 5
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      expect(screen.getByText('+45%')).toBeInTheDocument();
      expect(screen.getByText('Melhoria')).toBeInTheDocument();
    });

    it('should handle negative improvement percentage', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 80,
        dailyScores: [],
        stats: {
          perfectDays: 1,
          averageScore: 11.4,
          improvementPercent: -15,
          streakRecord: 3
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      expect(screen.getByText('-15%')).toBeInTheDocument();
      expect(screen.getByText('Melhoria')).toBeInTheDocument();
    });

    it('should display streak record correctly', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 95,
        dailyScores: [],
        stats: {
          perfectDays: 2,
          averageScore: 13.6,
          improvementPercent: 20,
          streakRecord: 6
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('Sequência Máxima')).toBeInTheDocument();
    });
  });

  describe('Daily Scores Processing', () => {
    it('should process and display all daily scores', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 105,
        dailyScores: [
          { day: 1, score: 15, date: '2024-01-01', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false } },
          { day: 2, score: 14, date: '2024-01-02', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: false, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } },
          { day: 3, score: 16, date: '2024-01-03', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: true, registro_visual: true } },
          { day: 4, score: 13, date: '2024-01-04', goals: [], completed: true, tasks_completed: { hidratacao: false, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } },
          { day: 5, score: 17, date: '2024-01-05', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: true } },
          { day: 6, score: 15, date: '2024-01-06', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: false, atividade_fisica: true, seguiu_dieta: true, registro_visual: true } },
          { day: 7, score: 15, date: '2024-01-07', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } }
        ],
        stats: {
          perfectDays: 0,
          averageScore: 15,
          improvementPercent: 25,
          streakRecord: 7
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // All daily scores should be displayed
      expect(screen.getByText('15')).toBeInTheDocument(); // Multiple days with score 15
      expect(screen.getByText('14')).toBeInTheDocument();
      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.getByText('13')).toBeInTheDocument();
      expect(screen.getByText('17')).toBeInTheDocument();

      // All day numbers should be displayed
      for (let day = 1; day <= 7; day++) {
        const dayElements = screen.getAllByText(day.toString());
        expect(dayElements.length).toBeGreaterThan(0);
      }
    });

    it('should handle incomplete daily scores array', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 45,
        dailyScores: [
          { day: 1, score: 15, date: '2024-01-01', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false } },
          { day: 2, score: 15, date: '2024-01-02', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: false, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } },
          { day: 3, score: 15, date: '2024-01-03', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: true, registro_visual: false } }
          // Only 3 days instead of 7
        ],
        stats: {
          perfectDays: 0,
          averageScore: 15,
          improvementPercent: 0,
          streakRecord: 3
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should still render with available data
      expect(screen.getByText('Test User!')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('Sua Jornada de 7 Dias')).toBeInTheDocument();
    });

    it('should handle days with zero scores', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 30,
        dailyScores: [
          { day: 1, score: 15, date: '2024-01-01', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false } },
          { day: 2, score: 0, date: '2024-01-02', goals: [], completed: false, tasks_completed: { hidratacao: false, sono_qualidade: false, atividade_fisica: false, seguiu_dieta: false, registro_visual: false } },
          { day: 3, score: 15, date: '2024-01-03', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false } },
          { day: 4, score: 0, date: '2024-01-04', goals: [], completed: false, tasks_completed: { hidratacao: false, sono_qualidade: false, atividade_fisica: false, seguiu_dieta: false, registro_visual: false } }
        ],
        stats: {
          perfectDays: 0,
          averageScore: 7.5,
          improvementPercent: 0,
          streakRecord: 1
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should display zero scores
      const zeroScores = screen.getAllByText('0');
      expect(zeroScores.length).toBeGreaterThan(0);

      // Should show "Não iniciado" for incomplete days
      const notStartedLabels = screen.getAllByText('Não iniciado');
      expect(notStartedLabels.length).toBe(2); // Days 2 and 4
    });

    it('should correctly identify completed vs incomplete days', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 60,
        dailyScores: [
          { day: 1, score: 15, date: '2024-01-01', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false } },
          { day: 2, score: 15, date: '2024-01-02', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: false, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } },
          { day: 3, score: 0, date: '2024-01-03', goals: [], completed: false, tasks_completed: { hidratacao: false, sono_qualidade: false, atividade_fisica: false, seguiu_dieta: false, registro_visual: false } },
          { day: 4, score: 15, date: '2024-01-04', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: true, registro_visual: false } },
          { day: 5, score: 15, date: '2024-01-05', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false } }
        ],
        stats: {
          perfectDays: 0,
          averageScore: 12,
          improvementPercent: 15,
          streakRecord: 2
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should show "Concluído" for completed days with scores > 0
      const completedBadges = screen.getAllByText('Concluído');
      expect(completedBadges.length).toBe(4); // Days 1, 2, 4, 5

      // Should show "Não iniciado" for incomplete days
      const notStartedLabels = screen.getAllByText('Não iniciado');
      expect(notStartedLabels.length).toBe(1); // Day 3
    });
  });

  describe('Data Validation and Error Handling', () => {
    it('should handle missing patient name', () => {
      const challengeData: ChallengeData = {
        patientName: '',
        challengeDuration: 7,
        totalScore: 100,
        dailyScores: [],
        stats: {
          perfectDays: 0,
          averageScore: 14.3,
          improvementPercent: 20,
          streakRecord: 5
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should show data validation error
      expect(screen.getByText('Dados Inconsistentes')).toBeInTheDocument();
    });

    it('should handle null daily scores', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 100,
        dailyScores: null as any,
        stats: {
          perfectDays: 0,
          averageScore: 14.3,
          improvementPercent: 20,
          streakRecord: 5
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should show data validation error
      expect(screen.getByText('Dados Inconsistentes')).toBeInTheDocument();
    });

    it('should handle invalid daily scores structure', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 100,
        dailyScores: 'invalid' as any,
        stats: {
          perfectDays: 0,
          averageScore: 14.3,
          improvementPercent: 20,
          streakRecord: 5
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should show data validation error
      expect(screen.getByText('Dados Inconsistentes')).toBeInTheDocument();
    });

    it('should handle missing stats object', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 100,
        dailyScores: [
          { day: 1, score: 15, date: '2024-01-01', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false } }
        ],
        stats: null as any
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should still render but may show default values or handle gracefully
      expect(screen.getByText('Test User!')).toBeInTheDocument();
    });

    it('should handle extreme values gracefully', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 9999,
        dailyScores: [
          { day: 1, score: 9999, date: '2024-01-01', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: true } }
        ],
        stats: {
          perfectDays: 999,
          averageScore: 9999,
          improvementPercent: 999,
          streakRecord: 999
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should display extreme values without breaking
      expect(screen.getByText('9999')).toBeInTheDocument();
      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('+999%')).toBeInTheDocument();
    });
  });

  describe('Challenge Duration Variations', () => {
    it('should handle different challenge durations', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 14, // 14-day challenge
        totalScore: 200,
        dailyScores: Array.from({ length: 14 }, (_, i) => ({
          day: i + 1,
          score: 14 + (i % 3),
          date: `2024-01-${String(i + 1).padStart(2, '0')}`,
          goals: [],
          completed: true,
          tasks_completed: {
            hidratacao: true,
            sono_qualidade: i % 2 === 0,
            atividade_fisica: i % 3 === 0,
            seguiu_dieta: i % 4 === 0,
            registro_visual: i % 5 === 0
          }
        })),
        stats: {
          perfectDays: 0,
          averageScore: 14.3,
          improvementPercent: 30,
          streakRecord: 14
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should display correct challenge duration
      expect(screen.getByText('14 dias')).toBeInTheDocument();
      expect(screen.getByText('desafio de 14 dias')).toBeInTheDocument();
    });

    it('should handle single day challenge', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 1,
        totalScore: 15,
        dailyScores: [
          { day: 1, score: 15, date: '2024-01-01', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false } }
        ],
        stats: {
          perfectDays: 0,
          averageScore: 15,
          improvementPercent: 0,
          streakRecord: 1
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should display single day correctly
      expect(screen.getByText('1 dias')).toBeInTheDocument(); // Note: keeping original format
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('Task Completion Analysis', () => {
    it('should analyze task completion patterns correctly', () => {
      const challengeData: ChallengeData = {
        patientName: 'Test User',
        challengeDuration: 7,
        totalScore: 91,
        dailyScores: [
          { day: 1, score: 13, date: '2024-01-01', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: true, registro_visual: false } },
          { day: 2, score: 13, date: '2024-01-02', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: false, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } },
          { day: 3, score: 13, date: '2024-01-03', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: false, seguiu_dieta: false, registro_visual: true } },
          { day: 4, score: 13, date: '2024-01-04', goals: [], completed: true, tasks_completed: { hidratacao: false, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } },
          { day: 5, score: 13, date: '2024-01-05', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: false, atividade_fisica: false, seguiu_dieta: true, registro_visual: true } },
          { day: 6, score: 13, date: '2024-01-06', goals: [], completed: true, tasks_completed: { hidratacao: true, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: false, registro_visual: false } },
          { day: 7, score: 13, date: '2024-01-07', goals: [], completed: true, tasks_completed: { hidratacao: false, sono_qualidade: true, atividade_fisica: true, seguiu_dieta: true, registro_visual: false } }
        ],
        stats: {
          perfectDays: 0, // No perfect days (no day has all 5 tasks completed)
          averageScore: 13,
          improvementPercent: 0,
          streakRecord: 7
        }
      };

      render(<CelebrationPage challengeData={challengeData} />);

      // Should show 0 perfect days since no day has all 5 tasks completed
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Dias Perfeitos')).toBeInTheDocument();

      // All days should show as completed since they have scores > 0
      const completedBadges = screen.getAllByText('Concluído');
      expect(completedBadges.length).toBe(7);
    });
  });
});