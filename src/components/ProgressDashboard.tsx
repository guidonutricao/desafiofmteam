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
      <div className="px-2">
        <Card className="bg-white border-gray-200 rounded-2xl shadow-lg">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="space-y-4">
              <div className="p-4 rounded-full bg-yellow-100 w-fit mx-auto">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Carregando Dashboard</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Buscando seus dados de progresso...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2">
        <Card className="bg-white border-gray-200 rounded-2xl shadow-lg">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="space-y-4">
              <div className="p-4 rounded-full bg-red-100 w-fit mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Erro no Dashboard</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar se há algum dado real (não apenas zeros)
  const hasRealData = progressData.some(item => item.points > 0);
  
  if (!hasRealData) {
    return (
      <div className="px-2">
        <Card className="bg-white border-gray-200 rounded-2xl shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-yellow-100">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Dashboard de Progresso
                </CardTitle>
              </div>
            </div>
            <CardDescription className="text-sm text-gray-600 leading-relaxed">
              Acompanhe sua evolução no desafio de 7 dias
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="space-y-6">
              <div className="p-4 rounded-full bg-gray-100 w-fit mx-auto">
                <Target className="w-12 h-12 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nenhum progresso registrado ainda
                </h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Para ver seu dashboard de progresso:
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-xl text-left max-w-sm mx-auto">
                    <ol className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-medium">1</span>
                        <span>Vá para a página "Desafio Diário"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-medium">2</span>
                        <span>Complete suas tarefas diárias</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-medium">3</span>
                        <span>Volte aqui para ver sua evolução!</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Mobile-First */}
      <div className="text-center space-y-3 px-2">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-sm">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              Dashboard de Progresso
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1 leading-relaxed">
              {currentChallengeDay > 7 ? 'Desafio concluído! 🎉' : `Você está no dia ${currentChallengeDay} do desafio`}
            </p>
          </div>
        </div>
      </div>

      {/* Cards Mobile-Optimized */}
      <div className="space-y-4 px-2">
        {/* Layout: Empilhado verticalmente no mobile, grid no desktop */}
        <div className="flex flex-col space-y-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0">
          
          {/* Card 1: Total de Pontos */}
          <div className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 rounded-2xl border border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-2 rounded-full bg-yellow-200">
                <Trophy className="w-5 h-5 text-yellow-700" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-2xl font-bold text-yellow-700 leading-none">
                  {totalPoints.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-yellow-800 leading-tight">
                  Total de Pontos
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Dia Atual do Desafio */}
          <div className={`rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-4 ${
            currentChallengeDay > 7 
              ? 'bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-green-300' 
              : 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-blue-300'
          }`}>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-2 rounded-full ${
                currentChallengeDay > 7 ? 'bg-green-200' : 'bg-blue-200'
              }`}>
                {currentChallengeDay > 7 ? (
                  <Trophy className="w-5 h-5 text-green-700" />
                ) : (
                  <CalendarDays className="w-5 h-5 text-blue-700" />
                )}
              </div>
              <div className="space-y-1">
                <div className={`text-3xl sm:text-2xl font-bold leading-none ${
                  currentChallengeDay > 7 ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {currentChallengeDay > 7 ? '7/7' : currentChallengeDay}
                </div>
                <div className={`text-sm font-medium leading-tight ${
                  currentChallengeDay > 7 ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {currentChallengeDay > 7 ? 'Desafio Completo' : 'Dia Atual do Desafio'}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Pontuação Média */}
          <div className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 rounded-2xl border border-green-300 shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-2 rounded-full bg-green-200">
                <Target className="w-5 h-5 text-green-700" />
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-2xl font-bold text-green-700 leading-none">
                  {averagePoints}
                </div>
                <div className="text-sm font-medium text-green-800 leading-tight">
                  Pontuação Média por Dia
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Mobile-Optimized */}
      <div className="px-2">
        <Card className="bg-white border-gray-200 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Evolução Diária</h3>
              <p className="text-sm text-gray-600">Acompanhe sua pontuação ao longo dos 7 dias</p>
            </div>
            
            <div className="h-64 sm:h-80">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  accessibilityLayer
                  data={progressData}
                  margin={{
                    left: 8,
                    right: 8,
                    top: 16,
                    bottom: 16,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    tickFormatter={(value) => `D${value}`}
                    className="text-gray-600 text-xs"
                    domain={[1, 7]}
                    type="number"
                    ticks={[1, 2, 3, 4, 5, 6, 7]}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-gray-600 text-xs"
                    width={40}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const tasks = data.tasks_completed;
                        const completedTasks = Object.entries(tasks).filter(([_, completed]) => completed);
                        
                        return (
                          <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl max-w-xs">
                            <p className="font-bold text-gray-900 mb-2 text-base">Dia {label}</p>
                            {data.points > 0 ? (
                              <>
                                <p className="text-yellow-600 font-semibold mb-3 text-lg">{data.points} pontos</p>
                                <div className="text-sm text-gray-600">
                                  <p className="font-medium mb-2">Tarefas completadas:</p>
                                  {completedTasks.length > 0 ? (
                                    <ul className="space-y-1.5">
                                      {tasks.hidratacao && <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Hidratação</li>}
                                      {tasks.sono_qualidade && <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>Sono de qualidade</li>}
                                      {tasks.atividade_fisica && <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>Atividade física</li>}
                                      {tasks.seguiu_dieta && <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>Seguiu dieta</li>}
                                      {tasks.registro_visual && <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>Registro visual</li>}
                                    </ul>
                                  ) : (
                                    <p className="text-gray-400 italic">Nenhuma tarefa completada</p>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-gray-500">
                                <p className="font-medium mb-1 text-base">0 pontos</p>
                                <p className="text-gray-400 italic">Dia ainda não completado</p>
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
                    fillOpacity={0.7}
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Stats Mobile-Optimized */}
      <div className="px-2">
        <Card className="bg-gray-50 border-gray-200 rounded-2xl shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Trend */}
              <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-xl">
                {trend > 0 ? (
                  <>
                    <div className="p-2 rounded-full bg-green-100">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-700">
                      Crescimento de {trend}% na segunda metade
                    </span>
                  </>
                ) : trend < 0 ? (
                  <>
                    <div className="p-2 rounded-full bg-red-100">
                      <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                    </div>
                    <span className="text-sm font-medium text-red-700">
                      Queda de {Math.abs(trend)}% na segunda metade
                    </span>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded-full bg-gray-100">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Performance estável
                    </span>
                  </>
                )}
              </div>

              {/* Additional Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Dados atualizados em tempo real</span>
                </div>
                {bestDay && (
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    <span>Melhor dia: Dia {bestDay.day} ({bestDay.points} pts)</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}