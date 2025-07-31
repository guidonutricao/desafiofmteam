import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useChallengeStatus } from '@/hooks/useChallengeStatus';
import { retryAsync, RETRY_CONFIGS } from '@/lib/retryUtils';

// Types for challenge data processing
export interface TasksCompleted {
  hidratacao: boolean;
  sono_qualidade: boolean;
  atividade_fisica: boolean;
  seguiu_dieta: boolean;
  registro_visual: boolean;
}

export interface DailyProgress {
  day: number;
  score: number;
  date: string;
  goals: string[];
  completed: boolean;
  tasks_completed: TasksCompleted;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ChallengeStats {
  perfectDays: number;
  averageScore: number;
  improvementPercent: number;
  streakRecord: number;
}

export interface ChallengeData {
  patientName: string;
  challengeDuration: number;
  totalScore: number;
  dailyScores: DailyProgress[];
  achievements: Achievement[];
  stats: ChallengeStats;
}

export interface CelebrationDataState {
  data: ChallengeData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  retryCount: number;
  isRetrying: boolean;
}

// Data transformation functions
export const transformDailyData = (rawData: any[]): DailyProgress[] => {
  const fullWeekData: DailyProgress[] = [];
  
  // Create complete 7-day structure
  for (let day = 1; day <= 7; day++) {
    const dayData = rawData.find(item => {
      if (item.day) return item.day === day;
      return rawData.indexOf(item) + 1 === day;
    });
    
    if (dayData) {
      const tasks: TasksCompleted = {
        hidratacao: dayData.hidratacao || false,
        sono_qualidade: dayData.sono_qualidade || false,
        atividade_fisica: dayData.atividade_fisica || false,
        seguiu_dieta: dayData.seguiu_dieta || false,
        registro_visual: dayData.registro_visual || false
      };
      
      const completedTasksCount = Object.values(tasks).filter(Boolean).length;
      const goals = [];
      if (tasks.hidratacao) goals.push('Hidratação');
      if (tasks.sono_qualidade) goals.push('Sono de qualidade');
      if (tasks.atividade_fisica) goals.push('Atividade física');
      if (tasks.seguiu_dieta) goals.push('Dieta');
      if (tasks.registro_visual) goals.push('Registro visual');
      
      fullWeekData.push({
        day,
        score: dayData.pontuacao_total || 0,
        date: dayData.data || new Date(Date.now() - (7 - day) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goals,
        completed: completedTasksCount > 0,
        tasks_completed: tasks
      });
    } else {
      // Day without data - fill with zeros
      fullWeekData.push({
        day,
        score: 0,
        date: new Date(Date.now() - (7 - day) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goals: [],
        completed: false,
        tasks_completed: {
          hidratacao: false,
          sono_qualidade: false,
          atividade_fisica: false,
          seguiu_dieta: false,
          registro_visual: false
        }
      });
    }
  }
  
  return fullWeekData;
};

export const calculateStats = (dailyScores: DailyProgress[]): ChallengeStats => {
  const completedDays = dailyScores.filter(day => day.completed);
  const scoresWithData = dailyScores.filter(day => day.score > 0);
  
  // Perfect days (all 5 tasks completed)
  const perfectDays = dailyScores.filter(day => {
    const tasks = day.tasks_completed;
    return Object.values(tasks).filter(Boolean).length === 5;
  }).length;
  
  // Average score (only counting days with data)
  const averageScore = scoresWithData.length > 0 
    ? Math.round(scoresWithData.reduce((sum, day) => sum + day.score, 0) / scoresWithData.length)
    : 0;
  
  // Improvement percentage (comparing first half vs second half)
  const firstHalf = dailyScores.slice(0, Math.ceil(dailyScores.length / 2));
  const secondHalf = dailyScores.slice(Math.ceil(dailyScores.length / 2));
  
  const firstHalfAvg = firstHalf.length > 0 
    ? firstHalf.reduce((sum, day) => sum + day.score, 0) / firstHalf.length 
    : 0;
  const secondHalfAvg = secondHalf.length > 0 
    ? secondHalf.reduce((sum, day) => sum + day.score, 0) / secondHalf.length 
    : 0;
  
  const improvementPercent = firstHalfAvg > 0 
    ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
    : 0;
  
  // Streak record (consecutive days with any activity)
  let currentStreak = 0;
  let maxStreak = 0;
  
  for (const day of dailyScores) {
    if (day.completed) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return {
    perfectDays,
    averageScore,
    improvementPercent,
    streakRecord: maxStreak
  };
};

export const generateAchievements = (dailyScores: DailyProgress[], stats: ChallengeStats): Achievement[] => {
  const achievements: Achievement[] = [];
  
  // Challenge completion achievement
  const completedDays = dailyScores.filter(day => day.completed).length;
  if (completedDays >= 7) {
    achievements.push({
      id: 'challenge-complete',
      title: 'Desafio Completo',
      description: 'Completou todos os 7 dias do desafio',
      icon: 'trophy'
    });
  } else if (completedDays >= 5) {
    achievements.push({
      id: 'almost-there',
      title: 'Quase Lá',
      description: `Completou ${completedDays} de 7 dias`,
      icon: 'star'
    });
  }
  
  // Perfect days achievement
  if (stats.perfectDays >= 3) {
    achievements.push({
      id: 'perfectionist',
      title: 'Perfeccionista',
      description: `${stats.perfectDays} dias perfeitos`,
      icon: 'crown'
    });
  }
  
  // Consistency achievement
  if (stats.streakRecord >= 5) {
    achievements.push({
      id: 'consistent',
      title: 'Consistente',
      description: `${stats.streakRecord} dias consecutivos`,
      icon: 'flame'
    });
  }
  
  // Improvement achievement
  if (stats.improvementPercent > 20) {
    achievements.push({
      id: 'improving',
      title: 'Em Evolução',
      description: `${stats.improvementPercent}% de melhoria`,
      icon: 'trending-up'
    });
  }
  
  return achievements;
};

// Main hook for celebration data
export const useCelebrationData = (): CelebrationDataState => {
  const { user } = useAuth();
  const { isCompleted, challengeStartDate, challengeCompletedAt } = useChallengeStatus();
  const [state, setState] = useState<Omit<CelebrationDataState, 'refresh'>>({
    data: null,
    loading: true,
    error: null,
    retryCount: 0,
    isRetrying: false
  });

  const fetchChallengeData = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false, error: null, data: null, retryCount: 0, isRetrying: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, isRetrying: false }));

    try {
      // Wrap the entire data fetching operation with retry logic
      const challengeData = await retryAsync(async () => {
        // Fetch user profile for name
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('nome')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
          // Continue with fallback name from user metadata
        }

        // Fetch daily challenge data
        const { data: desafiosData, error: desafiosError } = await supabase
          .from('desafios_diarios')
          .select(`
            data,
            pontuacao_total,
            hidratacao,
            sono_qualidade,
            atividade_fisica,
            seguiu_dieta,
            registro_visual
          `)
          .eq('user_id', user.id)
          .order('data', { ascending: true });

        if (desafiosError) {
          throw new Error(`Erro ao buscar dados do desafio: ${desafiosError.message}`);
        }

        let dailyScores: DailyProgress[] = [];
        let totalScore = 0;

        // Always fetch total score from ranking view (includes both legacy and new points)
        const { data: rankingData, error: rankingError } = await supabase
          .from('ranking_with_challenge_progress')
          .select('total_points, legacy_points, total_challenge_points')
          .eq('user_id', user.id)
          .single();

        if (!rankingError && rankingData) {
          totalScore = rankingData.total_points || 0;
        }

        if (desafiosData && desafiosData.length > 0) {
          // Transform data from desafios_diarios table for daily breakdown
          dailyScores = transformDailyData(desafiosData);
        } else if (rankingData) {
          // Create simulated daily data based on total score
          // Use challenge points for daily distribution if available, otherwise use total
          const pointsForDistribution = rankingData.total_challenge_points > 0 
            ? rankingData.total_challenge_points 
            : totalScore;
          const basePoints = Math.floor(pointsForDistribution / 7);
          const remainder = pointsForDistribution % 7;
          
          const pointsDistribution = Array.from({ length: 7 }, (_, i) => {
            const extraPoints = i < remainder ? 1 : 0;
            return Math.max(basePoints + extraPoints, 0);
          });
          
          dailyScores = pointsDistribution.map((points, index) => ({
            day: index + 1,
            score: points,
            date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            goals: points > 0 ? ['Atividade registrada'] : [],
            completed: points > 0,
            tasks_completed: {
              hidratacao: points > basePoints * 0.8,
              sono_qualidade: points > basePoints * 0.6,
              atividade_fisica: points > basePoints * 0.4,
              seguiu_dieta: points > basePoints * 0.2,
              registro_visual: points > 0
            }
          }));
        } else {
          // No data available - create empty structure
          dailyScores = transformDailyData([]);
          totalScore = 0;
        }

        // Validate data integrity
        if (!dailyScores || dailyScores.length === 0) {
          throw new Error('Nenhum dado de progresso encontrado para o desafio');
        }

        // Calculate statistics
        const stats = calculateStats(dailyScores);
        
        // Generate achievements
        const achievements = generateAchievements(dailyScores, stats);

        const challengeData: ChallengeData = {
          patientName: profileData?.nome || user.user_metadata?.nome || user.email?.split('@')[0] || 'Usuário',
          challengeDuration: 7,
          totalScore,
          dailyScores,
          achievements,
          stats
        };

        return challengeData;
      }, {
        ...RETRY_CONFIGS.dataFetch,
        onRetry: (attempt, error) => {
          console.warn(`Tentativa ${attempt} de buscar dados falhou:`, error);
          setState(prev => ({ 
            ...prev, 
            retryCount: attempt, 
            isRetrying: true,
            error: `Tentativa ${attempt}: ${error.message}`
          }));
        }
      });

      setState({
        data: challengeData,
        loading: false,
        error: null,
        retryCount: 0,
        isRetrying: false
      });

    } catch (error) {
      console.error('Error fetching celebration data:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Erro ao carregar dados do desafio';
      
      if (error instanceof Error) {
        if (error.message.includes('JWT') || error.message.includes('token')) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('PGRST')) {
          errorMessage = 'Erro no banco de dados. Tente novamente em alguns instantes.';
        } else if (error.message.includes('dados')) {
          errorMessage = error.message; // Use the specific data error message
        } else {
          errorMessage = `Erro inesperado: ${error.message}`;
        }
      }
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        retryCount: 0,
        isRetrying: false
      });
    }
  }, [user, challengeStartDate, challengeCompletedAt]);

  useEffect(() => {
    fetchChallengeData();
  }, [fetchChallengeData]);

  const refresh = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false, error: null, data: null, retryCount: 0, isRetrying: false }));
      return;
    }
    
    // Reset retry state before refreshing
    setState(prev => ({ ...prev, retryCount: 0, isRetrying: false, error: null }));
    await fetchChallengeData();
  }, [fetchChallengeData, user]);

  return {
    ...state,
    refresh
  };
};