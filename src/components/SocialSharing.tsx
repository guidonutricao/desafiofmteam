import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2, Loader2, AlertCircle, RefreshCw, Camera } from 'lucide-react';
import { retryAsync, RETRY_CONFIGS } from '@/lib/retryUtils';
import { useCelebrationImageGenerator } from '@/hooks/useCelebrationImageGenerator';
import { type ChallengeData } from '@/hooks/useCelebrationData';

interface ShareData {
  title: string;
  text: string;
  url: string;
}

interface SocialSharingProps {
  challengeData: ChallengeData;
  onShare?: () => void;
  className?: string;
}

export function SocialSharing({ challengeData, onShare, className }: SocialSharingProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { isGenerating, error: imageError, generateAndShare } = useCelebrationImageGenerator();

  // Generate share content with challenge completion message
  const generateShareData = (): ShareData => {
    return {
      title: 'Shape Express - Desafio Concluído!',
      text: `Acabei de concluir o desafio de ${challengeData.challengeDuration} dias! 💪 Consegui ${challengeData.totalScore} pontos!`,
      url: window.location.href
    };
  };

  // Enhanced fallback function with better error handling
  const fallbackToClipboard = async (shareData: ShareData): Promise<void> => {
    const shareText = `${shareData.text}\n\n${shareData.url}`;
    
    // Wrap clipboard operation with retry logic
    await retryAsync(async () => {
      // Modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        return;
      }

      // Fallback for older browsers using deprecated execCommand
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (!successful) {
          throw new Error('Comando de cópia falhou');
        }
      } finally {
        document.body.removeChild(textArea);
      }
    }, {
      ...RETRY_CONFIGS.sharing,
      onRetry: (attempt, error) => {
        console.warn(`Tentativa ${attempt} de copiar para clipboard falhou:`, error);
        setRetryCount(attempt);
      }
    });

    // Success - show toast and call callback
    toast({
      title: "Copiado para área de transferência! 📋",
      description: "Cole em suas redes sociais para compartilhar sua conquista!",
    });
    
    if (onShare) onShare();
  };

  // Enhanced share handler with image generation
  const handleShare = async (): Promise<void> => {
    if (!challengeData) {
      const errorMsg = "Dados do desafio não encontrados. Tente recarregar a página.";
      setShareError(errorMsg);
      toast({
        title: "Erro ao compartilhar",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    
    setIsSharing(true);
    setShareError(null);
    setRetryCount(0);
    
    try {
      // Generate and share the celebration image
      await generateAndShare(challengeData);
      
      // Show success toast
      toast({
        title: "Imagem gerada com sucesso! 🎉",
        description: "Sua conquista foi compartilhada com uma imagem personalizada!",
      });
      
      if (onShare) onShare();
      
      // Clear any previous errors on success
      setShareError(null);
      
    } catch (error: any) {
      console.error('Erro ao gerar e compartilhar imagem:', error);
      
      // Fallback to text sharing if image generation fails
      try {
        await retryAsync(async () => {
          const shareData = generateShareData();

          // Check if Web Share API is available and supported
          if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
              
              // Show success toast for successful native sharing
              toast({
                title: "Compartilhado com sucesso! 📝",
                description: "Sua conquista foi compartilhada como texto!",
              });
              
              if (onShare) onShare();
              return;
            } catch (shareError: any) {
              // Handle user cancellation gracefully (don't show error)
              if (shareError.name === 'AbortError') {
                // User cancelled sharing, don't show error message
                return;
              }
              
              // For other share errors, fallback to clipboard
              console.warn('Web Share API failed, falling back to clipboard:', shareError);
              throw new Error(`Web Share API failed: ${shareError.message}`);
            }
          } else {
            // Web Share API not available, use clipboard fallback
            await fallbackToClipboard(shareData);
          }
        }, {
          ...RETRY_CONFIGS.sharing,
          onRetry: (attempt, error) => {
            console.warn(`Tentativa ${attempt} de compartilhamento falhou:`, error);
            setRetryCount(attempt);
            
            toast({
              title: `Tentativa ${attempt} falhou`,
              description: "Tentando novamente...",
              variant: "default",
            });
          }
        });
        
        // Clear any previous errors on success
        setShareError(null);
        
      } catch (fallbackError: any) {
        console.error('Erro geral ao compartilhar:', fallbackError);
        
        const errorMessage = getShareErrorMessage(fallbackError);
        setShareError(errorMessage);
        
        // Show error toast with appropriate user feedback
        toast({
          title: "Erro ao compartilhar",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Get user-friendly error message based on error type
  const getShareErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('clipboard')) {
      return "Erro ao acessar a área de transferência. Verifique as permissões do navegador.";
    }
    
    if (message.includes('network')) {
      return "Erro de conexão. Verifique sua internet e tente novamente.";
    }
    
    if (message.includes('permission')) {
      return "Permissão negada. Verifique as configurações do navegador.";
    }
    
    if (message.includes('share')) {
      return "Erro no compartilhamento. Tente copiar o texto manualmente.";
    }
    
    return "Não foi possível compartilhar. Tente novamente em alguns instantes.";
  };

  // Retry the share operation
  const retryShare = async () => {
    await handleShare();
  };

  const isLoading = isSharing || isGenerating;
  const currentError = shareError || imageError;

  return (
    <div role="region" aria-labelledby="social-sharing" className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <Button
          variant="share"
          size="lg"
          onClick={handleShare}
          disabled={isLoading}
          className={className}
          aria-label={
            isLoading 
              ? "Gerando imagem e compartilhando conquista, aguarde..." 
              : "Gerar imagem personalizada e compartilhar conquista do desafio"
          }
          aria-describedby="share-description"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              {isGenerating ? 'Gerando imagem...' : 
               retryCount > 0 ? `Tentativa ${retryCount}...` : 'Compartilhando...'}
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" aria-hidden="true" />
              Compartilhar Conquista
            </>
          )}
        </Button>

        {/* Retry button for failed share attempts */}
        {currentError && !isLoading && (
          <Button
            variant="outline"
            size="sm"
            onClick={retryShare}
            className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
            aria-label="Tentar compartilhar novamente"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Tentar novamente
          </Button>
        )}
      </div>

      {/* Error message display */}
      {currentError && (
        <div 
          className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-red-700 font-medium">
              {imageError ? 'Erro ao gerar imagem' : 'Erro ao compartilhar'}
            </p>
            <p className="text-red-600">{currentError}</p>
            {retryCount > 0 && (
              <p className="text-red-500 text-xs">
                Tentativas realizadas: {retryCount}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Loading state with retry information */}
      {isLoading && retryCount > 0 && (
        <div 
          className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" aria-hidden="true" />
          <p className="text-amber-700">
            {isGenerating ? 'Gerando imagem...' : `Tentativa ${retryCount} de compartilhamento em andamento...`}
          </p>
        </div>
      )}

      {/* Image generation info */}
      {!isLoading && !currentError && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Gera uma imagem personalizada em alta qualidade com todos os seus dados do desafio
          </p>
        </div>
      )}

      <div 
        id="share-description" 
        className="sr-only"
      >
        Gera uma imagem personalizada e compartilha sua conquista do desafio de {challengeData.challengeDuration} dias com {challengeData.totalScore} pontos nas redes sociais
      </div>
    </div>
  );
}