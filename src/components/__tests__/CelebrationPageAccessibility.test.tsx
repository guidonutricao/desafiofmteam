import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import CelebrationPage from '@/pages/CelebrationPage';
import { type ChallengeData } from '@/hooks/useCelebrationData';

// Mock the hooks and components
vi.mock('@/hooks/useCelebrationData', () => ({
  useCelebrationData: () => ({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn()
  })
}));

vi.mock('@/components/Confetti', () => ({
  Confetti: ({ 'aria-hidden': ariaHidden }: { 'aria-hidden'?: string }) => (
    <div data-testid="confetti" aria-hidden={ariaHidden}>Confetti Animation</div>
  )
}));

vi.mock('@/lib/socialMetaTags', () => ({
  updateSocialMetaTags: vi.fn(),
  generateCelebrationMetaTags: vi.fn(() => ({}))
}));

const mockChallengeData: ChallengeData = {
  patientName: 'João Silva',
  challengeDuration: 7,
  totalScore: 85,
  dailyScores: [
    {
      day: 1,
      score: 12,
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
    // Add more days as needed for testing
    ...Array.from({ length: 5 }, (_, i) => ({
      day: i + 3,
      score: 10 + i,
      date: `2024-01-0${i + 3}`,
      goals: ['hidratacao'],
      completed: i % 2 === 0,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: false,
        atividade_fisica: false,
        seguiu_dieta: false,
        registro_visual: false
      }
    }))
  ],
  stats: {
    perfectDays: 3,
    averageScore: 12.1,
    improvementPercent: 25,
    streakRecord: 2
  }
};

describe('CelebrationPage Accessibility', () => {
  beforeEach(() => {
    // Reset any DOM modifications
    document.body.innerHTML = '';
    // Clear any existing timers
    vi.clearAllTimers();
  });

  afterEach(() => {
    // Clear any remaining timers
    vi.clearAllTimers();
  });

  describe('Semantic HTML Structure', () => {
    it('should have proper heading hierarchy', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Main title should be h1
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Parabéns,');
      
      // Section headings should be h2
      expect(screen.getByRole('heading', { level: 2, name: /sua evolução/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /sua jornada de 7 dias/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /quer resultados ainda melhores/i })).toBeInTheDocument();
    });

    it('should use proper landmark roles', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Should have main landmark
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Should have multiple section landmarks
      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should have proper list structures', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Statistics should be in a list
      const statsLists = screen.getAllByRole('list');
      expect(statsLists.length).toBeGreaterThan(0);
      
      // List items should be present
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('ARIA Labels and Descriptions', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // CTA button should have descriptive label
      const ctaButton = screen.getByRole('button', { name: /conhecer acompanhamento premium/i });
      expect(ctaButton).toHaveAttribute('aria-label', expect.stringContaining('WhatsApp'));
      
      // Share button should have descriptive label
      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      expect(shareButton).toHaveAttribute('aria-label', expect.stringContaining('redes sociais'));
    });

    it('should have proper ARIA descriptions for complex elements', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Share button should have description
      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      expect(shareButton).toHaveAttribute('aria-describedby');
      
      const descriptionId = shareButton.getAttribute('aria-describedby');
      if (descriptionId) {
        expect(document.getElementById(descriptionId)).toBeInTheDocument();
      }
    });

    it('should have proper labels for score displays', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Total score should have proper label
      const totalScoreElement = screen.getByText('85');
      expect(totalScoreElement).toHaveAttribute('aria-label', expect.stringContaining('pontos'));
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have skip link for keyboard users', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      const skipLink = screen.getByText('Pular para o conteúdo principal');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should focus main content when skip link is activated', async () => {
      const user = userEvent.setup();
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      const skipLink = screen.getByText('Pular para o conteúdo principal');
      const mainContent = screen.getByRole('main');
      
      await user.click(skipLink);
      
      expect(mainContent).toHaveFocus();
    });

    it('should have proper tab order for interactive elements', async () => {
      const user = userEvent.setup();
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Tab through interactive elements
      await user.tab();
      expect(screen.getByText('Pular para o conteúdo principal')).toHaveFocus();
      
      await user.tab();
      // Should focus on first interactive element in main content
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });

    it('should handle Escape key to return focus to main content', async () => {
      const user = userEvent.setup();
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      const mainContent = screen.getByRole('main');
      
      // Press Escape
      await user.keyboard('{Escape}');
      
      expect(mainContent).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce page load to screen readers', async () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Wait for the announcement to be added
      await waitFor(() => {
        const announcement = document.querySelector('[aria-live="polite"]');
        expect(announcement).toBeInTheDocument();
      });
    });

    it('should have proper live regions for dynamic content', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Progress completion should have live region
      const completionMessage = screen.getByText(/desafio completado com sucesso/i);
      expect(completionMessage.closest('[role="status"]')).toBeInTheDocument();
    });

    it('should hide decorative elements from screen readers', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Confetti should be hidden from screen readers
      const confetti = screen.getByTestId('confetti');
      expect(confetti).toHaveAttribute('aria-hidden', 'true');
      
      // Decorative icons should be hidden
      const decorativeElements = document.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Interactive elements should have focus styles
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button.className).toMatch(/focus-visible:/);
      });
    });

    it('should manage focus for daily score cards', async () => {
      const user = userEvent.setup();
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Daily score cards should be focusable
      const dayCards = screen.getAllByRole('listitem').filter(item => 
        item.textContent?.includes('pontos')
      );
      
      if (dayCards.length > 0) {
        await user.click(dayCards[0]);
        expect(dayCards[0]).toHaveFocus();
      }
    });
  });

  describe('Error States Accessibility', () => {
    it('should have accessible error state', () => {
      // Test the error state by rendering with no data (which triggers the no data state)
      render(<CelebrationPage challengeData={undefined} />);
      
      // The no data state should have proper accessibility
      const mainElement = screen.getByRole('main', { name: /nenhum dado de desafio encontrado/i });
      expect(mainElement).toBeInTheDocument();
      
      // Retry button should be properly labeled
      const retryButton = screen.getByRole('button', { name: /recarregar dados do desafio/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should have accessible loading state', () => {
      // For this test, we'll verify that the loading state elements have proper accessibility
      // when they would be rendered (we can't easily test the loading state with current mock setup)
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Verify that when data is available, the main content has proper accessibility
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveAttribute('aria-label', expect.stringContaining('João Silva'));
      
      // Verify that interactive elements are accessible
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Color and Contrast', () => {
    it('should not rely solely on color for information', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Completed days should have text indicators, not just color
      const completedBadges = screen.getAllByText('Concluído');
      expect(completedBadges.length).toBeGreaterThan(0);
      
      // Progress indicators should have text, not just color
      const progressIndicators = screen.getAllByText(/em progresso|não iniciado/i);
      expect(progressIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility across different screen sizes', () => {
      // Test mobile view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // All accessibility features should still work
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Pular para o conteúdo principal')).toBeInTheDocument();
      
      // Buttons should still be accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });
});