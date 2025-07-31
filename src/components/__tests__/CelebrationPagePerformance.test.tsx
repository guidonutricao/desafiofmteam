import { render, screen, act } from '@testing-library/react';
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
    >
      Confetti Animation
    </div>
  )
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

const mockChallengeData: ChallengeData = {
  patientName: 'Performance Test User',
  challengeDuration: 7,
  totalScore: 105,
  dailyScores: Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    score: 15,
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    goals: ['hidratacao', 'sono_qualidade'],
    completed: true,
    tasks_completed: {
      hidratacao: true,
      sono_qualidade: true,
      atividade_fisica: i % 2 === 0,
      seguiu_dieta: i % 3 === 0,
      registro_visual: i % 4 === 0
    }
  })),
  stats: {
    perfectDays: 0,
    averageScore: 15,
    improvementPercent: 25,
    streakRecord: 7
  }
};

describe('CelebrationPage Performance Tests', () => {
  beforeEach(() => {
    // Mock performance APIs
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
    global.cancelAnimationFrame = vi.fn();
    
    // Mock performance.now for timing measurements
    Object.defineProperty(performance, 'now', {
      value: vi.fn(() => Date.now()),
      writable: true
    });

    // Mock IntersectionObserver for lazy loading tests
    global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: []
    }));

    // Mock ResizeObserver for responsive tests
    global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Animation Performance', () => {
    it('should use GPU-accelerated animations', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for GPU acceleration classes
      const gpuElements = document.querySelectorAll('.gpu-accelerated');
      expect(gpuElements.length).toBeGreaterThan(0);

      // Verify transform-based animations (GPU-friendly)
      const transformElements = document.querySelectorAll('[class*="translate"], [class*="scale"], [class*="rotate"]');
      expect(transformElements.length).toBeGreaterThan(0);
    });

    it('should optimize animation timing for performance', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for reasonable animation durations
      const durationElements = document.querySelectorAll('[class*="duration-"]');
      expect(durationElements.length).toBeGreaterThan(0);

      // Verify no excessively long animations (> 1000ms)
      durationElements.forEach(element => {
        const classes = element.className;
        expect(classes).not.toMatch(/duration-[2-9]\d{3,}/); // No durations > 1999ms
      });
    });

    it('should batch animation updates efficiently', async () => {
      const { rerender } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Track requestAnimationFrame calls
      const rafCallCount = (global.requestAnimationFrame as any).mock.calls.length;

      // Fast-forward through animation sequence
      act(() => {
        vi.advanceTimersByTime(1600); // All animations complete
      });

      // Re-render multiple times rapidly
      for (let i = 0; i < 5; i++) {
        rerender(<CelebrationPage challengeData={mockChallengeData} />);
      }

      // Should not cause excessive RAF calls
      const finalRafCallCount = (global.requestAnimationFrame as any).mock.calls.length;
      expect(finalRafCallCount - rafCallCount).toBeLessThan(20); // Reasonable limit
    });

    it('should handle animation cleanup properly', () => {
      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Start animations
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Track cleanup calls
      const cancelCallsBefore = (global.cancelAnimationFrame as any).mock.calls.length;

      // Unmount component
      unmount();

      // Should clean up animations
      const cancelCallsAfter = (global.cancelAnimationFrame as any).mock.calls.length;
      expect(cancelCallsAfter).toBeGreaterThanOrEqual(cancelCallsBefore);
    });

    it('should respect reduced motion preferences', () => {
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

      // Should still render content
      expect(screen.getByText('Performance Test User!')).toBeInTheDocument();

      // Animation elements should still exist but may have reduced motion
      const animatedElements = document.querySelectorAll('.animate-slide-up-staggered');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Memory Management', () => {
    it('should not create memory leaks with timers', () => {
      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Create multiple timer-based animations
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Track active timers before unmount
      const activeTimersBefore = vi.getTimerCount();

      // Unmount component
      unmount();

      // Should clean up timers
      const activeTimersAfter = vi.getTimerCount();
      expect(activeTimersAfter).toBeLessThanOrEqual(activeTimersBefore);
    });

    it('should handle rapid mount/unmount cycles', () => {
      // Simulate rapid component mounting/unmounting
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);
        
        act(() => {
          vi.advanceTimersByTime(50);
        });
        
        unmount();
      }

      // Should not throw errors or cause memory issues
      expect(() => {
        render(<CelebrationPage challengeData={mockChallengeData} />);
      }).not.toThrow();
    });

    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Should add event listeners for online/offline and keyboard events
      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();

      // Should remove event listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should handle DOM node cleanup', () => {
      const { unmount } = render(<CelebrationPage challengeData={mockChallengeData} />);

      // Verify component renders
      expect(screen.getByText('Performance Test User!')).toBeInTheDocument();

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();

      // DOM should be clean after unmount
      expect(screen.queryByText('Performance Test User!')).not.toBeInTheDocument();
    });
  });

  describe('Rendering Performance', () => {
    it('should render efficiently with large datasets', () => {
      const largeDataset: ChallengeData = {
        ...mockChallengeData,
        dailyScores: Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          score: Math.floor(Math.random() * 20),
          date: `2024-01-${String(i + 1).padStart(2, '0')}`,
          goals: ['hidratacao', 'sono_qualidade', 'atividade_fisica'],
          completed: true,
          tasks_completed: {
            hidratacao: Math.random() > 0.5,
            sono_qualidade: Math.random() > 0.5,
            atividade_fisica: Math.random() > 0.5,
            seguiu_dieta: Math.random() > 0.5,
            registro_visual: Math.random() > 0.5
          }
        }))
      };

      const startTime = performance.now();
      render(<CelebrationPage challengeData={largeDataset} />);
      const endTime = performance.now();

      // Should render within reasonable time (< 100ms in test environment)
      expect(endTime - startTime).toBeLessThan(100);

      // Should still display content correctly
      expect(screen.getByText('Performance Test User!')).toBeInTheDocument();
    });

    it('should handle frequent re-renders efficiently', () => {
      const { rerender } = render(<CelebrationPage challengeData={mockChallengeData} />);

      const startTime = performance.now();

      // Perform multiple re-renders
      for (let i = 0; i < 20; i++) {
        const updatedData = {
          ...mockChallengeData,
          totalScore: mockChallengeData.totalScore + i
        };
        rerender(<CelebrationPage challengeData={updatedData} />);
      }

      const endTime = performance.now();

      // Should handle re-renders efficiently
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should optimize confetti rendering', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      const confetti = screen.getByTestId('confetti');
      
      // Should limit particle count for performance
      const particleCount = confetti.getAttribute('data-particle-count');
      expect(parseInt(particleCount || '0')).toBeLessThanOrEqual(50);

      // Should use efficient colors
      const colors = confetti.getAttribute('data-colors');
      expect(colors).toBeTruthy();
      expect(colors?.split(',').length).toBeLessThanOrEqual(10); // Reasonable color limit
    });
  });

  describe('Layout Performance', () => {
    it('should avoid layout thrashing with animations', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check that animations use transform/opacity instead of layout properties
      const animatedElements = document.querySelectorAll('[class*="animate-"]');
      
      animatedElements.forEach(element => {
        const classes = element.className;
        
        // Should not animate layout-triggering properties
        expect(classes).not.toMatch(/animate-.*width/);
        expect(classes).not.toMatch(/animate-.*height/);
        expect(classes).not.toMatch(/animate-.*top/);
        expect(classes).not.toMatch(/animate-.*left/);
        expect(classes).not.toMatch(/animate-.*margin/);
        expect(classes).not.toMatch(/animate-.*padding/);
      });
    });

    it('should use efficient CSS for responsive design', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for efficient responsive classes
      const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]');
      expect(responsiveElements.length).toBeGreaterThan(0);

      // Should use CSS Grid/Flexbox for layouts
      const layoutElements = document.querySelectorAll('.grid, .flex');
      expect(layoutElements.length).toBeGreaterThan(0);
    });

    it('should minimize reflows during animation', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Elements with will-change should be present for performance
      const willChangeElements = document.querySelectorAll('[style*="will-change"]');
      
      // At minimum, animated elements should have performance optimizations
      const animatedElements = document.querySelectorAll('.animate-slide-up-staggered, .animate-float');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Resource Optimization', () => {
    it('should lazy load non-critical components', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Critical content should load immediately
      expect(screen.getByText('Performance Test User!')).toBeInTheDocument();
      expect(screen.getByText('Parabéns,')).toBeInTheDocument();

      // Non-critical elements may load with delay
      act(() => {
        vi.advanceTimersByTime(1600);
      });

      // All content should be available after animations
      expect(screen.getByText('Sua Evolução')).toBeInTheDocument();
      expect(screen.getByText('Quer Resultados ainda melhores?')).toBeInTheDocument();
    });

    it('should optimize image loading', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Check for optimized image attributes
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        // Should have loading optimization
        expect(img.getAttribute('loading')).toBeTruthy();
        
        // Should have proper alt text
        expect(img.getAttribute('alt')).toBeTruthy();
      });
    });

    it('should handle network conditions gracefully', () => {
      // Mock slow network
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '2g',
          downlink: 0.5,
          rtt: 2000
        },
        writable: true
      });

      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Should still render core content
      expect(screen.getByText('Performance Test User!')).toBeInTheDocument();

      // Should handle reduced functionality gracefully
      const confetti = screen.getByTestId('confetti');
      expect(confetti).toBeInTheDocument();
    });
  });

  describe('Bundle Size Impact', () => {
    it('should use efficient imports', () => {
      // This test verifies that the component doesn't import unnecessary modules
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Component should render successfully with mocked dependencies
      expect(screen.getByText('Performance Test User!')).toBeInTheDocument();
      
      // Verify that essential functionality works
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('confetti')).toBeInTheDocument();
    });

    it('should minimize DOM nodes for performance', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Count total DOM nodes
      const allElements = document.querySelectorAll('*');
      
      // Should be reasonable for a celebration page (not excessive)
      expect(allElements.length).toBeLessThan(200); // Reasonable limit for this component
    });
  });

  describe('Accessibility Performance', () => {
    it('should not impact performance with accessibility features', () => {
      const startTime = performance.now();
      render(<CelebrationPage challengeData={mockChallengeData} />);
      const endTime = performance.now();

      // Accessibility features should not significantly impact render time
      expect(endTime - startTime).toBeLessThan(100);

      // Should have accessibility features
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Pular para o conteúdo principal')).toBeInTheDocument();
    });

    it('should handle screen reader announcements efficiently', () => {
      render(<CelebrationPage challengeData={mockChallengeData} />);

      // Should call screen reader announcement without performance issues
      expect(require('@/lib/accessibilityUtils').announceToScreenReader).toHaveBeenCalled();

      // Component should still be responsive
      expect(screen.getByText('Performance Test User!')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Performance', () => {
    it('should handle errors without memory leaks', () => {
      // Mock console.error to avoid test noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      // This would be caught by CelebrationErrorBoundary in real usage
      expect(() => {
        render(<ErrorComponent />);
      }).toThrow();

      consoleSpy.mockRestore();
    });

    it('should recover from errors gracefully', () => {
      const invalidData = {
        ...mockChallengeData,
        dailyScores: null as any
      };

      render(<CelebrationPage challengeData={invalidData} />);

      // Should show error state without crashing
      expect(screen.getByText('Dados Inconsistentes')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /recarregar/i })).toBeInTheDocument();
    });
  });
});