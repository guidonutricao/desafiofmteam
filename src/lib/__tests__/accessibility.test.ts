import { 
  validateColorContrast, 
  checkColorContrast, 
  COLOR_COMBINATIONS,
  checkAccessibility,
  runAccessibilityAudit,
  announceToScreenReader,
  createLiveRegion,
  updateLiveRegion,
  generateId,
  getAriaDescribedBy,
  FocusManager
} from '../accessibility';

// Mock DOM methods
Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn(() => ({
      setAttribute: jest.fn(),
      textContent: '',
      className: '',
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      getElementById: jest.fn(),
      activeElement: null
    })),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn()
    },
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    getElementById: jest.fn(),
    activeElement: null
  },
  writable: true
});

describe('Accessibility Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Color Contrast Validation', () => {
    it('should validate color contrast correctly', () => {
      // Test high contrast (should pass)
      const highContrast = validateColorContrast('#000000', '#ffffff');
      expect(highContrast.passes).toBe(true);
      expect(highContrast.ratio).toBeGreaterThan(4.5);

      // Test low contrast (should fail)
      const lowContrast = validateColorContrast('#888888', '#999999');
      expect(lowContrast.passes).toBe(false);
      expect(lowContrast.ratio).toBeLessThan(4.5);
    });

    it('should handle large text requirements', () => {
      const result = validateColorContrast('#666666', '#ffffff', true);
      // Large text only needs 3:1 ratio
      expect(result.ratio).toBeGreaterThan(3);
    });

    it('should check all predefined color combinations', () => {
      const results = checkColorContrast();
      expect(results).toHaveProperty('passed');
      expect(results).toHaveProperty('failed');
      expect(results).toHaveProperty('details');
      expect(Array.isArray(results.details)).toBe(true);
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should create announcement elements', () => {
      const mockElement = {
        setAttribute: jest.fn(),
        textContent: '',
        className: ''
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockElement);
      
      announceToScreenReader('Test message', 'polite');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(mockElement.textContent).toBe('Test message');
    });

    it('should handle assertive announcements', () => {
      const mockElement = {
        setAttribute: jest.fn(),
        textContent: '',
        className: ''
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockElement);
      
      announceToScreenReader('Error message', 'assertive');
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
    });
  });

  describe('Live Regions', () => {
    it('should create live regions', () => {
      const mockElement = {
        id: '',
        setAttribute: jest.fn(),
        className: ''
      };
      
      (document.createElement as jest.Mock).mockReturnValue(mockElement);
      (document.getElementById as jest.Mock).mockReturnValue(null);
      
      createLiveRegion('test-region', 'polite');
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
    });

    it('should update existing live regions', () => {
      const mockElement = {
        textContent: ''
      };
      
      (document.getElementById as jest.Mock).mockReturnValue(mockElement);
      
      updateLiveRegion('test-region', 'Updated message');
      
      expect(mockElement.textContent).toBe('Updated message');
    });

    it('should not create duplicate live regions', () => {
      const mockElement = {
        id: 'existing-region',
        setAttribute: jest.fn(),
        className: ''
      };
      
      (document.getElementById as jest.Mock).mockReturnValue(mockElement);
      
      const result = createLiveRegion('existing-region', 'polite');
      
      expect(result).toBe(mockElement);
      expect(document.createElement).not.toHaveBeenCalled();
    });
  });

  describe('ID Generation', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test-\d+$/);
      expect(id2).toMatch(/^test-\d+$/);
    });

    it('should use default prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^field-\d+$/);
    });
  });

  describe('ARIA Helpers', () => {
    it('should generate aria-describedby correctly', () => {
      const result = getAriaDescribedBy('test-field', true, true);
      expect(result).toBe('test-field-help test-field-error');
    });

    it('should handle no error state', () => {
      const result = getAriaDescribedBy('test-field', false, true);
      expect(result).toBe('test-field-help');
    });

    it('should handle no help text', () => {
      const result = getAriaDescribedBy('test-field', true, false);
      expect(result).toBe('test-field-error');
    });

    it('should handle minimal state', () => {
      const result = getAriaDescribedBy('test-field', false, false);
      expect(result).toBe('');
    });
  });

  describe('Focus Management', () => {
    it('should create focus manager', () => {
      const focusManager = new FocusManager();
      expect(focusManager).toBeInstanceOf(FocusManager);
    });

    it('should save and restore focus', () => {
      const mockElement = {
        focus: jest.fn()
      };
      
      Object.defineProperty(document, 'activeElement', {
        value: mockElement,
        writable: true
      });
      
      const focusManager = new FocusManager();
      focusManager.saveFocus();
      focusManager.restoreFocus();
      
      expect(mockElement.focus).toHaveBeenCalled();
    });
  });

  describe('Accessibility Audit', () => {
    it('should run accessibility checks', () => {
      // Mock DOM queries for testing
      (document.querySelectorAll as jest.Mock)
        .mockReturnValueOnce([]) // images
        .mockReturnValueOnce([]) // inputs
        .mockReturnValueOnce([]) // headings
        .mockReturnValueOnce([]) // buttons
        .mockReturnValueOnce([]); // focusable elements
      
      (document.querySelector as jest.Mock).mockReturnValue({}); // main element
      
      const issues = checkAccessibility();
      expect(Array.isArray(issues)).toBe(true);
    });

    it('should detect missing alt text', () => {
      const mockImages = [{ getAttribute: () => null }];
      
      (document.querySelectorAll as jest.Mock)
        .mockReturnValueOnce(mockImages) // images without alt
        .mockReturnValueOnce([]) // inputs
        .mockReturnValueOnce([]) // headings
        .mockReturnValueOnce([]) // buttons
        .mockReturnValueOnce([]); // focusable elements
      
      (document.querySelector as jest.Mock).mockReturnValue({}); // main element
      
      const issues = checkAccessibility();
      expect(issues.some(issue => issue.includes('images missing alt text'))).toBe(true);
    });

    it('should run complete audit', () => {
      // Mock console methods
      const consoleSpy = jest.spyOn(console, 'group').mockImplementation();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();
      
      // Mock DOM for clean audit
      (document.querySelectorAll as jest.Mock)
        .mockReturnValue([]);
      (document.querySelector as jest.Mock).mockReturnValue({});
      
      const result = runAccessibilityAudit();
      
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('contrastResults');
      expect(consoleSpy).toHaveBeenCalled();
      
      // Cleanup
      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });

  describe('Color Combinations', () => {
    it('should have all required color combinations defined', () => {
      expect(COLOR_COMBINATIONS).toHaveProperty('primaryText');
      expect(COLOR_COMBINATIONS).toHaveProperty('secondaryText');
      expect(COLOR_COMBINATIONS).toHaveProperty('accentOnDark');
      expect(COLOR_COMBINATIONS).toHaveProperty('darkOnAmber');
      expect(COLOR_COMBINATIONS).toHaveProperty('errorText');
      expect(COLOR_COMBINATIONS).toHaveProperty('successText');
    });

    it('should validate that our design colors pass WCAG', () => {
      // Primary text should pass
      expect(COLOR_COMBINATIONS.primaryText.passes).toBe(true);
      
      // Amber accent should pass
      expect(COLOR_COMBINATIONS.accentOnDark.passes).toBe(true);
      
      // Button text should pass
      expect(COLOR_COMBINATIONS.darkOnAmber.passes).toBe(true);
    });
  });
});