import { describe, it, expect } from 'vitest';
import { 
  hexToRgb, 
  getRelativeLuminance, 
  getContrastRatio, 
  meetsWCAGStandard, 
  getContrastAssessment,
  CELEBRATION_COLOR_COMBINATIONS 
} from '../contrastUtils';

describe('contrastUtils', () => {
  describe('hexToRgb', () => {
    it('should convert hex colors to RGB', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('FFFFFF')).toEqual({ r: 255, g: 255, b: 255 }); // without #
    });

    it('should return null for invalid hex colors', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GGG')).toBeNull();
      expect(hexToRgb('')).toBeNull();
    });
  });

  describe('getRelativeLuminance', () => {
    it('should calculate correct luminance for white', () => {
      const luminance = getRelativeLuminance(255, 255, 255);
      expect(luminance).toBeCloseTo(1, 2);
    });

    it('should calculate correct luminance for black', () => {
      const luminance = getRelativeLuminance(0, 0, 0);
      expect(luminance).toBeCloseTo(0, 2);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate maximum contrast for black on white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate minimum contrast for same colors', () => {
      const ratio = getContrastRatio('#FFFFFF', '#FFFFFF');
      expect(ratio).toBeCloseTo(1, 0);
    });

    it('should handle color order consistently', () => {
      const ratio1 = getContrastRatio('#000000', '#FFFFFF');
      const ratio2 = getContrastRatio('#FFFFFF', '#000000');
      expect(ratio1).toEqual(ratio2);
    });
  });

  describe('meetsWCAGStandard', () => {
    it('should validate AA standard for normal text', () => {
      expect(meetsWCAGStandard('#000000', '#FFFFFF', 'AA', false)).toBe(true); // 21:1
      expect(meetsWCAGStandard('#767676', '#FFFFFF', 'AA', false)).toBe(true); // ~4.5:1
      expect(meetsWCAGStandard('#999999', '#FFFFFF', 'AA', false)).toBe(false); // ~2.8:1
    });

    it('should validate AAA standard for normal text', () => {
      expect(meetsWCAGStandard('#000000', '#FFFFFF', 'AAA', false)).toBe(true); // 21:1
      expect(meetsWCAGStandard('#595959', '#FFFFFF', 'AAA', false)).toBe(true); // ~7:1
      expect(meetsWCAGStandard('#767676', '#FFFFFF', 'AAA', false)).toBe(false); // ~4.5:1
    });

    it('should validate AA standard for large text', () => {
      expect(meetsWCAGStandard('#999999', '#FFFFFF', 'AA', true)).toBe(false); // ~2.8:1
      expect(meetsWCAGStandard('#767676', '#FFFFFF', 'AA', true)).toBe(true); // ~4.5:1
    });
  });

  describe('getContrastAssessment', () => {
    it('should provide complete assessment for high contrast', () => {
      const assessment = getContrastAssessment('#000000', '#FFFFFF');
      
      expect(assessment.ratio).toBe(21);
      expect(assessment.meetsAA).toBe(true);
      expect(assessment.meetsAAA).toBe(true);
      expect(assessment.meetsAALarge).toBe(true);
      expect(assessment.meetsAAALarge).toBe(true);
    });

    it('should provide complete assessment for medium contrast', () => {
      const assessment = getContrastAssessment('#767676', '#FFFFFF');
      
      expect(assessment.ratio).toBeCloseTo(4.5, 1);
      expect(assessment.meetsAA).toBe(true);
      expect(assessment.meetsAAA).toBe(false);
      expect(assessment.meetsAALarge).toBe(true);
      expect(assessment.meetsAAALarge).toBe(true);
    });

    it('should provide complete assessment for low contrast', () => {
      const assessment = getContrastAssessment('#CCCCCC', '#FFFFFF');
      
      expect(assessment.ratio).toBeLessThan(3);
      expect(assessment.meetsAA).toBe(false);
      expect(assessment.meetsAAA).toBe(false);
      expect(assessment.meetsAALarge).toBe(false);
      expect(assessment.meetsAAALarge).toBe(false);
    });
  });

  describe('CELEBRATION_COLOR_COMBINATIONS validation', () => {
    it('should validate all celebration image color combinations meet WCAG AA', () => {
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

    it('should validate most celebration image color combinations meet WCAG AAA', () => {
      const aaaCombinations = CELEBRATION_COLOR_COMBINATIONS.filter(combination => {
        const assessment = getContrastAssessment(combination.foreground, combination.background);
        return assessment.meetsAAA;
      });
      
      // At least 80% should meet AAA standard
      const aaaPercentage = (aaaCombinations.length / CELEBRATION_COLOR_COMBINATIONS.length) * 100;
      expect(aaaPercentage).toBeGreaterThanOrEqual(80);
    });

    it('should validate specific high-priority elements meet AAA standard', () => {
      const highPriorityElements = [
        'Main titles',
        'Badge text', 
        'Score text',
        'Block titles',
        'Evolution titles'
      ];
      
      const failedHighPriority: string[] = [];
      
      CELEBRATION_COLOR_COMBINATIONS
        .filter(combo => highPriorityElements.includes(combo.element))
        .forEach(combination => {
          const assessment = getContrastAssessment(combination.foreground, combination.background);
          
          if (!assessment.meetsAAA) {
            failedHighPriority.push(
              `${combination.element}: ${combination.foreground} on ${combination.background} (ratio: ${assessment.ratio})`
            );
          }
        });
      
      expect(failedHighPriority).toEqual([]);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should throw error for invalid color formats', () => {
      expect(() => getContrastRatio('invalid', '#FFFFFF')).toThrow();
      expect(() => getContrastRatio('#FFFFFF', 'invalid')).toThrow();
    });

    it('should handle colors with different cases', () => {
      const ratio1 = getContrastRatio('#ffffff', '#000000');
      const ratio2 = getContrastRatio('#FFFFFF', '#000000');
      expect(ratio1).toEqual(ratio2);
    });
  });
});