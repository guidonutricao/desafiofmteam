import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TasksCompleted {
  hidratacao: boolean;
  sono_qualidade: boolean;
  atividade_fisica: boolean;
  seguiu_dieta: boolean;
  registro_visual: boolean;
}

interface DailyProgress {
  day: number;
  score: number;
  date: string;
  goals: string[];
  completed: boolean;
  tasks_completed: TasksCompleted;
}

interface DailyScoreDashboardProps {
  dailyScores: DailyProgress[];
  totalScore?: number; // Add totalScore prop to ensure consistency
}

export function DailyScoreDashboard({ dailyScores, totalScore }: DailyScoreDashboardProps) {
  // Calculate if a day is truly completed (has meaningful activity)
  const isDayCompleted = (day: DailyProgress) => {
    return day.score > 0 && day.completed;
  };

  return (
    <section 
      className="space-y-8"
      aria-labelledby="daily-progress-title"
    >
      {/* Header */}
      <header className="text-center space-y-4">
        <h2 
          id="daily-progress-title"
          className="text-3xl md:text-4xl font-bold text-gray-900"
        >
          Sua Jornada de 7 Dias
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Acompanhe seu progresso diário durante o desafio e veja como você evoluiu
        </p>
      </header>

      {/* 7-Day Grid - Responsive Layout (2 cols → 4 cols → 7 cols) */}
      <div 
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-6"
        role="list"
        aria-label="Progresso diário dos 7 dias do desafio"
      >
        {dailyScores.map((day, index) => {
          const isCompleted = isDayCompleted(day);
          const hasActivity = day.score > 0;
          
          const getStatusText = () => {
            if (isCompleted) return 'Concluído';
            if (hasActivity) return 'Em progresso';
            return 'Não iniciado';
          };
          
          return (
            <Card
              key={day.day}
              className={`
                relative overflow-hidden animate-card-hover cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 gpu-accelerated animate-slide-up-staggered
                ${isCompleted 
                  ? 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 border-green-300 shadow-lg' 
                  : hasActivity 
                    ? 'bg-gradient-to-br from-amber-50 via-yellow-100 to-amber-100 border-amber-300 shadow-md'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-sm'
                }
              `}
              style={{
                animationDelay: `${index * 100 + 200}ms`
              }}
              role="listitem"
              tabIndex={0}
              aria-label={`Dia ${day.day}: ${day.score} pontos, status: ${getStatusText()}`}
            >
              <CardContent className="p-4 lg:p-6 text-center space-y-4">
                {/* Day Number */}
                <div className="flex items-center justify-center">
                  <div 
                    className={`
                      w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm lg:text-base font-bold shadow-md
                      ${isCompleted 
                        ? 'bg-green-500 text-white shadow-green-200' 
                        : hasActivity 
                          ? 'bg-amber-500 text-white shadow-amber-200'
                          : 'bg-gray-300 text-gray-600 shadow-gray-200'
                      }
                    `}
                    aria-label={`Dia número ${day.day}`}
                  >
                    {day.day}
                  </div>
                </div>

                {/* Score Display */}
                <div className="space-y-2">
                  <div 
                    className={`
                      text-2xl lg:text-3xl font-bold
                      ${isCompleted 
                        ? 'text-green-700' 
                        : hasActivity 
                          ? 'text-amber-700'
                          : 'text-gray-400'
                      }
                    `}
                    aria-label={`${day.score} pontos`}
                  >
                    {day.score}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 font-medium">
                    pontos
                  </div>
                </div>

                {/* Completion Badge */}
                {isCompleted && (
                  <div 
                    className="flex items-center justify-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md"
                    role="status"
                    aria-label="Dia concluído com sucesso"
                  >
                    <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                    <span>Concluído</span>
                  </div>
                )}

                {/* Progress Indicator */}
                {hasActivity && !isCompleted && (
                  <div 
                    className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded-full"
                    role="status"
                    aria-label="Dia em progresso"
                  >
                    Em progresso
                  </div>
                )}

                {/* Empty State */}
                {!hasActivity && (
                  <div 
                    className="text-xs text-gray-400 font-medium"
                    role="status"
                    aria-label="Dia não iniciado"
                  >
                    Não iniciado
                  </div>
                )}

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" aria-hidden="true" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats - Consistent with existing ProgressDashboard styling */}
      <section 
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-gray-200 shadow-xl animate-card-hover gpu-accelerated animate-slide-up-staggered animate-delay-1000"
        aria-labelledby="summary-title"
      >
        <header className="text-center mb-6">
          <h3 
            id="summary-title"
            className="text-xl font-bold text-gray-900 mb-2"
          >
            Resumo do Desafio
          </h3>
          <p className="text-gray-600 text-sm">Suas estatísticas finais de performance</p>
        </header>
        
        <div 
          className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          role="list"
          aria-label="Estatísticas resumidas do desafio"
        >
          <div 
            className="text-center space-y-2 animate-slide-up-staggered animate-delay-1200"
            role="listitem"
            tabIndex={0}
            aria-label={`${dailyScores.filter(day => isDayCompleted(day)).length} dias completos`}
          >
            <div className="p-3 rounded-xl bg-green-100 w-fit mx-auto" aria-hidden="true">
              <div className="text-3xl font-bold text-green-600">
                {dailyScores.filter(day => isDayCompleted(day)).length}
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium leading-tight">
              Dias Completos
            </div>
          </div>
          
          <div 
            className="text-center space-y-2 animate-slide-up-staggered animate-delay-1300"
            role="listitem"
            tabIndex={0}
            aria-label={`${totalScore || dailyScores.reduce((sum, day) => sum + day.score, 0)} pontos totais`}
          >
            <div className="p-3 rounded-xl bg-amber-100 w-fit mx-auto" aria-hidden="true">
              <div className="text-3xl font-bold text-amber-600">
                {totalScore || dailyScores.reduce((sum, day) => sum + day.score, 0)}
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium leading-tight">
              Total de Pontos
            </div>
          </div>
          
          <div 
            className="text-center space-y-2 animate-slide-up-staggered animate-delay-1400"
            role="listitem"
            tabIndex={0}
            aria-label={`Média diária de ${Math.round((totalScore || dailyScores.reduce((sum, day) => sum + day.score, 0)) / 7)} pontos`}
          >
            <div className="p-3 rounded-xl bg-blue-100 w-fit mx-auto" aria-hidden="true">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round((totalScore || dailyScores.reduce((sum, day) => sum + day.score, 0)) / 7)}
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium leading-tight">
              Média Diária
            </div>
          </div>
          
          <div 
            className="text-center space-y-2 animate-slide-up-staggered animate-delay-1500"
            role="listitem"
            tabIndex={0}
            aria-label={`Taxa de conclusão de ${Math.round((dailyScores.filter(day => isDayCompleted(day)).length / 7) * 100)} por cento`}
          >
            <div className="p-3 rounded-xl bg-purple-100 w-fit mx-auto" aria-hidden="true">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round((dailyScores.filter(day => isDayCompleted(day)).length / 7) * 100)}%
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium leading-tight">
              Taxa de Conclusão
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}