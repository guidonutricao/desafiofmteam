import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
  CalendarDays
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

  const tarefas = [
    {
      key: 'hidratacao' as keyof DesafioDiario,
      icon: Droplets,
      titulo: 'Hidratação',
      descricao: 'Beba 2 litros de água hoje',
      emoji: '💧'
    },
    {
      key: 'sono_qualidade' as keyof DesafioDiario,
      icon: Moon,
      titulo: 'Sono de Qualidade',
      descricao: 'Durma pelo menos 7-8 horas',
      emoji: '😴'
    },
    {
      key: 'atividade_fisica' as keyof DesafioDiario,
      icon: Dumbbell,
      titulo: 'Atividade Física',
      descricao: 'Pratique pelo menos 30min de exercício',
      emoji: '🏋️‍♀️'
    },
    {
      key: 'seguiu_dieta' as keyof DesafioDiario,
      icon: UtensilsCrossed,
      titulo: 'Seguir a Dieta',
      descricao: 'Siga seu plano alimentar',
      emoji: '🥗'
    },
    {
      key: 'registro_visual' as keyof DesafioDiario,
      icon: Camera,
      titulo: 'Registro Visual',
      descricao: 'Tire uma foto do seu progresso',
      emoji: '📸'
    },
    {
      key: 'evitar_ultraprocessados' as keyof DesafioDiario,
      icon: ShieldX,
      titulo: 'Evitar Ultraprocessados',
      descricao: 'Passe o dia todo sem consumir alimentos ultraprocessados (biscoitos, embutidos, salgadinhos etc.)',
      emoji: '🚫'
    },
    {
      key: 'dormir_sem_celular' as keyof DesafioDiario,
      icon: Smartphone,
      titulo: 'Dormir sem Mexer no Celular',
      descricao: 'Evite celular por pelo menos 30 minutos antes de dormir',
      emoji: '📱'
    },
    {
      key: 'organizar_refeicoes' as keyof DesafioDiario,
      icon: CalendarDays,
      titulo: 'Organizar as Refeições do Dia Seguinte',
      descricao: 'Planeje ou separe o que vai comer no dia seguinte (pode incluir marmitas, lanches, frutas etc.)',
      emoji: '📋'
    }
  ];

  useEffect(() => {
    carregarDados();
  }, [user]);

  const carregarDados = async () => {
    if (!user) return;

    try {
      const hoje = new Date().toISOString().split('T')[0];

      // Carregar desafio do dia
      const { data: desafioData } = await supabase
        .from('desafios_diarios')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', hoje)
        .single();

      if (desafioData) {
        setDesafio({
          ...desafioData,
          evitar_ultraprocessados: (desafioData as any).evitar_ultraprocessados || false,
          dormir_sem_celular: (desafioData as any).dormir_sem_celular || false,
          organizar_refeicoes: (desafioData as any).organizar_refeicoes || false,
        });
      }

      // Carregar pontuação total e dias consecutivos
      const { data: pontuacaoData } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (pontuacaoData) {
        setPontuacaoTotal(pontuacaoData.pontuacao_total);
        setDiasConsecutivos(pontuacaoData.dias_consecutivos);
      }

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
    } finally {
      setLoading(false);
    }
  };

  const marcarTarefa = async (tarefa: keyof DesafioDiario) => {
    if (!user || typeof desafio[tarefa] !== 'boolean') return;

    const novoStatus = !desafio[tarefa];
    const novaPontuacao = desafio.pontuacao_total + (novoStatus ? 1 : -1);

    const novoDesafio = {
      ...desafio,
      [tarefa]: novoStatus,
      pontuacao_total: Math.max(0, novaPontuacao)
    };

    setDesafio(novoDesafio);

    try {
      const hoje = new Date().toISOString().split('T')[0];

      if (desafio.id) {
        // Atualizar desafio existente
        await supabase
          .from('desafios_diarios')
          .update(novoDesafio)
          .eq('id', desafio.id);
      } else {
        // Criar novo desafio
        const { data } = await supabase
          .from('desafios_diarios')
          .insert({
            user_id: user.id,
            data: hoje,
            ...novoDesafio
          })
          .select()
          .single();

        if (data) {
          setDesafio({
            ...data,
            evitar_ultraprocessados: (data as any).evitar_ultraprocessados || false,
            dormir_sem_celular: (data as any).dormir_sem_celular || false,
            organizar_refeicoes: (data as any).organizar_refeicoes || false,
          });
        }
      }

      // Atualizar pontuação total
      await supabase
        .from('pontuacoes')
        .upsert({
          user_id: user.id,
          pontuacao_total: pontuacaoTotal + (novoStatus ? 1 : -1),
          dias_consecutivos: diasConsecutivos,
          ultima_data_participacao: hoje
        });

      setPontuacaoTotal(prev => Math.max(0, prev + (novoStatus ? 1 : -1)));

      toast({
        title: novoStatus ? "Tarefa concluída! 🎉" : "Tarefa desmarcada",
        description: novoStatus ? `+1 ponto! Continue assim!` : "Você pode marcar novamente quando completar.",
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tarefasConcluidas = tarefas.filter(t => desafio[t.key] as boolean).length;
  const progresso = (tarefasConcluidas / tarefas.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-gold text-gold-foreground px-4 py-2 rounded-full font-bold">
          <Trophy className="w-5 h-5" />
          Desafio Shape Express - Dia {Math.min(diasConsecutivos + 1, 7)}/7
        </div>

        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{pontuacaoTotal}</div>
            <div className="text-sm text-white">Pontos Totais</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-white">{tarefasConcluidas}/8</div>
            <div className="text-sm text-white">Tarefas Hoje</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-white">{diasConsecutivos}</div>
            <div className="text-sm text-white">Dias Seguidos</div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso do dia</span>
            <span className="text-sm font-medium text-foreground">{Math.round(progresso)}%</span>
          </div>
          <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-gold transition-all duration-500 ease-out"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tarefas do dia + Card Premium */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tarefas.map((tarefa) => {
          const concluida = desafio[tarefa.key] as boolean;
          const IconComponent = tarefa.icon;

          return (
            <Card
              key={tarefa.key}
              className={`relative transition-all duration-300 ${concluida
                ? 'bg-gradient-gold text-gold-foreground border-gold shadow-lg'
                : 'bg-gradient-card'
                }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${concluida ? 'bg-gold-foreground/20' : 'bg-accent'}`}>
                    <IconComponent className={`w-5 h-5 ${concluida ? 'text-gold-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tarefa.emoji}</span>
                      <span className="font-semibold">{tarefa.titulo}</span>
                    </div>
                  </div>
                  {/* Botão de check */}
                  <div className={`p-2 rounded-full transition-all duration-200 ${concluida
                    ? 'bg-gold-foreground text-gold shadow-md'
                    : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}>
                    {concluida ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className={`text-sm mb-4 ${concluida ? 'text-gold-foreground/80' : 'text-muted-foreground'}`}>
                  {tarefa.descricao}
                </p>

                {/* Botão de ação */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    marcarTarefa(tarefa.key);
                  }}
                  className={`w-full transition-all duration-200 ${concluida
                    ? 'bg-gold-foreground/20 hover:bg-gold-foreground/30 text-gold-foreground border border-gold-foreground/30'
                    : 'bg-gradient-gold hover:opacity-90 text-gold-foreground'
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

        {/* Card Premium - Posicionado após as tarefas */}
        <Card
          className="bg-amber-500 text-white border-amber-400 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] lg:col-span-1"
          onClick={() => window.open('https://wa.me/5511948464441?text=Ol%C3%A1%2C%20vim%20do%20desafio%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20acompanhamento%20premium.', '_blank')}
        >
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-white/20 rounded-full w-fit">
              <Award className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-white leading-tight">
              Quer Resultados Ainda Melhores?
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <p className="text-white/90 text-sm leading-relaxed">
              Acompanhamento individual personalizado para participantes do desafio
            </p>

            <Button
              className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-200"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                window.open('https://wa.me/5511948464441?text=Ol%C3%A1%2C%20vim%20do%20desafio%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20acompanhamento%20premium.', '_blank');
              }}
            >
              Conhecer Acompanhamento Premium
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mensagem motivacional */}
      {mensagem && (
        <Card className="bg-gradient-card border-border/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-gold" />
              Motivação Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="text-foreground italic">
              "{mensagem.mensagem}"
            </blockquote>
            {mensagem.autor && (
              <cite className="text-sm text-muted-foreground mt-2 block">
                - {mensagem.autor}
              </cite>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card de resultado */}
      {cardResultado && (
        <Card className="bg-gradient-gold text-gold-foreground">
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