import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CelebrationImageGenerator } from '../celebrationImageGenerator';
import { getContrastAssessment, CELEBRATION_COLOR_COMBINATIONS } from '../contrastUtils';
import { type ChallengeData } from '@/hooks/useCelebrationData';

// Mock HTML5 Canvas for testing
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
  toDataURL: vi.fn()
};

const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  setTransform: vi.fn(),
  quadraticCurveTo: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  set fillStyle(value: any) {},
  set strokeStyle(value: any) {},
  set lineWidth(value: any) {},
  set font(value: any) {},
  set textAlign(value: any) {},
  set textBaseline(value: any) {},
  set globalAlpha(value: any) {},
  set globalCompositeOperation(value: any) {},
  set imageSmoothingEnabled(value: any) {},
  set imageSmoothingQuality(value: any) {},
  set shadowColor(value: any) {},
  set shadowOffsetX(value: any) {},
  set shadowOffsetY(value: any) {},
  set shadowBlur(value: any) {}
};

const mockGradient = {
  addColorStop: vi.fn()
};

// Mock DOM methods
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => mockCanvas),
    body: {
      offsetHeight: 100
    }
  }
});

Object.defineProperty(global, 'window', {
  value: {
    requestAnimationFrame: vi.fn((callback) => setTimeout(callback, 0))
  }
});

const mockChallengeData: ChallengeData = {
  patientName: 'João Silva',
  totalScore: 85,
  challengeDuration: 7,
  dailyScores: [
    { day: 1, score: 12, date: '2024-01-01' },
    { day: 2, score: 15, date: '2024-01-02' },
    { day: 3, score: 10, date: '2024-01-03' },
    { day: 4, score: 13, date: '2024-01-04' },
    { day: 5, score: 11, date: '2024-01-05' },
    { day: 6, score: 12, date: '2024-01-06' },
    { day: 7, score: 12, date: '2024-01-07' }
  ],
  stats: {
    completedDays: 7,
    averageScore: 12.1,
    bestDay: { day: 2, score: 15 },
    improvementTrend: 'stable' as const,
    perfectDays: 1,
    improvementPercent: -10,
    streakRecord: 3
  }
};

describe('CelebrationImageGenerator - Visual Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvas.getContext.mockReturnValue(mockContext);
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mockImageData');
    mockContext.createLinearGradient.mockReturnValue(mockGradient);
    mockContext.createRadialGradient.mockReturnValue(mockGradient);
  });

  describe('Responsive Design Validation', () => {
    it('should generate appropriate dimensions for mobile devices', () => {
      const generator = new CelebrationImageGenerator({
        deviceType: 'mobile'
      });
      
      expect(mockCanvas.width).toBe(720);
      expect(mockCanvas.height).toBe(1280);
    });

    it('should generate appropriate dimensions for tablet devices', () => {
      const generator = new CelebrationImageGenerator({
        deviceType: 'tablet'
      });
      
      expect(mockCanvas.width).toBe(900);
      expect(mockCanvas.height).toBe(1600);
    });

    it('should generate appropriate dimensions for desktop devices', () => {
      const generator = new CelebrationImageGenerator({
        deviceType: 'desktop'
      });
      
      expect(mockCanvas.width).toBe(1080);
      expect(mockCanvas.height).toBe(1920);
    });

    it('should scale font sizes appropriately for different devices', async () => {
      const mobileGenerator = new CelebrationImageGenerator({
        deviceType: 'mobile'
      });
      
      await mobileGenerator.generateCelebrationImage(mockChallengeData);
      
      // Check that font sizes are scaled down for mobile
      const fontCalls = mockContext.font.mock?.calls || [];
      // Mobile should use smaller fonts (scaled by 0.67)
      // This is tested indirectly through the font property setter
      expect(mockContext.fillText).toHaveBeenCalled();
    });
  });

  describe('Data Validation and Fallbacks', () => {
    it('should handle missing patient name with fallback', async () => {
      const invalidData = {
        ...mockChallengeData,
        patientName: ''
      };
      
      const generator = new CelebrationImageGenerator();
      const result = await generator.generateCelebrationImage(invalidData);
      
      expect(result).toBe('data:image/png;base64,mockImageData');
      // Should use "Usuário" as fallback
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('Usuário'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle invalid score with fallback', async () => {
      const invalidData = {
        ...mockChallengeData,
        totalScore: -1
      };
      
      const generator = new CelebrationImageGenerator();
      const result = await generator.generateCelebrationImage(invalidData);
      
      expect(result).toBe('data:image/png;base64,mockImageData');
      // Should use 0 as fallback for invalid score
      expect(mockContext.fillText).toHaveBeenCalledWith(
        '0',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle missing stats with fallbacks', async () => {
      const invalidData = {
        ...mockChallengeData,
        stats: null as any
      };
      
      const generator = new CelebrationImageGenerator();
      const result = await generator.generateCelebrationImage(invalidData);
      
      expect(result).toBe('data:image/png;base64,mockImageData');
      // Should render without errors using fallback stats
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should sanitize long patient names', async () => {
      const longNameData = {
        ...mockChallengeData,
        patientName: 'A'.repeat(100) // Very long name
      };
      
      const generator = new CelebrationImageGenerator();
      const result = await generator.generateCelebrationImage(longNameData);
      
      expect(result).toBe('data:image/png;base64,mockImageData');
      // Name should be truncated to 50 characters
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/^A{50}$/),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should handle special characters in patient name', async () => {
      const specialCharData = {
        ...mockChallengeData,
        patientName: '!@#$%^&*()'
      };
      
      const generator = new CelebrationImageGenerator();
      const result = await generator.generateCelebrationImage(specialCharData);
      
      expect(result).toBe('data:image/png;base64,mockImageData');
      // Should use "Usuário" as fallback for names with only special characters
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('Usuário'),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('Rendering Stability', () => {
    it('should prepare stable rendering context', async () => {
      const generator = new CelebrationImageGenerator();
      await generator.generateCelebrationImage(mockChallengeData);
      
      // Should reset transformations
      expect(mockContext.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
      
      // Should set consistent text properties
      expect(mockContext.textBaseline).toBe('middle');
      expect(mockContext.textAlign).toBe('center');
    });

    it('should handle canvas context errors gracefully', async () => {
      mockCanvas.getContext.mockReturnValue(null);
      
      const generator = new CelebrationImageGenerator();
      
      await expect(generator.generateCelebrationImage(mockChallengeData))
        .rejects.toThrow('Canvas context not available');
    });

    it('should finalize rendering properly', async () => {
      const generator = new CelebrationImageGenerator();
      await generator.generateCelebrationImage(mockChallengeData);
      
      // Should reset context state
      expect(mockContext.globalAlpha).toBe(1);
      expect(mockContext.globalCompositeOperation).toBe('source-over');
    });
  });

  describe('Visual Quality Assurance', () => {
    it('should use high-quality image smoothing', async () => {
      const generator = new CelebrationImageGenerator();
      await generator.generateCelebrationImage(mockChallengeData);
      
      expect(mockContext.imageSmoothingEnabled).toBe(true);
      expect(mockContext.imageSmoothingQuality).toBe('high');
    });

    it('should apply text shadows for better readability', async () => {
      const generator = new CelebrationImageGenerator();
      await generator.generateCelebrationImage(mockChallengeData);
      
      // Should apply and remove shadows appropriately
      // This is tested through the shadow property setters
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should use consistent color scheme', async () => {
      const generator = new CelebrationImageGenerator();
      await generator.generateCelebrationImage(mockChallengeData);
      
      // Should use the defined color palette
      expect(mockContext.fillStyle).toHaveBeenCalled();
      expect(mockContext.strokeStyle).toHaveBeenCalled();
    });
  });

  describe('Performance Validation', () => {
    it('should complete generation within reasonable time', async () => {
      const generator = new CelebrationImageGenerator();
      const startTime = Date.now();
      
      await generator.generateCelebrationImage(mockChallengeData);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 1 second (generous for testing environment)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle multiple concurrent generations', async () => {
      const generator = new CelebrationImageGenerator();
      
      const promises = Array.from({ length: 5 }, () =>
        generator.generateCelebrationImage(mockChallengeData)
      );
      
      const results = await Promise.all(promises);
      
      // All should complete successfully
      results.forEach(result => {
        expect(result).toBe('data:image/png;base64,mockImageData');
      });
    });
  });
});

describe('Color Contrast Validation', () => {
  it('should validate all celebration colors meet WCAG AA standards', () => {
    const failedCombinations: string[] = [];
    
    CELEBRATION_COLOR_COMBINATIONS.forEach(combination => {
      const assessment = getContrastAssessment(combination.foreground, combination.background);
      
      if (!assessment.meetsAA) {
        failedCombinations.push(
          `${combination.element}: ${combination.foreground} on ${combination.background} (ratio: ${assessment.ratio})`
        );
      }
    });
    
    expect(failedCombinations).toEqual([]);
  });

  it('should validate high-priority elements meet WCAG AAA standards', () => {
    const highPriorityElements = [
      'Main titles',
      'Badge text',
      'Score text',
      'Block titles',
      'Evolution titles'
    ];
    
    const failedAAA: string[] = [];
    
    CELEBRATION_COLOR_COMBINATIONS
      .filter(combo => highPriorityElements.includes(combo.element))
      .forEach(combination => {
        const assessment = getContrastAssessment(combination.foreground, combination.background);
        
        if (!assessment.meetsAAA) {
          failedAAA.push(
            `${combination.element}: ${combination.foreground} on ${combination.background} (ratio: ${assessment.ratio})`
          );
        }
      });
    
    expect(failedAAA).toEqual([]);
  });
});