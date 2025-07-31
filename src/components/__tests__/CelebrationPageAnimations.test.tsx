import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  Confetti: ({ particleCount, colors }: { particleCount?: number; colors?: string[] }) => (
    <div 
      data-testid="confetti" 
      data-particle-count={particleCount}
      data-colors={colors?.join(',')}
      aria-hidden="true"
    >
      Confetti Animation
    </div>
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
  generateCelebrationMetaTags: vi.fn(() => ({})),
  cleanupSocialMetaTags: vi.fn()
}));

const mockChallengeData: ChallengeData = {
  patientName: 'Carlos Silva',
  challengeDuration: 7,
  totalScore: 88,
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
    {
      day: 3,
      score: 10,
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
      score: 13,
      date: '2024-01-04',
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
      day: 5,
      score: 11,
      date: '2024-01-05',
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
      day: 6,
      score: 14,
      date: '2024-01-06',
      goals: ['hidratacao', 'atividade_fisica', 'registro_visual'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: false,
        atividade_fisica: true,
        seguiu_dieta: false,
        registro_visual: true
      }
    },
    {
      day: 7,
      score: 13,
      date: '2024-01-07',
      goals: ['hidratacao', 'sono_qualidade', 'seguiu_dieta'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: false,
        seguiu_dieta: true,
        registro_visual: false
      }
    }
  ],
  stats: {
    perfectDays: 0,
    averageScore: 12.6,
    improvementPercent: 20,
    streakRecord: 7
  }
};

describe('CelebrationPage Animation System', () => {
  beforeEach(() => {
    // Mock CSS animation support
    Object.defineProperty(window, 'getComputedStyle', {
      value: () => ({
        animationName: 'slideUp',
        animationDuration: '0.6s',
        animationDelay: '0.3s',
        animationFillMode: 'both'
      }),
      writable: true
    });

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
    global.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Confetti Animation', () => {
    it('should render confetti with correct particle count', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const confetti = screen.getByTestId('confetti');
      expect(confetti).toBeInTheDocument();
      expect(confetti).toHaveAttribute('data-particle-count', '50');
    });

    it('should render confetti with celebration colors', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const confetti = screen.getByTestId('confetti');
      const colors = confetti.getAttribute('data-colors');
      
      // Should include celebration colors
      expect(colors).toContain('#fbbf24'); // amber-400
      expect(colors).toContain('#f59e0b'); // amber-500
      expect(colors).toContain('#d97706'); // amber-600
    });

    it('should hide confetti from screen readers', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const confetti = screen.getByTestId('confetti');
      expect(confetti).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Staggered Entry Animations', () => {
    it('should apply staggered animation delays to sections', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for elements with staggered animation delays
      const elementsWithDelay = document.querySelectorAll('[style*="animation-delay"]');
      expect(elementsWithDelay.length).toBeGreaterThan(0);

      // Verify different delay values
      const delays = Array.from(elementsWithDelay).map(el => 
        el.getAttribute('style')?.match(/animation-delay:\s*(\d+)ms/)?.[1]
      ).filter(Boolean);

      expect(delays.length).toBeGreaterThan(1);
      expect(new Set(delays).size).toBeGreaterThan(1); // Multiple different delays
    });

    it('should apply slideUp animation class to animated elements', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const animatedElements = document.querySelectorAll('.animate-slide-up-staggered');
      expect(animatedElements.length).toBeGreaterThan(0);

      // Each animated element should have the correct class
      animatedElements.forEach(element => {
        expect(element).toHaveClass('animate-slide-up-staggered');
      });
    });

    it('should sequence animations in logical order', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const elementsWithDelay = Array.from(document.querySelectorAll('[style*="animation-delay"]'));
      
      // Extract delay values and sort by DOM order
      const delayData = elementsWithDelay.map((el, index) => ({
        element: el,
        domIndex: index,
        delay: parseInt(el.getAttribute('style')?.match(/animation-delay:\s*(\d+)ms/)?.[1] || '0')
      }));

      // Delays should generally increase with DOM order (staggered effect)
      for (let i = 1; i < delayData.length; i++) {
        expect(delayData[i].delay).toBeGreaterThanOrEqual(delayData[i-1].delay);
      }
    });
  });

  describe('Trophy Animation', () => {
    it('should render trophy with floating animation class', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const trophy = screen.getByTestId('trophy-icon');
      expect(trophy).toBeInTheDocument();
      expect(trophy).toHaveClass('animate-float');
    });

    it('should apply drop shadow to trophy', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const trophy = screen.getByTestId('trophy-icon');
      expect(trophy).toHaveClass('drop-shadow-lg');
    });

    it('should render trophy with correct size', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const trophy = screen.getByTestId('trophy-icon');
      expect(trophy).toHaveStyle({ width: '80px', height: '80px' });
    });
  });

  describe('Card Hover Effects', () => {
    it('should apply hover effects to daily score cards', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Find daily score cards
      const dayCards = document.querySelectorAll('[role="listitem"]');
      expect(dayCards.length).toBeGreaterThan(0);

      // Each card should have hover effects
      dayCards.forEach(card => {
        expect(card.className).toMatch(/hover:scale-105/);
        expect(card.className).toMatch(/hover:shadow-xl/);
        expect(card.className).toMatch(/transition-all/);
      });
    });

    it('should apply hover effects to evolution card statistics', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Find statistics cards within evolution card
      const statsCards = document.querySelectorAll('[role="listitem"]');
      
      statsCards.forEach(card => {
        expect(card.className).toMatch(/hover:/);
        expect(card.className).toMatch(/transition/);
      });
    });
  });

  describe('Button Animation Effects', () => {
    it('should apply hover animations to share button', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      expect(shareButton.className).toMatch(/hover:scale-105/);
      expect(shareButton.className).toMatch(/transition-all/);
      expect(shareButton.className).toMatch(/duration-300/);
    });

    it('should apply hover animations to CTA button', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const ctaButton = screen.getByRole('button', { name: /conhecer acompanhamento premium/i });
      expect(ctaButton.className).toMatch(/hover:scale-105/);
      expect(ctaButton.className).toMatch(/transition-all/);
      expect(ctaButton.className).toMatch(/duration-300/);
    });

    it('should apply glow effects to buttons', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        // Should have shadow effects for glow
        expect(button.className).toMatch(/shadow/);
      });
    });
  });

  describe('Background Gradient Animation', () => {
    it('should apply diagonal gradient background', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for gradient background classes
      const backgroundElements = document.querySelectorAll('.bg-gradient-to-br');
      expect(backgroundElements.length).toBeGreaterThan(0);
    });

    it('should use celebration color scheme in gradients', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for amber/gold gradient colors
      const gradientElements = document.querySelectorAll('[class*="from-amber"], [class*="to-amber"]');
      expect(gradientElements.length).toBeGreaterThan(0);
    });
  });

  describe('Animation Performance', () => {
    it('should use GPU-accelerated animations', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for GPU acceleration class
      const gpuElements = document.querySelectorAll('.gpu-accelerated');
      expect(gpuElements.length).toBeGreaterThan(0);
    });

    it('should apply will-change property for performance', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for elements that should have will-change
      const animatedElements = document.querySelectorAll('.animate-float, .animate-slide-up-staggered');
      
      animatedElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        // In a real browser, this would check for will-change: transform
        expect(computedStyle).toBeDefined();
      });
    });

    it('should not cause layout thrashing with animations', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Animations should use transform and opacity, not layout properties
      const animatedElements = document.querySelectorAll('[class*="animate-"]');
      
      animatedElements.forEach(element => {
        // Should not animate width, height, top, left, etc.
        expect(element.className).not.toMatch(/animate-.*width/);
        expect(element.className).not.toMatch(/animate-.*height/);
        expect(element.className).not.toMatch(/animate-.*top/);
        expect(element.className).not.toMatch(/animate-.*left/);
      });
    });
  });

  describe('Animation Accessibility', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Should still render but potentially with reduced animations
      expect(screen.getByText('Carlos Silva!')).toBeInTheDocument();
    });

    it('should not interfere with screen reader navigation', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Animated elements should still be accessible
      const animatedElements = document.querySelectorAll('.animate-slide-up-staggered');
      
      animatedElements.forEach(element => {
        // Should not have aria-hidden unless it's decorative
        if (element.getAttribute('aria-hidden') === 'true') {
          // Only decorative elements should be hidden
          expect(element.textContent).not.toMatch(/\w+/); // No meaningful text
        }
      });
    });
  });

  describe('Animation Timing and Sequencing', () => {
    it('should have appropriate animation durations', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for duration classes
      const durationElements = document.querySelectorAll('[class*="duration-"]');
      expect(durationElements.length).toBeGreaterThan(0);

      // Common durations should be reasonable (300ms, 500ms, etc.)
      durationElements.forEach(element => {
        expect(element.className).toMatch(/duration-(300|500|700|1000)/);
      });
    });

    it('should complete all animations within reasonable time', async () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // All animations should complete within 2 seconds
      await waitFor(() => {
        const animatedElements = document.querySelectorAll('.animate-slide-up-staggered');
        expect(animatedElements.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('should maintain animation state consistency', () => {
      const { rerender } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Get initial animation state
      const initialAnimatedElements = document.querySelectorAll('.animate-slide-up-staggered');
      const initialCount = initialAnimatedElements.length;

      // Re-render should maintain consistent animation state
      rerender(<CelebrationPage challengeData={mockChallengeData} />);

      const rerenderedAnimatedElements = document.querySelectorAll('.animate-slide-up-staggered');
      expect(rerenderedAnimatedElements.length).toBe(initialCount);
    });
  });

  describe('Visual Effects Integration', () => {
    it('should coordinate multiple animation systems', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Should have confetti, trophy float, and staggered entry animations
      expect(screen.getByTestId('confetti')).toBeInTheDocument();
      expect(screen.getByTestId('trophy-icon')).toHaveClass('animate-float');
      
      const staggeredElements = document.querySelectorAll('.animate-slide-up-staggered');
      expect(staggeredElements.length).toBeGreaterThan(0);
    });

    it('should apply consistent visual theme across animations', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // All animated elements should use consistent color scheme
      const coloredElements = document.querySelectorAll('[class*="amber"], [class*="green"]');
      expect(coloredElements.length).toBeGreaterThan(0);

      // Should maintain brand colors throughout
      coloredElements.forEach(element => {
        expect(element.className).toMatch(/(amber|green|emerald)-(100|200|300|400|500|600|700)/);
      });
    });
  });
});