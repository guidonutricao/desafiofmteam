import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import CelebrationPage from '@/pages/CelebrationPage';
import { type ChallengeData } from '@/hooks/useCelebrationData';

// Mock all component dependencies
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

// Mock individual components to test integration
vi.mock('@/components/Confetti', () => ({
  Confetti: ({ particleCount, colors, 'aria-hidden': ariaHidden }: { 
    particleCount?: number; 
    colors?: string[]; 
    'aria-hidden'?: string;
  }) => (
    <div 
      data-testid="confetti-component" 
      data-particle-count={particleCount}
      data-colors={colors?.join(',')}
      aria-hidden={ariaHidden}
    >
      Confetti Component
    </div>
  )
}));

vi.mock('@/components/EvolutionCard', () => ({
  EvolutionCard: ({ stats, className }: { stats: any; className?: string }) => (
    <div 
      data-testid="evolution-card-component" 
      className={className}
      data-stats={JSON.stringify(stats)}
    >
      <h2>Sua Evolução</h2>
      <div>Perfect Days: {stats.perfectDays}</div>
      <div>Average Score: {stats.averageScore}</div>
      <div>Improvement: {stats.improvementPercent}%</div>
      <div>Streak: {stats.streakRecord}</div>
    </div>
  )
}));

vi.mock('@/components/DailyScoreDashboard', () => ({
  DailyScoreDashboard: ({ dailyScores, className }: { dailyScores: any[]; className?: string }) => (
    <div 
      data-testid="daily-score-dashboard-component" 
      className={className}
      data-daily-scores={JSON.stringify(dailyScores)}
    >
      <h2>Sua Jornada de 7 Dias</h2>
      {dailyScores.map(day => (
        <div key={day.day} data-testid={`day-${day.day}`}>
          Day {day.day}: {day.score} points
          {day.completed && <span data-testid={`completed-${day.day}`}>Concluído</span>}
        </div>
      ))}
    </div>
  )
}));

vi.mock('@/components/SocialSharing', () => ({
  SocialSharing: ({ challengeData, onShare, className }: { 
    challengeData: any; 
    onShare?: () => void; 
    className?: string;
  }) => (
    <div 
      data-testid="social-sharing-component" 
      className={className}
      data-challenge-data={JSON.stringify(challengeData)}
    >
      <button 
        onClick={onShare}
        aria-label="Compartilhar conquista nas redes sociais"
      >
        Compartilhar Conquista
      </button>
    </div>
  )
}));

vi.mock('@/components/CelebrationErrorBoundary', () => ({
  CelebrationErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary-component">
      {children}
    </div>
  )
}));

vi.mock('@/lib/socialMetaTags', () => ({
  updateSocialMetaTags: vi.fn(),
  generateCelebrationMetaTags: vi.fn(() => ({
    title: 'Shape Express - Desafio Concluído!',
    description: 'Acabei de concluir o desafio de 7 dias!',
    image: '/celebration-og-image.svg',
    url: 'https://shapeexpress.com/celebration'
  })),
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

const mockChallengeData: ChallengeData = {
  patientName: 'Integration Test User',
  challengeDuration: 7,
  totalScore: 112,
  dailyScores: [
    {
      day: 1,
      score: 16,
      date: '2024-01-01',
      goals: ['hidratacao', 'sono_qualidade', 'atividade_fisica', 'seguiu_dieta'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: true,
        seguiu_dieta: true,
        registro_visual: false
      }
    },
    {
      day: 2,
      score: 20,
      date: '2024-01-02',
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
      day: 3,
      score: 14,
      date: '2024-01-03',
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
      day: 4,
      score: 18,
      date: '2024-01-04',
      goals: ['hidratacao', 'atividade_fisica', 'seguiu_dieta', 'registro_visual'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: false,
        atividade_fisica: true,
        seguiu_dieta: true,
        registro_visual: true
      }
    },
    {
      day: 5,
      score: 15,
      date: '2024-01-05',
      goals: ['hidratacao', 'sono_qualidade', 'seguiu_dieta'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: false,
        seguiu_dieta: true,
        registro_visual: false
      }
    },
    {
      day: 6,
      score: 13,
      date: '2024-01-06',
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
      day: 7,
      score: 16,
      date: '2024-01-07',
      goals: ['hidratacao', 'atividade_fisica', 'seguiu_dieta', 'registro_visual'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: false,
        atividade_fisica: true,
        seguiu_dieta: true,
        registro_visual: true
      }
    }
  ],
  stats: {
    perfectDays: 1, // Only day 2 has all 5 tasks completed
    averageScore: 16,
    improvementPercent: 40,
    streakRecord: 7
  }
};

describe('CelebrationPage Component Integration Tests', () => {
  beforeEach(() => {
    // Mock window APIs
    global.open = vi.fn();
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      writable: true,
    });
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Confetti Component Integration', () => {
    it('should render Confetti component with correct props', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const confetti = screen.getByTestId('confetti-component');
      expect(confetti).toBeInTheDocument();
      expect(confetti).toHaveAttribute('aria-hidden', 'true');
      expect(confetti).toHaveAttribute('data-particle-count', '50');
      
      // Should have celebration colors
      const colors = confetti.getAttribute('data-colors');
      expect(colors).toContain('#fbbf24'); // amber-400
      expect(colors).toContain('#f59e0b'); // amber-500
    });

    it('should position Confetti as background element', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const confetti = screen.getByTestId('confetti-component');
      
      // Should be hidden from screen readers (decorative)
      expect(confetti).toHaveAttribute('aria-hidden', 'true');
      
      // Should be present in the DOM
      expect(confetti).toBeInTheDocument();
    });
  });

  describe('EvolutionCard Component Integration', () => {
    it('should pass correct stats data to EvolutionCard', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const evolutionCard = screen.getByTestId('evolution-card-component');
      expect(evolutionCard).toBeInTheDocument();

      const statsData = JSON.parse(evolutionCard.getAttribute('data-stats') || '{}');
      expect(statsData).toEqual({
        perfectDays: 1,
        averageScore: 16,
        improvementPercent: 40,
        streakRecord: 7
      });
    });

    it('should display EvolutionCard content correctly', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      expect(screen.getByText('Sua Evolução')).toBeInTheDocument();
      expect(screen.getByText('Perfect Days: 1')).toBeInTheDocument();
      expect(screen.getByText('Average Score: 16')).toBeInTheDocument();
      expect(screen.getByText('Improvement: 40%')).toBeInTheDocument();
      expect(screen.getByText('Streak: 7')).toBeInTheDocument();
    });

    it('should handle EvolutionCard with edge case stats', () => {
      const edgeCaseData = {
        ...mockChallengeData,
        stats: {
          perfectDays: 0,
          averageScore: 0,
          improvementPercent: -50,
          streakRecord: 0
        }
      };

      render(<CelebrationPage challengeData={edgeCaseData} />);

      expect(screen.getByText('Perfect Days: 0')).toBeInTheDocument();
      expect(screen.getByText('Average Score: 0')).toBeInTheDocument();
      expect(screen.getByText('Improvement: -50%')).toBeInTheDocument();
      expect(screen.getByText('Streak: 0')).toBeInTheDocument();
    });
  });

  describe('DailyScoreDashboard Component Integration', () => {
    it('should pass correct daily scores to DailyScoreDashboard', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const dashboard = screen.getByTestId('daily-score-dashboard-component');
      expect(dashboard).toBeInTheDocument();

      const dailyScoresData = JSON.parse(dashboard.getAttribute('data-daily-scores') || '[]');
      expect(dailyScoresData).toHaveLength(7);
      expect(dailyScoresData[0]).toEqual(expect.objectContaining({
        day: 1,
        score: 16,
        completed: true
      }));
    });

    it('should display all daily scores in DailyScoreDashboard', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      expect(screen.getByText('Sua Jornada de 7 Dias')).toBeInTheDocument();

      // Check all days are displayed
      for (let day = 1; day <= 7; day++) {
        expect(screen.getByTestId(`day-${day}`)).toBeInTheDocument();
        expect(screen.getByText(`Day ${day}:`)).toBeInTheDocument();
      }

      // Check specific scores
      expect(screen.getByText('Day 1: 16 points')).toBeInTheDocument();
      expect(screen.getByText('Day 2: 20 points')).toBeInTheDocument();
      expect(screen.getByText('Day 7: 16 points')).toBeInTheDocument();
    });

    it('should show completion status for each day', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // All days in mock data are completed
      for (let day = 1; day <= 7; day++) {
        expect(screen.getByTestId(`completed-${day}`)).toBeInTheDocument();
      }
    });

    it('should handle DailyScoreDashboard with incomplete days', () => {
      const incompleteData = {
        ...mockChallengeData,
        dailyScores: [
          ...mockChallengeData.dailyScores.slice(0, 5),
          {
            day: 6,
            score: 0,
            date: '2024-01-06',
            goals: [],
            completed: false,
            tasks_completed: {
              hidratacao: false,
              sono_qualidade: false,
              atividade_fisica: false,
              seguiu_dieta: false,
              registro_visual: false
            }
          },
          {
            day: 7,
            score: 0,
            date: '2024-01-07',
            goals: [],
            completed: false,
            tasks_completed: {
              hidratacao: false,
              sono_qualidade: false,
              atividade_fisica: false,
              seguiu_dieta: false,
              registro_visual: false
            }
          }
        ]
      };

      render(<CelebrationPage challengeData={incompleteData} />);

      // Completed days should show completion
      expect(screen.getByTestId('completed-1')).toBeInTheDocument();
      expect(screen.getByTestId('completed-2')).toBeInTheDocument();

      // Incomplete days should not show completion
      expect(screen.queryByTestId('completed-6')).not.toBeInTheDocument();
      expect(screen.queryByTestId('completed-7')).not.toBeInTheDocument();
    });
  });

  describe('SocialSharing Component Integration', () => {
    it('should pass correct challenge data to SocialSharing', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const socialSharing = screen.getByTestId('social-sharing-component');
      expect(socialSharing).toBeInTheDocument();

      const challengeData = JSON.parse(socialSharing.getAttribute('data-challenge-data') || '{}');
      expect(challengeData).toEqual(expect.objectContaining({
        patientName: 'Integration Test User',
        challengeDuration: 7,
        totalScore: 112
      }));
    });

    it('should handle SocialSharing button interaction', async () => {
      const mockOnShare = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<CelebrationPage challengeData={mockChallengeData} onShare={mockOnShare} />);

      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      await user.click(shareButton);

      expect(mockOnShare).toHaveBeenCalledTimes(1);
    });

    it('should apply correct styling to SocialSharing', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const socialSharing = screen.getByTestId('social-sharing-component');
      
      // Should have responsive width classes
      expect(socialSharing).toHaveClass('w-full', 'sm:w-auto');
    });
  });

  describe('CelebrationErrorBoundary Integration', () => {
    it('should wrap content with CelebrationErrorBoundary', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const errorBoundary = screen.getByTestId('error-boundary-component');
      expect(errorBoundary).toBeInTheDocument();

      // Content should be inside error boundary
      expect(errorBoundary).toContainElement(screen.getByText('Integration Test User!'));
    });

    it('should handle component errors gracefully', () => {
      // Mock console.error to avoid test noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // This would be handled by the error boundary in real usage
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Should render without throwing
      expect(screen.getByTestId('error-boundary-component')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Cross-Component Data Flow', () => {
    it('should maintain data consistency across all components', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Hero section should show correct total score
      expect(screen.getByText('112')).toBeInTheDocument();

      // EvolutionCard should show correct stats
      expect(screen.getByText('Perfect Days: 1')).toBeInTheDocument();
      expect(screen.getByText('Average Score: 16')).toBeInTheDocument();

      // DailyScoreDashboard should show all days
      expect(screen.getByText('Day 1: 16 points')).toBeInTheDocument();
      expect(screen.getByText('Day 2: 20 points')).toBeInTheDocument();

      // SocialSharing should have correct data
      const socialSharing = screen.getByTestId('social-sharing-component');
      const challengeData = JSON.parse(socialSharing.getAttribute('data-challenge-data') || '{}');
      expect(challengeData.totalScore).toBe(112);
    });

    it('should handle data updates across components', () => {
      const { rerender } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Update challenge data
      const updatedData = {
        ...mockChallengeData,
        totalScore: 150,
        stats: {
          ...mockChallengeData.stats,
          perfectDays: 3
        }
      };

      rerender(<CelebrationPage challengeData={updatedData} />);

      // All components should reflect updated data
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Perfect Days: 3')).toBeInTheDocument();

      const socialSharing = screen.getByTestId('social-sharing-component');
      const challengeData = JSON.parse(socialSharing.getAttribute('data-challenge-data') || '{}');
      expect(challengeData.totalScore).toBe(150);
    });
  });

  describe('Component Lifecycle Integration', () => {
    it('should initialize all components in correct order', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // All components should be present
      expect(screen.getByTestId('confetti-component')).toBeInTheDocument();
      expect(screen.getByTestId('evolution-card-component')).toBeInTheDocument();
      expect(screen.getByTestId('daily-score-dashboard-component')).toBeInTheDocument();
      expect(screen.getByTestId('social-sharing-component')).toBeInTheDocument();
      expect(screen.getByTestId('error-boundary-component')).toBeInTheDocument();
    });

    it('should handle component unmounting cleanly', () => {
      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Verify components are mounted
      expect(screen.getByTestId('confetti-component')).toBeInTheDocument();
      expect(screen.getByTestId('evolution-card-component')).toBeInTheDocument();

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid component re-mounting', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);
        
        // Verify component renders
        expect(screen.getByText('Integration Test User!')).toBeInTheDocument();
        
        unmount();
      }

      // Final render should work correctly
      render(<CelebrationPage challengeData={mockChallengeData} />);
      expect(screen.getByText('Integration Test User!')).toBeInTheDocument();
    });
  });

  describe('Responsive Integration', () => {
    it('should pass responsive classes to child components', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // SocialSharing should have responsive classes
      const socialSharing = screen.getByTestId('social-sharing-component');
      expect(socialSharing).toHaveClass('w-full', 'sm:w-auto');

      // Other components should be present and functional
      expect(screen.getByTestId('evolution-card-component')).toBeInTheDocument();
      expect(screen.getByTestId('daily-score-dashboard-component')).toBeInTheDocument();
    });

    it('should maintain component functionality across screen sizes', () => {
      // Mock different viewport sizes
      const viewports = [375, 768, 1024, 1440];

      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);

        // All components should render at any viewport size
        expect(screen.getByTestId('confetti-component')).toBeInTheDocument();
        expect(screen.getByTestId('evolution-card-component')).toBeInTheDocument();
        expect(screen.getByTestId('daily-score-dashboard-component')).toBeInTheDocument();
        expect(screen.getByTestId('social-sharing-component')).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Animation Integration', () => {
    it('should coordinate animations across components', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for staggered animation classes
      const animatedElements = document.querySelectorAll('.animate-slide-up-staggered');
      expect(animatedElements.length).toBeGreaterThan(0);

      // Components should have animation delays
      const elementsWithDelay = document.querySelectorAll('[style*="animation-delay"]');
      expect(elementsWithDelay.length).toBeGreaterThan(0);
    });

    it('should handle animation completion across components', async () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Fast-forward through all animations
      act(() => {
        vi.advanceTimersByTime(1600);
      });

      await waitFor(() => {
        // All components should be visible after animations
        expect(screen.getByTestId('evolution-card-component')).toBeInTheDocument();
        expect(screen.getByTestId('daily-score-dashboard-component')).toBeInTheDocument();
        expect(screen.getByTestId('social-sharing-component')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility across all components', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Main accessibility structure
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Pular para o conteúdo principal')).toBeInTheDocument();

      // Component-specific accessibility
      expect(screen.getByTestId('confetti-component')).toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByRole('button', { name: /compartilhar conquista/i })).toBeInTheDocument();

      // Headings hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Parabéns,');
      expect(screen.getByRole('heading', { level: 2, name: /sua evolução/i })).toBeInTheDocument();
    });

    it('should handle focus management across components', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Skip link should work
      const skipLink = screen.getByText('Pular para o conteúdo principal');
      await user.click(skipLink);

      expect(require('@/lib/accessibilityUtils').manageFocus).toHaveBeenCalled();
    });
  });
});