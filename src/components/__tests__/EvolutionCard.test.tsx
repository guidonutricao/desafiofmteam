import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EvolutionCard } from '../EvolutionCard';
import { type ChallengeStats } from '@/hooks/useCelebrationData';

// Mock the TrophyIcon component
vi.mock('../TrophyIcon', () => ({
  TrophyIcon: ({ className, size }: { className?: string; size?: number }) => (
    <div data-testid="trophy-icon" className={className} style={{ width: size, height: size }}>
      Trophy Icon
    </div>
  )
}));

// Mock the UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  )
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: { value: number; className?: string }) => (
    <div data-testid="progress" className={className} data-value={value}>
      Progress: {value}%
    </div>
  )
}));

describe('EvolutionCard', () => {
  const mockStats: ChallengeStats = {
    perfectDays: 3,
    averageScore: 85,
    improvementPercent: 25,
    streakRecord: 5
  };

  it('should render the component with all required elements', () => {
    render(<EvolutionCard stats={mockStats} />);
    
    // Check if main elements are present
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  it('should display the correct title and description', () => {
    render(<EvolutionCard stats={mockStats} />);
    
    expect(screen.getByText('Sua Evolução')).toBeInTheDocument();
    expect(screen.getByText('Estatísticas do seu desafio de 7 dias')).toBeInTheDocument();
  });

  it('should display all statistics correctly', () => {
    render(<EvolutionCard stats={mockStats} />);
    
    // Check perfect days
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Dias Perfeitos')).toBeInTheDocument();
    
    // Check average score
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Média de Pontos')).toBeInTheDocument();
    
    // Check improvement percentage
    expect(screen.getByText('+25%')).toBeInTheDocument();
    expect(screen.getByText('Melhoria')).toBeInTheDocument();
    
    // Check streak record
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Sequência Máxima')).toBeInTheDocument();
  });

  it('should display negative improvement percentage correctly', () => {
    const statsWithNegativeImprovement: ChallengeStats = {
      ...mockStats,
      improvementPercent: -10
    };
    
    render(<EvolutionCard stats={statsWithNegativeImprovement} />);
    
    expect(screen.getByText('-10%')).toBeInTheDocument();
  });

  it('should display zero improvement percentage correctly', () => {
    const statsWithZeroImprovement: ChallengeStats = {
      ...mockStats,
      improvementPercent: 0
    };
    
    render(<EvolutionCard stats={statsWithZeroImprovement} />);
    
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should render the 100% completion progress bar', () => {
    render(<EvolutionCard stats={mockStats} />);
    
    const progressBar = screen.getByTestId('progress');
    expect(progressBar).toHaveAttribute('data-value', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Progresso do Desafio')).toBeInTheDocument();
  });

  it('should display completion message', () => {
    render(<EvolutionCard stats={mockStats} />);
    
    expect(screen.getByText('🎉 Desafio Completado com Sucesso! 🎉')).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const customClass = 'custom-evolution-card';
    render(<EvolutionCard stats={mockStats} className={customClass} />);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass(customClass);
  });

  it('should render trophy icon with correct props', () => {
    render(<EvolutionCard stats={mockStats} />);
    
    const trophyIcon = screen.getByTestId('trophy-icon');
    expect(trophyIcon).toHaveClass('animate-float');
    expect(trophyIcon).toHaveClass('drop-shadow-lg');
    expect(trophyIcon).toHaveStyle({ width: '80px', height: '80px' });
  });

  it('should handle edge case values correctly', () => {
    const edgeCaseStats: ChallengeStats = {
      perfectDays: 0,
      averageScore: 0,
      improvementPercent: 0,
      streakRecord: 0
    };
    
    render(<EvolutionCard stats={edgeCaseStats} />);
    
    // Should display zeros correctly
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues).toHaveLength(3); // perfectDays, averageScore, streakRecord
    expect(screen.getByText('0%')).toBeInTheDocument(); // improvementPercent
  });
});