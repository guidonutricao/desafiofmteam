import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

/**
 * Specialized Error Boundary for the Celebration Page
 * Provides celebration-themed error handling with retry mechanisms
 * Requirements: 3.5, 5.4 - Comprehensive error boundaries and user-friendly error messages
 */
export class CelebrationErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `celebration_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CelebrationErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details for debugging
    console.error('Celebration page error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    });
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount <= this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        retryCount: newRetryCount
      });

      // Call optional retry handler
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoToChallenge = () => {
    window.location.href = '/desafio-diario';
  };

  getErrorMessage = (): string => {
    if (!this.state.error) return 'Erro desconhecido';

    const errorMessage = this.state.error.message.toLowerCase();
    
    if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
      return 'Sua sessão expirou. Faça login novamente para ver sua celebração.';
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    if (errorMessage.includes('data') || errorMessage.includes('challenge')) {
      return 'Erro ao carregar os dados do seu desafio. Vamos tentar novamente.';
    }
    
    return 'Ocorreu um erro inesperado ao carregar sua celebração.';
  };

  getErrorTitle = (): string => {
    if (!this.state.error) return 'Ops! Algo deu errado';

    const errorMessage = this.state.error.message.toLowerCase();
    
    if (errorMessage.includes('jwt') || errorMessage.includes('token')) {
      return 'Sessão Expirada';
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Erro de Conexão';
    }
    
    return 'Ops! Algo deu errado';
  };

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries;
      const isAuthError = this.state.error?.message.includes('JWT') || 
                         this.state.error?.message.includes('token');

      return (
        <div 
          className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4"
          role="main"
          aria-label="Erro na página de celebração"
        >
          <div className="text-center space-y-6 p-8 max-w-lg mx-auto">
            {/* Error Icon */}
            <div 
              className="p-6 rounded-full bg-red-100 w-fit mx-auto"
              role="img"
              aria-label="Ícone de erro"
            >
              <AlertTriangle className="w-12 h-12 text-red-600" aria-hidden="true" />
            </div>

            {/* Error Content */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {this.getErrorTitle()}
              </h1>
              
              <div className="space-y-2">
                <p className="text-gray-600 text-lg" role="alert" aria-live="polite">
                  {this.getErrorMessage()}
                </p>
                
                {this.state.retryCount > 0 && (
                  <p className="text-sm text-gray-500">
                    Tentativa {this.state.retryCount} de {this.maxRetries}
                  </p>
                )}
              </div>

              {/* Error ID for support */}
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Informações técnicas
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs font-mono text-gray-600">
                  <p>ID do erro: {this.state.errorId}</p>
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="mt-2 text-red-600">
                      <p>Erro: {this.state.error.message}</p>
                      <p>Stack: {this.state.error.stack?.substring(0, 200)}...</p>
                    </div>
                  )}
                </div>
              </details>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              {canRetry && !isAuthError && (
                <Button 
                  onClick={this.handleRetry}
                  className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                  aria-label="Tentar carregar a celebração novamente"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Tentar novamente
                </Button>
              )}
              
              {isAuthError && (
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                  aria-label="Ir para página de login"
                >
                  Fazer Login
                </Button>
              )}
              
              <Button 
                onClick={this.handleGoToChallenge}
                variant="outline"
                className="gap-2"
                aria-label="Voltar para página do desafio diário"
              >
                <Trophy className="w-4 h-4" aria-hidden="true" />
                Ir para Desafio
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="gap-2"
                aria-label="Ir para página inicial"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Página Inicial
              </Button>
            </div>

            {/* Motivational Message */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Não se preocupe! Seus dados do desafio estão seguros. 
                Tente novamente em alguns instantes.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with CelebrationErrorBoundary
 */
export function withCelebrationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  onError?: (error: Error, errorInfo: ErrorInfo) => void,
  onRetry?: () => void
) {
  return function WrappedComponent(props: P) {
    return (
      <CelebrationErrorBoundary onError={onError} onRetry={onRetry}>
        <Component {...props} />
      </CelebrationErrorBoundary>
    );
  };
}