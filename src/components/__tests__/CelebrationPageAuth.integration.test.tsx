import { render, screen } from '@testing-library/react';
import { vi, describe, it, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CelebrationPage from '@/pages/CelebrationPage';

// Import the hooks to mock them
import { useAuth } from '@/hooks/use-auth';
import { useChallengeStatus } from '@/hooks/useChallengeStatus';
import { useCelebrationData } from '@/hooks/useCelebrationData';

// Mock the hooks
vi.mock('@/hooks/use-auth');
vi.mock('@/hooks/useChallengeStatus');
vi.mock('@/hooks/useCelebrationData');

// Mock other components to focus on authentication logic
vi.mock('@/components/Confetti', () => ({
  Confetti: () => <div data-testid="confetti">Confetti</div>
}));

vi.mock('@/components/EvolutionCard', () => ({
  EvolutionCard: () => <div data-testid="evolution-card">Evolution Card</div>
}));

vi.mock('@/components/DailyScoreDashboard', () => ({
  DailyScoreDashboard: () => <div data-testid="daily-dashboard">Daily Dashboard</div>
}));

vi.mock('@/components/SocialSharing', () => ({
  SocialSharing: () => <div data-testid="social-sharing">Social Sharing</div>
}));

vi.mock('@/lib/socialMetaTags', () => ({
  updateSocialMetaTags: vi.fn(),
  generateCelebrationMetaTags: vi.fn(),
  addStructuredData: vi.fn(),
  cleanupSocialMetaTags: vi.fn()
}));

vi.mock('@/lib/accessibilityUtils', () => ({
  announceToScreenReader: vi.fn(() => document.createElement('div')),
  manageFocus: vi.fn()
}));

const mockChallengeData = {
  patientName: 'Test User',
  challengeDuration: 7,
  totalScore: 85,
  dailyScores: [
    { day: 1, score: 12, date: '2024-01-01', goals: ['Hidratação'], completed: true, tasks_completed: {} },
    { day: 2, score: 15, date: '2024-01-02', goals: ['Hidratação', 'Sono'], completed: true, tasks_completed: {} }
  ],
  achievements: [],
  stats: {
    perfectDays: 2,
    averageScore: 13.5,
    improvementPercent: 25,
    streakRecord: 7
  }
};

describe('CelebrationPage Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Mock unauthenticated state
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    });

    vi.mocked(useChallengeStatus).mockReturnValue({
      hasStarted: false,
      canCompleteTasks: false,
      challengeStartDate: null,
      challengeCompletedAt: null,
      daysSinceStart: 0,
      currentChallengeDay: 0,
      isCompleted: true,
      loading: false,
      error: null,
      refresh: vi.fn()
    });

    vi.mocked(useCelebrationData).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refresh: vi.fn()
    });

    render(
      <BrowserRouter>
        <CelebrationPage />
      </BrowserRouter>
    );

    // Should not render the main celebration content
    expect(screen.queryByText('Parabéns,')).not.toBeInTheDocument();
  });

  it('should redirect to challenge page when challenge is not completed', () => {
    // Mock authenticated but challenge not completed
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' } as any,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    });

    vi.mocked(useChallengeStatus).mockReturnValue({
      hasStarted: true,
      canCompleteTasks: true,
      challengeStartDate: new Date(),
      challengeCompletedAt: null,
      daysSinceStart: 3,
      currentChallengeDay: 3,
      isCompleted: false,
      loading: false,
      error: null,
      refresh: vi.fn()
    });

    vi.mocked(useCelebrationData).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refresh: vi.fn()
    });

    render(
      <BrowserRouter>
        <CelebrationPage />
      </BrowserRouter>
    );

    // Should not render the main celebration content
    expect(screen.queryByText('Parabéns,')).not.toBeInTheDocument();
  });

  it('should show loading state when authentication is loading', () => {
    // Mock loading authentication
    vi.mocked(require('@/hooks/use-auth').useAuth).mockReturnValue({
      user: null,
      loading: true
    });

    vi.mocked(require('@/hooks/useChallengeStatus').useChallengeStatus).mockReturnValue({
      isCompleted: false,
      loading: false
    });

    vi.mocked(require('@/hooks/useCelebrationData').useCelebrationData).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refresh: vi.fn()
    });

    render(
      <BrowserRouter>
        <CelebrationPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Verificando autenticação...')).toBeInTheDocument();
  });

  it('should show loading state when challenge status is loading', () => {
    // Mock loading challenge status
    vi.mocked(require('@/hooks/use-auth').useAuth).mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      loading: false
    });

    vi.mocked(require('@/hooks/useChallengeStatus').useChallengeStatus).mockReturnValue({
      isCompleted: false,
      loading: true
    });

    vi.mocked(require('@/hooks/useCelebrationData').useCelebrationData).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refresh: vi.fn()
    });

    render(
      <BrowserRouter>
        <CelebrationPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Verificando status do desafio...')).toBeInTheDocument();
  });

  it('should render celebration page when authenticated and challenge completed', () => {
    // Mock successful authentication and completed challenge
    vi.mocked(require('@/hooks/use-auth').useAuth).mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      loading: false
    });

    vi.mocked(require('@/hooks/useChallengeStatus').useChallengeStatus).mockReturnValue({
      isCompleted: true,
      loading: false
    });

    vi.mocked(require('@/hooks/useCelebrationData').useCelebrationData).mockReturnValue({
      data: mockChallengeData,
      loading: false,
      error: null,
      refresh: vi.fn()
    });

    render(
      <BrowserRouter>
        <CelebrationPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Parabéns,')).toBeInTheDocument();
    expect(screen.getByText('Test User!')).toBeInTheDocument();
  });

  it('should handle authentication errors gracefully', () => {
    // Mock authentication error
    vi.mocked(require('@/hooks/use-auth').useAuth).mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      loading: false
    });

    vi.mocked(require('@/hooks/useChallengeStatus').useChallengeStatus).mockReturnValue({
      isCompleted: true,
      loading: false
    });

    vi.mocked(require('@/hooks/useCelebrationData').useCelebrationData).mockReturnValue({
      data: null,
      loading: false,
      error: 'Sessão expirada. Faça login novamente.',
      refresh: vi.fn()
    });

    render(
      <BrowserRouter>
        <CelebrationPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Sessão Expirada')).toBeInTheDocument();
    expect(screen.getByText('Sessão expirada. Faça login novamente.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fazer Login/i })).toBeInTheDocument();
  });
});