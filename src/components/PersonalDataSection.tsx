import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Save, AlertTriangle } from 'lucide-react';
import { handleError, getErrorMessage } from '@/lib/errorUtils';
import { withRetry, RETRY_CONFIGS } from '@/lib/retryUtils';
import { useToast } from '@/hooks/use-toast';
import { useConfirmation } from '@/hooks/use-confirmation';
import { useFormValidation } from '@/hooks/use-form-validation';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { FormErrorBoundary } from '@/components/ErrorBoundary';
import { AccessibleForm, AccessibleField, AccessibleInput, AccessibleButton } from '@/components/AccessibleForm';

interface ProfileData {
  nome: string;
  foto_url?: string;
}

interface PersonalDataSectionProps {
  profile: ProfileData;
  userEmail: string;
  onProfileUpdate: (data: ProfileData) => Promise<void>;
  saving: boolean;
}



export function PersonalDataSection({ 
  profile, 
  userEmail, 
  onProfileUpdate, 
  saving 
}: PersonalDataSectionProps) {
  const { toast } = useToast();
  const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmation();
  const [formData, setFormData] = useState<ProfileData>(profile);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Enhanced form validation with real-time feedback
  const validation = useFormValidation({
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300,
    onValidationChange: (isValid, errors) => {
      // Handle validation state changes
      if (!isValid && Object.keys(errors).length > 0) {
        setLastError(null); // Clear previous errors when validation errors occur
      }
    }
  });

  // Update form data when profile prop changes
  useEffect(() => {
    setFormData(profile);
    validation.setFormDirty(false);
    validation.resetValidation();
  }, [profile, validation]);

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, nome: value }));
    validation.setFormDirty(true);
    
    // Real-time validation with enhanced feedback (Requirement 5.5)
    validation.validateField('nome', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Comprehensive form validation (Requirement 3.2, 3.3)
    const isValid = validation.validateForm({ nome: formData.nome });
    if (!isValid) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog before saving critical changes (Requirement 5.4)
    const confirmed = await confirm({
      title: "Confirmar alterações",
      description: "Deseja salvar as alterações nos seus dados pessoais?",
      confirmText: "Salvar alterações",
      cancelText: "Cancelar"
    });

    if (!confirmed) {
      return;
    }

    // Enhanced operation with retry mechanism (Requirements 3.4, 5.3)
    const result = await withRetry(
      () => onProfileUpdate(formData),
      {
        ...RETRY_CONFIGS.QUICK,
        onRetry: (attempt, error) => {
          setRetryCount(attempt);
          toast({
            title: `Tentativa ${attempt + 1}`,
            description: "Tentando salvar novamente...",
            duration: 2000
          });
        }
      }
    );

    if (result.success) {
      validation.setFormDirty(false);
      setRetryCount(0);
      setLastError(null);
      
      // Enhanced success feedback (Requirement 5.2)
      toast({
        title: "✅ Dados pessoais atualizados!",
        description: `Nome atualizado para: ${formData.nome}`,
        duration: 4000
      });
    } else {
      // Enhanced error handling with retry information (Requirement 5.3)
      const appError = handleError(result.error);
      const errorMessage = getErrorMessage(appError);
      setLastError(errorMessage);
      
      toast({
        title: "❌ Erro ao salvar dados pessoais",
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
          <CardTitle id="personal-data-title" className="flex items-center gap-2 text-zinc-100">
            <User className="w-5 h-5 text-amber-500" aria-hidden="true" />
            Dados Pessoais
            {retryCount > 0 && (
              <span 
                className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded"
                role="status"
                aria-label={`Tentativa ${retryCount} de salvamento`}
              >
                Tentativa {retryCount}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error summary with proper accessibility */}
          {lastError && (
            <div 
              className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                <span>Erro ao salvar: {lastError}</span>
              </div>
            </div>
          )}
          
          <AccessibleForm 
            onSubmit={handleSubmit}
            ariaLabel="Formulário de dados pessoais"
            ariaDescribedBy="personal-data-title"
          >
            {/* Name field with comprehensive accessibility */}
            <AccessibleField
              label="Nome Completo"
              required={true}
              error={validation.state.errors.nome}
              helpText="Digite seu nome completo para identificação. Este nome será exibido em seu perfil."
              fieldId="nome"
            >
              <AccessibleInput
                type="text"
                value={formData.nome}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Digite seu nome completo"
                required
                error={!!validation.state.errors.nome}
                success={validation.state.validFields.has('nome') && !validation.state.errors.nome}
                aria-describedby="nome-validation-status"
              />
            </AccessibleField>
            
            {/* Validation status for screen readers */}
            <div id="nome-validation-status" className="sr-only" aria-live="polite">
              {validation.state.errors.nome 
                ? `Erro no campo nome: ${validation.state.errors.nome}`
                : validation.state.validFields.has('nome') 
                  ? "Campo nome válido"
                  : "Campo nome aguardando entrada"
              }
            </div>

            {/* Email field with comprehensive accessibility */}
            <AccessibleField
              label="Email"
              required={false}
              helpText="O email não pode ser alterado por questões de segurança. Para alterar o email, entre em contato com o suporte."
              fieldId="email"
            >
              <AccessibleInput
                type="email"
                value={userEmail}
                disabled
                className="bg-zinc-700 border-zinc-600 text-zinc-300 cursor-not-allowed opacity-75"
                aria-describedby="email-readonly-explanation"
                readOnly
              />
            </AccessibleField>
            
            {/* Explanation for screen readers */}
            <div id="email-readonly-explanation" className="sr-only">
              Este campo é somente leitura. O endereço de email está vinculado à sua conta e não pode ser alterado através desta interface por motivos de segurança.
            </div>

            {/* Save button with full accessibility */}
            <AccessibleButton
              type="submit"
              disabled={saving || !validation.state.isDirty || !validation.state.isValid}
              loading={saving}
              loadingText={retryCount > 0 ? `Tentativa ${retryCount + 1}...` : 'Salvando dados pessoais...'}
              variant="primary"
              className="w-full"
              aria-describedby="save-button-help"
            >
              <Save className="w-4 h-4 mr-2" aria-hidden="true" />
              Salvar dados pessoais
            </AccessibleButton>
            
            {/* Enhanced status indicators with comprehensive feedback (Requirement 5.5) */}
            {validation.state.isDirty && !saving && validation.state.isValid && (
              <div className="flex items-center justify-center gap-2 text-xs text-amber-400" role="status" aria-live="polite">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" aria-hidden="true" />
                Alterações pendentes - clique para salvar
              </div>
            )}
            
            {!validation.state.isValid && Object.keys(validation.state.errors).length > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-red-400" role="alert" aria-live="assertive">
                <div className="w-2 h-2 bg-red-400 rounded-full" aria-hidden="true" />
                Corrija os erros antes de salvar
              </div>
            )}
            
            {validation.state.isValidating && (
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400" role="status" aria-live="polite">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" aria-hidden="true" />
                Validando...
              </div>
            )}
          </AccessibleForm>
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