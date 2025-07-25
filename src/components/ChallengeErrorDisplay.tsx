import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChallengeErrorDisplayProps {
  hasError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
  variant?: 'card' | 'alert' | 'inline';
  className?: string;
}

/**
 * Component to display user-friendly error messages for challenge-related errors
 * Provides consistent error handling UI across the application
 */
export function ChallengeErrorDisplay({
  hasError,
  errorMessage,
  onRetry,
  showRetryButton = true,
  variant = 'alert',
  className = ''
}: ChallengeErrorDisplayProps) {
  if (!hasError) {
    return null;
  }

  const defaultMessage = 'Ocorreu um erro inesperado. Tente recarregar a página.';
  const displayMessage = errorMessage || defaultMessage;

  if (variant === 'card') {
    return (
      <Card className={`border-destructive/20 bg-destructive/5 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Erro no Desafio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {displayMessage}
          </p>
          {showRetryButton && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm text-destructive ${className}`}>
        <AlertTriangle className="w-4 h-4" />
        <span>{displayMessage}</span>
        {showRetryButton && onRetry && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-destructive hover:text-destructive"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  // Default: alert variant
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{displayMessage}</span>
        {showRetryButton && onRetry && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="h-auto p-2 text-destructive-foreground hover:bg-destructive/20"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Specialized error display for timezone-related issues
 */
export function TimezoneErrorDisplay({
  hasError,
  errorMessage,
  onRetry,
  className = ''
}: Omit<ChallengeErrorDisplayProps, 'variant'>) {
  if (!hasError) {
    return null;
  }

  return (
    <Alert variant="destructive" className={className}>
      <Clock className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <div className="font-medium">Erro de Horário</div>
        <div className="text-sm">
          {errorMessage || 'Erro ao processar horário de Brasília. Verifique sua conexão e tente novamente.'}
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Loading state component for challenge calculations
 */
export function ChallengeLoadingDisplay({ 
  message = 'Calculando progresso do desafio...',
  className = ''
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}