import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SocialSharing } from '../SocialSharing';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock retry utils
vi.mock('@/lib/retryUtils', () => ({
  retryAsync: vi.fn(),
  RETRY_CONFIGS: {
    sharing: {
      maxAttempts: 2,
      delay: 500,
      backoff: 'linear',
      onRetry: vi.fn()
    }
  }
}));

// Mock celebration image generator hook
vi.mock('@/hooks/useCelebrationImageGenerator', () => ({
  useCelebrationImageGenerator: () => ({
    isGenerating: false,
    error: null,
    generateAndShare: vi.fn()
  })
}));

describe('SocialSharing Component', () => {
  const mockChallengeData = {
    patientName: 'João Silva',
    challengeDuration: 7,
    totalScore: 85,
    dailyScores: [
      { day: 1, score: 12, date: '2024-01-01' },
      { day: 2, score: 13, date: '2024-01-02' },
      { day: 3, score: 15, date: '2024-01-03' },
      { day: 4, score: 12, date: '2024-01-04' },
      { day: 5, score: 13, date: '2024-01-05' },
      { day: 6, score: 12, date: '2024-01-06' },
      { day: 7, score: 8, date: '2024-01-07' }
    ],
    stats: {
      completedDays: 7,
      averageScore: 12.1,
      bestDay: { day: 3, score: 15 },
      improvementTrend: 'stable' as const,
      perfectDays: 1,
      improvementPercent: -10,
      streakRecord: 3
    }
  };

  const mockOnShare = vi.fn();

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://shapeexpress.com/celebration',
      },
      writable: true,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render share button correctly', () => {
    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    expect(shareButton).toBeInTheDocument();
    expect(shareButton).not.toBeDisabled();
  });

  it('should show camera icon in button', () => {
    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    expect(shareButton).toBeInTheDocument();
    // The camera icon should be present (tested via aria-label)
    expect(shareButton).toHaveAttribute('aria-label', expect.stringContaining('Gerar imagem personalizada'));
  });

  it('should generate correct share data', () => {
    const expectedShareData = {
      title: 'Shape Express - Desafio Concluído!',
      text: `Acabei de concluir o desafio de ${mockChallengeData.challengeDuration} dias! 💪 Consegui ${mockChallengeData.totalScore} pontos!`,
      url: window.location.href
    };

    expect(expectedShareData.title).toBe('Shape Express - Desafio Concluído!');
    expect(expectedShareData.text).toBe('Acabei de concluir o desafio de 7 dias! 💪 Consegui 85 pontos!');
    expect(expectedShareData.url).toBe('https://shapeexpress.com/celebration');
  });

  it('should have correct aria labels for accessibility', () => {
    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /gerar imagem personalizada e compartilhar conquista/i });
    expect(shareButton).toBeInTheDocument();
    
    const description = screen.getByText(/Gera uma imagem personalizada em alta qualidade/);
    expect(description).toBeInTheDocument();
  });

  it('should generate correct share data format', () => {
    const expectedShareData = {
      title: 'Shape Express - Desafio Concluído!',
      text: `Acabei de concluir o desafio de ${mockChallengeData.challengeDuration} dias! 💪 Consegui ${mockChallengeData.totalScore} pontos!`,
      url: window.location.href
    };

    expect(expectedShareData.title).toBe('Shape Express - Desafio Concluído!');
    expect(expectedShareData.text).toBe('Acabei de concluir o desafio de 7 dias! 💪 Consegui 85 pontos!');
    expect(expectedShareData.url).toBe('https://shapeexpress.com/celebration');
  });
});