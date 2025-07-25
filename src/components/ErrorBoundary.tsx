import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Error Boundary component for catching unexpected errors
 * Requirements: Create error boundary components for unexpected errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
          <Card className="bg-zinc-800 border-zinc-700 max-w-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                Ops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-zinc-300">
                <p className="mb-2">
                  Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
                </p>
                <p className="text-sm text-zinc-400">
                  ID do erro: <code className="bg-zinc-700 px-1 rounded">{this.state.errorId}</code>
                </p>
              </div>

              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-zinc-700 p-3 rounded text-xs">
                  <summary className="cursor-pointer text-zinc-300 mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="text-red-300 font-mono whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </div>
                </details>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-zinc-900"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Specialized error boundary for form components
 */
export function FormErrorBoundary({ 
  children, 
  onError 
}: { 
  children: ReactNode; 
  onError?: (error: Error) => void;
}) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Form error:', error, errorInfo);
    if (onError) {
      onError(error);
    }
  };

  const fallback = (
    <Card className="bg-zinc-800 border-red-500/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-red-400 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Erro no formulário</span>
        </div>
        <p className="text-zinc-300 text-sm mb-4">
          Ocorreu um erro inesperado neste formulário. Tente recarregar a página.
        </p>
        <Button
          onClick={() => window.location.reload()}
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-zinc-900"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Recarregar página
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}