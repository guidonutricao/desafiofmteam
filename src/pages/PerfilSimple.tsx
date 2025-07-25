import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  nome: string;
  foto_url?: string;
}

export default function PerfilSimple() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({ nome: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

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
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-100">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-8 text-center">
          Meu Perfil
        </h1>
        <div className="bg-zinc-800 rounded-lg p-6">
          <p className="text-zinc-100">Nome: {profile.nome || 'Não informado'}</p>
          <p className="text-zinc-400 mt-2">Email: {user?.email}</p>
          <p className="text-zinc-400 mt-2">ID: {user?.id}</p>
        </div>
      </div>
    </div>
  );
}