import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CelebrationImageGenerator, downloadImage, shareImage } from '../celebrationImageGenerator';
import { type ChallengeData } from '@/hooks/useCelebrationData';

// Mock HTML5 Canvas
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
  toDataURL: vi.fn()
};

const mockContext = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  roundRect: vi.fn(),
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  quadraticCurveTo: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  set fillStyle(value: any) {},
  set strokeStyle(value: any) {},
  set lineWidth(value: any) {},
  set font(value: any) {},
  set textAlign(value: any) {},
  set globalAlpha(value: any) {}
};

const mockGradient = {
  addColorStop: vi.fn()
};

// Mock DOM methods
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => mockCanvas),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  }
});

Object.defineProperty(global, 'navigator', {
  value: {
    share: vi.fn(),
    canShare: vi.fn()
  }
});

Object.defineProperty(global, 'fetch', {
  value: vi.fn()
});

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

describe('CelebrationImageGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockCanvas.getContext.mockReturnValue(mockContext);
    mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mockImageData');
    mockContext.createLinearGradient.mockReturnValue(mockGradient);
    mockContext.createRadialGradient.mockReturnValue(mockGradient);
  });

  it('creates canvas with default dimensions', () => {
    const generator = new CelebrationImageGenerator();
    
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.width).toBe(1080);
    expect(mockCanvas.height).toBe(1920);
  });

  it('creates canvas with custom dimensions', () => {
    const generator = new CelebrationImageGenerator({
      width: 800,
      height: 600
    });
    
    expect(mockCanvas.width).toBe(800);
    expect(mockCanvas.height).toBe(600);
  });

  it('throws error when canvas context is not available', () => {
    mockCanvas.getContext.mockReturnValue(null);
    
    expect(() => {
      new CelebrationImageGenerator();
    }).toThrow('Could not get canvas context');
  });

  it('generates celebration image successfully', async () => {
    const generator = new CelebrationImageGenerator();
    
    const result = await generator.generateCelebrationImage(mockChallengeData);
    
    expect(result).toBe('data:image/png;base64,mockImageData');
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 1080, 1920);
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 0.9);
  });

  it('draws background with gradient', async () => {
    const generator = new CelebrationImageGenerator();
    
    await generator.generateCelebrationImage(mockChallengeData);
    
    expect(mockContext.createLinearGradient).toHaveBeenCalledWith(0, 0, 1080, 1920);
    expect(mockGradient.addColorStop).toHaveBeenCalledWith(0, '#FFFBEB');
    expect(mockGradient.addColorStop).toHaveBeenCalledWith(0.5, '#FEF3C7');
    expect(mockGradient.addColorStop).toHaveBeenCalledWith(1, '#FFFBEB');
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 1080, 1920);
  });

  it('draws patient name', async () => {
    const generator = new CelebrationImageGenerator();
    
    await generator.generateCelebrationImage(mockChallengeData);
    
    expect(mockContext.fillText).toHaveBeenCalledWith('Desafio Shape Express - Concluído', 540, 280);
    expect(mockContext.fillText).toHaveBeenCalledWith('Parabéns, João Silva!', 540, 340);
  });

  it('draws total score', async () => {
    const generator = new CelebrationImageGenerator();
    
    await generator.generateCelebrationImage(mockChallengeData);
    
    expect(mockContext.fillText).toHaveBeenCalledWith('85', 540, 590);
    expect(mockContext.fillText).toHaveBeenCalledWith('pontos totais', 540, 615);
  });

  it('draws evolution section when available', async () => {
    const generator = new CelebrationImageGenerator();
    
    await generator.generateCelebrationImage(mockChallengeData);
    
    expect(mockContext.fillText).toHaveBeenCalledWith('🏆', 540, 1050);
    expect(mockContext.fillText).toHaveBeenCalledWith('Sua Evolução', 540, 1090);
    expect(mockContext.fillText).toHaveBeenCalledWith('Estatísticas do seu desafio de 7 dias', 540, 1115);
  });

  it('draws branding', async () => {
    const generator = new CelebrationImageGenerator();
    
    await generator.generateCelebrationImage(mockChallengeData);
    
    expect(mockContext.fillText).toHaveBeenCalledWith('Shape Express', 540, 1820);
    expect(mockContext.fillText).toHaveBeenCalledWith('Transformando vidas através de hábitos saudáveis', 540, 1860);
  });

  it('handles missing stats gracefully', async () => {
    const dataWithoutStats = { ...mockChallengeData, stats: undefined };
    const generator = new CelebrationImageGenerator();
    
    const result = await generator.generateCelebrationImage(dataWithoutStats);
    
    expect(result).toBe('data:image/png;base64,mockImageData');
    // Should still complete without errors
  });
});

describe('downloadImage', () => {
  it('creates download link and triggers download', () => {
    const mockLink = {
      download: '',
      href: '',
      click: vi.fn()
    };
    
    document.createElement = vi.fn().mockReturnValue(mockLink);
    
    const dataUrl = 'data:image/png;base64,mockData';
    const filename = 'test-image.png';
    
    downloadImage(dataUrl, filename);
    
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.download).toBe(filename);
    expect(mockLink.href).toBe(dataUrl);
    expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
  });

  it('uses default filename when not provided', () => {
    const mockLink = {
      download: '',
      href: '',
      click: vi.fn()
    };
    
    document.createElement = vi.fn().mockReturnValue(mockLink);
    
    downloadImage('data:image/png;base64,mockData');
    
    expect(mockLink.download).toBe('celebracao-shape-express.png');
  });
});

describe('shareImage', () => {
  it('uses Web Share API when available and supported', async () => {
    const mockBlob = new Blob(['mock'], { type: 'image/png' });
    const mockFile = new File([mockBlob], 'test.png', { type: 'image/png' });
    
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(mockBlob)
    });
    
    global.File = vi.fn().mockReturnValue(mockFile);
    
    navigator.canShare = vi.fn().mockReturnValue(true);
    navigator.share = vi.fn().mockResolvedValue(undefined);
    
    const dataUrl = 'data:image/png;base64,mockData';
    
    await shareImage(dataUrl, mockChallengeData);
    
    expect(fetch).toHaveBeenCalledWith(dataUrl);
    expect(navigator.canShare).toHaveBeenCalled();
    expect(navigator.share).toHaveBeenCalledWith({
      title: 'Desafio Shape Express Concluído!',
      text: 'Acabei de concluir o Desafio Shape Express com 85 pontos! 🏆',
      files: [mockFile]
    });
  });

  it('falls back to download when Web Share API is not available', async () => {
    navigator.share = undefined;
    
    const mockLink = {
      download: 'celebracao-shape-express.png',
      href: '',
      click: vi.fn()
    };
    
    document.createElement = vi.fn().mockReturnValue(mockLink);
    
    const dataUrl = 'data:image/png;base64,mockData';
    
    await shareImage(dataUrl, mockChallengeData);
    
    expect(mockLink.click).toHaveBeenCalled();
  });

  it('falls back to download when sharing fails', async () => {
    const mockBlob = new Blob(['mock'], { type: 'image/png' });
    
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(mockBlob)
    });
    
    navigator.canShare = vi.fn().mockReturnValue(true);
    navigator.share = vi.fn().mockRejectedValue(new Error('Share failed'));
    
    const mockLink = {
      download: 'celebracao-shape-express.png',
      href: '',
      click: vi.fn()
    };
    
    document.createElement = vi.fn().mockReturnValue(mockLink);
    
    const dataUrl = 'data:image/png;base64,mockData';
    
    await shareImage(dataUrl, mockChallengeData);
    
    expect(mockLink.click).toHaveBeenCalled();
  });
});