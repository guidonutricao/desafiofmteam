import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CelebrationErrorBoundary } from '../CelebrationErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Mock window.location
const mockLocation = {
  href: '',
  reload: vi.fn()
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('CelebrationErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
    console.error = vi.fn(); // Suppress error logs in tests
  });

  it('renders children when there is no error', () => {
    render(
      <CelebrationErrorBoundary>
        <ThrowError shouldThrow={false} />
      </CelebrationErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <CelebrationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CelebrationErrorBoundary>
    );

    expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText(/Ocorreu um erro inesperado ao carregar sua celebração/)).toBeInTheDocument();
  });

  it('shows retry button when error is not auth-related', () => {
    render(
      <CelebrationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CelebrationErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /tentar carregar a celebração novamente/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('shows login button for JWT errors', () => {
    const JWTError = () => {
      throw new Error('JWT token expired');
    };

    render(
      <CelebrationErrorBoundary>
        <JWTError />
      </CelebrationErrorBoundary>
    );

    expect(screen.getByText('Sessão Expirada')).toBeInTheDocument();
    expect(screen.getByText(/Sua sessão expirou/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ir para página de login/i })).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <CelebrationErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </CelebrationErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('calls onRetry callback when retry button is clicked', () => {
    const onRetry = vi.fn();

    render(
      <CelebrationErrorBoundary onRetry={onRetry}>
        <ThrowError shouldThrow={true} />
      </CelebrationErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /tentar carregar a celebração novamente/i });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  it('limits retry attempts to maximum allowed', () => {
    const onRetry = vi.fn();
    let shouldThrow = true;

    const RetryableComponent = () => {
      if (shouldThrow) {
        throw new Error('Retryable error');
      }
      return <div>Success</div>;
    };

    const { rerender } = render(
      <CelebrationErrorBoundary onRetry={onRetry}>
        <RetryableComponent />
      </CelebrationErrorBoundary>
    );

    // Click retry button multiple times
    for (let i = 0; i < 5; i++) {
      const retryButton = screen.queryByRole('button', { name: /tentar carregar a celebração novamente/i });
      if (retryButton) {
        fireEvent.click(retryButton);
        rerender(
          <CelebrationErrorBoundary onRetry={onRetry}>
            <RetryableComponent />
          </CelebrationErrorBoundary>
        );
      }
    }

    // Should only allow 3 retries
    expect(onRetry).toHaveBeenCalledTimes(3);
  });

  it('navigates to challenge page when challenge button is clicked', () => {
    render(
      <CelebrationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CelebrationErrorBoundary>
    );

    const challengeButton = screen.getByRole('button', { name: /voltar para página do desafio diário/i });
    fireEvent.click(challengeButton);

    expect(mockLocation.href).toBe('/desafio-diario');
  });

  it('navigates to home page when home button is clicked', () => {
    render(
      <CelebrationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CelebrationErrorBoundary>
    );

    const homeButton = screen.getByRole('button', { name: /ir para página inicial/i });
    fireEvent.click(homeButton);

    expect(mockLocation.href).toBe('/');
  });

  it('shows error ID for technical support', () => {
    render(
      <CelebrationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CelebrationErrorBoundary>
    );

    const technicalInfo = screen.getByText('Informações técnicas');
    fireEvent.click(technicalInfo);

    expect(screen.getByText(/ID do erro:/)).toBeInTheDocument();
  });

  it('provides appropriate error messages for different error types', () => {
    const NetworkError = () => {
      throw new Error('Network request failed');
    };

    render(
      <CelebrationErrorBoundary>
        <NetworkError />
      </CelebrationErrorBoundary>
    );

    expect(screen.getByText(/Erro de conexão/)).toBeInTheDocument();
  });

  it('shows motivational message to reassure users', () => {
    render(
      <CelebrationErrorBoundary>
        <ThrowError shouldThrow={true} />
      </CelebrationErrorBoundary>
    );

    expect(screen.getByText(/Não se preocupe! Seus dados do desafio estão seguros/)).toBeInTheDocument();
  });
});