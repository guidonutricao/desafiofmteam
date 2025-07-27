import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { ChallengeErrorDisplay, TimezoneErrorDisplay, ChallengeLoadingDisplay } from '@/components/ChallengeErrorDisplay';
import {
  Droplets,
  Moon,
  Dumbbell,
  UtensilsCrossed,
  Camera,
  Trophy,
  Flame,
  Check,
  Circle,
  Award,
  ShieldX,
  Smartphone,
  CalendarCheck
} from 'lucide-react';

interface DesafioDiario {
  id?: number;
  hidratacao: boolean;
  sono_qualidade: boolean;
  atividade_fisica: boolean;
  seguiu_dieta: boolean;
  registro_visual: boolean;
  evitar_ultraprocessados: boolean;
  dormir_sem_celular: boolean;
  organizar_refeicoes: boolean;
  pontuacao_total: number;
}

interface MensagemMotivacional {
  id: number;
  mensagem: string;
  autor?: string;
}

interface CardResultado {
  id: number;
  titulo: string;
  descricao: string;
}

export default function DesafioDiario() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [desafio, setDesafio] = useState<DesafioDiario>({
    hidratacao: false,
    sono_qualidade: false,
    atividade_fisica: false,
    seguiu_dieta: false,
    registro_visual: false,
    evitar_ultraprocessados: false,
    dormir_sem_celular: false,
    organizar_refeicoes: false,
    pontuacao_total: 0
  });

  const [mensagem, setMensagem] = useState<MensagemMotivacional | null>(null);
  const [cardResultado, setCardResultado] = useState<CardResultado | null>(null);
  const [pontuacaoTotal, setPontuacaoTotal] = useState(0);
  const [diasConsecutivos, setDiasConsecutivos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [challengeStartDate, setChallengeStartDate] = useState<Date | null>(null);

  // Use the challenge progress hook
  const challengeProgress = useChallengeProgress(challengeStartDate);

  const tarefas = [
    {
      key: 'hidratacao' as keyof DesafioDiario,
      icon: Droplets,
      titulo: 'Hidratação',
      descricao: 'Beba 2 litros de água hoje',
      emoji: '💧',
      pontos: 100
    },
    {
      key: 'sono_qualidade' as keyof DesafioDiario,
      icon: Moon,
      titulo: 'Sono de Qualidade',
      descricao: 'Durma pelo menos 7-8 horas',
      emoji: '😴',
      pontos: 100
    },
    {
      key: 'evitar_ultraprocessados' as keyof DesafioDiario,
      icon: ShieldX,
      titulo: 'Evitar Ultraprocessados',
      descricao: 'Passar o dia todo sem consumir alimentos ultraprocessados (biscoitos, embutidos, salgadinhos etc.)',
      emoji: '🚫',
      pontos: 150
    },
    {
      key: 'dormir_sem_celular' as keyof DesafioDiario,
      icon: Smartphone,
      titulo: 'Dormir sem Mexer no Celular',
      descricao: 'Evitar celular por pelo menos 1h antes de dormir',
      emoji: '📵',
      pontos: 150
    },
    {
      key: 'atividade_fisica' as keyof DesafioDiario,
      icon: Dumbbell,
      titulo: 'Atividade Física',
      descricao: 'Pratique pelo menos 30min de exercício',
      emoji: '🏋️‍♀️',
      pontos: 200
    },
    {
      key: 'seguiu_dieta' as keyof DesafioDiario,
      icon: UtensilsCrossed,
      titulo: 'Seguir a Dieta',
      descricao: 'Siga seu plano alimentar',
      emoji: '🥗',
      pontos: 200
    },
    {
      key: 'registro_visual' as keyof DesafioDiario,
      icon: Camera,
      titulo: 'Registro Visual',
      descricao: 'Tire uma foto do seu progresso',
      emoji: '📸',
      pontos: 250
    },
    {
      key: 'organizar_refeicoes' as keyof DesafioDiario,
      icon: CalendarCheck,
      titulo: 'Organizar as Refeições do Dia Seguinte',
      descricao: 'Planejar ou separar o que vai comer no dia seguinte (pode incluir marmitas, lanches, frutas etc.)',
      emoji: '📋',
      pontos: 250
    }
  ];

  useEffect(() => {
    carregarDados();
  }, [user]);

  // Re-calculate challenge progress when challengeStartDate changes
  useEffect(() => {
    if (challengeStartDate) {
      console.log('Challenge start date updated:', challengeStartDate);
      console.log('Challenge progress:', challengeProgress);
    }
  }, [challengeStartDate, challengeProgress]);

  const carregarDados = async () => {
    if (!user) return;

    try {
      const hoje = new Date().toISOString().split('T')[0];

      // Load pontuacao data to determine challenge status and get points
      const { data: pontuacaoData, error: pontuacaoError } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (pontuacaoError && pontuacaoError.code !== 'PGRST116') {
        console.error('Error loading points data:', pontuacaoError);
        setChallengeStartDate(null);
        setPontuacaoTotal(0);
        setDiasConsecutivos(0);
      } else if (pontuacaoData) {
        // Update pontuacao state
        setPontuacaoTotal(pontuacaoData.pontuacao_total || 0);
        setDiasConsecutivos(pontuacaoData.dias_consecutivos || 0);

        // Determine if challenge has been started based on participation
        if (pontuacaoData.ultima_data_participacao || pontuacaoData.pontuacao_total > 0) {
          // If user has participated or has points, consider challenge as started
          // Use created_at as the challenge start date
          setChallengeStartDate(new Date(pontuacaoData.created_at));
        } else {
          setChallengeStartDate(null);
        }
      } else {
        setChallengeStartDate(null);
        setPontuacaoTotal(0);
        setDiasConsecutivos(0);
      }

      // Carregar desafio do dia
      const { data: desafioData, error: desafioError } = await supabase
        .from('desafios_diarios')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', hoje)
        .single();

      if (desafioError && desafioError.code !== 'PGRST116') {
        console.error('Error loading challenge data:', desafioError);
      } else if (desafioData) {
        setDesafio(desafioData);
      } else {
        // Reset to default state if no challenge data for today
        setDesafio({
          hidratacao: false,
          sono_qualidade: false,
          atividade_fisica: false,
          seguiu_dieta: false,
          registro_visual: false,
          evitar_ultraprocessados: false,
          dormir_sem_celular: false,
          organizar_refeicoes: false,
          pontuacao_total: 0
        });
      }

      // Pontuacao data is already handled above

      // Carregar mensagem motivacional aleatória
      const { data: mensagens } = await supabase
        .from('mensagens_motivacionais')
        .select('*');

      if (mensagens && mensagens.length > 0) {
        const mensagemAleatoria = mensagens[Math.floor(Math.random() * mensagens.length)];
        setMensagem(mensagemAleatoria);
      }

      // Carregar card de resultado aleatório
      const { data: cards } = await supabase
        .from('cards_resultado')
        .select('*');

      if (cards && cards.length > 0) {
        const cardAleatorio = cards[Math.floor(Math.random() * cards.length)];
        setCardResultado(cardAleatorio);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do desafio. Tente recarregar a página.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const marcarTarefa = async (tarefa: keyof DesafioDiario) => {
    if (!user || typeof desafio[tarefa] !== 'boolean') return;

    const novoStatus = !desafio[tarefa];
    const tarefaInfo = tarefas.find(t => t.key === tarefa);
    const pontosTarefa = tarefaInfo?.pontos || 0;

    // Criar objeto com novo status (a pontuação será calculada automaticamente pelo trigger)
    const novoDesafio = {
      ...desafio,
      [tarefa]: novoStatus
    };

    setDesafio(novoDesafio);

    try {
      const hoje = new Date().toISOString().split('T')[0];
      let desafioAtualizado;

      if (desafio.id) {
        // Atualizar desafio existente
        const { data } = await supabase
          .from('desafios_diarios')
          .update({
            [tarefa]: novoStatus
          })
          .eq('id', desafio.id)
          .select()
          .single();

        desafioAtualizado = data;
      } else {
        // Criar novo desafio
        const { data } = await supabase
          .from('desafios_diarios')
          .insert({
            user_id: user.id,
            data: hoje,
            hidratacao: novoDesafio.hidratacao,
            sono_qualidade: novoDesafio.sono_qualidade,
            evitar_ultraprocessados: novoDesafio.evitar_ultraprocessados,
            dormir_sem_celular: novoDesafio.dormir_sem_celular,
            atividade_fisica: novoDesafio.atividade_fisica,
            seguiu_dieta: novoDesafio.seguiu_dieta,
            registro_visual: novoDesafio.registro_visual,
            organizar_refeicoes: novoDesafio.organizar_refeicoes
          })
          .select()
          .single();

        desafioAtualizado = data;
      }

      if (desafioAtualizado) {
        setDesafio(desafioAtualizado);

        // Recalcular pontuação total do usuário
        await supabase.rpc('recalcular_pontuacao_usuario', {
          user_id_param: user.id
        });

        // Atualizar pontuação local
        const { data: pontuacaoData } = await supabase
          .from('pontuacoes')
          .select('pontuacao_total')
          .eq('user_id', user.id)
          .single();

        if (pontuacaoData) {
          setPontuacaoTotal(pontuacaoData.pontuacao_total);
        }

        // Atualizar última data de participação
        await supabase
          .from('pontuacoes')
          .update({
            ultima_data_participacao: hoje
          })
          .eq('user_id', user.id);
      }

      toast({
        title: novoStatus ? "Tarefa concluída! 🎉" : "Tarefa desmarcada",
        description: novoStatus ? `+${pontosTarefa} pontos! Continue assim!` : "Você pode marcar novamente quando completar.",
      });

    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      // Reverter estado em caso de erro
      setDesafio(prev => ({ ...prev, [tarefa]: !novoStatus }));
      toast({
        title: "Erro",
        description: "Não foi possível salvar a tarefa. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <ChallengeLoadingDisplay message="Carregando dados do desafio..." />;
  }

  // Handle case where user hasn't registered for challenge yet
  if (!challengeStartDate) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
          <Trophy className="w-5 h-5" />
          Desafio Shape Express - Não iniciado
        </div>
        <Card className="max-w-md mx-auto bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
          <CardHeader>
            <CardTitle className="text-center">Bem-vindo ao Desafio!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Seu desafio de 7 dias ainda não foi iniciado. Clique no botão abaixo para começar sua jornada!
            </p>
            <Button
              onClick={async () => {
                if (!user) {
                  toast({
                    title: "Erro de autenticação",
                    description: "Usuário não autenticado. Faça login novamente.",
                    variant: "destructive"
                  });
                  return;
                }

                try {
                  setLoading(true);

                  console.log('Starting challenge for user:', user.id);
                  console.log('User object:', user);

                  // Test Supabase connection
                  const { data: connectionTest, error: connectionError } = await supabase
                    .from('profiles')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .limit(1);

                  if (connectionError) {
                    console.error('Connection test failed:', connectionError);
                    throw new Error(`Erro de conexão: ${connectionError.message}`);
                  }

                  if (!connectionTest || connectionTest.length === 0) {
                    throw new Error('Perfil do usuário não encontrado no banco de dados');
                  }

                  console.log('Connection test passed');

                  // This check is already done by the parent component logic
                  // since we only show this button when challengeStartDate is null

                  console.log('Profile check passed, starting challenge...');

                  // Since challenge columns don't exist in profiles, we'll use pontuacoes table
                  // to track challenge start by setting ultima_data_participacao to today
                  const hoje = new Date().toISOString().split('T')[0];

                  const { data: updateResult, error: updateError } = await supabase
                    .from('pontuacoes')
                    .update({
                      ultima_data_participacao: hoje,
                      updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id)
                    .select();

                  if (updateError) {
                    console.error('Update Error:', updateError);
                    throw updateError;
                  }

                  if (!updateResult || updateResult.length === 0) {
                    throw new Error('Falha ao atualizar os dados do usuário');
                  }

                  console.log('Challenge started successfully:', updateResult[0]);

                  // Set challenge start date to today for the component state
                  setChallengeStartDate(new Date());

                  // Verify the challenge was started by fetching the updated profile
                  const { data: updatedProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('challenge_start_date')
                    .eq('user_id', user.id)
                    .single();

                  if (profileError) {
                    throw profileError;
                  }

                  if (updatedProfile?.challenge_start_date) {
                    const startDate = new Date(updatedProfile.challenge_start_date);
                    console.log('Challenge start date from DB:', startDate);
                    setChallengeStartDate(startDate);
                  }

                  // Reload all data to ensure everything is in sync
                  await carregarDados();

                  toast({
                    title: "Desafio iniciado! 🎉",
                    description: "Sua jornada de 7 dias começou, bora pra cima!",
                  });
                } catch (error) {
                  console.error('Error starting challenge:', error);

                  // More detailed error handling
                  let errorMessage = "Não foi possível iniciar o desafio. Tente novamente.";

                  if (error && typeof error === 'object') {
                    if ('message' in error) {
                      errorMessage = `Erro: ${error.message}`;
                    } else if ('details' in error) {
                      errorMessage = `Erro: ${error.details}`;
                    } else if ('hint' in error) {
                      errorMessage = `Erro: ${error.hint}`;
                    }
                  }

                  console.error('Detailed error info:', {
                    error,
                    user: user?.id,
                    timestamp: new Date().toISOString()
                  });

                  toast({
                    title: "Erro ao iniciar desafio",
                    description: errorMessage,
                    variant: "destructive"
                  });
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 text-white"
              disabled={loading}
            >
              {loading ? "Iniciando..." : "Iniciar Desafio"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if challenge progress has errors
  if (challengeProgress.hasError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
            <Trophy className="w-5 h-5" />
            Desafio Shape Express
          </div>
        </div>

        <TimezoneErrorDisplay
          hasError={true}
          errorMessage={challengeProgress.errorMessage}
          onRetry={() => {
            carregarDados();
          }}
        />

        {/* Still show basic interface even with errors */}
        <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
          <CardContent className="text-center py-12">
            <p className="text-gray-600">
              Alguns recursos podem estar limitados devido ao erro acima.
              Tente recarregar a página ou entre em contato com o suporte se o problema persistir.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show special message for "starts tomorrow" state but still show tasks
  const showTasksWithMessage = challengeProgress.isNotStarted && challengeStartDate;

  if (challengeProgress.isCompleted) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
          <Trophy className="w-5 h-5" />
          {challengeProgress.displayText}
        </div>
        <Card className="max-w-md mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6" />
              Parabéns! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gold-foreground/90">
              Você completou com sucesso o Desafio Shape Express de 7 dias!
              Continue mantendo esses hábitos saudáveis em sua rotina.
            </p>
            <div className="text-2xl font-bold">
              {pontuacaoTotal} pontos totais
            </div>
          </CardContent>
        </Card>

        {/* Show motivational message and result card even when completed */}
        {mensagem && (
          <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="w-5 h-5 text-yellow-600" />
                Motivação Diária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-gray-900 italic">
                "{mensagem.mensagem}"
              </blockquote>
              {mensagem.autor && (
                <cite className="text-sm text-gray-600 mt-2 block">
                  - {mensagem.autor}
                </cite>
              )}
            </CardContent>
          </Card>
        )}

        {cardResultado && (
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {cardResultado.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gold-foreground/90">
                {cardResultado.descricao}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const tarefasConcluidas = tarefas.filter(t => desafio[t.key] as boolean).length;
  const pontuacaoMaxima = tarefas.reduce((total, tarefa) => total + tarefa.pontos, 0);
  const progresso = (desafio.pontuacao_total / pontuacaoMaxima) * 100;

  return (
    <div className="space-y-6">
      {/* Special message for "starts tomorrow" state */}
      {showTasksWithMessage && (
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-blue-400 font-semibold">
                🌅 Seu desafio começará amanhã!
              </div>
              <p className="text-sm text-muted-foreground">
                Você pode começar a se preparar completando as tarefas abaixo.
                Elas contarão oficialmente a partir de amanhã.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header com progresso */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
          <Trophy className="w-5 h-5" />
          {challengeProgress.displayText}
        </div>

        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{pontuacaoTotal}</div>
            <div className="text-sm text-white">Pontos Totais</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-white">{desafio.pontuacao_total}/{pontuacaoMaxima}</div>
            <div className="text-sm text-white">Pontos Hoje</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-white">{challengeProgress.currentDay}/{challengeProgress.totalDays}</div>
            <div className="text-sm text-white">Dia do Desafio</div>
          </div>
        </div>

        {/* Barra de progresso do desafio */}
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso do dia</span>
            <span className="text-sm font-medium text-white">{Math.round(progresso)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${progresso}%` }}
            />
          </div>

          {/* Barra de progresso do desafio geral */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso do desafio</span>
            <span className="text-sm font-medium text-white">{Math.round(challengeProgress.progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${challengeProgress.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tarefas do dia */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tarefas.map((tarefa) => {
          const concluida = desafio[tarefa.key] as boolean;
          const IconComponent = tarefa.icon;

          return (
            <Card
              key={tarefa.key}
              className={`relative transition-all duration-300 hover:scale-[1.02] cursor-pointer ${concluida
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-500 shadow-lg'
                : 'bg-white dark:bg-white border-gray-200 dark:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-50 text-gray-900'
                }`}
              onClick={() => marcarTarefa(tarefa.key)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${concluida ? 'bg-yellow-500/20' : 'bg-gray-100'}`}>
                    <IconComponent className={`w-5 h-5 ${concluida ? 'text-yellow-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tarefa.emoji}</span>
                      <span className="font-semibold">{tarefa.titulo}</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className={`text-sm mb-3 ${concluida ? 'text-white/90' : 'text-gray-600'}`}>
                  {tarefa.descricao}
                </p>

                {/* Pontuação da tarefa */}
                <div className={`flex items-center gap-1 mb-4 text-sm font-medium ${concluida ? 'text-white' : 'text-yellow-600'
                  }`}>
                  <Trophy className="w-4 h-4" />
                  {tarefa.pontos} pontos
                </div>

                {/* Botão de ação */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    marcarTarefa(tarefa.key);
                  }}
                  className={`w-full transition-all duration-200 ${concluida
                    ? 'bg-green-500 hover:bg-green-600 text-white border border-green-500'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 text-white'
                    }`}
                  variant={concluida ? "outline" : "default"}
                >
                  {concluida ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Concluída!
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 mr-2" />
                      Marcar como feito
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {/* Card Premium */}
        <Card
          className="bg-amber-500 text-white cursor-pointer hover:bg-amber-600 transition-colors duration-200"
          onClick={() => window.open('https://wa.me/5511948464441?text=Ol%C3%A1%2C%20vim%20do%20desafio%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20acompanhamento%20premium.', '_blank')}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-6 h-6 text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Quer Resultados Ainda Melhores?
              </h3>
              <p className="text-white/90 text-sm">
                Acompanhamento individual personalizado para participantes do desafio
              </p>
            </div>

            <div className="pt-2">
              <div className="bg-white/20 hover:bg-white/30 transition-colors duration-200 rounded-lg px-6 py-3 inline-block">
                <span className="text-white font-semibold">
                  Conhecer Acompanhamento Premium
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagem motivacional */}
      {mensagem && (
        <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-yellow-600" />
              Motivação Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-gray-900 italic">
              "{mensagem.mensagem}"
            </blockquote>
            {mensagem.autor && (
              <cite className="text-sm text-gray-600 mt-2 block">
                - {mensagem.autor}
              </cite>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card de resultado */}
      {cardResultado && (
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {cardResultado.titulo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gold-foreground/90">
              {cardResultado.descricao}
            </p>
          </CardContent>
        </Card>
      )}


    </div>
  );
}