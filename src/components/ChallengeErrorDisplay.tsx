import { AlertTriangle, RefreshCw, Clock, Wifi, WifiOff, Calendar, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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

/**
 * Comprehensive error display for challenge-related issues with specific error types
 */
export function ChallengeErrorBoundary({
  hasError,
  errorMessage,
  errorType = 'general',
  onRetry,
  onReload,
  showTechnicalDetails = false,
  className = ''
}: {
  hasError: boolean;
  errorMessage?: string;
  errorType?: 'timezone' | 'network' | 'data' | 'calculation' | 'general';
  onRetry?: () => void;
  onReload?: () => void;
  showTechnicalDetails?: boolean;
  className?: string;
}) {
  if (!hasError) {
    return null;
  }

  const getErrorConfig = (type: string) => {
    switch (type) {
      case 'timezone':
        return {
          icon: Clock,
          title: 'Erro de Horário',
          description: 'Problema ao processar o horário de Brasília',
          suggestion: 'Verifique sua conexão com a internet e tente novamente.',
          badge: 'Timezone',
          color: 'text-blue-600'
        };
      case 'network':
        return {
          icon: WifiOff,
          title: 'Erro de Conexão',
          description: 'Não foi possível conectar com o servidor',
          suggestion: 'Verifique sua conexão com a internet.',
          badge: 'Rede',
          color: 'text-red-600'
        };
      case 'data':
        return {
          icon: Calendar,
          title: 'Erro de Data',
          description: 'Data inválida ou formato incorreto',
          suggestion: 'Os dados serão recarregados automaticamente.',
          badge: 'Dados',
          color: 'text-orange-600'
        };
      case 'calculation':
        return {
          icon: AlertTriangle,
          title: 'Erro de Cálculo',
          description: 'Problema ao calcular o progresso do desafio',
          suggestion: 'Tente recarregar a página.',
          badge: 'Cálculo',
          color: 'text-yellow-600'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Erro Inesperado',
          description: 'Ocorreu um problema inesperado',
          suggestion: 'Tente recarregar a página ou entre em contato com o suporte.',
          badge: 'Geral',
          color: 'text-destructive'
        };
    }
  };

  const config = getErrorConfig(errorType);
  const IconComponent = config.icon;

  return (
    <Card className={`border-destructive/20 bg-destructive/5 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <IconComponent className="w-5 h-5" />
          {config.title}
          <Badge variant="outline" className={`ml-auto ${config.color} border-current`}>
            {config.badge}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {config.description}
          </p>
          <p className="text-sm text-muted-foreground">
            {errorMessage || config.suggestion}
          </p>
        </div>

        {showTechnicalDetails && errorMessage && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Detalhes Técnicos</AlertTitle>
            <AlertDescription className="text-xs font-mono bg-muted p-2 rounded mt-2">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
          {onReload && (
            <Button
              onClick={onReload}
              variant="default"
              size="sm"
              className="flex-1"
            >
              Recarregar Página
            </Button>
          )}
        </div>

        {errorType === 'timezone' && (
          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3 h-3 text-blue-600" />
              <span className="font-medium text-blue-800">Dica sobre Horário</span>
            </div>
            <p className="text-blue-700">
              O desafio funciona baseado no horário de Brasília (UTC-3). 
              Se você está em outro fuso horário, isso é normal e não afeta seu progresso.
            </p>
          </div>
        )}

        {errorType === 'network' && (
          <div className="text-xs text-muted-foreground bg-red-50 p-3 rounded border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-3 h-3 text-red-600" />
              <span className="font-medium text-red-800">Verificação de Conexão</span>
            </div>
            <p className="text-red-700">
              Verifique se você está conectado à internet. 
              Alguns recursos podem funcionar offline, mas a sincronização requer conexão.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Fallback UI component for when challenge data cannot be calculated
 */
export function ChallengeFallbackDisplay({
  title = 'Modo Limitado',
  message = 'Alguns recursos estão temporariamente indisponíveis',
  showBasicInterface = true,
  onRetry,
  className = ''
}: {
  title?: string;
  message?: string;
  showBasicInterface?: boolean;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">{title}</AlertTitle>
        <AlertDescription className="text-yellow-700">
          {message}
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="ghost"
              size="sm"
              className="ml-2 h-auto p-1 text-yellow-700 hover:text-yellow-800"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Tentar novamente
            </Button>
          )}
        </AlertDescription>
      </Alert>

      {showBasicInterface && (
        <Card className="bg-gradient-card border-border/20">
          <CardContent className="text-center py-8">
            <div className="space-y-3">
              <div className="text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2" />
              </div>
              <h3 className="font-semibold text-foreground">
                Interface Básica Disponível
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Você ainda pode usar as funcionalidades básicas do desafio. 
                O progresso será sincronizado quando a conexão for restabelecida.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}