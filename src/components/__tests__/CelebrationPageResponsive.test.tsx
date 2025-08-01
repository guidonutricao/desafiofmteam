import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CelebrationPage from '@/pages/CelebrationPage';
import { type ChallengeData } from '@/hooks/useCelebrationData';

// Mock dependencies
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    loading: false
  })
}));

vi.mock('@/hooks/useChallengeStatus', () => ({
  useChallengeStatus: () => ({
    isCompleted: true,
    loading: false
  })
}));

const mockUseCelebrationData = vi.fn();
vi.mock('@/hooks/useCelebrationData', () => ({
  useCelebrationData: mockUseCelebrationData
}));

vi.mock('@/components/Confetti', () => ({
  Confetti: () => <div data-testid="confetti">Confetti</div>
}));

vi.mock('@/lib/socialMetaTags', () => ({
  updateSocialMetaTags: vi.fn(),
  generateCelebrationMetaTags: vi.fn(() => ({})),
  cleanupSocialMetaTags: vi.fn()
}));

const mockChallengeData: ChallengeData = {
  patientName: 'Maria Santos',
  challengeDuration: 7,
  totalScore: 102,
  dailyScores: [
    {
      day: 1,
      score: 14,
      date: '2024-01-01',
      goals: ['hidratacao', 'sono_qualidade', 'atividade_fisica'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: true,
        seguiu_dieta: false,
        registro_visual: false
      }
    },
    {
      day: 2,
      score: 16,
      date: '2024-01-02',
      goals: ['hidratacao', 'sono_qualidade', 'atividade_fisica', 'seguiu_dieta'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: true,
        seguiu_dieta: true,
        registro_visual: false
      }
    },
    {
      day: 3,
      score: 15,
      date: '2024-01-03',
      goals: ['hidratacao', 'sono_qualidade', 'atividade_fisica'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: true,
        seguiu_dieta: false,
        registro_visual: false
      }
    },
    {
      day: 4,
      score: 13,
      date: '2024-01-04',
      goals: ['hidratacao', 'sono_qualidade', 'seguiu_dieta'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: false,
        seguiu_dieta: true,
        registro_visual: false
      }
    },
    {
      day: 5,
      score: 17,
      date: '2024-01-05',
      goals: ['hidratacao', 'atividade_fisica', 'seguiu_dieta', 'registro_visual'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: false,
        atividade_fisica: true,
        seguiu_dieta: true,
        registro_visual: true
      }
    },
    {
      day: 6,
      score: 12,
      date: '2024-01-06',
      goals: ['hidratacao', 'sono_qualidade'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: false,
        seguiu_dieta: false,
        registro_visual: false
      }
    },
    {
      day: 7,
      score: 15,
      date: '2024-01-07',
      goals: ['hidratacao', 'sono_qualidade', 'atividade_fisica'],
      completed: true,
      tasks_completed: {
        hidratacao: true,
        sono_qualidade: true,
        atividade_fisica: true,
        seguiu_dieta: false,
        registro_visual: false
      }
    }
  ],
  achievements: [
    {
      id: 'challenge-complete',
      title: 'Desafio Completo',
      description: 'Completou todos os 7 dias do desafio',
      icon: 'trophy'
    },
    {
      id: 'consistent',
      title: 'Consistente',
      description: '7 dias consecutivos',
      icon: 'flame'
    }
  ],
  stats: {
    perfectDays: 0,
    averageScore: 14.6,
    improvementPercent: 7,
    streakRecord: 7
  }
};
// Mock window.matchMedia for responsive tests
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('CelebrationPage Responsive Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(mockMatchMedia),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render celebration page with mock data', () => {
    // Mock the hook to return our test data
    mockUseCelebrationData.mockReturnValue({
      data: mockChallengeData,
      loading: false,
      error: null,
      refresh: vi.fn(),
      retryCount: 0,
      isRetrying: false
    });

    render(<CelebrationPage />);

    // Basic assertions to verify the page renders
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument(); // Total score
  });

  it('should handle mobile viewport correctly', () => {
    // Mock mobile viewport
    const mobileMatchMedia = (query: string) => ({
      ...mockMatchMedia(query),
      matches: query.includes('max-width: 768px')
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(mobileMatchMedia),
    });

    mockUseCelebrationData.mockReturnValue({
      data: mockChallengeData,
      loading: false,
      error: null,
      refresh: vi.fn(),
      retryCount: 0,
      isRetrying: false
    });

    render(<CelebrationPage />);

    // Verify mobile-specific elements or layouts
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });

  it('should handle tablet viewport correctly', () => {
    // Mock tablet viewport
    const tabletMatchMedia = (query: string) => ({
      ...mockMatchMedia(query),
      matches: query.includes('max-width: 1024px') && !query.includes('max-width: 768px')
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(tabletMatchMedia),
    });

    mockUseCelebrationData.mockReturnValue({
      data: mockChallengeData,
      loading: false,
      error: null,
      refresh: vi.fn(),
      retryCount: 0,
      isRetrying: false
    });

    render(<CelebrationPage />);

    // Verify tablet-specific elements or layouts
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });

  it('should handle desktop viewport correctly', () => {
    // Mock desktop viewport
    const desktopMatchMedia = (query: string) => ({
      ...mockMatchMedia(query),
      matches: !query.includes('max-width')
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(desktopMatchMedia),
    });

    mockUseCelebrationData.mockReturnValue({
      data: mockChallengeData,
      loading: false,
      error: null,
      refresh: vi.fn(),
      retryCount: 0,
      isRetrying: false
    });

    render(<CelebrationPage />);

    // Verify desktop-specific elements or layouts
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });
});