import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, RefreshCw, User, Camera, Save, Eye, EyeOff, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  nome: string;
  foto_url?: string;
}

export default function Perfil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [profile, setProfile] = useState<Profile>({ nome: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile data loading
  const carregarPerfil = useCallback(async () => {
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

      const profileData = data || { nome: '' };
      setProfile(profileData);
      setTempName(profileData.nome);
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao carregar perfil';
      setError(errorMessage);

      toast({
        title: "❌ Erro ao carregar perfil",
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      carregarPerfil();
    }
  }, [user, carregarPerfil]);

  // Save name changes
  const handleSaveName = async () => {
    if (!user || !tempName.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nome: tempName.trim() })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, nome: tempName.trim() }));
      setEditingName(false);

      toast({
        title: "✅ Nome atualizado!",
        description: "Seu nome foi salvo com sucesso.",
        duration: 4000
      });
    } catch (error: any) {
      toast({
        title: "❌ Erro ao salvar nome",
        description: error?.message || 'Erro desconhecido',
        variant: "destructive",
        duration: 6000
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel name editing
  const handleCancelName = () => {
    setTempName(profile.nome);
    setEditingName(false);
  };

  // Photo upload handler
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "❌ Tipo de arquivo inválido",
        description: "Use apenas arquivos JPG, PNG ou WebP",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "❌ Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ foto_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, foto_url: publicUrl }));

      toast({
        title: "✅ Foto atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso.",
        duration: 4000
      });
    } catch (error: any) {
      toast({
        title: "❌ Erro no upload",
        description: error?.message || 'Erro ao fazer upload da foto',
        variant: "destructive",
        duration: 6000
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Password update handler
  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "❌ Erro na senha",
        description: "As senhas não coincidem ou estão vazias",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "❌ Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: "✅ Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
        duration: 4000
      });
    } catch (error: any) {
      toast({
        title: "❌ Erro ao atualizar senha",
        description: error?.message || 'Erro desconhecido',
        variant: "destructive",
        duration: 6000
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Retry mechanism for failed operations
  const handleRetry = useCallback(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  // Loading state
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

<<<<<<< HEAD
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
=======
  // Error state with retry option
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
            onClick={handleRetry}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-900"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
>>>>>>> 2673e5a (falta configurar as datas do desafio)
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-zinc-900 py-8 px-4">
      {/* Page Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Meu Perfil</h1>
          <p className="text-zinc-400">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Profile Photo Section */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-center">Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32 border-4 border-amber-500/20">
              <AvatarImage src={profile.foto_url} alt="Foto de perfil" />
              <AvatarFallback className="bg-zinc-700 text-zinc-100 text-2xl">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-zinc-900 transition-colors"
              >
                {uploadingPhoto ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Alterar Foto
                  </>
                )}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Two-column layout for larger screens */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Data Section */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <User className="w-5 h-5 text-amber-500" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-zinc-200">Nome Completo</Label>
                {editingName ? (
                  <div className="flex gap-2">
                    <Input
                      id="nome"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-zinc-700 border-zinc-600 text-zinc-100"
                      placeholder="Digite seu nome"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={saving || !tempName.trim()}
                      className="bg-amber-500 hover:bg-amber-600 text-zinc-900"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelName}
                      className="border-zinc-500 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-100">{profile.nome || 'Não informado'}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingName(true)}
                      className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-zinc-900 transition-colors"
                    >
                      Editar
                    </Button>
                  </div>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <Label className="text-zinc-200">Email</Label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-zinc-700 border-zinc-600 text-zinc-300 cursor-not-allowed"
                />
                <p className="text-xs text-zinc-400">
                  O email não pode ser alterado por questões de segurança
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <Save className="w-5 h-5 text-amber-500" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-zinc-200">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-zinc-700 border-zinc-600 text-zinc-100 pr-10"
                    placeholder="Digite sua nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-zinc-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-200">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-zinc-700 border-zinc-600 text-zinc-100 pr-10"
                    placeholder="Confirme sua nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-zinc-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password validation feedback */}
              {newPassword && newPassword.length < 6 && (
                <p className="text-red-400 text-sm">A senha deve ter pelo menos 6 caracteres</p>
              )}
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-400 text-sm">As senhas não coincidem</p>
              )}

              {/* Update Password Button */}
              <Button
                onClick={handlePasswordUpdate}
                disabled={updatingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900"
              >
                {updatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Atualizando senha...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Atualizar senha
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}