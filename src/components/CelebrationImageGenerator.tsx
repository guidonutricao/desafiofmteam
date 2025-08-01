import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Download, Share2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useCelebrationImageGenerator } from '@/hooks/useCelebrationImageGenerator';
import { type ChallengeData } from '@/hooks/useCelebrationData';

interface CelebrationImageGeneratorProps {
  challengeData: ChallengeData;
  className?: string;
}

export function CelebrationImageGenerator({ 
  challengeData, 
  className = '' 
}: CelebrationImageGeneratorProps) {
  const { isGenerating, error, generateAndDownload, generateAndShare } = useCelebrationImageGenerator();
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAction, setLastAction] = useState<'download' | 'share' | null>(null);

  const handleDownload = async () => {
    setLastAction('download');
    setShowSuccess(false);
    await generateAndDownload(challengeData);
    if (!error) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleShare = async () => {
    setLastAction('share');
    setShowSuccess(false);
    await generateAndShare(challengeData);
    if (!error) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-amber-600">
          <Camera className="w-5 h-5" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Compartilhe sua Conquista</h3>
        </div>
        <p className="text-sm text-gray-600">
          Gere uma imagem personalizada para compartilhar nas suas redes sociais
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={handleShare}
          disabled={isGenerating}
          variant="default"
          size="lg"
          className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Gerar e compartilhar imagem de celebração"
        >
          {isGenerating && lastAction === 'share' ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Share2 className="w-4 h-4" aria-hidden="true" />
          )}
          {isGenerating && lastAction === 'share' ? 'Gerando...' : 'Compartilhar'}
        </Button>

        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          variant="outline"
          size="lg"
          className="gap-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-300"
          aria-label="Gerar e baixar imagem de celebração"
        >
          {isGenerating && lastAction === 'download' ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="w-4 h-4" aria-hidden="true" />
          )}
          {isGenerating && lastAction === 'download' ? 'Gerando...' : 'Baixar Imagem'}
        </Button>
      </div>

      {/* Status Messages */}
      {error && (
        <div 
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>Erro ao gerar imagem: {error}</span>
        </div>
      )}

      {showSuccess && (
        <div 
          className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"
          role="alert"
          aria-live="polite"
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>
            {lastAction === 'download' 
              ? 'Imagem baixada com sucesso!' 
              : 'Imagem gerada para compartilhamento!'}
          </span>
        </div>
      )}

      {/* Preview Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          A imagem será gerada em alta qualidade (1080x1920px) ideal para Instagram Stories e WhatsApp
        </p>
      </div>
    </div>
  );
}