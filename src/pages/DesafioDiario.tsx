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
  Star
} from 'lucide-react';

interface DesafioDiario {
  id?: number;
  hidratacao: boolean;
  sono_qualidade: boolean;
  atividade_fisica: boolean;
  seguiu_dieta: boolean;
  registro_visual: boolean;
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
        setDesafio(desafioData);
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
          setDesafio(data);
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
            <div className="text-2xl font-bold text-foreground">{pontuacaoTotal}</div>
            <div className="text-sm text-muted-foreground">Pontos Totais</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{tarefasConcluidas}/5</div>
            <div className="text-sm text-muted-foreground">Tarefas Hoje</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{diasConsecutivos}</div>
            <div className="text-sm text-muted-foreground">Dias Seguidos</div>
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

      {/* Tarefas do dia */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tarefas.map((tarefa) => {
          const concluida = desafio[tarefa.key] as boolean;
          const IconComponent = tarefa.icon;
          
          return (
            <Card 
              key={tarefa.key}
              className={`relative transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                concluida 
                  ? 'bg-gradient-gold text-gold-foreground border-gold shadow-lg' 
                  : 'bg-gradient-card hover:bg-accent/5'
              }`}
              onClick={() => marcarTarefa(tarefa.key)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${concluida ? 'bg-gold-foreground/20' : 'bg-accent'}`}>
                    <IconComponent className={`w-5 h-5 ${concluida ? 'text-gold-foreground' : 'text-muted-foreground'}`} />
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
                <p className={`text-sm ${concluida ? 'text-gold-foreground/80' : 'text-muted-foreground'}`}>
                  {tarefa.descricao}
                </p>
                
                {concluida && (
                  <div className="flex items-center gap-1 mt-3">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">Concluída!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
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

      {/* Botão premium fixo */}
      <div className="fixed bottom-20 right-4 lg:bottom-4 lg:right-4">
        <Button 
          className="bg-gradient-gold hover:opacity-90 text-gold-foreground shadow-lg"
          onClick={() => window.open('https://example.com/premium', '_blank')}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Conhecer Acompanhamento Premium
        </Button>
      </div>
    </div>
  );
}