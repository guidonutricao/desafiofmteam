import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getRankingData, type RankingUser } from '@/lib/supabase/challengeQueries';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown, Calendar } from 'lucide-react';
import { 
  ChallengeLoadingDisplay,
  ChallengeErrorBoundary,
  ChallengeFallbackDisplay
} from '@/components/ChallengeErrorDisplay';

export default function Ranking() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [minhaPosicao, setMinhaPosicao] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    carregarRanking();
    
    // Debug: testar view diretamente
    const testView = async () => {
      try {
        const { data, error } = await supabase
          .from('ranking_with_challenge_progress')
          .select('user_id, nome, challenge_start_date, total_points')
          .limit(5);
        
        if (error) {
          console.error('❌ Erro ao testar view diretamente:', error);
        } else {
          console.log('🔍 Debug - Dados diretos da view:', data);
        }
      } catch (error) {
        console.error('❌ Erro no teste da view:', error);
      }
    };
    
    testView();
  }, []);



  // Função de fallback para buscar dados diretamente da tabela pontuacoes
  const getRankingDataFallback = async (): Promise<RankingUser[]> => {
    try {
      console.log('🔄 Buscando dados da tabela pontuacoes como fallback...');
      
      const { data: pontuacoesData, error } = await supabase
        .from('pontuacoes')
        .select(`
          user_id,
          pontuacao_total,
          dias_consecutivos,
          ultima_data_participacao,
          profiles!inner(nome, foto_url)
        `)
        .order('pontuacao_total', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar dados da tabela pontuacoes:', error);
        
        // Tentar uma consulta mais simples sem join
        console.log('🔄 Tentando consulta simplificada...');
        const { data: simpleData, error: simpleError } = await supabase
          .from('pontuacoes')
          .select('user_id, pontuacao_total, dias_consecutivos')
          .order('pontuacao_total', { ascending: false });
          
        if (simpleError) {
          console.error('❌ Erro na consulta simplificada:', simpleError);
          throw simpleError;
        }
        
        if (!simpleData || simpleData.length === 0) {
          console.log('⚠️ Nenhum dado encontrado na consulta simplificada');
          return [];
        }
        
        console.log(`✅ Encontrados ${simpleData.length} registros na consulta simplificada`);
        
        // Buscar nomes dos usuários e dados do desafio separadamente
        const userIds = simpleData.map(item => item.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, nome, foto_url, challenge_start_date, challenge_completed_at')
          .in('user_id', userIds);
        
        // Combinar dados
        const rankingUsers: RankingUser[] = simpleData.map((item) => {
          const profile = profilesData?.find(p => p.user_id === item.user_id);
          
          // Processar data de início do desafio
          let challengeStartDate: Date | null = null;
          if (profile?.challenge_start_date) {
            try {
              challengeStartDate = new Date(profile.challenge_start_date);
              if (isNaN(challengeStartDate.getTime())) {
                challengeStartDate = null;
              }
            } catch (error) {
              console.error(`Erro ao processar data de início para usuário ${item.user_id}:`, error);
              challengeStartDate = null;
            }
          }
          
          return {
            id: item.user_id,
            name: profile?.nome || 'Usuário sem nome',
            avatar: profile?.foto_url,
            totalPoints: item.pontuacao_total || 0,
            challengeStartDate,
            challengeProgress: {
              currentDay: 0,
              totalDays: 7,
              isCompleted: !!profile?.challenge_completed_at,
              isNotStarted: !challengeStartDate,
              daysRemaining: 7,
              progressPercentage: 0,
              displayText: challengeStartDate ? 'Participando' : 'Dados básicos',
              hasError: false,
              errorMessage: ''
            }
          };
        });
        
        return rankingUsers;
      }

      if (!pontuacoesData || pontuacoesData.length === 0) {
        console.log('⚠️ Nenhum dado encontrado na tabela pontuacoes');
        return [];
      }

      console.log(`✅ Encontrados ${pontuacoesData.length} registros na tabela pontuacoes`);

      // Buscar dados do desafio dos usuários
      const userIds = pontuacoesData.map(item => item.user_id);
      const { data: challengeData } = await supabase
        .from('profiles')
        .select('user_id, challenge_start_date, challenge_completed_at')
        .in('user_id', userIds);

      // Converter dados para o formato esperado
      const rankingUsers: RankingUser[] = pontuacoesData.map((item) => {
        const challenge = challengeData?.find(c => c.user_id === item.user_id);
        
        // Processar data de início do desafio
        let challengeStartDate: Date | null = null;
        if (challenge?.challenge_start_date) {
          try {
            challengeStartDate = new Date(challenge.challenge_start_date);
            if (isNaN(challengeStartDate.getTime())) {
              challengeStartDate = null;
            }
          } catch (error) {
            console.error(`Erro ao processar data de início para usuário ${item.user_id}:`, error);
            challengeStartDate = null;
          }
        }
        
        return {
          id: item.user_id,
          name: item.profiles?.nome || 'Usuário sem nome',
          avatar: item.profiles?.foto_url,
          totalPoints: item.pontuacao_total || 0,
          challengeStartDate,
          challengeProgress: {
            currentDay: 0,
            totalDays: 7,
            isCompleted: !!challenge?.challenge_completed_at,
            isNotStarted: !challengeStartDate,
            daysRemaining: 7,
            progressPercentage: 0,
            displayText: challengeStartDate ? 'Participando' : 'Dados básicos',
            hasError: false,
            errorMessage: ''
          }
        };
      });

      return rankingUsers;
    } catch (error) {
      console.error('❌ Erro na função de fallback:', error);
      return [];
    }
  };

  const carregarRanking = async () => {
    try {
      console.log('🚀 Iniciando carregamento do ranking...');
      setHasError(false);
      setErrorMessage('');
      
      console.log('🔄 Tentando getRankingData()...');
      let rankingData = await getRankingData();
      console.log(`📊 getRankingData() retornou ${rankingData.length} registros`);
      
      // Debug: verificar dados dos usuários
      if (rankingData.length > 0) {
        console.log('🔍 Debug - Primeiros 3 usuários do ranking principal:', 
          rankingData.slice(0, 3).map(u => ({
            name: u.name,
            totalPoints: u.totalPoints,
            challengeStartDate: u.challengeStartDate,
            isNotStarted: u.challengeProgress.isNotStarted
          }))
        );
      }
      
      // Se getRankingData retornou array vazio, tentar buscar diretamente da tabela pontuacoes
      if (rankingData.length === 0) {
        console.log('🔄 Array vazio, tentando fallback...');
        rankingData = await getRankingDataFallback();
        console.log(`📊 Fallback retornou ${rankingData.length} registros`);
        
        // Debug: verificar dados do fallback
        if (rankingData.length > 0) {
          console.log('🔍 Debug - Primeiros 3 usuários do fallback:', 
            rankingData.slice(0, 3).map(u => ({
              name: u.name,
              totalPoints: u.totalPoints,
              challengeStartDate: u.challengeStartDate,
              isNotStarted: u.challengeProgress.isNotStarted
            }))
          );
        }
      }
      
      console.log('✅ Definindo usuários no estado:', rankingData);
      setUsuarios(rankingData);
      
      // Encontrar posição do usuário atual
      if (user && rankingData.length > 0) {
        const posicao = rankingData.findIndex(u => u.id === user.id);
        setMinhaPosicao(posicao !== -1 ? posicao + 1 : null);
        console.log(`👤 Posição do usuário atual: ${posicao !== -1 ? posicao + 1 : 'não encontrado'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar ranking:', error);
      setHasError(true);
      
      // Determine error type based on error message
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        setErrorMessage('Erro de conexão ao carregar ranking. Verifique sua internet.');
      } else if (errorMsg.includes('timezone') || errorMsg.includes('horário')) {
        setErrorMessage('Erro ao processar horários do ranking. Tente recarregar.');
      } else {
        setErrorMessage('Erro inesperado ao carregar ranking. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getIconePosicao = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{posicao}</span>;
    }
  };

  const getCorFundo = (posicao: number, isUsuarioAtual: boolean) => {
    if (isUsuarioAtual) {
      return 'bg-gradient-gold text-gold-foreground border-gold';
    }
    
    switch (posicao) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'bg-gradient-card';
    }
  };

  const getInitiais = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusText = (usuario: RankingUser) => {
    // Prioridade 1: Se tem data de início, mostrar ela
    if (usuario.challengeStartDate) {
      return `Iniciado em ${usuario.challengeStartDate.toLocaleDateString('pt-BR')}`;
    }
    
    // Prioridade 2: Se está concluído
    if (usuario.challengeProgress.isCompleted) {
      return 'Concluído';
    }
    
    // Prioridade 3: Se tem pontos mas não tem data (inconsistência de dados)
    if (usuario.totalPoints > 0) {
      return 'Participando';
    }
    
    // Prioridade 4: Realmente não iniciou
    return 'Não iniciado';
  };



  if (loading) {
    return <ChallengeLoadingDisplay message="Carregando ranking do desafio..." />;
  }

  if (hasError) {
    const errorType = errorMessage.includes('conexão') ? 'network' :
                     errorMessage.includes('horário') ? 'timezone' : 'general';

    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
            <Trophy className="w-5 h-5" />
            Ranking do Desafio
          </div>
        </div>

        <ChallengeErrorBoundary
          hasError={true}
          errorMessage={errorMessage}
          errorType={errorType}
          onRetry={carregarRanking}
          onReload={() => window.location.reload()}
        />

        <ChallengeFallbackDisplay
          title="Ranking Indisponível"
          message="Não foi possível carregar o ranking no momento. Seus pontos estão sendo salvos normalmente."
          showBasicInterface={false}
          onRetry={carregarRanking}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
          <Trophy className="w-5 h-5" />
          Ranking do Desafio
        </div>
        <p className="text-muted-foreground">
          Veja como você está se saindo comparado aos outros participantes
        </p>
        

        
        {minhaPosicao && (
          <div className="text-center">
            <div className="text-2xl font-bold text-white">#{minhaPosicao}</div>
            <div className="text-sm text-white">Sua posição atual</div>
          </div>
        )}
      </div>

      {/* Pódio - Top 3 */}
      {usuarios.length >= 3 && (
        <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Classificação Completa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* 2º lugar */}
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Medal className="w-8 h-8 text-gray-400" />
                </div>
                <Avatar className="mx-auto h-16 w-16 border-2 border-gray-400">
                  <AvatarImage src={usuarios[1]?.avatar} />
                  <AvatarFallback className="bg-gray-100 text-gray-800">
                    {usuarios[1] ? getInitiais(usuarios[1].name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{usuarios[1]?.name}</p>
                  <p className="text-xs text-gray-600">{usuarios[1]?.totalPoints} pts</p>
                  <p className="text-xs text-gray-600">
                    {usuarios[1] ? getStatusText(usuarios[1]) : 'Não iniciado'}
                  </p>
                </div>
              </div>

              {/* 1º lugar */}
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Crown className="w-10 h-10 text-yellow-500" />
                </div>
                <Avatar className="mx-auto h-20 w-20 border-4 border-yellow-500">
                  <AvatarImage src={usuarios[0]?.avatar} />
                  <AvatarFallback className="bg-yellow-100 text-yellow-800">
                    {usuarios[0] ? getInitiais(usuarios[0].name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-gray-900">{usuarios[0]?.name}</p>
                  <p className="text-sm text-gray-600">{usuarios[0]?.totalPoints} pts</p>
                  <p className="text-sm text-gray-600">
                    {usuarios[0] ? getStatusText(usuarios[0]) : 'Não iniciado'}
                  </p>
                </div>
              </div>

              {/* 3º lugar */}
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Award className="w-8 h-8 text-amber-600" />
                </div>
                <Avatar className="mx-auto h-16 w-16 border-2 border-amber-600">
                  <AvatarImage src={usuarios[2]?.avatar} />
                  <AvatarFallback className="bg-amber-100 text-amber-800">
                    {usuarios[2] ? getInitiais(usuarios[2].name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{usuarios[2]?.name}</p>
                  <p className="text-xs text-gray-600">{usuarios[2]?.totalPoints} pts</p>
                  <p className="text-xs text-gray-600">
                    {usuarios[2] ? getStatusText(usuarios[2]) : 'Não iniciado'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista completa do ranking */}
      <div className="space-y-3">
        {usuarios.map((usuario, index) => {
          const posicao = index + 1;
          const isUsuarioAtual = user?.id === usuario.id;
          
          return (
            <Card 
              key={usuario.id}
              className={`transition-all duration-200 ${getCorFundo(posicao, isUsuarioAtual)} ${
                isUsuarioAtual ? 'scale-[1.02] shadow-lg' : 'hover:scale-[1.01]'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Posição */}
                  <div className="flex items-center justify-center w-12">
                    {getIconePosicao(posicao)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12 border-2 border-border/20">
                    <AvatarImage src={usuario.avatar} />
                    <AvatarFallback className={`${
                      isUsuarioAtual 
                        ? 'bg-gold-foreground/20 text-gold-foreground' 
                        : 'bg-accent text-accent-foreground'
                    }`}>
                      {getInitiais(usuario.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Informações do usuário */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${
                        isUsuarioAtual ? 'text-gold-foreground' : 'text-foreground'
                      }`}>
                        {usuario.name}
                      </h3>
                      {isUsuarioAtual && (
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-medium">
                          Você
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1">
                        <Trophy className={`w-4 h-4 ${
                          isUsuarioAtual ? 'text-gold-foreground' : 'text-gold'
                        }`} />
                        <span className={`text-sm font-medium ${
                          isUsuarioAtual ? 'text-gold-foreground' : 'text-foreground'
                        }`}>
                          {usuario.totalPoints} pts
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className={`w-4 h-4 ${
                          isUsuarioAtual ? 'text-gold-foreground' : 'text-blue-500'
                        }`} />
                        <span className={`text-sm ${
                          isUsuarioAtual ? 'text-gold-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {getStatusText(usuario)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {usuarios.length === 0 && !loading && !hasError && (
        <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900">
          <CardContent className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum participante ainda
            </h3>
            <p className="text-gray-600 mb-4">
              Seja o primeiro a completar tarefas e aparecer no ranking!
            </p>
            <p className="text-xs text-gray-600">
              Se você já completou tarefas e não aparece aqui, pode haver um problema de sincronização.
              <br />
              Tente recarregar a página ou entre em contato com o suporte.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}