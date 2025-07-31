import type { DailyProgress, ChallengeStats, Achievement, TasksCompleted } from '@/hooks/useCelebrationData';

/**
 * Utility functions for processing celebration page data
 */

// Task labels mapping for display
export const TASK_LABELS: Record<keyof TasksCompleted, string> = {
  hidratacao: 'Hidratação',
  sono_qualidade: 'Sono de qualidade',
  atividade_fisica: 'Atividade física',
  seguiu_dieta: 'Dieta',
  registro_visual: 'Registro visual'
};

// Achievement icons mapping
export const ACHIEVEMENT_ICONS: Record<string, string> = {
  trophy: '🏆',
  star: '⭐',
  crown: '👑',
  flame: '🔥',
  'trending-up': '📈'
};

/**
 * Calculate completion percentage for a day based on completed tasks
 */
export const calculateDayCompletion = (tasks: TasksCompleted): number => {
  const completedCount = Object.values(tasks).filter(Boolean).length;
  return Math.round((completedCount / 5) * 100);
};

/**
 * Get task completion summary for a day
 */
export const getTaskSummary = (tasks: TasksCompleted): {
  completed: string[];
  total: number;
  percentage: number;
} => {
  const completed = Object.entries(tasks)
    .filter(([_, isCompleted]) => isCompleted)
    .map(([task, _]) => TASK_LABELS[task as keyof TasksCompleted]);
  
  return {
    completed,
    total: Object.keys(tasks).length,
    percentage: calculateDayCompletion(tasks)
  };
};

/**
 * Determine if a challenge is considered "successful" based on completion criteria
 */
export const isChallengeSuccessful = (stats: ChallengeStats, dailyScores: DailyProgress[]): boolean => {
  const completedDays = dailyScores.filter(day => day.completed).length;
  const totalScore = dailyScores.reduce((sum, day) => sum + day.score, 0);
  
  // Consider successful if:
  // - Completed at least 5 out of 7 days, OR
  // - Has at least 2 perfect days, OR
  // - Total score is above 200 points
  return completedDays >= 5 || stats.perfectDays >= 2 || totalScore >= 200;
};

/**
 * Generate motivational message based on performance
 */
export const getMotivationalMessage = (stats: ChallengeStats, dailyScores: DailyProgress[]): string => {
  const completedDays = dailyScores.filter(day => day.completed).length;
  const totalScore = dailyScores.reduce((sum, day) => sum + day.score, 0);
  
  if (completedDays === 7 && stats.perfectDays >= 5) {
    return "Incrível! Você é um verdadeiro campeão! 🏆";
  } else if (completedDays === 7) {
    return "Parabéns! Você completou todos os 7 dias! 🎉";
  } else if (stats.perfectDays >= 3) {
    return "Excelente consistência! Continue assim! ⭐";
  } else if (stats.improvementPercent > 20) {
    return "Que evolução fantástica! Você está no caminho certo! 📈";
  } else if (completedDays >= 5) {
    return "Muito bem! Você mostrou dedicação! 💪";
  } else if (totalScore > 100) {
    return "Bom trabalho! Cada passo conta! 👏";
  } else {
    return "Todo começo é importante! Continue tentando! 🌟";
  }
};

/**
 * Format score for display with appropriate suffix
 */
export const formatScore = (score: number): string => {
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`;
  }
  return score.toString();
};

/**
 * Get color theme based on performance level
 */
export const getPerformanceTheme = (stats: ChallengeStats, dailyScores: DailyProgress[]): {
  primary: string;
  secondary: string;
  accent: string;
} => {
  const completedDays = dailyScores.filter(day => day.completed).length;
  
  if (completedDays === 7 && stats.perfectDays >= 5) {
    // Gold theme for exceptional performance
    return {
      primary: 'from-yellow-400 to-amber-500',
      secondary: 'from-yellow-50 to-amber-100',
      accent: 'text-yellow-700'
    };
  } else if (completedDays >= 6 || stats.perfectDays >= 3) {
    // Silver theme for great performance
    return {
      primary: 'from-gray-300 to-gray-400',
      secondary: 'from-gray-50 to-gray-100',
      accent: 'text-gray-700'
    };
  } else if (completedDays >= 4) {
    // Bronze theme for good performance
    return {
      primary: 'from-orange-400 to-orange-500',
      secondary: 'from-orange-50 to-orange-100',
      accent: 'text-orange-700'
    };
  } else {
    // Default theme for participation
    return {
      primary: 'from-blue-400 to-blue-500',
      secondary: 'from-blue-50 to-blue-100',
      accent: 'text-blue-700'
    };
  }
};

/**
 * Calculate trend direction and intensity
 */
export const getTrendAnalysis = (dailyScores: DailyProgress[]): {
  direction: 'up' | 'down' | 'stable';
  intensity: 'weak' | 'moderate' | 'strong';
  percentage: number;
} => {
  if (dailyScores.length < 2) {
    return { direction: 'stable', intensity: 'weak', percentage: 0 };
  }
  
  const firstHalf = dailyScores.slice(0, Math.ceil(dailyScores.length / 2));
  const secondHalf = dailyScores.slice(Math.ceil(dailyScores.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.score, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.score, 0) / secondHalf.length;
  
  if (firstHalfAvg === 0) {
    return { direction: 'stable', intensity: 'weak', percentage: 0 };
  }
  
  const percentage = Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
  const absPercentage = Math.abs(percentage);
  
  let direction: 'up' | 'down' | 'stable';
  if (percentage > 5) direction = 'up';
  else if (percentage < -5) direction = 'down';
  else direction = 'stable';
  
  let intensity: 'weak' | 'moderate' | 'strong';
  if (absPercentage < 10) intensity = 'weak';
  else if (absPercentage < 25) intensity = 'moderate';
  else intensity = 'strong';
  
  return { direction, intensity, percentage };
};

/**
 * Generate share text based on performance
 */
export const generateShareText = (data: {
  patientName: string;
  challengeDuration: number;
  totalScore: number;
  stats: ChallengeStats;
}): string => {
  const { patientName, challengeDuration, totalScore, stats } = data;
  
  let shareText = `Acabei de concluir o desafio de ${challengeDuration} dias da Shape Express! 💪`;
  
  if (stats.perfectDays > 0) {
    shareText += ` Tive ${stats.perfectDays} dias perfeitos!`;
  }
  
  if (totalScore > 0) {
    shareText += ` Conquistei ${totalScore} pontos!`;
  }
  
  shareText += ' #ShapeExpress #DesafioCompleto';
  
  return shareText;
};