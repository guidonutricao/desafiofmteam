/**
 * Utility functions for calculating color contrast ratios
 * Based on WCAG 2.1 guidelines
 */

// Convert hex color to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex colors like #FFFFFF');
  }
  
  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Check if contrast meets WCAG standards
export function meetsWCAGStandard(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  } else {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
}

// Get contrast assessment
export function getContrastAssessment(
  foreground: string, 
  background: string
): {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  meetsAALarge: boolean;
  meetsAAALarge: boolean;
} {
  const ratio = getContrastRatio(foreground, background);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    meetsAA: ratio >= 4.5,
    meetsAAA: ratio >= 7,
    meetsAALarge: ratio >= 3,
    meetsAAALarge: ratio >= 4.5
  };
}

// Color combinations used in celebration image
export const CELEBRATION_COLOR_COMBINATIONS = [
  // Main titles on light background
  { foreground: '#000000', background: '#FFFBEB', element: 'Main titles' },
  
  // Badge text
  { foreground: '#451A03', background: '#FFFFFF', element: 'Badge text' },
  
  // Patient name gradient (using darkest color)
  { foreground: '#92400E', background: '#FFFBEB', element: 'Patient name' },
  
  // Description text
  { foreground: '#1F2937', background: '#FFFBEB', element: 'Description text' },
  
  // Score text on dark background
  { foreground: '#FFFFFF', background: '#92400E', element: 'Score text' },
  
  // Motivational block titles
  { foreground: '#000000', background: '#FFFFFF', element: 'Block titles' },
  
  // Motivational block text
  { foreground: '#1F2937', background: '#FFFFFF', element: 'Block text' },
  
  // Evolution section titles
  { foreground: '#000000', background: '#FFFFFF', element: 'Evolution titles' },
  
  // Stat values (using darkest colors)
  { foreground: '#92400E', background: '#FFFFFF', element: 'Stat values (amber)' },
  { foreground: '#1E40AF', background: '#FFFFFF', element: 'Stat values (blue)' },
  { foreground: '#166534', background: '#FFFFFF', element: 'Stat values (green)' },
  { foreground: '#C2410C', background: '#FFFFFF', element: 'Stat values (orange)' },
  
  // Stat labels
  { foreground: '#000000', background: '#FFFFFF', element: 'Stat labels' },
  
  // Progress text
  { foreground: '#000000', background: '#FFFFFF', element: 'Progress text' },
  
  // Branding
  { foreground: '#000000', background: '#FFFBEB', element: 'Branding title' },
  { foreground: '#1F2937', background: '#FFFBEB', element: 'Branding tagline' }
];