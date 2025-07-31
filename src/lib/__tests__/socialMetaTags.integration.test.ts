import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateSocialMetaTags, generateCelebrationMetaTags, addStructuredData, cleanupSocialMetaTags } from '../socialMetaTags';

// Mock DOM methods
const mockQuerySelector = vi.fn();
const mockCreateElement = vi.fn();
const mockSetAttribute = vi.fn();
const mockAppendChild = vi.fn();
const mockRemove = vi.fn();

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

describe('Social Meta Tags Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://shapeexpress.com/celebration',
        hostname: 'shapeexpress.com',
        origin: 'https://shapeexpress.com'
      },
      writable: true,
    });
  });

  it('should handle complete celebration page meta tags workflow', () => {
    const mockMetaElement = {
      setAttribute: mockSetAttribute,
      remove: mockRemove,
    };
    const mockLinkElement = {
      setAttribute: mockSetAttribute,
    };
    const mockScriptElement = {
      setAttribute: mockSetAttribute,
      remove: mockRemove,
    };

    mockQuerySelector.mockReturnValue(null);
    mockCreateElement.mockImplementation((tagName) => {
      if (tagName === 'meta') return mockMetaElement;
      if (tagName === 'link') return mockLinkElement;
      if (tagName === 'script') return mockScriptElement;
      return mockMetaElement;
    });

    const challengeData = {
      patientName: 'Maria Silva',
      challengeDuration: 7,
      totalScore: 92,
    };

    // Generate celebration meta tags
    const metaTags = generateCelebrationMetaTags(challengeData);
    
    // Verify generated meta tags structure
    expect(metaTags.title).toBe('Shape Express - Desafio Concluído!');
    expect(metaTags.description).toContain('Maria Silva');
    expect(metaTags.description).toContain('7 dias');
    expect(metaTags.description).toContain('92 pontos');
    expect(metaTags.image).toBe('/celebration-og-image.svg');
    expect(metaTags.type).toBe('article');
    expect(metaTags.tags).toContain('fitness');
    expect(metaTags.tags).toContain('7 dias');

    // Update social meta tags
    updateSocialMetaTags(metaTags);

    // Verify document title was updated
    expect(document.title).toBe('Shape Express - Desafio Concluído!');

    // Verify meta elements were created
    expect(mockCreateElement).toHaveBeenCalledWith('meta');
    expect(mockCreateElement).toHaveBeenCalledWith('link');

    // Verify Open Graph tags
    expect(mockSetAttribute).toHaveBeenCalledWith('property', 'og:title');
    expect(mockSetAttribute).toHaveBeenCalledWith('property', 'og:description');
    expect(mockSetAttribute).toHaveBeenCalledWith('property', 'og:image');
    expect(mockSetAttribute).toHaveBeenCalledWith('property', 'og:type');
    expect(mockSetAttribute).toHaveBeenCalledWith('property', 'og:article:author');

    // Verify Twitter Card tags
    expect(mockSetAttribute).toHaveBeenCalledWith('name', 'twitter:card');
    expect(mockSetAttribute).toHaveBeenCalledWith('name', 'twitter:title');
    expect(mockSetAttribute).toHaveBeenCalledWith('name', 'twitter:description');
    expect(mockSetAttribute).toHaveBeenCalledWith('name', 'twitter:image');

    // Add structured data
    addStructuredData(challengeData);

    // Verify structured data script was created
    expect(mockCreateElement).toHaveBeenCalledWith('script');
    expect(mockSetAttribute).toHaveBeenCalledWith('data-celebration', 'true');

    // Test cleanup
    mockQuerySelector.mockReturnValue(mockScriptElement);
    cleanupSocialMetaTags();

    // Verify cleanup was called
    expect(mockRemove).toHaveBeenCalled();
  });

  it('should handle absolute image URLs correctly', () => {
    const mockMetaElement = {
      setAttribute: mockSetAttribute,
    };

    mockQuerySelector.mockReturnValue(null);
    mockCreateElement.mockReturnValue(mockMetaElement);

    updateSocialMetaTags({
      image: 'https://example.com/image.jpg'
    });

    // Should use the absolute URL as-is
    expect(mockSetAttribute).toHaveBeenCalledWith('content', 'https://example.com/image.jpg');
  });

  it('should convert relative image URLs to absolute', () => {
    const mockMetaElement = {
      setAttribute: mockSetAttribute,
    };

    mockQuerySelector.mockReturnValue(null);
    mockCreateElement.mockReturnValue(mockMetaElement);

    updateSocialMetaTags({
      image: '/celebration-og-image.svg'
    });

    // Should convert to absolute URL
    expect(mockSetAttribute).toHaveBeenCalledWith('content', 'https://shapeexpress.com/celebration-og-image.svg');
  });
});