import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Home, Building } from 'lucide-react';

interface PlanoTreino {
  id: number;
  nome: string;
  descricao: string;
  tipo_treino: 'casa' | 'academia' | 'ar_livre' | 'outro';
  frequencia: number;
}

export default function Treinos() {
  const [planos, setPlanos] = useState<PlanoTreino[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPlanos();
  }, []);

  const carregarPlanos = async () => {
    try {
      const { data } = await supabase
        .from('planos_treino')
        .select('*')
        .order('frequencia');

      setPlanos(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'casa': return <Home className="w-4 h-4" />;
      case 'academia': return <Building className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Planos de Treino</h1>
        <p className="text-muted-foreground">Escolha o treino ideal para sua frequência e objetivo</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {planos.map((plano) => (
          <Card key={plano.id} className="bg-gradient-card hover:scale-[1.02] transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-gold" />
                {plano.nome}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{plano.descricao}</p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getIconeTipo(plano.tipo_treino)}
                  {plano.tipo_treino}
                </Badge>
                <Badge variant="outline">
                  {plano.frequencia}x por semana
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}