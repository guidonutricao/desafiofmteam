import { useState, useCallback } from 'react';
import { CelebrationImageGenerator, downloadImage, shareImage } from '@/lib/celebrationImageGenerator';
import { type ChallengeData } from '@/hooks/useCelebrationData';

interface UseCelebrationImageGeneratorReturn {
  isGenerating: boolean;
  error: string | null;
  generateAndDownload: (data: ChallengeData, deviceType?: 'mobile' | 'tablet' | 'desktop') => Promise<void>;
  generateAndShare: (data: ChallengeData, deviceType?: 'mobile' | 'tablet' | 'desktop') => Promise<void>;
  generateImageUrl: (data: ChallengeData, deviceType?: 'mobile' | 'tablet' | 'desktop') => Promise<string | null>;
}

export function useCelebrationImageGenerator(): UseCelebrationImageGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImageUrl = useCallback(async (data: ChallengeData, deviceType?: 'mobile' | 'tablet' | 'desktop'): Promise<string | null> => {
    try {
      setIsGenerating(true);
      setError(null);

      // Detect device type if not provided
      const detectedDeviceType = deviceType || detectDeviceType();

      const generator = new CelebrationImageGenerator({
        deviceType: detectedDeviceType,
        format: 'png',
        quality: 0.9
      });

      const imageUrl = await generator.generateCelebrationImage(data);
      return imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar imagem';
      setError(errorMessage);
      console.error('Error generating celebration image:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Detect device type based on screen size
  const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  };

  const generateAndDownload = useCallback(async (data: ChallengeData, deviceType?: 'mobile' | 'tablet' | 'desktop'): Promise<void> => {
    const imageUrl = await generateImageUrl(data, deviceType);
    if (imageUrl) {
      const filename = `celebracao-${data.patientName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      downloadImage(imageUrl, filename);
    }
  }, [generateImageUrl]);

  const generateAndShare = useCallback(async (data: ChallengeData, deviceType?: 'mobile' | 'tablet' | 'desktop'): Promise<void> => {
    const imageUrl = await generateImageUrl(data, deviceType);
    if (imageUrl) {
      await shareImage(imageUrl, data);
    }
  }, [generateImageUrl]);

  return {
    isGenerating,
    error,
    generateAndDownload,
    generateAndShare,
    generateImageUrl
  };
}