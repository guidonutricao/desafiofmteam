import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Camera } from 'lucide-react';

interface Profile {
  nome: string;
  foto_url?: string;
  peso_atual?: number;
}

export default function Perfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({ nome: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, [user]);

  const carregarPerfil = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', user.id);

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o perfil.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
        <p className="text-white/80">Gerencie suas informações pessoais</p>
      </div>

      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-gold" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={salvarPerfil} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-gold/20">
                <AvatarImage src={profile.foto_url} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xl">
                  {profile.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Alterar Foto
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={profile.nome}
                  onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="peso">Peso Atual (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  value={profile.peso_atual || ''}
                  onChange={(e) => setProfile({ ...profile, peso_atual: parseFloat(e.target.value) || undefined })}
                  placeholder="Ex: 70.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-gold hover:opacity-90"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}