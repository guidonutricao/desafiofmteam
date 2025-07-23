import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown, Flame } from 'lucide-react';

interface UsuarioRanking {
  user_id: string;
  pontuacao_total: number;
  dias_consecutivos: number;
  profiles: {
    nome: string;
    foto_url?: string;
  };
}

export default function Ranking() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [minhaPosicao, setMinhaPosicao] = useState<number | null>(null);

  useEffect(() => {
    carregarRanking();
  }, []);

  const carregarRanking = async () => {
    try {
      const { data, error } = await supabase
        .from('pontuacoes')
        .select(`
          user_id,
          pontuacao_total,
          dias_consecutivos,
          profiles!inner (
            nome,
            foto_url
          )
        `)
        .order('pontuacao_total', { ascending: false })
        .order('dias_consecutivos', { ascending: false });

      if (error) throw error;

      setUsuarios(data || []);
      
      // Encontrar posição do usuário atual
      if (user && data) {
        const posicao = data.findIndex(u => u.user_id === user.id);
        setMinhaPosicao(posicao !== -1 ? posicao + 1 : null);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-gold text-gold-foreground px-4 py-2 rounded-full font-bold">
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
        <Card className="bg-gradient-card border-border/20">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
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
                  <AvatarImage src={usuarios[1]?.profiles.foto_url} />
                  <AvatarFallback className="bg-gray-100 text-gray-800">
                    {usuarios[1] ? getInitiais(usuarios[1].profiles.nome) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{usuarios[1]?.profiles.nome}</p>
                  <p className="text-xs text-muted-foreground">{usuarios[1]?.pontuacao_total} pts</p>
                </div>
              </div>

              {/* 1º lugar */}
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Crown className="w-10 h-10 text-yellow-500" />
                </div>
                <Avatar className="mx-auto h-20 w-20 border-4 border-yellow-500">
                  <AvatarImage src={usuarios[0]?.profiles.foto_url} />
                  <AvatarFallback className="bg-yellow-100 text-yellow-800">
                    {usuarios[0] ? getInitiais(usuarios[0].profiles.nome) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{usuarios[0]?.profiles.nome}</p>
                  <p className="text-sm text-muted-foreground">{usuarios[0]?.pontuacao_total} pts</p>
                </div>
              </div>

              {/* 3º lugar */}
              <div className="text-center space-y-2">
                <div className="flex justify-center">
                  <Award className="w-8 h-8 text-amber-600" />
                </div>
                <Avatar className="mx-auto h-16 w-16 border-2 border-amber-600">
                  <AvatarImage src={usuarios[2]?.profiles.foto_url} />
                  <AvatarFallback className="bg-amber-100 text-amber-800">
                    {usuarios[2] ? getInitiais(usuarios[2].profiles.nome) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{usuarios[2]?.profiles.nome}</p>
                  <p className="text-xs text-muted-foreground">{usuarios[2]?.pontuacao_total} pts</p>
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
          const isUsuarioAtual = user?.id === usuario.user_id;
          
          return (
            <Card 
              key={usuario.user_id}
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
                    <AvatarImage src={usuario.profiles.foto_url} />
                    <AvatarFallback className={`${
                      isUsuarioAtual 
                        ? 'bg-gold-foreground/20 text-gold-foreground' 
                        : 'bg-accent text-accent-foreground'
                    }`}>
                      {getInitiais(usuario.profiles.nome)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Informações do usuário */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${
                        isUsuarioAtual ? 'text-gold-foreground' : 'text-foreground'
                      }`}>
                        {usuario.profiles.nome}
                      </h3>
                      {isUsuarioAtual && (
                        <Badge variant="secondary" className="bg-gold-foreground/20 text-gold-foreground">
                          Você
                        </Badge>
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
                          {usuario.pontuacao_total} pts
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className={`w-4 h-4 ${
                          isUsuarioAtual ? 'text-gold-foreground' : 'text-orange-500'
                        }`} />
                        <span className={`text-sm ${
                          isUsuarioAtual ? 'text-gold-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {usuario.dias_consecutivos} dias seguidos
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

      {usuarios.length === 0 && (
        <Card className="bg-gradient-card border-border/20">
          <CardContent className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum participante ainda
            </h3>
            <p className="text-muted-foreground">
              Seja o primeiro a completar tarefas e aparecer no ranking!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}