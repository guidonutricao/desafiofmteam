import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCelebrationImageGenerator } from '../useCelebrationImageGenerator';
import { CelebrationImageGenerator, downloadImage, shareImage } from '@/lib/celebrationImageGenerator';
import { type ChallengeData } from '@/hooks/useCelebrationData';

// Mock the image generator and utility functions
vi.mock('@/lib/celebrationImageGenerator');

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
    improvementTrend: 'stable'
  }
};

describe('useCelebrationImageGenerator', () => {
  const mockGenerateCelebrationImage = vi.fn();
  const mockDownloadImage = vi.fn();
  const mockShareImage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (CelebrationImageGenerator as any).mockImplementation(() => ({
      generateCelebrationImage: mockGenerateCelebrationImage
    }));
    
    (downloadImage as any).mockImplementation(mockDownloadImage);
    (shareImage as any).mockImplementation(mockShareImage);
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useCelebrationImageGenerator());
    
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.generateAndDownload).toBe('function');
    expect(typeof result.current.generateAndShare).toBe('function');
    expect(typeof result.current.generateImageUrl).toBe('function');
  });

  it('generates image URL successfully', async () => {
    const mockImageUrl = 'data:image/png;base64,mockImageData';
    mockGenerateCelebrationImage.mockResolvedValue(mockImageUrl);
    
    const { result } = renderHook(() => useCelebrationImageGenerator());
    
    let imageUrl: string | null = null;
    
    await act(async () => {
      imageUrl = await result.current.generateImageUrl(mockChallengeData);
    });
    
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(null);
    expect(imageUrl).toBe(mockImageUrl);
    expect(CelebrationImageGenerator).toHaveBeenCalledWith({
      width: 1080,
      height: 1080,
      format: 'png',
      quality: 0.9
    });
  });

  it('handles image generation error', async () => {
    const errorMessage = 'Canvas not supported';
    mockGenerateCelebrationImage.mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useCelebrationImageGenerator());
    
    let imageUrl: string | null = null;
    
    await act(async () => {
      imageUrl = await result.current.generateImageUrl(mockChallengeData);
    });
    
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(imageUrl).toBe(null);
  });

  it('sets loading state during generation', async () => {
    let resolveGeneration: (value: string) => void;
    const generationPromise = new Promise<string>((resolve) => {
      resolveGeneration = resolve;
    });
    
    mockGenerateCelebrationImage.mockReturnValue(generationPromise);
    
    const { result } = renderHook(() => useCelebrationImageGenerator());
    
    // Start generation
    act(() => {
      result.current.generateImageUrl(mockChallengeData);
    });
    
    // Should be loading
    expect(result.current.isGenerating).toBe(true);
    expect(result.current.error).toBe(null);
    
    // Complete generation
    await act(async () => {
      resolveGeneration!('data:image/png;base64,mockImageData');
    });
    
    // Should no longer be loading
    expect(result.current.isGenerating).toBe(false);
  });

  it('generates and downloads image', async () => {
    const mockImageUrl = 'data:image/png;base64,mockImageData';
    mockGenerateCelebrationImage.mockResolvedValue(mockImageUrl);
    
    const { result } = renderHook(() => useCelebrationImageGenerator());
    
    await act(async () => {
      await result.current.generateAndDownload(mockChallengeData);
    });
    
    expect(mockGenerateCelebrationImage).toHaveBeenCalled();
    expect(mockDownloadImage).toHaveBeenCalledWith(
      mockImageUrl,
      expect.stringContaining('celebracao-joão-silva')
    );
  });

  it('generates and shares image', async () => {
    const mockImageUrl = 'data:image/png;base64,mockImageData';
    mockGenerateCelebrationImage.mockResolvedValue(mockImageUrl);
    
    const { result } = renderHook(() => useCelebrationImageGenerator());
    
    await act(async () => {
      await result.current.generateAndShare(mockChallengeData);
    });
    
    expect(mockGenerateCelebrationImage).toHaveBeenCalled();
    expect(mockShareImage).toHaveBeenCalledWith(mockImageUrl, mockChallengeData);
  });

  it('does not download when image generation fails', async () => {
    mockGenerateCelebrationImage.mockRejectedValue(new Error('Generation failed'));
    
    const { result } = renderHook(() => useCelebrationImageGenerator());
    
    await act(async () => {
      await result.current.generateAndDownload(mockChallengeData);
    });
    
    expect(mockDownloadImage).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Generation failed');
  });

  it('does not share when image generation fails', async () => {
    mockGenerateCelebrationImage.mockRejectedValue(new Error('Generation failed'));
    
    const { result } = renderHook(() => useCelebrationImageGenerator());
    
    await act(async () => {
      await result.current.generateAndShare(mockChallengeData);
    });
    
    expect(mockShareImage).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Generation failed');
  });

  it('generates filename with sanitized patient name', async () => {
    const mockImageUrl = 'data:image/png;base64,mockImageData';
    mockGenerateCelebrationImage.mockResolvedValue(mockImageUrl);
    
    const dataWithSpecialChars = {
      ...mockChallengeData,
      patientName: 'João da Silva & Cia.'
    };
    
    const { result } = renderHook(() => useCelebrationImageGenerator());
    
    await act(async () => {
      await result.current.generateAndDownload(dataWithSpecialChars);
    });
    
    expect(mockDownloadImage).toHaveBeenCalledWith(
      mockImageUrl,
      expect.stringMatching(/celebracao-joão-da-silva-&-cia\.-\d+\.png/)
    );
  });

  it('clears error when starting new generation', async () => {
    // First, cause an error
    mockGenerateCelebrationImage.mockRejectedValueOnce(new Error('First error'));
    
    const { result } = renderHook(() => useCelebrationImageGenerator());
    
    await act(async () => {
      await result.current.generateImageUrl(mockChallengeData);
    });
    
    expect(result.current.error).toBe('First error');
    
    // Then, start a new successful generation
    mockGenerateCelebrationImage.mockResolvedValue('data:image/png;base64,success');
    
    await act(async () => {
      await result.current.generateImageUrl(mockChallengeData);
    });
    
    expect(result.current.error).toBe(null);
  });
});