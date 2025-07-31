import React from 'react';
import { TrophyIcon } from '@/components/TrophyIcon';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, Flame } from 'lucide-react';
import { type ChallengeStats } from '@/hooks/useCelebrationData';

interface EvolutionCardProps {
  stats: ChallengeStats;
  totalScore?: number; // Add totalScore prop to ensure consistency
  className?: string;
}

export const EvolutionCard: React.FC<EvolutionCardProps> = ({ 
  stats, 
  totalScore,
  className = "" 
}) => {
  // Use totalScore for average calculation if provided, otherwise use stats.averageScore
  const displayAverageScore = totalScore ? Math.round(totalScore / 7) : stats.averageScore;
  return (
    <Card 
      className={`bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 border-amber-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] ${className}`}
      role="region"
      aria-labelledby="evolution-title"
    >
      <CardContent className="p-4 sm:p-6 lg:p-8">
        {/* Header with Enhanced Animated Trophy - Mobile-optimized */}
        <header className="text-center mb-4 sm:mb-6 lg:mb-8">
          <div className="relative inline-block">
            <TrophyIcon 
              size={60} 
              className="sm:w-16 sm:h-16 lg:w-20 lg:h-20"
              animated={true}
              aria-label="Troféu de conquista"
            />
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 via-orange-400/30 to-amber-400/20 rounded-full blur-xl animate-glow" aria-hidden="true"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-300/10 to-orange-300/10 rounded-full blur-lg animate-pulse-glow" aria-hidden="true"></div>
          </div>
          <h2 
            id="evolution-title"
            className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-3 sm:mt-4 mb-1 sm:mb-2"
          >
            Sua Evolução
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Estatísticas do seu desafio de 7 dias
          </p>
        </header>

        {/* Statistics Grid - Mobile-first responsive 2x2 → 4x1 */}
        <div 
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8"
          role="list"
          aria-label="Estatísticas do desafio"
        >
          {/* Perfect Days */}
          <div 
            className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-lg animate-card-hover border border-amber-100/50 gpu-accelerated animate-slide-up-staggered animate-delay-100"
            role="listitem"
            tabIndex={0}
            aria-label={`${stats.perfectDays} dias perfeitos completados`}
          >
            <div className="p-1.5 sm:p-2 rounded-full bg-amber-100 w-fit mx-auto mb-2 sm:mb-3" aria-hidden="true">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-700 mb-1">
              {stats.perfectDays}
            </div>
            <div className="text-xs font-medium text-gray-600 leading-tight">
              Dias Perfeitos
            </div>
          </div>

          {/* Average Score */}
          <div 
            className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-lg animate-card-hover border border-blue-100/50 gpu-accelerated animate-slide-up-staggered animate-delay-200"
            role="listitem"
            tabIndex={0}
            aria-label={`Média de ${displayAverageScore} pontos por dia`}
          >
            <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 w-fit mx-auto mb-2 sm:mb-3" aria-hidden="true">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 mb-1">
              {displayAverageScore}
            </div>
            <div className="text-xs font-medium text-gray-600 leading-tight">
              Média de Pontos
            </div>
          </div>

          {/* Improvement */}
          <div 
            className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-lg animate-card-hover border border-green-100/50 gpu-accelerated animate-slide-up-staggered animate-delay-300"
            role="listitem"
            tabIndex={0}
            aria-label={`Melhoria de ${stats.improvementPercent > 0 ? '+' : ''}${stats.improvementPercent} por cento`}
          >
            <div className="p-1.5 sm:p-2 rounded-full bg-green-100 w-fit mx-auto mb-2 sm:mb-3" aria-hidden="true">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 mb-1">
              {stats.improvementPercent > 0 ? '+' : ''}{stats.improvementPercent}%
            </div>
            <div className="text-xs font-medium text-gray-600 leading-tight">
              Melhoria
            </div>
          </div>

          {/* Streak Record */}
          <div 
            className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-lg animate-card-hover border border-orange-100/50 gpu-accelerated animate-slide-up-staggered animate-delay-400"
            role="listitem"
            tabIndex={0}
            aria-label={`Sequência máxima de ${stats.streakRecord} dias consecutivos`}
          >
            <div className="p-1.5 sm:p-2 rounded-full bg-orange-100 w-fit mx-auto mb-2 sm:mb-3" aria-hidden="true">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-700 mb-1">
              {stats.streakRecord}
            </div>
            <div className="text-xs font-medium text-gray-600 leading-tight">
              Sequência Máxima
            </div>
          </div>
        </div>

        {/* 100% Completion Progress Bar */}
        <section 
          className="space-y-4"
          aria-labelledby="progress-section"
        >
          <div className="flex items-center justify-between">
            <span 
              id="progress-section"
              className="text-sm font-medium text-gray-700"
            >
              Progresso do Desafio
            </span>
            <span 
              className="text-sm font-bold text-amber-600"
              aria-label="Cem por cento completo"
            >
              100%
            </span>
          </div>
          
          <div className="relative animate-slide-up-staggered animate-delay-500">
            <Progress 
              value={100} 
              className="h-3 bg-gray-200/50 rounded-full overflow-hidden"
              aria-label="Barra de progresso do desafio - 100% completo"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-full shadow-lg animate-pulse-glow" aria-hidden="true"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-shimmer" aria-hidden="true"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-orange-500/20 to-amber-600/20 rounded-full blur-sm animate-glow" aria-hidden="true"></div>
          </div>
          
          <div className="text-center">
            <p 
              className="text-sm font-medium text-gray-600"
              role="status"
              aria-live="polite"
            >
              🎉 Desafio Completado com Sucesso! 🎉
            </p>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};