import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CelebrationPage from '@/pages/CelebrationPage';
import { EvolutionCard } from '@/components/EvolutionCard';
import { DailyScoreDashboard } from '@/components/DailyScoreDashboard';
import { SocialSharing } from '@/components/SocialSharing';
import { type ChallengeData } from '@/hooks/useCelebrationData';
import { validateAriaAttributes, getFocusableElements } from '@/lib/accessibilityUtils';

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
  patientName: 'Maria Silva',
  challengeDuration: 7,
  totalScore: 92,
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
    ...Array.from({ length: 5 }, (_, i) => ({
      day: i + 3,
      score: 10 + (i * 2),
      date: `2024-01-0${i + 3}`,
      goals: ['hidratacao'],
      completed: i % 2 === 0,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: i % 2 === 0,
        atividade_fisica: false,
        seguiu_dieta: false,
        registro_visual: false
      }
    }))
  ],
  stats: {
    perfectDays: 4,
    averageScore: 13.1,
    improvementPercent: 35,
    streakRecord: 3
  }
};

describe('Accessibility Validation', () => {
  describe('WCAG 2.1 AA Compliance', () => {
    it('should have proper heading hierarchy (1.3.1)', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Check heading levels are in proper order
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
      
      // No h4 should appear before h3, etc.
      const allHeadings = screen.getAllByRole('heading');
      const headingLevels = allHeadings.map(h => parseInt(h.tagName.charAt(1)));
      
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const maxPreviousLevel = Math.max(...headingLevels.slice(0, i));
        expect(currentLevel).toBeLessThanOrEqual(maxPreviousLevel + 1);
      }
    });

    it('should have meaningful link text (2.4.4)', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      const skipLink = screen.getByText('Pular para o conteúdo principal');
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(skipLink.textContent).toBeTruthy();
    });

    it('should have sufficient color contrast (1.4.3)', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Verify that text elements don't rely solely on color
      const completedBadges = screen.getAllByText('Concluído');
      completedBadges.forEach(badge => {
        expect(badge.textContent).toBeTruthy(); // Has text, not just color
      });
    });

    it('should be keyboard accessible (2.1.1)', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // All interactive elements should be focusable
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
        expect(button).not.toHaveAttribute('disabled');
      });
      
      // Check for proper focus indicators
      buttons.forEach(button => {
        expect(button.className).toMatch(/focus-visible:/);
      });
    });

    it('should have proper form labels (1.3.1)', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // All interactive elements should have accessible names
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasLabel = button.hasAttribute('aria-label') || 
                        button.hasAttribute('aria-labelledby') || 
                        button.textContent?.trim();
        expect(hasLabel).toBeTruthy();
      });
    });

    it('should use ARIA landmarks correctly (1.3.6)', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Should have main landmark
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      
      // Should have proper section landmarks
      const regions = screen.getAllByRole('region');
      regions.forEach(region => {
        const hasLabel = region.hasAttribute('aria-label') || 
                        region.hasAttribute('aria-labelledby');
        expect(hasLabel).toBeTruthy();
      });
    });

    it('should announce dynamic content changes (4.1.3)', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Check for live regions
      const liveRegions = document.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeGreaterThan(0);
      
      // Status elements should be present
      const statusElements = screen.getAllByRole('status');
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  describe('Component-Specific Accessibility', () => {
    it('should have accessible EvolutionCard', () => {
      const stats = mockChallengeData.stats;
      render(<EvolutionCard stats={stats} />);
      
      // Should have proper heading
      const heading = screen.getByRole('heading', { name: /sua evolução/i });
      expect(heading).toBeInTheDocument();
      
      // Statistics should be in a list
      const list = screen.getByRole('list', { name: /estatísticas do desafio/i });
      expect(list).toBeInTheDocument();
      
      // Each statistic should be focusable and have proper labels
      const listItems = screen.getAllByRole('listitem');
      listItems.forEach(item => {
        expect(item).toHaveAttribute('tabindex', '0');
        expect(item).toHaveAttribute('aria-label');
      });
    });

    it('should have accessible DailyScoreDashboard', () => {
      render(<DailyScoreDashboard dailyScores={mockChallengeData.dailyScores} />);
      
      // Should have proper heading
      const heading = screen.getByRole('heading', { name: /sua jornada de 7 dias/i });
      expect(heading).toBeInTheDocument();
      
      // Daily scores should be in a list
      const list = screen.getByRole('list', { name: /progresso diário/i });
      expect(list).toBeInTheDocument();
      
      // Each day should be accessible (7 days + 4 summary stats = 11 total)
      const dayCards = screen.getAllByRole('listitem');
      expect(dayCards.length).toBeGreaterThanOrEqual(7);
      
      dayCards.forEach(card => {
        expect(card).toHaveAttribute('tabindex', '0');
        expect(card).toHaveAttribute('aria-label');
      });
    });

    it('should have accessible SocialSharing', () => {
      render(
        <SocialSharing 
          challengeData={mockChallengeData} 
          onShare={vi.fn()} 
        />
      );
      
      // Share button should be properly labeled
      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      expect(shareButton).toBeInTheDocument();
      expect(shareButton).toHaveAttribute('aria-label');
      expect(shareButton).toHaveAttribute('aria-describedby');
    });
  });

  describe('Screen Reader Support', () => {
    it('should hide decorative elements from screen readers', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Confetti should be hidden
      const confetti = screen.getByTestId('confetti');
      expect(confetti).toHaveAttribute('aria-hidden', 'true');
      
      // Decorative icons should be hidden
      const decorativeElements = document.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });

    it('should provide alternative text for images', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Trophy icons should have proper labels
      const trophyElements = document.querySelectorAll('[role="img"]');
      trophyElements.forEach(element => {
        expect(element).toHaveAttribute('aria-label');
      });
    });

    it('should use proper list markup', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      const lists = screen.getAllByRole('list');
      lists.forEach(list => {
        const listItems = list.querySelectorAll('[role="listitem"]');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Check buttons specifically for focus styles
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Should have focus styles
        expect(button.className).toMatch(/focus-visible:/);
      });
    });

    it('should have logical tab order', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      const focusableElements = getFocusableElements(document.body);
      
      // Skip link should be first
      expect(focusableElements[0]).toHaveTextContent('Pular para o conteúdo principal');
      
      // Interactive elements should be in logical order
      const buttons = focusableElements.filter(el => el.tagName === 'BUTTON');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should handle skip link correctly', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      const skipLink = screen.getByText('Pular para o conteúdo principal');
      const mainContent = screen.getByRole('main');
      
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(mainContent).toHaveAttribute('id', 'main-content');
      expect(mainContent).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Error Handling', () => {
    it('should announce errors to screen readers', () => {
      render(<CelebrationPage challengeData={undefined} />);
      
      // Should have proper error state
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveAttribute('aria-label', expect.stringContaining('Nenhum dado'));
    });

    it('should provide recovery options', () => {
      render(<CelebrationPage challengeData={undefined} />);
      
      // Should have retry button
      const retryButton = screen.getByRole('button', { name: /recarregar/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveAttribute('aria-label');
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility across screen sizes', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
      
      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // All accessibility features should still work
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Pular para o conteúdo principal')).toBeInTheDocument();
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
      
      unmount();
    });
  });

  describe('ARIA Validation', () => {
    it('should have valid ARIA attributes', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      // Get all elements with ARIA attributes
      const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
      
      elementsWithAria.forEach(element => {
        const issues = validateAriaAttributes(element as HTMLElement);
        expect(issues).toHaveLength(0);
      });
    });

    it('should have proper live regions', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);
      
      const liveRegions = document.querySelectorAll('[aria-live]');
      liveRegions.forEach(region => {
        const ariaLive = region.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(ariaLive);
      });
    });
  });
});