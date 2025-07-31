import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateSocialMetaTags, generateCelebrationMetaTags } from '../socialMetaTags';

// Mock DOM methods
const mockQuerySelector = vi.fn();
const mockCreateElement = vi.fn();
const mockSetAttribute = vi.fn();
const mockAppendChild = vi.fn();

Object.defineProperty(document, 'querySelector', {
  value: mockQuerySelector,
  writable: true,
});

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
});

Object.defineProperty(document, 'head', {
  value: {
    appendChild: mockAppendChild,
  },
  writable: true,
});

describe('Social Meta Tags Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://shapeexpress.com/celebration',
      },
      writable: true,
    });
  });

  describe('generateCelebrationMetaTags', () => {
    it('should generate correct meta tags for celebration', () => {
      const challengeData = {
        patientName: 'João Silva',
        challengeDuration: 7,
        totalScore: 85,
      };

      const metaTags = generateCelebrationMetaTags(challengeData);

      expect(metaTags.title).toBe('Shape Express - Desafio Concluído!');
      expect(metaTags.description).toBe('🎉 João Silva concluiu com sucesso o desafio de 7 dias da Shape Express com 85 pontos! Uma jornada incrível de transformação e dedicação. 💪✨');
      expect(metaTags.image).toBe('/celebration-og-image.svg');
      expect(metaTags.url).toBe('https://shapeexpress.com/celebration');
    });
  });

  describe('updateSocialMetaTags', () => {
    it('should update document title', () => {
      const mockMetaElement = {
        setAttribute: mockSetAttribute,
      };

      mockQuerySelector.mockReturnValue(null);
      mockCreateElement.mockReturnValue(mockMetaElement);
      
      const originalTitle = document.title;
      
      updateSocialMetaTags({
        title: 'Test Title',
      });

      expect(document.title).toBe('Test Title');
      
      // Restore original title
      document.title = originalTitle;
    });

    it('should create new meta tag when it does not exist', () => {
      const mockMetaElement = {
        setAttribute: mockSetAttribute,
      };

      mockQuerySelector.mockReturnValue(null);
      mockCreateElement.mockReturnValue(mockMetaElement);

      updateSocialMetaTags({
        title: 'Test Title',
        description: 'Test Description',
      });

      expect(mockCreateElement).toHaveBeenCalledWith('meta');
      expect(mockSetAttribute).toHaveBeenCalledWith('name', 'description');
      expect(mockSetAttribute).toHaveBeenCalledWith('content', 'Test Description');
      expect(mockAppendChild).toHaveBeenCalledWith(mockMetaElement);
    });

    it('should update existing meta tag', () => {
      const mockExistingMetaElement = {
        setAttribute: mockSetAttribute,
      };

      mockQuerySelector.mockReturnValue(mockExistingMetaElement);

      updateSocialMetaTags({
        description: 'Updated Description',
      });

      expect(mockSetAttribute).toHaveBeenCalledWith('content', 'Updated Description');
      expect(mockCreateElement).not.toHaveBeenCalled();
      expect(mockAppendChild).not.toHaveBeenCalled();
    });

    it('should use default values when options are not provided', () => {
      updateSocialMetaTags({});

      expect(document.title).toBe('Shape Express - Desafio Concluído!');
    });

    it('should handle Open Graph and Twitter Card meta tags', () => {
      const mockMetaElement = {
        setAttribute: mockSetAttribute,
      };
      const mockLinkElement = {
        setAttribute: mockSetAttribute,
      };

      mockQuerySelector.mockReturnValue(null);
      mockCreateElement.mockImplementation((tagName) => {
        if (tagName === 'meta') return mockMetaElement;
        if (tagName === 'link') return mockLinkElement;
        return mockMetaElement;
      });

      updateSocialMetaTags({
        title: 'Test Title',
        description: 'Test Description',
        image: '/test-image.jpg',
        url: 'https://test.com',
      });

      // Check that property attribute is used for Open Graph tags
      expect(mockSetAttribute).toHaveBeenCalledWith('property', 'og:title');
      expect(mockSetAttribute).toHaveBeenCalledWith('property', 'og:description');
      expect(mockSetAttribute).toHaveBeenCalledWith('property', 'og:image');
      expect(mockSetAttribute).toHaveBeenCalledWith('property', 'og:url');
      expect(mockSetAttribute).toHaveBeenCalledWith('property', 'og:type');

      // Check that name attribute is used for Twitter Card tags
      expect(mockSetAttribute).toHaveBeenCalledWith('name', 'twitter:card');
      expect(mockSetAttribute).toHaveBeenCalledWith('name', 'twitter:title');
      expect(mockSetAttribute).toHaveBeenCalledWith('name', 'twitter:description');
      expect(mockSetAttribute).toHaveBeenCalledWith('name', 'twitter:image');

      // Check content values
      expect(mockSetAttribute).toHaveBeenCalledWith('content', 'Test Title');
      expect(mockSetAttribute).toHaveBeenCalledWith('content', 'Test Description');
      expect(mockSetAttribute).toHaveBeenCalledWith('content', 'summary_large_image');
    });
  });
});