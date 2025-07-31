import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach } from 'vitest';
import CelebrationPage from '@/pages/CelebrationPage';
import type { ChallengeData } from '@/hooks/useCelebrationData';

// Mock the hooks and components
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/useChallengeStatus', () => ({
  useChallengeStatus: vi.fn()
}));

vi.mock('@/hooks/useCelebrationData', () => ({
  useCelebrationData: () => ({
    data: null,
    loading: false,
    error: null,
    refresh: vi.fn()
  })
}));

vi.mock('@/components/Confetti', () => ({
  Confetti: () => <div data-testid="confetti" />
}));

vi.mock('@/components/EvolutionCard', () => ({
  EvolutionCard: () => <div data-testid="evolution-card" />
}));

vi.mock('@/components/DailyScoreDashboard', () => ({
  DailyScoreDashboard: () => <div data-testid="daily-score-dashboard" />
}));

vi.mock('@/components/SocialSharing', () => ({
  SocialSharing: () => <div data-testid="social-sharing" />
}));

vi.mock('@/lib/socialMetaTags', () => ({
  updateSocialMetaTags: vi.fn(),
  generateCelebrationMetaTags: vi.fn(() => ({})),
  addStructuredData: vi.fn(),
  cleanupSocialMetaTags: vi.fn()
}));

const mockChallengeData: ChallengeData = {
  patientName: 'João Silva',
  challengeDuration: 7,
  totalScore: 85,
  dailyScores: [
    { day: 1, score: 12, goals: ['hidratacao', 'sono_qualidade'], completed: true },
    { day: 2, score: 11, goals: ['atividade_fisica', 'seguiu_dieta'], completed: true },
    { day: 3, score: 13, goals: ['hidratacao', 'registro_visual'], completed: true },
    { day: 4, score: 10, goals: ['sono_qualidade', 'seguiu_dieta'], completed: true },
    { day: 5, score: 14, goals: ['atividade_fisica', 'hidratacao'], completed: true },
    { day: 6, score: 12, goals: ['registro_visual', 'sono_qualidade'], completed: true },
    { day: 7, score: 13, goals: ['seguiu_dieta', 'atividade_fisica'], completed: true }
  ],
  stats: {
    perfectDays: 7,
    averageScore: 12.1,
    improvementPercent: 25,
    streakRecord: 7
  }
};

describe('CelebrationPage Lead Generation CTA', () => {
  beforeEach(() => {
    // Mock authentication hooks
    vi.mocked(require('@/hooks/use-auth').useAuth).mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      loading: false
    });

    vi.mocked(require('@/hooks/useChallengeStatus').useChallengeStatus).mockReturnValue({
      isCompleted: true,
      loading: false
    });

    // Mock window.open
    global.open = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the lead generation CTA section with correct text', () => {
    render(<CelebrationPage challengeData={mockChallengeData} />);
    
    // Check for the main CTA heading
    expect(screen.getByText('Quer Resultados ainda melhores?')).toBeInTheDocument();
    
    // Check for the promotion copy
    expect(screen.getByText(/Acompanhamento individual personalizado com/)).toBeInTheDocument();
    expect(screen.getByText(/Bônus especiais/)).toBeInTheDocument();
    expect(screen.getByText(/para os participantes do desafio!/)).toBeInTheDocument();
    
    // Check for the CTA button
    expect(screen.getByRole('button', { name: /Conhecer acompanhamento premium/ })).toBeInTheDocument();
  });

  it('should open WhatsApp when CTA button is clicked', () => {
    render(<CelebrationPage challengeData={mockChallengeData} />);
    
    const ctaButton = screen.getByRole('button', { name: /Conhecer acompanhamento premium/ });
    fireEvent.click(ctaButton);
    
    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/5511948464441?text='),
      '_blank'
    );
    
    // Verify the message contains the user's score
    const callArgs = (global.open as any).mock.calls[0][0];
    expect(decodeURIComponent(callArgs)).toContain('85 pontos');
    expect(decodeURIComponent(callArgs)).toContain('desafio de 7 dias');
  });

  it('should call onCTAClick callback when provided', () => {
    const mockOnCTAClick = vi.fn();
    render(<CelebrationPage challengeData={mockChallengeData} onCTAClick={mockOnCTAClick} />);
    
    const ctaButton = screen.getByRole('button', { name: /Conhecer acompanhamento premium/ });
    fireEvent.click(ctaButton);
    
    expect(mockOnCTAClick).toHaveBeenCalledTimes(1);
  });

  it('should render benefits cards in the CTA section', () => {
    render(<CelebrationPage challengeData={mockChallengeData} />);
    
    expect(screen.getByText('Plano Personalizado')).toBeInTheDocument();
    expect(screen.getByText('Acompanhamento 1:1')).toBeInTheDocument();
    expect(screen.getByText('Bônus Exclusivos')).toBeInTheDocument();
  });

  it('should have proper styling classes for hover effects', () => {
    render(<CelebrationPage challengeData={mockChallengeData} />);
    
    const ctaButton = screen.getByRole('button', { name: /Conhecer acompanhamento premium/ });
    
    // Check for hover and scale classes
    expect(ctaButton).toHaveClass('hover:scale-105');
    expect(ctaButton).toHaveClass('transition-all');
    expect(ctaButton).toHaveClass('duration-300');
  });
});