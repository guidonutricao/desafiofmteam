/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 * Requirements: 1.1, 1.3, 6.4, 6.5
 */

// ARIA live region announcements for screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Focus management utilities
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Generate unique IDs for form elements
let idCounter = 0;
export function generateId(prefix: string = 'field'): string {
  return `${prefix}-${++idCounter}`;
}

// ARIA describedby helper
export function getAriaDescribedBy(
  fieldId: string,
  hasError: boolean,
  hasHelp: boolean = true
): string {
  const ids: string[] = [];
  
  if (hasHelp) {
    ids.push(`${fieldId}-help`);
  }
  
  if (hasError) {
    ids.push(`${fieldId}-error`);
  }
  
  return ids.join(' ');
}

// Color contrast validation with actual calculation
export function validateColorContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): { ratio: number; passes: boolean } {
  const requiredRatio = isLargeText ? 3 : 4.5;
  
  // Convert hex colors to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };
  
  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const [r1, g1, b1] = hexToRgb(foreground);
  const [r2, g2, b2] = hexToRgb(background);
  
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  
  return {
    ratio,
    passes: ratio >= requiredRatio
  };
}

// WCAG color combinations for our design system
export const COLOR_COMBINATIONS = {
  // Primary text on dark background
  primaryText: {
    foreground: '#f4f4f5', // zinc-100
    background: '#18181b', // zinc-900
    passes: validateColorContrast('#f4f4f5', '#18181b').passes
  },
  // Secondary text on dark background
  secondaryText: {
    foreground: '#a1a1aa', // zinc-400
    background: '#18181b', // zinc-900
    passes: validateColorContrast('#a1a1aa', '#18181b').passes
  },
  // Amber accent on dark background
  accentOnDark: {
    foreground: '#f59e0b', // amber-500
    background: '#18181b', // zinc-900
    passes: validateColorContrast('#f59e0b', '#18181b').passes
  },
  // Dark text on amber background (buttons)
  darkOnAmber: {
    foreground: '#18181b', // zinc-900
    background: '#f59e0b', // amber-500
    passes: validateColorContrast('#18181b', '#f59e0b').passes
  },
  // Error text
  errorText: {
    foreground: '#f87171', // red-400
    background: '#18181b', // zinc-900
    passes: validateColorContrast('#f87171', '#18181b').passes
  },
  // Success text
  successText: {
    foreground: '#34d399', // green-400
    background: '#18181b', // zinc-900
    passes: validateColorContrast('#34d399', '#18181b').passes
  }
};

// Check all color combinations
export function checkColorContrast(): { passed: number; failed: number; details: any[] } {
  const results = Object.entries(COLOR_COMBINATIONS).map(([name, combo]) => ({
    name,
    ...combo,
    ratio: validateColorContrast(combo.foreground, combo.background).ratio
  }));
  
  const passed = results.filter(r => r.passes).length;
  const failed = results.filter(r => !r.passes).length;
  
  return { passed, failed, details: results };
}

// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End'
} as const;

export function handleKeyboardNavigation(
  event: KeyboardEvent,
  handlers: Partial<Record<keyof typeof KEYBOARD_KEYS, () => void>>
) {
  const key = event.key;
  const handler = Object.entries(KEYBOARD_KEYS).find(([, value]) => value === key)?.[0] as keyof typeof KEYBOARD_KEYS;
  
  if (handler && handlers[handler]) {
    event.preventDefault();
    handlers[handler]!();
  }
}

// Screen reader text utilities
export function createScreenReaderText(text: string): string {
  return `<span class="sr-only">${text}</span>`;
}

// Form validation announcements
export function announceValidationError(fieldName: string, error: string) {
  announceToScreenReader(`Erro no campo ${fieldName}: ${error}`, 'assertive');
}

export function announceValidationSuccess(fieldName: string) {
  announceToScreenReader(`Campo ${fieldName} válido`, 'polite');
}

export function announceFormSubmission(isSuccess: boolean, message: string) {
  const priority = isSuccess ? 'polite' : 'assertive';
  announceToScreenReader(message, priority);
}

// Focus restoration
export class FocusManager {
  private previousFocus: HTMLElement | null = null;
  
  saveFocus() {
    this.previousFocus = document.activeElement as HTMLElement;
  }
  
  restoreFocus() {
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }
  }
  
  focusFirst(container: HTMLElement) {
    const firstFocusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
}

// ARIA live region component helper
export function createLiveRegion(id: string, level: 'polite' | 'assertive' = 'polite') {
  const existing = document.getElementById(id);
  if (existing) {
    return existing;
  }
  
  const liveRegion = document.createElement('div');
  liveRegion.id = id;
  liveRegion.setAttribute('aria-live', level);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  
  document.body.appendChild(liveRegion);
  
  return liveRegion;
}

export function updateLiveRegion(id: string, message: string) {
  const region = document.getElementById(id);
  if (region) {
    region.textContent = message;
  }
}

// Enhanced focus management for complex interactions
export function manageFocusForModal(modalElement: HTMLElement) {
  const focusableElements = modalElement.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  // Focus first element
  if (firstFocusable) {
    firstFocusable.focus();
  }
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
    
    if (e.key === 'Escape') {
      // Let parent handle escape
      modalElement.dispatchEvent(new CustomEvent('modal-escape'));
    }
  };
  
  modalElement.addEventListener('keydown', handleKeyDown);
  
  return () => {
    modalElement.removeEventListener('keydown', handleKeyDown);
  };
}

// Enhanced roving tabindex for complex widgets
export function createRovingTabindex(container: HTMLElement, itemSelector: string) {
  const items = container.querySelectorAll(itemSelector) as NodeListOf<HTMLElement>;
  let currentIndex = 0;
  
  const updateTabindex = () => {
    items.forEach((item, index) => {
      item.tabIndex = index === currentIndex ? 0 : -1;
    });
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    let newIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
    }
    
    if (newIndex !== currentIndex) {
      currentIndex = newIndex;
      updateTabindex();
      items[currentIndex].focus();
    }
  };
  
  // Initialize
  updateTabindex();
  container.addEventListener('keydown', handleKeyDown);
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

// Accessibility testing helpers (for development)
export function checkAccessibility() {
  const issues: string[] = [];
  
  // Check for missing alt text
  const images = document.querySelectorAll('img:not([alt])');
  if (images.length > 0) {
    issues.push(`${images.length} images missing alt text`);
  }
  
  // Check for missing form labels
  const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  const unlabeledInputs = Array.from(inputs).filter(input => {
    const id = input.getAttribute('id');
    return !id || !document.querySelector(`label[for="${id}"]`);
  });
  
  if (unlabeledInputs.length > 0) {
    issues.push(`${unlabeledInputs.length} form inputs missing labels`);
  }
  
  // Check for missing heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > previousLevel + 1) {
      issues.push(`Heading hierarchy skip: ${heading.tagName} after h${previousLevel}`);
    }
    previousLevel = level;
  });
  
  // Check for missing ARIA landmarks
  const main = document.querySelector('main');
  if (!main) {
    issues.push('Missing main landmark');
  }
  
  // Check for buttons without accessible names
  const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
  const unnamedButtons = Array.from(buttons).filter(button => {
    return !button.textContent?.trim();
  });
  
  if (unnamedButtons.length > 0) {
    issues.push(`${unnamedButtons.length} buttons without accessible names`);
  }
  
  // Check color contrast
  const contrastResults = checkColorContrast();
  if (contrastResults.failed > 0) {
    issues.push(`${contrastResults.failed} color combinations fail WCAG contrast requirements`);
  }
  
  // Check for missing focus indicators
  const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const elementsWithoutFocus = Array.from(focusableElements).filter(element => {
    const styles = getComputedStyle(element);
    return styles.outline === 'none' && !styles.boxShadow.includes('focus');
  });
  
  if (elementsWithoutFocus.length > 0) {
    issues.push(`${elementsWithoutFocus.length} focusable elements missing focus indicators`);
  }
  
  return issues;
}

// Development helper to run accessibility checks
export function runAccessibilityAudit() {
  const issues = checkAccessibility();
  const contrastResults = checkColorContrast();
  
  console.group('🔍 Accessibility Audit Results');
  
  if (issues.length === 0) {
    console.log('✅ No accessibility issues found!');
  } else {
    console.warn(`⚠️ Found ${issues.length} accessibility issues:`);
    issues.forEach(issue => console.warn(`  • ${issue}`));
  }
  
  console.group('🎨 Color Contrast Results');
  console.log(`✅ ${contrastResults.passed} combinations pass WCAG AA`);
  if (contrastResults.failed > 0) {
    console.warn(`❌ ${contrastResults.failed} combinations fail WCAG AA`);
  }
  
  contrastResults.details.forEach(detail => {
    const status = detail.passes ? '✅' : '❌';
    console.log(`${status} ${detail.name}: ${detail.ratio.toFixed(2)}:1`);
  });
  
  console.groupEnd();
  console.groupEnd();
  
  return { issues, contrastResults };
}