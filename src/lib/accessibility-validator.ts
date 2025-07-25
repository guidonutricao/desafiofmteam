/**
 * Accessibility validation utility for the Profile page
 * Requirements: 1.1, 1.3, 6.4, 6.5
 */

import { runAccessibilityAudit, checkColorContrast, COLOR_COMBINATIONS } from './accessibility';

export interface AccessibilityValidationResult {
  passed: boolean;
  score: number;
  issues: AccessibilityIssue[];
  recommendations: string[];
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'aria' | 'keyboard' | 'color' | 'structure' | 'focus';
  message: string;
  element?: string;
  fix?: string;
}

/**
 * Validates ARIA labels and descriptions for form elements
 */
function validateAriaLabels(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Check all form inputs have proper labels
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!id) {
      issues.push({
        type: 'error',
        category: 'aria',
        message: `Form input ${index + 1} missing ID attribute`,
        element: input.tagName.toLowerCase(),
        fix: 'Add unique ID attribute to form input'
      });
    }
    
    if (!ariaLabel && !ariaLabelledBy && id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (!label) {
        issues.push({
          type: 'error',
          category: 'aria',
          message: `Form input with ID "${id}" missing label or aria-label`,
          element: `input#${id}`,
          fix: 'Add label element or aria-label attribute'
        });
      }
    }
    
    // Check required fields have proper indication
    const required = input.getAttribute('aria-required') === 'true' || input.hasAttribute('required');
    if (required) {
      const labelElement = id ? document.querySelector(`label[for="${id}"]`) : null;
      if (labelElement) {
        const hasRequiredIndicator = labelElement.querySelector('[aria-label*="obrigatório"]') || 
                                   labelElement.textContent?.includes('*');
        if (!hasRequiredIndicator) {
          issues.push({
            type: 'warning',
            category: 'aria',
            message: `Required field "${id}" missing visual required indicator`,
            element: `input#${id}`,
            fix: 'Add asterisk (*) or "obrigatório" indicator to label'
          });
        }
      }
    }
    
    // Check aria-describedby references exist
    const describedBy = input.getAttribute('aria-describedby');
    if (describedBy) {
      const ids = describedBy.split(' ');
      ids.forEach(descId => {
        if (!document.getElementById(descId)) {
          issues.push({
            type: 'error',
            category: 'aria',
            message: `aria-describedby references non-existent element "${descId}"`,
            element: `input#${id}`,
            fix: `Create element with ID "${descId}" or remove from aria-describedby`
          });
        }
      });
    }
  });
  
  // Check buttons have accessible names
  const buttons = document.querySelectorAll('button');
  buttons.forEach((button, index) => {
    const hasText = button.textContent?.trim();
    const hasAriaLabel = button.getAttribute('aria-label');
    const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
    
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push({
        type: 'error',
        category: 'aria',
        message: `Button ${index + 1} missing accessible name`,
        element: 'button',
        fix: 'Add text content, aria-label, or aria-labelledby attribute'
      });
    }
  });
  
  return issues;
}

/**
 * Validates keyboard navigation support
 */
function validateKeyboardNavigation(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Check all interactive elements are keyboard accessible
  const interactiveElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex], [role="button"], [role="link"]'
  );
  
  interactiveElements.forEach((element, index) => {
    const tabIndex = element.getAttribute('tabindex');
    
    // Elements with tabindex="-1" should not be in tab order unless they're programmatically focused
    if (tabIndex === '-1' && !element.hasAttribute('aria-hidden')) {
      issues.push({
        type: 'warning',
        category: 'keyboard',
        message: `Interactive element ${index + 1} has tabindex="-1" but is not hidden`,
        element: element.tagName.toLowerCase(),
        fix: 'Remove tabindex="-1" or add aria-hidden="true" if element should not be focusable'
      });
    }
    
    // Check for custom interactive elements with proper role
    if (element.hasAttribute('onclick') && !['BUTTON', 'A', 'INPUT'].includes(element.tagName)) {
      const role = element.getAttribute('role');
      if (!role || !['button', 'link'].includes(role)) {
        issues.push({
          type: 'error',
          category: 'keyboard',
          message: `Element with click handler missing proper role`,
          element: element.tagName.toLowerCase(),
          fix: 'Add role="button" or role="link" and keyboard event handlers'
        });
      }
    }
  });
  
  // Check for skip links
  const skipLinks = document.querySelectorAll('a[href^="#"]');
  if (skipLinks.length === 0) {
    issues.push({
      type: 'info',
      category: 'keyboard',
      message: 'No skip links found',
      fix: 'Consider adding skip links for keyboard users'
    });
  }
  
  return issues;
}

/**
 * Validates heading hierarchy and structure
 */
function validateHeadingHierarchy(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  
  if (headings.length === 0) {
    issues.push({
      type: 'error',
      category: 'structure',
      message: 'No headings found on page',
      fix: 'Add proper heading structure starting with h1'
    });
    return issues;
  }
  
  // Check for h1
  const h1Elements = document.querySelectorAll('h1');
  if (h1Elements.length === 0) {
    issues.push({
      type: 'error',
      category: 'structure',
      message: 'No h1 element found',
      fix: 'Add h1 element as main page heading'
    });
  } else if (h1Elements.length > 1) {
    issues.push({
      type: 'warning',
      category: 'structure',
      message: `Multiple h1 elements found (${h1Elements.length})`,
      fix: 'Use only one h1 per page'
    });
  }
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    
    // Check for heading level skips
    if (level > previousLevel + 1) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: `Heading hierarchy skip: ${heading.tagName} after h${previousLevel}`,
        element: heading.tagName.toLowerCase(),
        fix: `Use h${previousLevel + 1} instead of ${heading.tagName}`
      });
    }
    
    // Check headings have content
    if (!heading.textContent?.trim()) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: `Empty heading element: ${heading.tagName}`,
        element: heading.tagName.toLowerCase(),
        fix: 'Add descriptive text content to heading'
      });
    }
    
    previousLevel = level;
  });
  
  return issues;
}

/**
 * Validates focus management
 */
function validateFocusManagement(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Check for focus indicators
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  focusableElements.forEach((element, index) => {
    // This would need to be tested with actual focus events in a real browser
    // For now, we check for common focus indicator patterns
    const computedStyle = window.getComputedStyle ? window.getComputedStyle(element) : null;
    
    if (computedStyle) {
      const outline = computedStyle.outline;
      const boxShadow = computedStyle.boxShadow;
      
      // Check if element has focus indicators (this is a basic check)
      if (outline === 'none' && !boxShadow.includes('focus')) {
        issues.push({
          type: 'warning',
          category: 'focus',
          message: `Element ${index + 1} may be missing focus indicator`,
          element: element.tagName.toLowerCase(),
          fix: 'Add focus:outline or focus:ring styles'
        });
      }
    }
  });
  
  // Check for live regions
  const liveRegions = document.querySelectorAll('[aria-live]');
  if (liveRegions.length === 0) {
    issues.push({
      type: 'info',
      category: 'focus',
      message: 'No ARIA live regions found',
      fix: 'Consider adding live regions for dynamic content announcements'
    });
  }
  
  return issues;
}

/**
 * Validates color contrast
 */
function validateColorContrast(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  const contrastResults = checkColorContrast();
  
  if (contrastResults.failed > 0) {
    contrastResults.details.forEach(detail => {
      if (!detail.passes) {
        issues.push({
          type: 'error',
          category: 'color',
          message: `Color combination "${detail.name}" fails WCAG contrast (${detail.ratio.toFixed(2)}:1)`,
          fix: `Adjust colors to achieve at least 4.5:1 contrast ratio`
        });
      }
    });
  }
  
  return issues;
}

/**
 * Validates landmarks and page structure
 */
function validateLandmarks(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Check for main landmark
  const main = document.querySelector('main, [role="main"]');
  if (!main) {
    issues.push({
      type: 'error',
      category: 'structure',
      message: 'No main landmark found',
      fix: 'Add <main> element or role="main"'
    });
  }
  
  // Check for header landmark
  const header = document.querySelector('header, [role="banner"]');
  if (!header) {
    issues.push({
      type: 'warning',
      category: 'structure',
      message: 'No header landmark found',
      fix: 'Add <header> element or role="banner"'
    });
  }
  
  // Check sections have proper labeling
  const sections = document.querySelectorAll('section');
  sections.forEach((section, index) => {
    const ariaLabel = section.getAttribute('aria-label');
    const ariaLabelledBy = section.getAttribute('aria-labelledby');
    
    if (!ariaLabel && !ariaLabelledBy) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: `Section ${index + 1} missing aria-label or aria-labelledby`,
        element: 'section',
        fix: 'Add aria-label or aria-labelledby to identify section purpose'
      });
    }
  });
  
  return issues;
}

/**
 * Runs comprehensive accessibility validation
 */
export function validateProfileAccessibility(): AccessibilityValidationResult {
  const allIssues: AccessibilityIssue[] = [
    ...validateAriaLabels(),
    ...validateKeyboardNavigation(),
    ...validateHeadingHierarchy(),
    ...validateFocusManagement(),
    ...validateColorContrast(),
    ...validateLandmarks()
  ];
  
  // Calculate score based on issues
  const errorCount = allIssues.filter(issue => issue.type === 'error').length;
  const warningCount = allIssues.filter(issue => issue.type === 'warning').length;
  const infoCount = allIssues.filter(issue => issue.type === 'info').length;
  
  // Score calculation: start with 100, subtract points for issues
  let score = 100;
  score -= errorCount * 10; // Errors are worth 10 points each
  score -= warningCount * 5; // Warnings are worth 5 points each
  score -= infoCount * 1; // Info items are worth 1 point each
  
  score = Math.max(0, score); // Don't go below 0
  
  const passed = errorCount === 0 && warningCount <= 2; // Allow up to 2 warnings
  
  const recommendations: string[] = [];
  
  if (errorCount > 0) {
    recommendations.push('Fix all accessibility errors before deployment');
  }
  
  if (warningCount > 2) {
    recommendations.push('Address accessibility warnings to improve user experience');
  }
  
  if (score < 90) {
    recommendations.push('Consider comprehensive accessibility review');
  }
  
  if (allIssues.some(issue => issue.category === 'color')) {
    recommendations.push('Review color choices for better contrast');
  }
  
  if (allIssues.some(issue => issue.category === 'keyboard')) {
    recommendations.push('Test keyboard navigation thoroughly');
  }
  
  return {
    passed,
    score,
    issues: allIssues,
    recommendations
  };
}

/**
 * Logs accessibility validation results to console
 */
export function logAccessibilityResults(results: AccessibilityValidationResult) {
  console.group('🔍 Profile Page Accessibility Validation');
  
  if (results.passed) {
    console.log(`✅ Accessibility validation PASSED (Score: ${results.score}/100)`);
  } else {
    console.warn(`⚠️ Accessibility validation FAILED (Score: ${results.score}/100)`);
  }
  
  if (results.issues.length > 0) {
    console.group(`📋 Issues Found (${results.issues.length})`);
    
    const errors = results.issues.filter(issue => issue.type === 'error');
    const warnings = results.issues.filter(issue => issue.type === 'warning');
    const info = results.issues.filter(issue => issue.type === 'info');
    
    if (errors.length > 0) {
      console.group(`❌ Errors (${errors.length})`);
      errors.forEach(issue => {
        console.error(`${issue.category.toUpperCase()}: ${issue.message}`);
        if (issue.element) console.error(`  Element: ${issue.element}`);
        if (issue.fix) console.error(`  Fix: ${issue.fix}`);
      });
      console.groupEnd();
    }
    
    if (warnings.length > 0) {
      console.group(`⚠️ Warnings (${warnings.length})`);
      warnings.forEach(issue => {
        console.warn(`${issue.category.toUpperCase()}: ${issue.message}`);
        if (issue.element) console.warn(`  Element: ${issue.element}`);
        if (issue.fix) console.warn(`  Fix: ${issue.fix}`);
      });
      console.groupEnd();
    }
    
    if (info.length > 0) {
      console.group(`ℹ️ Info (${info.length})`);
      info.forEach(issue => {
        console.info(`${issue.category.toUpperCase()}: ${issue.message}`);
        if (issue.fix) console.info(`  Suggestion: ${issue.fix}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }
  
  if (results.recommendations.length > 0) {
    console.group('💡 Recommendations');
    results.recommendations.forEach(rec => {
      console.info(`• ${rec}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return results;
}

/**
 * Development helper to run accessibility validation
 */
export function runProfileAccessibilityValidation() {
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      const results = validateProfileAccessibility();
      logAccessibilityResults(results);
    }, 1000);
  }
}