import { render, screen } from '@testing-library/react';
import { DailyScoreDashboard } from '../DailyScoreDashboard';

const mockDailyScores = [
  {
    day: 1,
    score: 85,
    date: '2024-01-01',
    goals: ['Hidratação', 'Sono de qualidade', 'Atividade física'],
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
    score: 60,
    date: '2024-01-02',
    goals: ['Hidratação', 'Dieta'],
    completed: true,
    tasks_completed: {
      hidratacao: true,
      sono_qualidade: false,
      atividade_fisica: false,
      seguiu_dieta: true,
      registro_visual: false
    }
  },
  {
    day: 3,
    score: 0,
    date: '2024-01-03',
    goals: [],
    completed: false,
    tasks_completed: {
      hidratacao: false,
      sono_qualidade: false,
      atividade_fisica: false,
      seguiu_dieta: false,
      registro_visual: false
    }
  },
  {
    day: 4,
    score: 95,
    date: '2024-01-04',
    goals: ['Hidratação', 'Sono de qualidade', 'Atividade física', 'Dieta', 'Registro visual'],
    completed: true,
    tasks_completed: {
      hidratacao: true,
      sono_qualidade: true,
      atividade_fisica: true,
      seguiu_dieta: true,
      registro_visual: true
    }
  },
  {
    day: 5,
    score: 40,
    date: '2024-01-05',
    goals: ['Hidratação'],
    completed: true,
    tasks_completed: {
      hidratacao: true,
      sono_qualidade: false,
      atividade_fisica: false,
      seguiu_dieta: false,
      registro_visual: false
    }
  },
  {
    day: 6,
    score: 0,
    date: '2024-01-06',
    goals: [],
    completed: false,
    tasks_completed: {
      hidratacao: false,
      sono_qualidade: false,
      atividade_fisica: false,
      seguiu_dieta: false,
      registro_visual: false
    }
  },
  {
    day: 7,
    score: 80,
    date: '2024-01-07',
    goals: ['Hidratação', 'Sono de qualidade', 'Atividade física', 'Dieta'],
    completed: true,
    tasks_completed: {
      hidratacao: true,
      sono_qualidade: true,
      atividade_fisica: true,
      seguiu_dieta: true,
      registro_visual: false
    }
  }
];

describe('DailyScoreDashboard', () => {
  it('renders the component with correct title', () => {
    render(<DailyScoreDashboard dailyScores={mockDailyScores} />);
    
    expect(screen.getByText('Sua Jornada de 7 Dias')).toBeInTheDocument();
    expect(screen.getByText(/Acompanhe seu progresso diário durante o desafio/)).toBeInTheDocument();
  });

  it('displays all 7 days in the grid', () => {
    render(<DailyScoreDashboard dailyScores={mockDailyScores} />);
    
    // Check that all 7 day numbers are displayed
    for (let day = 1; day <= 7; day++) {
      expect(screen.getByText(day.toString())).toBeInTheDocument();
    }
  });

  it('shows correct scores for each day', () => {
    render(<DailyScoreDashboard dailyScores={mockDailyScores} />);
    
    // Check specific scores
    expect(screen.getByText('85')).toBeInTheDocument(); // Day 1
    expect(screen.getByText('60')).toBeInTheDocument(); // Day 2
    expect(screen.getByText('95')).toBeInTheDocument(); // Day 4
    expect(screen.getByText('40')).toBeInTheDocument(); // Day 5
    expect(screen.getByText('80')).toBeInTheDocument(); // Day 7
  });

  it('displays "Concluído" badges for completed days with scores', () => {
    render(<DailyScoreDashboard dailyScores={mockDailyScores} />);
    
    // Should show "Concluído" for days with scores > 0 and completed = true
    const completedBadges = screen.getAllByText('Concluído');
    expect(completedBadges).toHaveLength(5); // Days 1, 2, 4, 5, 7
  });

  it('shows "Não iniciado" for days without activity', () => {
    render(<DailyScoreDashboard dailyScores={mockDailyScores} />);
    
    // Should show "Não iniciado" for days 3 and 6 (score = 0, completed = false)
    const notStartedLabels = screen.getAllByText('Não iniciado');
    expect(notStartedLabels).toHaveLength(2);
  });

  it('displays correct summary statistics', () => {
    render(<DailyScoreDashboard dailyScores={mockDailyScores} />);
    
    // Total completed days (days with score > 0 and completed = true)
    expect(screen.getByText('5')).toBeInTheDocument(); // Completed days
    
    // Total points (85 + 60 + 0 + 95 + 40 + 0 + 80 = 360)
    expect(screen.getByText('360')).toBeInTheDocument();
    
    // Average daily (360 / 7 = 51.43, rounded = 51)
    expect(screen.getByText('51')).toBeInTheDocument();
    
    // Completion rate (5/7 * 100 = 71.43, rounded = 71%)
    expect(screen.getByText('71%')).toBeInTheDocument();
  });

  it('applies responsive grid classes', () => {
    const { container } = render(<DailyScoreDashboard dailyScores={mockDailyScores} />);
    
    // Check for responsive grid classes
    const gridContainer = container.querySelector('.grid.grid-cols-2.sm\\:grid-cols-4.lg\\:grid-cols-7');
    expect(gridContainer).toBeInTheDocument();
  });

  it('applies hover effects to day cards', () => {
    const { container } = render(<DailyScoreDashboard dailyScores={mockDailyScores} />);
    
    // Check for hover effect classes
    const dayCards = container.querySelectorAll('.hover\\:scale-105.hover\\:shadow-xl');
    expect(dayCards).toHaveLength(7);
  });

  it('shows star icons in completion badges', () => {
    render(<DailyScoreDashboard dailyScores={mockDailyScores} />);
    
    // Check that star icons are present in completed badges
    const completedBadges = screen.getAllByText('Concluído');
    completedBadges.forEach(badge => {
      const starIcon = badge.parentElement?.querySelector('svg');
      expect(starIcon).toBeInTheDocument();
    });
  });

  it('handles empty daily scores array', () => {
    render(<DailyScoreDashboard dailyScores={[]} />);
    
    // Should still render the component structure
    expect(screen.getByText('Sua Jornada de 7 Dias')).toBeInTheDocument();
    expect(screen.getByText('Resumo do Desafio')).toBeInTheDocument();
  });
});