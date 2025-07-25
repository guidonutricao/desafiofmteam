import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfilePhotoSection from '@/components/ProfilePhotoSection';
import { PersonalDataSection } from '@/components/PersonalDataSection';
import { PasswordSection } from '@/components/PasswordSection';

interface Profile {
  nome: string;
  foto_url?: string;
}

export default function PerfilDebug() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile>({ nome: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarPerfil = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nome, foto_url')
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data || { nome: '' });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setError('Erro ao carregar perfil');
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      carregarPerfil();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-zinc-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error && !profile.nome) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-zinc-100">
            Erro ao carregar perfil
          </h2>
          <p className="text-zinc-400">{error}</p>
          <Button
            onClick={carregarPerfil}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-900"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 py-8 px-4">
      <header className="max-w-4xl mx-auto mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Meu Perfil</h1>
          <p className="text-zinc-400">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        <section className="bg-zinc-800 rounded-2xl shadow-md border border-zinc-700 p-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-6 text-center">
            Informações Básicas
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-zinc-200 font-medium">Nome:</label>
              <p className="text-zinc-100 mt-1">{profile.nome || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-zinc-200 font-medium">Email:</label>
              <p className="text-zinc-100 mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="text-zinc-200 font-medium">ID:</label>
              <p className="text-zinc-400 text-sm mt-1">{user?.id}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}