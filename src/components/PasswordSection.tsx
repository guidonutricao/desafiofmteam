import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { handleError, getErrorMessage } from '@/lib/errorUtils';
import { withRetry, RETRY_CONFIGS } from '@/lib/retryUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConfirmation } from '@/hooks/use-confirmation';
import { usePasswordFormValidation } from '@/hooks/use-form-validation';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { FormErrorBoundary } from '@/components/ErrorBoundary';

interface PasswordSectionProps {
  onPasswordUpdate: (password: string) => Promise<void>;
  updating: boolean;
}

interface PasswordData {
  newPassword: string;
  confirmPassword: string;
}

export function PasswordSection({ onPasswordUpdate, updating }: PasswordSectionProps) {
  const { toast } = useToast();
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmation();
  const [formData, setFormData] = useState<PasswordData>({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Enhanced form validation with real-time feedback
  const validation = usePasswordFormValidation({
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
    onValidationChange: (isValid, errors) => {
      if (!isValid && Object.keys(errors).length > 0) {
        setLastError(null); // Clear previous errors when validation errors occur
      }
    }
  });

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    validation.setFormDirty(true);
    
    // Real-time validation with enhanced feedback (Requirement 5.5)
    if (field === 'newPassword') {
      validation.validateField('newPassword', value);
      
      // Also validate confirmation if it exists
      if (updatedData.confirmPassword) {
        validation.validateField('confirmPassword', updatedData.confirmPassword, { newPassword: value });
      }
    }
    
    if (field === 'confirmPassword') {
      validation.validateField('confirmPassword', value, { newPassword: updatedData.newPassword });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive form validation (Requirement 4.3)
    const isValid = validation.validateForm({ 
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword 
    });
    
    if (!isValid) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog for critical password change (Requirement 5.4)
    const confirmed = await confirm({
      title: "Confirmar alteração de senha",
      description: "Tem certeza que deseja alterar sua senha? Esta ação irá desconectar você de outros dispositivos.",
      confirmText: "Alterar senha",
      cancelText: "Cancelar",
      variant: 'destructive'
    });

    if (!confirmed) {
      return;
    }

    // Enhanced operation with retry mechanism (Requirements 4.4, 5.3)
    const result = await withRetry(
      async () => {
        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (error) {
          throw error;
        }

        // Call parent's update function if provided
        if (onPasswordUpdate) {
          await onPasswordUpdate(formData.newPassword);
        }

        return true;
      },
      {
        ...RETRY_CONFIGS.QUICK,
        onRetry: (attempt, error) => {
          setRetryCount(attempt);
          toast({
            title: `Tentativa ${attempt + 1}`,
            description: "Tentando alterar senha novamente...",
            duration: 2000
          });
        }
      }
    );

    if (result.success) {
      // Reset form
      setFormData({ newPassword: '', confirmPassword: '' });
      validation.resetValidation();
      setRetryCount(0);
      setLastError(null);
      
      // Enhanced success feedback (Requirement 5.2)
      toast({
        title: "🔒 Senha atualizada com sucesso!",
        description: "Sua senha foi alterada e você foi desconectado de outros dispositivos por segurança.",
        duration: 5000
      });
    } else {
      // Enhanced error handling with retry information (Requirement 5.3)
      const appError = handleError(result.error);
      const errorMessage = getErrorMessage(appError);
      setLastError(errorMessage);
      
      toast({
        title: "❌ Erro ao atualizar senha",
        description: `Falha após ${result.attempts} tentativa(s): ${errorMessage}`,
        variant: "destructive",
        duration: 8000
      });
    }
  };

  return (
    <FormErrorBoundary onError={(error) => {
      toast({
        title: "Erro no formulário",
        description: "Ocorreu um erro inesperado. Recarregue a página.",
        variant: "destructive"
      });
    }}>
      <Card className="bg-zinc-800 border-zinc-700 rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle id="password-section-title" className="flex items-center gap-2 text-zinc-100">
            <Lock className="w-5 h-5 text-amber-500" aria-hidden="true" />
            Alterar Senha
            {retryCount > 0 && (
              <span 
                className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded"
                role="status"
                aria-label={`Tentativa ${retryCount} de alteração de senha`}
              >
                Tentativa {retryCount}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error summary for multiple failure scenarios */}
          {lastError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Erro ao alterar senha: {lastError}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="password-section-title">
            {/* New password field with comprehensive accessibility (Requirements 4.1, 4.2, 5.5) */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-zinc-200 flex items-center">
                Nova Senha
                <span 
                  className="text-red-400 ml-1" 
                  aria-label="Campo obrigatório"
                  role="img"
                >
                  *
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className={`bg-zinc-800 border-zinc-600 text-zinc-100 focus:border-amber-500 pr-10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                    validation.state.errors.newPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : validation.state.validFields.has('newPassword') 
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : ''
                  }`}
                  placeholder="Digite sua nova senha"
                  aria-invalid={validation.state.errors.newPassword ? 'true' : 'false'}
                  aria-describedby="newPassword-help newPassword-validation-status"
                  aria-required="true"
                  required
                  autoComplete="new-password"
                />
                {/* Show/hide password toggle with enhanced accessibility (Requirement 4.2) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                  aria-describedby="password-toggle-help"
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                  )}
                </Button>
              </div>
              
              {/* Enhanced visual indicators for validation (Requirement 5.5) */}
              {validation.state.errors.newPassword && (
                <div 
                  id="newPassword-error"
                  className="flex items-center gap-1 text-red-400"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm">{validation.state.errors.newPassword}</span>
                </div>
              )}
              
              {!validation.state.errors.newPassword && !validation.state.validFields.has('newPassword') && (
                <p id="newPassword-help" className="text-xs text-zinc-400" role="note">
                  A senha deve ter pelo menos 6 caracteres. Use uma combinação de letras, números e símbolos para maior segurança.
                </p>
              )}
              
              {/* Validation status for screen readers */}
              <div id="newPassword-validation-status" className="sr-only" aria-live="polite">
                {validation.state.errors.newPassword 
                  ? `Erro na nova senha: ${validation.state.errors.newPassword}`
                  : validation.state.validFields.has('newPassword') 
                    ? "Nova senha válida"
                    : "Nova senha aguardando entrada"
                }
              </div>
              
              {/* Password toggle help for screen readers */}
              <div id="password-toggle-help" className="sr-only">
                Botão para alternar visibilidade da senha. Pressione para {showPassword ? 'ocultar' : 'mostrar'} os caracteres da senha.
              </div>
              
              {validation.state.validFields.has('newPassword') && !validation.state.errors.newPassword && (
                <div className="flex items-center gap-1 text-green-400" role="status" aria-live="polite">
                  <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true" />
                  <span className="text-sm">Senha válida</span>
                </div>
              )}
            </div>

            {/* Password confirmation field with comprehensive accessibility (matching validation, Requirement 5.5) */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-200 flex items-center">
                Confirmar Nova Senha
                <span 
                  className="text-red-400 ml-1" 
                  aria-label="Campo obrigatório"
                  role="img"
                >
                  *
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className={`bg-zinc-800 border-zinc-600 text-zinc-100 focus:border-amber-500 pr-10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                    validation.state.errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : validation.state.validFields.has('confirmPassword') 
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                        : ''
                  }`}
                  placeholder="Confirme sua nova senha"
                  aria-invalid={validation.state.errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby="confirmPassword-help confirmPassword-validation-status confirm-toggle-help"
                  aria-required="true"
                  required
                  autoComplete="new-password"
                />
                {/* Show/hide password toggle for confirmation field with enhanced accessibility */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                  aria-describedby="confirm-toggle-help"
                  tabIndex={0}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                  )}
                </Button>
              </div>
              
              {/* Enhanced visual indicators for validation (Requirement 5.5) */}
              {validation.state.errors.confirmPassword && (
                <div 
                  id="confirmPassword-error"
                  className="flex items-center gap-1 text-red-400"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm">{validation.state.errors.confirmPassword}</span>
                </div>
              )}
              
              {!validation.state.errors.confirmPassword && !validation.state.validFields.has('confirmPassword') && (
                <p id="confirmPassword-help" className="text-xs text-zinc-400" role="note">
                  Digite novamente a senha para confirmar. Deve ser idêntica à nova senha digitada acima.
                </p>
              )}
              
              {/* Validation status for screen readers */}
              <div id="confirmPassword-validation-status" className="sr-only" aria-live="polite">
                {validation.state.errors.confirmPassword 
                  ? `Erro na confirmação de senha: ${validation.state.errors.confirmPassword}`
                  : validation.state.validFields.has('confirmPassword') 
                    ? "Confirmação de senha válida"
                    : "Confirmação de senha aguardando entrada"
                }
              </div>
              
              {/* Confirmation toggle help for screen readers */}
              <div id="confirm-toggle-help" className="sr-only">
                Botão para alternar visibilidade da confirmação de senha. Pressione para {showConfirmPassword ? 'ocultar' : 'mostrar'} os caracteres da confirmação.
              </div>
              
              {validation.state.validFields.has('confirmPassword') && !validation.state.errors.confirmPassword && (
                <div className="flex items-center gap-1 text-green-400" role="status" aria-live="polite">
                  <div className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true" />
                  <span className="text-sm">Confirmação válida</span>
                </div>
              )}
            </div>

            {/* Enhanced save button with visual feedback (Requirements 4.4, 4.6, 5.1) */}
            <Button
              type="submit"
              disabled={updating || !validation.state.isDirty || !validation.state.isValid || !formData.newPassword || !formData.confirmPassword}
              className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 focus:ring-offset-zinc-900"
              aria-describedby="password-button-help"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  <span>{retryCount > 0 ? `Tentativa ${retryCount + 1}...` : 'Atualizando senha...'}</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" aria-hidden="true" />
                  Atualizar senha
                </>
              )}
            </Button>
            
            {/* Enhanced status indicators with comprehensive feedback (Requirement 5.5) */}
            {validation.state.isDirty && !updating && validation.state.isValid && formData.newPassword && formData.confirmPassword && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-400" role="status" aria-live="polite">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" aria-hidden="true" />
                Pronto para alterar senha - clique para confirmar
              </div>
            )}
            
            {!validation.state.isValid && Object.keys(validation.state.errors).length > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-red-400" role="alert" aria-live="assertive">
                <div className="w-2 h-2 bg-red-400 rounded-full" aria-hidden="true" />
                Corrija os erros antes de continuar
              </div>
            )}
            
            {(!formData.newPassword || !formData.confirmPassword) && validation.state.isDirty && (
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400" role="status" aria-live="polite">
                <div className="w-2 h-2 bg-zinc-400 rounded-full" aria-hidden="true" />
                Preencha todos os campos obrigatórios
              </div>
            )}
            
            {validation.state.isValidating && (
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400" role="status" aria-live="polite">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" aria-hidden="true" />
                Validando...
              </div>
            )}
          </form>
        </CardContent>
        
        {/* Confirmation dialog (Requirement 5.4) */}
        <ConfirmationDialog
          isOpen={isOpen}
          title={options?.title || ''}
          description={options?.description || ''}
          confirmText={options?.confirmText}
          cancelText={options?.cancelText}
          variant={options?.variant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </Card>
    </FormErrorBoundary>
  );
}