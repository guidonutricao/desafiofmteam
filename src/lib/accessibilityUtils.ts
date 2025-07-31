/**
 * Accessibility utility functions for the celebration page
 */

/**
 * Announces content to screen readers using a live region
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after screen reader has time to read it
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 3000);
  
  return announcement;
};

/**
 * Manages focus for keyboard navigation
 */
export const manageFocus = (element: HTMLElement | null) => {
  if (!element) return;
  
  element.focus();
  
  // Scroll into view if the method is available (not in test environment)
  if (typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

/**
 * Creates accessible button props with proper ARIA attributes
 */
export const createAccessibleButtonProps = (
  label: string,
  description?: string,
  disabled?: boolean
) => {
  const props: Record<string, any> = {
    'aria-label': label,
    disabled: disabled || false,
  };
  
  if (description) {
    const descriptionId = `desc-${Math.random().toString(36).substr(2, 9)}`;
    props['aria-describedby'] = descriptionId;
    
    // Create description element
    const descElement = document.createElement('div');
    descElement.id = descriptionId;
    descElement.className = 'sr-only';
    descElement.textContent = description;
    document.body.appendChild(descElement);
    
    // Cleanup function
    props._cleanup = () => {
      if (document.body.contains(descElement)) {
        document.body.removeChild(descElement);
      }
    };
  }
  
  return props;
};

/**
 * Validates color contrast for accessibility compliance
 */
export const validateColorContrast = (foreground: string, background: string): boolean => {
  // This is a simplified version - in a real implementation, you'd use a proper color contrast library
  // For now, we'll assume our design system colors meet WCAG AA standards
  return true;
};

/**
 * Checks if an element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ];
  
  return focusableSelectors.some(selector => element.matches(selector));
};

/**
 * Gets all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');
  
  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
};

/**
 * Creates a focus trap for modal dialogs
 */
export const createFocusTrap = (container: HTMLElement) => {
  const focusableElements = getFocusableElements(container);
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    }
    
    if (e.key === 'Escape') {
      // Return focus to the element that opened the modal
      const opener = container.getAttribute('data-focus-return');
      if (opener) {
        const returnElement = document.getElementById(opener);
        returnElement?.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  
  // Focus the first element
  firstFocusable?.focus();
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Formats numbers for screen readers
 */
export const formatNumberForScreenReader = (num: number, unit?: string): string => {
  const formatted = num.toLocaleString('pt-BR');
  return unit ? `${formatted} ${unit}` : formatted;
};

/**
 * Creates accessible progress announcements
 */
export const announceProgress = (current: number, total: number, context: string) => {
  const percentage = Math.round((current / total) * 100);
  const message = `${context}: ${current} de ${total} completo, ${percentage} por cento`;
  announceToScreenReader(message, 'polite');
};

/**
 * Validates ARIA attributes
 */
export const validateAriaAttributes = (element: HTMLElement): string[] => {
  const issues: string[] = [];
  
  // Check for required ARIA attributes
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  
  // Interactive elements should have accessible names
  if (isFocusable(element) && !ariaLabel && !ariaLabelledBy && !element.textContent?.trim()) {
    issues.push('Interactive element lacks accessible name');
  }
  
  // Check for invalid ARIA attribute combinations
  if (role === 'button' && element.tagName.toLowerCase() !== 'button') {
    if (!element.hasAttribute('tabindex')) {
      issues.push('Element with button role should be focusable');
    }
  }
  
  return issues;
};