import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import CelebrationPage from '@/pages/CelebrationPage';
import { type ChallengeData } from '@/hooks/useCelebrationData';

// Mock all dependencies
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/useChallengeStatus', () => ({
  useChallengeStatus: vi.fn()
}));

vi.mock('@/hooks/useCelebrationData', () => ({
  useCelebrationData: vi.fn()
}));

vi.mock('@/components/Confetti', () => ({
  Confetti: ({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: string }) => (
    <div data-testid="confetti" aria-hidden={ariaHidden}>Confetti Animation</div>
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

const mockChallengeData: ChallengeData = {
  patientName: 'Ana Silva',
  challengeDuration: 7,
  totalScore: 95,
  dailyScores: [
    {
      day: 1,
      score: 15,
      date: '2024-01-01',
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
      day: 2,
      score: 12,
      date: '2024-01-02',
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
      day: 3,
      score: 18,
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
    },
    {
      day: 4,
      score: 10,
      date: '2024-01-04',
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
      day: 5,
      score: 14,
      date: '2024-01-05',
      goals: ['hidratacao', 'atividade_fisica', 'seguiu_dieta'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: false,
        atividade_fisica: true,
        seguiu_dieta: true,
        registro_visual: false
      }
    },
    {
      day: 6,
      score: 13,
      date: '2024-01-06',
      goals: ['hidratacao', 'sono_qualidade', 'registro_visual'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: false,
        seguiu_dieta: false,
        registro_visual: true
      }
    },
    {
      day: 7,
      score: 13,
      date: '2024-01-07',
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
    perfectDays: 1, // Only day 3 has all 5 tasks completed
    averageScore: 13.6,
    improvementPercent: 30,
    streakRecord: 7
  }
};

describe('CelebrationPage Integration Tests', () => {
  beforeEach(() => {
    // Mock authentication
    vi.mocked(require('@/hooks/use-auth').useAuth).mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      loading: false
    });

    vi.mocked(require('@/hooks/useChallengeStatus').useChallengeStatus).mockReturnValue({
      isCompleted: true,
      loading: false
    });

    vi.mocked(require('@/hooks/useCelebrationData').useCelebrationData).mockReturnValue({
      data: mockChallengeData,
      loading: false,
      error: null,
      refresh: vi.fn()
    });

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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete User Journey', () => {
    it('should render complete celebration experience with all components', async () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Hero section with user name and score
      expect(screen.getByText('Parabéns,')).toBeInTheDocument();
      expect(screen.getByText('Ana Silva!')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
      expect(screen.getByText('pontos')).toBeInTheDocument();

      // Evolution card with statistics
      expect(screen.getByText('Sua Evolução')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Perfect days
      expect(screen.getByText('Dias Perfeitos')).toBeInTheDocument();
      expect(screen.getByText('14')).toBeInTheDocument(); // Average score (rounded)
      expect(screen.getByText('Média de Pontos')).toBeInTheDocument();
      expect(screen.getByText('+30%')).toBeInTheDocument(); // Improvement
      expect(screen.getByText('Melhoria')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument(); // Streak record
      expect(screen.getByText('Sequência Máxima')).toBeInTheDocument();

      // Daily score dashboard
      expect(screen.getByText('Sua Jornada de 7 Dias')).toBeInTheDocument();
      
      // All 7 days should be displayed
      for (let day = 1; day <= 7; day++) {
        const dayElements = screen.getAllByText(day.toString());
        expect(dayElements.length).toBeGreaterThan(0);
      }

      // Social sharing button
      expect(screen.getByRole('button', { name: /compartilhar conquista/i })).toBeInTheDocument();

      // CTA section
      expect(screen.getByText('Quer Resultados ainda melhores?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /conhecer acompanhamento premium/i })).toBeInTheDocument();

      // Confetti animation
      expect(screen.getByTestId('confetti')).toBeInTheDocument();
    });

    it('should handle complete user interaction flow', async () => {
      const user = userEvent.setup();
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Test social sharing
      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      await user.click(shareButton);

      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Shape Express - Desafio Concluído!',
        text: 'Acabei de concluir o desafio de 7 dias! 💪 Consegui 95 pontos!',
        url: window.location.href
      });

      // Test CTA interaction
      const ctaButton = screen.getByRole('button', { name: /conhecer acompanhamento premium/i });
      await user.click(ctaButton);

      expect(global.open).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/5511948464441?text='),
        '_blank'
      );

      const whatsappUrl = (global.open as any).mock.calls[0][0];
      expect(decodeURIComponent(whatsappUrl)).toContain('95 pontos');
      expect(decodeURIComponent(whatsappUrl)).toContain('desafio de 7 dias');
    });
  });

  describe('Data Processing and State Management', () => {
    it('should correctly process and display challenge statistics', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Verify calculated statistics are displayed correctly
      const totalScore = mockChallengeData.dailyScores.reduce((sum, day) => sum + day.score, 0);
      expect(totalScore).toBe(95);
      expect(screen.getByText('95')).toBeInTheDocument();

      // Perfect days calculation (all 5 tasks completed)
      const perfectDays = mockChallengeData.dailyScores.filter(day => {
        const tasks = day.tasks_completed;
        return tasks.hidratacao && tasks.sono_qualidade && tasks.atividade_fisica && 
               tasks.seguiu_dieta && tasks.registro_visual;
      }).length;
      expect(perfectDays).toBe(1); // Only day 3
      expect(screen.getByText('1')).toBeInTheDocument();

      // Average score calculation
      const averageScore = Math.round(totalScore / 7);
      expect(averageScore).toBe(14);
      expect(screen.getByText('14')).toBeInTheDocument();
    });

    it('should handle loading state correctly', () => {
      vi.mocked(require('@/hooks/useCelebrationData').useCelebrationData).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refresh: vi.fn()
      });

      render(<CelebrationPage challengeData={undefined} />);

      // Should show loading state
      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });

    it('should handle error state correctly', () => {
      vi.mocked(require('@/hooks/useCelebrationData').useCelebrationData).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Failed to load data'),
        refresh: vi.fn()
      });

      render(<CelebrationPage challengeData={undefined} />);

      // Should show error state
      expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    });
  });

  describe('Animation System Integration', () => {
    it('should apply staggered animations to components', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for animation classes
      const animatedElements = document.querySelectorAll('.animate-slide-up-staggered');
      expect(animatedElements.length).toBeGreaterThan(0);

      // Check for different animation delays
      const elementsWithDelay = document.querySelectorAll('[style*="animation-delay"]');
      expect(elementsWithDelay.length).toBeGreaterThan(0);
    });

    it('should render confetti with proper accessibility', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const confetti = screen.getByTestId('confetti');
      expect(confetti).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Responsive Design Integration', () => {
    it('should adapt layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for mobile-responsive classes
      const responsiveElements = document.querySelectorAll('.grid-cols-2');
      expect(responsiveElements.length).toBeGreaterThan(0);

      // Buttons should stack vertically on mobile
      const buttonContainer = document.querySelector('.flex-col');
      expect(buttonContainer).toBeInTheDocument();
    });

    it('should adapt layout for desktop screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for desktop-responsive classes
      const desktopElements = document.querySelectorAll('.lg\\:grid-cols-7');
      expect(desktopElements.length).toBeGreaterThan(0);
    });
  });

  describe('Social Media Integration', () => {
    it('should update meta tags on component mount', () => {
      const mockUpdateSocialMetaTags = vi.mocked(require('@/lib/socialMetaTags').updateSocialMetaTags);
      const mockGenerateCelebrationMetaTags = vi.mocked(require('@/lib/socialMetaTags').generateCelebrationMetaTags);

      render(<CelebrationPage challengeData={mockChallengeData} />);

      expect(mockGenerateCelebrationMetaTags).toHaveBeenCalledWith(mockChallengeData);
      expect(mockUpdateSocialMetaTags).toHaveBeenCalled();
    });

    it('should cleanup meta tags on component unmount', () => {
      const mockCleanupSocialMetaTags = vi.mocked(require('@/lib/socialMetaTags').cleanupSocialMetaTags);

      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);
      unmount();

      expect(mockCleanupSocialMetaTags).toHaveBeenCalled();
    });
  });

  describe('Lead Generation Integration', () => {
    it('should generate correct WhatsApp message with user data', async () => {
      const user = userEvent.setup();
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const ctaButton = screen.getByRole('button', { name: /conhecer acompanhamento premium/i });
      await user.click(ctaButton);

      const whatsappUrl = (global.open as any).mock.calls[0][0];
      const decodedMessage = decodeURIComponent(whatsappUrl);

      expect(decodedMessage).toContain('Ana Silva');
      expect(decodedMessage).toContain('95 pontos');
      expect(decodedMessage).toContain('desafio de 7 dias');
      expect(decodedMessage).toContain('Shape Express');
    });

    it('should call onCTAClick callback when provided', async () => {
      const mockOnCTAClick = vi.fn();
      const user = userEvent.setup();
      
      render(<CelebrationPage challengeData={mockChallengeData} onCTAClick={mockOnCTAClick} />);

      const ctaButton = screen.getByRole('button', { name: /conhecer acompanhamento premium/i });
      await user.click(ctaButton);

      expect(mockOnCTAClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle missing challenge data gracefully', () => {
      render(<CelebrationPage challengeData={undefined} />);

      // Should show appropriate message for missing data
      expect(screen.getByText(/nenhum dado de desafio encontrado/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /recarregar dados do desafio/i })).toBeInTheDocument();
    });

    it('should handle partial challenge data', () => {
      const partialData = {
        ...mockChallengeData,
        dailyScores: mockChallengeData.dailyScores.slice(0, 3) // Only 3 days
      };

      render(<CelebrationPage challengeData={partialData} />);

      // Should still render but with available data
      expect(screen.getByText('Ana Silva!')).toBeInTheDocument();
      expect(screen.getByText('Sua Evolução')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should not cause memory leaks with animations', () => {
      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Component should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid re-renders without errors', () => {
      const { rerender } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Rapid re-renders should not cause errors
      for (let i = 0; i < 5; i++) {
        rerender(<CelebrationPage challengeData={mockChallengeData} />);
      }

      expect(screen.getByText('Ana Silva!')).toBeInTheDocument();
    });
  });

  describe('Cross-Component Integration', () => {
    it('should properly integrate EvolutionCard with challenge data', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // EvolutionCard should display correct stats
      expect(screen.getByText('Sua Evolução')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Perfect days
      expect(screen.getByText('14')).toBeInTheDocument(); // Average score
      expect(screen.getByText('+30%')).toBeInTheDocument(); // Improvement
      expect(screen.getByText('7')).toBeInTheDocument(); // Streak
    });

    it('should properly integrate DailyScoreDashboard with daily scores', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // DailyScoreDashboard should show all days
      expect(screen.getByText('Sua Jornada de 7 Dias')).toBeInTheDocument();
      
      // Should show completion badges for completed days
      const completedBadges = screen.getAllByText('Concluído');
      expect(completedBadges.length).toBe(7); // All days are completed
    });

    it('should properly integrate SocialSharing with challenge data', async () => {
      const user = userEvent.setup();
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      await user.click(shareButton);

      // Should generate share content with challenge data
      expect(navigator.share).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('95 pontos')
        })
      );
    });
  });
});