import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { weightFromDatabase, formatWeight } from '@/lib/weightUtils';
import { Loader2, AlertCircle, RefreshCw, User, Camera, Save, Eye, EyeOff, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  nome: string;
  foto_url?: string;
  peso_inicial?: number;
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
        .select('nome, foto_url, peso_inicial')
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      const profileData = data || { nome: '', peso_inicial: undefined };
      
      // Processar peso_inicial com função utilitária para garantir precisão
      const processedProfile = {
        ...profileData,
        peso_inicial: weightFromDatabase(profileData.peso_inicial)
      };
      
      setProfile(processedProfile);
      setTempName(processedProfile.nome);
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B111F' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-zinc-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error && !profile.nome) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B111F' }}>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: '#0B111F' }}>
      <div className="space-y-6">
        {/* Header Premium com Título Dourado */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
            <User className="w-5 h-5" />
            Meu Perfil Premium
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Gerencie suas informações pessoais e configurações de conta com acesso premium
          </p>
        </div>

        {/* Profile Photo Section Premium */}
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg transition-all duration-300">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32 border-4 border-white/30 shadow-2xl">
                <AvatarImage src={profile.foto_url} alt="Foto de perfil" />
                <AvatarFallback className="bg-white/20 text-white text-2xl">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  {profile.nome || 'Usuário Premium'}
                </h2>
                <p className="text-white/90">
                  Membro Shape Express Premium
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="border-white/30 text-white hover:bg-white/20 hover:text-white transition-colors bg-white/10"
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Two-column layout for larger screens */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Personal Data Section */}
          <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <User className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <span className="text-lg">👤</span>
                  <span className="font-semibold ml-2">Dados Pessoais</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-gray-700 font-medium">Nome Completo</Label>
                {editingName ? (
                  <div className="flex gap-2">
                    <Input
                      id="nome"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-gray-50 border-gray-200 text-gray-900"
                      placeholder="Digite seu nome"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={saving || !tempName.trim()}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 text-white"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelName}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{profile.nome || 'Não informado'}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingName(true)}
                        className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Email</Label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <span className="text-gray-600">{user?.email || ''}</span>
                  <p className="text-xs text-gray-500 mt-1">
                    O email não pode ser alterado por questões de segurança
                  </p>
                </div>
              </div>

              {/* Peso Inicial Field (Read-only) */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Peso Inicial</Label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <span className="text-gray-900 font-medium">{formatWeight(profile.peso_inicial)}</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Peso registrado no momento do cadastro
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className="bg-white dark:bg-white border-gray-200 dark:border-gray-200 text-gray-900 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Save className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <span className="text-lg">🔒</span>
                  <span className="font-semibold ml-2">Alterar Senha</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700 font-medium">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-50 border-gray-200 text-gray-900 pr-10"
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
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-50 border-gray-200 text-gray-900 pr-10"
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
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password validation feedback */}
              {newPassword && newPassword.length < 6 && (
                <p className="text-red-500 text-sm">A senha deve ter pelo menos 6 caracteres</p>
              )}
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-sm">As senhas não coincidem</p>
              )}

              {/* Update Password Button */}
              <Button
                onClick={handlePasswordUpdate}
                disabled={updatingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 text-white"
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
      </div>
    </div>
  );
}