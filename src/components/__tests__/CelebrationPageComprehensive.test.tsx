import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import CelebrationPage from '@/pages/CelebrationPage';
import { type ChallengeData } from '@/hooks/useCelebrationData';

// Mock all dependencies
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false
  }))
}));

vi.mock('@/hooks/useChallengeStatus', () => ({
  useChallengeStatus: vi.fn(() => ({
    isCompleted: true,
    loading: false
  }))
}));

vi.mock('@/hooks/useCelebrationData', () => ({
  useCelebrationData: vi.fn(() => ({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
    retryCount: 0,
    isRetrying: false
  }))
}));

vi.mock('@/components/Confetti', () => ({
  Confetti: ({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: string }) => (
    <div data-testid="confetti" aria-hidden={ariaHidden}>Confetti Animation</div>
  )
}));

vi.mock('@/components/TrophyIcon', () => ({
  TrophyIcon: ({ className, size }: { className?: string; size?: number }) => (
    <div
      data-testid="trophy-icon"
      className={className}
      style={{ width: size, height: size }}
    >
      Trophy
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
  announceToScreenReader: vi.fn(() => {
    const element = document.createElement('div');
    element.setAttribute('aria-live', 'polite');
    element.className = 'sr-only';
    return element;
  }),
  manageFocus: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>
}));

const mockChallengeData: ChallengeData = {
  patientName: 'Maria Santos',
  challengeDuration: 7,
  totalScore: 98,
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
      score: 18,
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
      score: 12,
      date: '2024-01-03',
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
      day: 4,
      score: 16,
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
      score: 13,
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
      score: 11,
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
    perfectDays: 1, // Only day 2 has all 5 tasks completed
    averageScore: 14,
    improvementPercent: 35,
    streakRecord: 7
  }
};

describe('CelebrationPage Comprehensive Tests', () => {
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
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    });

    // Mock window.matchMedia for animation preferences
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
    global.cancelAnimationFrame = vi.fn();

    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Component Rendering and Data Processing', () => {
    it('should render all main sections with correct data', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Hero section
      expect(screen.getByText('Parabéns,')).toBeInTheDocument();
      expect(screen.getByText('Maria Santos!')).toBeInTheDocument();
      expect(screen.getByText('98')).toBeInTheDocument();
      expect(screen.getByText('pontos conquistados')).toBeInTheDocument();

      // Evolution card section
      expect(screen.getByText('Sua Evolução')).toBeInTheDocument();

      // Daily score dashboard section
      expect(screen.getByText('Sua Jornada de 7 Dias')).toBeInTheDocument();

      // CTA section
      expect(screen.getByText('Quer Resultados ainda melhores?')).toBeInTheDocument();

      // Social sharing
      expect(screen.getByRole('button', { name: /compartilhar conquista/i })).toBeInTheDocument();
    });

    it('should process challenge statistics correctly', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Verify total score calculation
      const totalScore = mockChallengeData.dailyScores.reduce((sum, day) => sum + day.score, 0);
      expect(totalScore).toBe(98);

      // Verify perfect days calculation (all 5 tasks completed)
      const perfectDays = mockChallengeData.dailyScores.filter(day => {
        const tasks = day.tasks_completed;
        return tasks.hidratacao && tasks.sono_qualidade && tasks.atividade_fisica &&
          tasks.seguiu_dieta && tasks.registro_visual;
      }).length;
      expect(perfectDays).toBe(1); // Only day 2

      // Verify average score
      const averageScore = Math.round(totalScore / 7);
      expect(averageScore).toBe(14);
    });

    it('should handle missing or invalid data gracefully', () => {
      const invalidData = {
        ...mockChallengeData,
        patientName: '',
        dailyScores: null as any
      };

      render(<CelebrationPage challengeData={invalidData} />);

      // Should show data validation error
      expect(screen.getByText('Dados Inconsistentes')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /recarregar dados do desafio/i })).toBeInTheDocument();
    });

    it('should handle partial daily scores data', () => {
      const partialData = {
        ...mockChallengeData,
        dailyScores: mockChallengeData.dailyScores.slice(0, 3) // Only 3 days
      };

      render(<CelebrationPage challengeData={partialData} />);

      // Should still render with available data
      expect(screen.getByText('Maria Santos!')).toBeInTheDocument();
      expect(screen.getByText('Sua Evolução')).toBeInTheDocument();
    });
  });

  describe('Animation System and State Management', () => {
    it('should trigger staggered animations on mount', async () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Initially elements should be hidden (opacity-0)
      const animatedElements = document.querySelectorAll('.animate-slide-up-staggered');
      expect(animatedElements.length).toBeGreaterThan(0);

      // Fast-forward timers to trigger animations
      act(() => {
        vi.advanceTimersByTime(1600); // All animations should complete
      });

      await waitFor(() => {
        // Elements should become visible after animation
        const visibleElements = document.querySelectorAll('.opacity-100');
        expect(visibleElements.length).toBeGreaterThan(0);
      });
    });

    it('should apply correct animation delays to different sections', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for elements with different animation delays
      const elementsWithDelay = document.querySelectorAll('[class*="animate-delay"]');
      expect(elementsWithDelay.length).toBeGreaterThan(0);

      // Verify staggered delay classes exist
      expect(document.querySelector('.animate-delay-100')).toBeInTheDocument();
      expect(document.querySelector('.animate-delay-200')).toBeInTheDocument();
      expect(document.querySelector('.animate-delay-300')).toBeInTheDocument();
    });

    it('should manage animation state correctly', async () => {
      const { rerender } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Fast-forward to trigger first animation stage
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Re-render should maintain animation state
      rerender(<CelebrationPage challengeData={mockChallengeData} />);

      // Animation elements should still be present
      const animatedElements = document.querySelectorAll('.animate-slide-up-staggered');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should handle animation cleanup on unmount', () => {
      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Verify component mounts without errors
      expect(screen.getByText('Maria Santos!')).toBeInTheDocument();

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Social Sharing Functionality', () => {
    it('should handle Web Share API success', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      await user.click(shareButton);

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Shape Express - Desafio Concluído!',
        text: 'Acabei de concluir o desafio de 7 dias! 💪 Consegui 98 pontos!',
        url: window.location.href
      });
    });

    it('should fallback to clipboard when Web Share API fails', async () => {
      const shareError = new Error('Share failed');
      const mockShare = vi.fn().mockRejectedValue(shareError);
      const mockWriteText = vi.fn().mockResolvedValue(undefined);

      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      });
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          'Acabei de concluir o desafio de 7 dias! 💪 Consegui 98 pontos!\n\nhttps://shapeexpress.com/celebration'
        );
      });
    });

    it('should call onShare callback when provided', async () => {
      const mockOnShare = vi.fn();
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<CelebrationPage challengeData={mockChallengeData} onShare={mockOnShare} />);

      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockOnShare).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Lead Generation CTA', () => {
    it('should generate correct WhatsApp URL with user data', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const ctaButton = screen.getByRole('button', { name: /conhecer acompanhamento premium/i });
      await user.click(ctaButton);

      expect(global.open).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/5511948464441?text='),
        '_blank'
      );

      const whatsappUrl = (global.open as any).mock.calls[0][0];
      const decodedMessage = decodeURIComponent(whatsappUrl);

      expect(decodedMessage).toContain('98 pontos');
      expect(decodedMessage).toContain('desafio de 7 dias');
      expect(decodedMessage).toContain('Shape Express');
    });

    it('should call onCTAClick callback when provided', async () => {
      const mockOnCTAClick = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CelebrationPage challengeData={mockChallengeData} onCTAClick={mockOnCTAClick} />);

      const ctaButton = screen.getByRole('button', { name: /conhecer acompanhamento premium/i });
      await user.click(ctaButton);

      expect(mockOnCTAClick).toHaveBeenCalledTimes(1);
    });

    it('should render benefits cards with correct content', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      expect(screen.getByText('Plano Personalizado')).toBeInTheDocument();
      expect(screen.getByText('Acompanhamento 1:1')).toBeInTheDocument();
      expect(screen.getByText('Bônus Exclusivos')).toBeInTheDocument();

      // Check benefit descriptions
      expect(screen.getByText('Treinos e dieta adaptados ao seu perfil')).toBeInTheDocument();
      expect(screen.getByText('Suporte direto com profissional')).toBeInTheDocument();
      expect(screen.getByText('Benefícios especiais para você')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should apply mobile-first responsive classes', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for mobile-responsive grid classes
      const responsiveGrids = document.querySelectorAll('.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3');
      expect(responsiveGrids.length).toBeGreaterThan(0);

      // Check for responsive text sizing
      const responsiveText = document.querySelectorAll('[class*="text-3xl"][class*="sm:text-5xl"]');
      expect(responsiveText.length).toBeGreaterThan(0);
    });

    it('should stack buttons vertically on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for flex-col class (vertical stacking)
      const buttonContainers = document.querySelectorAll('.flex-col');
      expect(buttonContainers.length).toBeGreaterThan(0);
    });

    it('should adapt daily dashboard grid for different screen sizes', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for responsive grid classes in daily dashboard
      const dashboardGrid = document.querySelector('.grid-cols-2.sm\\:grid-cols-4.lg\\:grid-cols-7');
      expect(dashboardGrid).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels and semantic structure', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Proper heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Parabéns,');
      expect(screen.getByRole('heading', { level: 2, name: /sua evolução/i })).toBeInTheDocument();

      // ARIA labels on interactive elements
      const ctaButton = screen.getByRole('button', { name: /conhecer acompanhamento premium/i });
      expect(ctaButton).toHaveAttribute('aria-label', expect.stringContaining('WhatsApp'));
    });

    it('should have skip link for keyboard navigation', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const skipLink = screen.getByText('Pular para o conteúdo principal');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should manage focus correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const skipLink = screen.getByText('Pular para o conteúdo principal');
      const mainContent = screen.getByRole('main');

      await user.click(skipLink);

      // manageFocus should be called with main content
      expect(require('@/lib/accessibilityUtils').manageFocus).toHaveBeenCalledWith(mainContent);
    });

    it('should announce page load to screen readers', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      expect(require('@/lib/accessibilityUtils').announceToScreenReader).toHaveBeenCalledWith(
        expect.stringContaining('Maria Santos')
      );
    });

    it('should hide decorative elements from screen readers', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const confetti = screen.getByTestId('confetti');
      expect(confetti).toHaveAttribute('aria-hidden', 'true');

      // Check for other decorative elements
      const decorativeElements = document.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThan(1);
    });
  });

  describe('Error Handling and Loading States', () => {
    it('should show loading state with proper accessibility', () => {
      const { useCelebrationData } = require('@/hooks/useCelebrationData');
      useCelebrationData.mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refresh: vi.fn(),
        retryCount: 0,
        isRetrying: false
      });

      render(<CelebrationPage challengeData={undefined} />);

      expect(screen.getByText(/preparando sua celebração/i)).toBeInTheDocument();
      expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/carregando página de celebração/i)).toBeInTheDocument();
    });

    it('should show error state with retry functionality', () => {
      const mockRefresh = vi.fn();
      const { useCelebrationData } = require('@/hooks/useCelebrationData');
      useCelebrationData.mockReturnValue({
        data: null,
        loading: false,
        error: 'Erro ao carregar dados do desafio',
        refresh: mockRefresh,
        retryCount: 2,
        isRetrying: false
      });

      render(<CelebrationPage challengeData={undefined} />);

      expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
      expect(screen.getByText('Erro ao carregar dados do desafio')).toBeInTheDocument();
      expect(screen.getByText('Tentativas realizadas: 2 de 3')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
      fireEvent.click(retryButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors with appropriate messaging', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      const { useCelebrationData } = require('@/hooks/useCelebrationData');
      useCelebrationData.mockReturnValue({
        data: null,
        loading: false,
        error: 'Erro de conexão com o servidor',
        refresh: vi.fn(),
        retryCount: 1,
        isRetrying: false
      });

      render(<CelebrationPage challengeData={undefined} />);

      expect(screen.getByText('Sem conexão com a internet')).toBeInTheDocument();
      expect(screen.getByText('Erro de Conexão')).toBeInTheDocument();
      expect(screen.getByText('Verifique sua conexão com a internet')).toBeInTheDocument();
    });

    it('should handle authentication errors', () => {
      const { useCelebrationData } = require('@/hooks/useCelebrationData');
      useCelebrationData.mockReturnValue({
        data: null,
        loading: false,
        error: 'JWT token expirado',
        refresh: vi.fn(),
        retryCount: 0,
        isRetrying: false
      });

      render(<CelebrationPage challengeData={undefined} />);

      expect(screen.getByText('Sessão Expirada')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /fazer login/i })).toBeInTheDocument();
    });
  });

  describe('Social Media Integration', () => {
    it('should update meta tags on component mount', () => {
      const { updateSocialMetaTags, generateCelebrationMetaTags, addStructuredData } = require('@/lib/socialMetaTags');

      render(<CelebrationPage challengeData={mockChallengeData} />);

      expect(generateCelebrationMetaTags).toHaveBeenCalledWith(mockChallengeData);
      expect(updateSocialMetaTags).toHaveBeenCalled();
      expect(addStructuredData).toHaveBeenCalledWith(mockChallengeData);
    });

    it('should cleanup meta tags on component unmount', () => {
      const { cleanupSocialMetaTags } = require('@/lib/socialMetaTags');

      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);
      unmount();

      expect(cleanupSocialMetaTags).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not cause memory leaks with animations', () => {
      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Fast-forward timers to create timeouts
      act(() => {
        vi.advanceTimersByTime(1600);
      });

      // Component should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid re-renders without errors', () => {
      const { rerender } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Rapid re-renders should not cause errors
      for (let i = 0; i < 5; i++) {
        rerender(<CelebrationPage challengeData={mockChallengeData} />);
      }

      expect(screen.getByText('Maria Santos!')).toBeInTheDocument();
    });

    it('should cleanup timers on unmount', () => {
      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Start some timers
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Unmount should clear timers
      unmount();

      // Advancing timers after unmount should not cause errors
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }).not.toThrow();
    });
  });

  describe('Navigation and Routing', () => {
    it('should redirect to login when user is not authenticated', () => {
      const { useAuth } = require('@/hooks/use-auth');
      useAuth.mockReturnValue({
        user: null,
        loading: false
      });

      render(<CelebrationPage challengeData={mockChallengeData} />);

      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
    });

    it('should redirect to challenge page when challenge is not completed', () => {
      const { useChallengeStatus } = require('@/hooks/useChallengeStatus');
      useChallengeStatus.mockReturnValue({
        isCompleted: false,
        loading: false
      });

      render(<CelebrationPage challengeData={undefined} />);

      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/desafio-diario');
    });

    it('should handle keyboard navigation with Escape key', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const mainContent = screen.getByRole('main');

      await user.keyboard('{Escape}');

      // Should focus main content
      expect(mainContent).toHaveFocus();
    });
  });

  describe('Network Status Monitoring', () => {
    it('should monitor online/offline status', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Simulate going offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          value: false,
          writable: true,
        });
        window.dispatchEvent(new Event('offline'));
      });

      // Should show offline indicator in error states
      // (This would be visible if there was an error)
    });

    it('should auto-retry when coming back online after error', () => {
      const mockRefresh = vi.fn();
      const { useCelebrationData } = require('@/hooks/useCelebrationData');
      useCelebrationData.mockReturnValue({
        data: null,
        loading: false,
        error: 'Network error',
        refresh: mockRefresh,
        retryCount: 1,
        isRetrying: false
      });

      render(<CelebrationPage challengeData={undefined} />);

      // Simulate coming back online
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          value: true,
          writable: true,
        });
        window.dispatchEvent(new Event('online'));
      });

      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});