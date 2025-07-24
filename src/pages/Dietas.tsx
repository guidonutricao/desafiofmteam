import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UtensilsCrossed, Leaf } from 'lucide-react';

interface PlanoDieta {
  id: number;
  nome: string;
  descricao: string;
  peso_min: number;
  peso_max: number;
  is_vegetariano: boolean;
}

export default function Dietas() {
  const [planos, setPlanos] = useState<PlanoDieta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPlanos();
  }, []);

  const carregarPlanos = async () => {
    try {
      const { data } = await supabase
        .from('planos_dieta')
        .select('*')
        .order('peso_min');

      setPlanos(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Planos Alimentares</h1>
        <p className="text-muted-foreground">Escolha o plano ideal para seu peso e objetivo</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {planos.map((plano) => (
          <Card key={plano.id} className="bg-gradient-card hover:scale-[1.02] transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-gold" />
                {plano.nome}
                {plano.is_vegetariano && (
                  <Badge variant="secondary" className="ml-auto">
                    <Leaf className="w-3 h-3 mr-1" />
                    Vegetariano
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{plano.descricao}</p>
              <div className="text-sm font-medium text-gold">
                Ideal para: {plano.peso_min}kg - {plano.peso_max === 999 ? 'acima' : plano.peso_max + 'kg'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}