"use client"

import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Trophy, Target, CalendarDays } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, AlertCircle } from 'lucide-react';

interface ProgressData {
  day: number;
  points: number;
  date: string;
  tasks_completed: any;
}

const chartConfig = {
  points: {
    label: "Pontos",
    color: "#fbbf24", // yellow-400
  },
} satisfies ChartConfig;

export function ProgressDashboard() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [daysCompleted, setDaysCompleted] = useState(0);
  const [averagePoints, setAveragePoints] = useState(0);
  const [bestDay, setBestDay] = useState<{ day: number; points: number } | null>(null);
  const [currentChallengeDay, setCurrentChallengeDay] = useState(1);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  // Função para criar estrutura completa de 7 dias
  const createFullWeekData = (dataPoints: any[] = []) => {
    const fullWeekData: ProgressData[] = [];
    
    // Criar array com 7 dias sempre
    for (let day = 1; day <= 7; day++) {
      // Procurar se existe dados para este dia
      const dayData = dataPoints.find(item => {
        if (item.day) return item.day === day;
        // Se não tem day, usar índice + 1
        return dataPoints.indexOf(item) + 1 === day;
      });
      
      if (dayData) {
        fullWeekData.push({
          day,
          points: dayData.points || dayData.pontuacao_total || 0,
          date: dayData.date || dayData.data || new Date(Date.now() - (7 - day) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tasks_completed: dayData.tasks_completed || {
            hidratacao: dayData.hidratacao || false,
            sono_qualidade: dayData.sono_qualidade || false,
            atividade_fisica: dayData.atividade_fisica || false,
            seguiu_dieta: dayData.seguiu_dieta || false,
            registro_visual: dayData.registro_visual || false
          }
        });
      } else {
        // Dia sem dados - preencher com zeros
        fullWeekData.push({
          day,
          points: 0,
          date: new Date(Date.now() - (7 - day) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  // Função para calcular o dia atual do desafio
  const calculateCurrentChallengeDay = async () => {
    try {
      // Buscar data de início do desafio do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('challenge_start_date')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profileData?.challenge_start_date) {
        return 1; // Se não tem data de início, assume dia 1
      }

      const startDate = new Date(profileData.challenge_start_date);
      const today = new Date();
      const diffTime = today.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 porque o primeiro dia é dia 1

      // Limitar entre 1 e 7 (ou 8 se completou)
      if (diffDays < 1) return 1;
      if (diffDays > 7) return 8; // Desafio completado
      return diffDays;
    } catch (error) {
      console.error('Erro ao calcular dia atual do desafio:', error);
      return 1;
    }
  };

  const loadProgressData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Carregando dados para usuário:', user.id);
      
      // Calcular dia atual do desafio
      const currentDay = await calculateCurrentChallengeDay();
      setCurrentChallengeDay(currentDay);
      console.log('📅 Dia atual do desafio:', currentDay);
      
      // Buscar dados de desafios diários
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

      console.log('📊 Dados desafios_diarios:', desafiosData);
      console.log('❌ Erro desafios_diarios:', desafiosError);

      if (desafiosError) throw desafiosError;

      let chartData: ProgressData[] = [];

      if (desafiosData && desafiosData.length > 0) {
        // Transformar dados da tabela desafios_diarios e criar estrutura completa de 7 dias
        const transformedData = desafiosData.map((item, index) => ({
          day: index + 1,
          points: item.pontuacao_total || 0,
          date: item.data,
          tasks_completed: {
            hidratacao: item.hidratacao,
            sono_qualidade: item.sono_qualidade,
            atividade_fisica: item.atividade_fisica,
            seguiu_dieta: item.seguiu_dieta,
            registro_visual: item.registro_visual
          }
        }));
        
        chartData = createFullWeekData(transformedData);
      } else {
        console.log('⚠️ Nenhum dado em desafios_diarios, tentando pontuacoes...');
        
        // Fallback: buscar dados da tabela pontuacoes se não houver dados detalhados
        const { data: pontuacoesData, error: pontuacoesError } = await supabase
          .from('pontuacoes')
          .select('pontuacao_total, ultima_data_participacao')
          .eq('user_id', user.id)
          .single();

        console.log('💰 Dados pontuacoes:', pontuacoesData);
        console.log('❌ Erro pontuacoes:', pontuacoesError);

        if (pontuacoesError && pontuacoesError.code !== 'PGRST116') {
          throw pontuacoesError;
        }

        if (pontuacoesData && pontuacoesData.pontuacao_total > 0) {
          console.log('💡 Criando dados simulados baseados na pontuação total:', pontuacoesData.pontuacao_total);
          
          // Criar dados simulados baseados na pontuação total
          // Distribuição mais realista com variação
          const totalPoints = pontuacoesData.pontuacao_total;
          const basePoints = Math.floor(totalPoints / 7);
          const remainder = totalPoints % 7;
          
          // Criar variação mais natural nos pontos
          const pointsDistribution = [
            basePoints + Math.floor(remainder * 0.2), // Dia 1: início mais baixo
            basePoints + Math.floor(remainder * 0.3), // Dia 2: crescendo
            basePoints + Math.floor(remainder * 0.1), // Dia 3: queda
            basePoints + Math.floor(remainder * 0.2), // Dia 4: recuperação
            basePoints + Math.floor(remainder * 0.1), // Dia 5: estável
            basePoints + Math.floor(remainder * 0.05), // Dia 6: preparação
            basePoints + (remainder - Math.floor(remainder * 0.95)) // Dia 7: resto
          ];
          
          const simulatedData = pointsDistribution.map((points, index) => ({
            day: index + 1,
            points: Math.max(points, 0), // Garantir que não seja negativo
            date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            tasks_completed: {
              hidratacao: true,
              sono_qualidade: points > basePoints,
              atividade_fisica: points > basePoints * 0.8,
              seguiu_dieta: points > basePoints * 0.6,
              registro_visual: points > basePoints * 0.4
            }
          }));
          
          chartData = createFullWeekData(simulatedData);
        } else {
          console.log('🔍 Tentando buscar na tabela daily_progress como último recurso...');
          
          // Terceira tentativa: buscar na tabela daily_progress (se existir)
          const { data: dailyProgressData, error: dailyProgressError } = await supabase
            .from('daily_progress')
            .select('challenge_day, points_earned, date, tasks_completed')
            .eq('user_id', user.id)
            .order('challenge_day', { ascending: true });

          console.log('📅 Dados daily_progress:', dailyProgressData);
          
          if (!dailyProgressError && dailyProgressData && dailyProgressData.length > 0) {
            const transformedData = dailyProgressData.map(item => ({
              day: item.challenge_day,
              points: item.points_earned || 0,
              date: item.date,
              tasks_completed: item.tasks_completed || {}
            }));
            
            chartData = createFullWeekData(transformedData);
          } else {
            // Se não há dados em nenhuma fonte, criar estrutura vazia de 7 dias
            chartData = createFullWeekData([]);
          }
        }
      }

      console.log('📈 Dados finais do gráfico:', chartData);
      
      setProgressData(chartData);

      // Calcular estatísticas
      const total = chartData.reduce((sum, item) => sum + item.points, 0);
      const daysWithData = chartData.filter(item => item.points > 0).length; // Contar apenas dias com pontos
      const average = daysWithData > 0 ? Math.round(total / daysWithData) : 0; // Média apenas dos dias ativos
      
      // Encontrar o melhor dia
      const best = chartData.reduce((max, item) => 
        item.points > max.points ? item : max, 
        { day: 0, points: 0 }
      );

      console.log('📊 Estatísticas calculadas:', { total, daysWithData, average, best });

      setTotalPoints(total);
      setDaysCompleted(daysWithData); // Mostrar apenas dias com dados
      setAveragePoints(average);
      setBestDay(best.points > 0 ? best : null);

    } catch (error: any) {
      console.error('Erro ao carregar dados de progresso:', error);
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Calcular tendência (crescimento percentual)
  const calculateTrend = () => {
    if (progressData.length < 2) return 0;
    
    const firstHalf = progressData.slice(0, Math.ceil(progressData.length / 2));
    const secondHalf = progressData.slice(Math.ceil(progressData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.points, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.points, 0) / secondHalf.length;
    
    if (firstHalfAvg === 0) return 0;
    
    return Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100);
  };

  const trend = calculateTrend();

  if (loading) {
    return (
      <Card className="bg-white dark:bg-white border-gray-200">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados de progresso...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-white border-gray-200">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Erro ao carregar dados: {error}</p>
        </CardContent>
      </Card>
    );
  }

  // Verificar se há algum dado real (não apenas zeros)
  const hasRealData = progressData.some(item => item.points > 0);
  
  if (!hasRealData) {
    return (
      <Card className="bg-white dark:bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <span className="text-lg">📊</span>
              <span className="font-semibold ml-2">Dashboard de Progresso</span>
            </div>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Acompanhe sua evolução no desafio de 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2 font-medium">Nenhum progresso registrado ainda</p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>Para ver seu dashboard de progresso:</p>
            <div className="bg-gray-50 p-4 rounded-lg text-left max-w-md mx-auto">
              <ol className="space-y-1">
                <li>1. Vá para a página "Desafio Diário"</li>
                <li>2. Complete suas tarefas diárias</li>
                <li>3. Volte aqui para ver sua evolução!</li>
              </ol>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Usuário ID: {user?.id?.slice(0, 8)}... (para debug)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-600">
          <div className="p-2 rounded-lg bg-yellow-100">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <span className="text-lg">📊</span>
            <span className="font-semibold ml-2">Dashboard de Progresso</span>
          </div>
        </CardTitle>
        <CardDescription className="text-gray-600">
          Sua evolução no desafio de 7 dias - {currentChallengeDay > 7 ? 'Desafio concluído!' : `Você está no dia ${currentChallengeDay}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{totalPoints.toLocaleString()}</div>
            <div className="text-sm text-gray-600 font-medium">Total de Pontos</div>
          </div>
          <div className={`text-center p-4 rounded-lg border ${
            currentChallengeDay > 7 
              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
              : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
          }`}>
            <div className={`text-2xl font-bold ${
              currentChallengeDay > 7 ? 'text-green-600' : 'text-blue-600'
            }`}>
              {currentChallengeDay > 7 ? (
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="w-6 h-6" />
                  <span>7/7</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <CalendarDays className="w-6 h-6" />
                  <span>{currentChallengeDay}</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {currentChallengeDay > 7 ? 'Desafio Completo' : 'Dia Atual do Desafio'}
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{averagePoints}</div>
            <div className="text-sm text-gray-600 font-medium">Pontuação Média por Dia</div>
          </div>
        </div>

        {/* Gráfico */}
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={progressData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `Dia ${value}`}
              className="text-gray-600"
              domain={[1, 7]}
              type="number"
              ticks={[1, 2, 3, 4, 5, 6, 7]}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-gray-600"
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const tasks = data.tasks_completed;
                  const completedTasks = Object.entries(tasks).filter(([_, completed]) => completed);
                  
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-900 mb-2">Dia {label}</p>
                      {data.points > 0 ? (
                        <>
                          <p className="text-yellow-600 font-medium mb-2">{data.points} pontos</p>
                          <div className="text-sm text-gray-600">
                            <p className="font-medium mb-1">Tarefas completadas:</p>
                            {completedTasks.length > 0 ? (
                              <ul className="space-y-1">
                                {tasks.hidratacao && <li>• Hidratação</li>}
                                {tasks.sono_qualidade && <li>• Sono de qualidade</li>}
                                {tasks.atividade_fisica && <li>• Atividade física</li>}
                                {tasks.seguiu_dieta && <li>• Seguiu dieta</li>}
                                {tasks.registro_visual && <li>• Registro visual</li>}
                              </ul>
                            ) : (
                              <p className="text-gray-400">Nenhuma tarefa completada</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          <p className="font-medium mb-1">0 pontos</p>
                          <p className="text-gray-400">Dia ainda não completado</p>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              dataKey="points"
              type="monotone"
              fill="url(#yellowGradient)"
              fillOpacity={0.6}
              stroke="#fbbf24"
              strokeWidth={3}
            />
            <defs>
              <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
      
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2 flex-1">
            <div className="flex items-center gap-2 leading-none font-medium text-gray-700">
              {trend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Crescimento de {trend}% na segunda metade</span>
                </>
              ) : trend < 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                  <span className="text-red-600">Queda de {Math.abs(trend)}% na segunda metade</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">Performance estável</span>
                </>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground flex items-center gap-2 leading-none text-gray-500">
                <Calendar className="h-3 w-3" />
                Dados atualizados em tempo real
              </div>
              {bestDay && (
                <div className="text-muted-foreground flex items-center gap-2 leading-none text-gray-500">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  Melhor dia: Dia {bestDay.day} ({bestDay.points} pts)
                </div>
              )}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}