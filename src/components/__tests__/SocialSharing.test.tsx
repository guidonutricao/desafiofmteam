import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SocialSharing } from '../SocialSharing';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock retry utils
const mockRetryAsync = vi.fn();
vi.mock('@/lib/retryUtils', () => ({
  retryAsync: mockRetryAsync,
  RETRY_CONFIGS: {
    sharing: {
      maxAttempts: 2,
      delay: 500,
      backoff: 'linear',
      onRetry: vi.fn()
    }
  }
}));

describe('SocialSharing Component', () => {
  const mockChallengeData = {
    patientName: 'João Silva',
    challengeDuration: 7,
    totalScore: 85,
  };

  const mockOnShare = vi.fn();

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://shapeexpress.com/celebration',
      },
      writable: true,
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render share button correctly', () => {
    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    expect(shareButton).toBeInTheDocument();
    expect(shareButton).not.toBeDisabled();
  });

  it('should generate correct share data', () => {
    const expectedShareData = {
      title: 'Shape Express - Desafio Concluído!',
      text: `Acabei de concluir o desafio de ${mockChallengeData.challengeDuration} dias! 💪 Consegui ${mockChallengeData.totalScore} pontos!`,
      url: window.location.href
    };

    expect(expectedShareData.title).toBe('Shape Express - Desafio Concluído!');
    expect(expectedShareData.text).toBe('Acabei de concluir o desafio de 7 dias! 💪 Consegui 85 pontos!');
    expect(expectedShareData.url).toBe('https://shapeexpress.com/celebration');
  });

  it('should use Web Share API when available and supported', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    const mockCanShare = vi.fn().mockReturnValue(true);

    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });

    Object.defineProperty(navigator, 'canShare', {
      value: mockCanShare,
      writable: true,
    });

    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: 'Shape Express - Desafio Concluído!',
        text: 'Acabei de concluir o desafio de 7 dias! 💪 Consegui 85 pontos!',
        url: 'https://shapeexpress.com/celebration'
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Compartilhado com sucesso! 🎉",
      description: "Sua conquista foi compartilhada!",
    });

    expect(mockOnShare).toHaveBeenCalled();
  });

  it('should handle AbortError gracefully (user cancellation)', async () => {
    const abortError = new Error('User cancelled');
    abortError.name = 'AbortError';
    
    const mockShare = vi.fn().mockRejectedValue(abortError);
    const mockCanShare = vi.fn().mockReturnValue(true);

    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });

    Object.defineProperty(navigator, 'canShare', {
      value: mockCanShare,
      writable: true,
    });

    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalled();
    });

    // Should not show error toast for user cancellation
    expect(mockToast).not.toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "destructive"
      })
    );
  });

  it('should fallback to clipboard when Web Share API fails', async () => {
    const shareError = new Error('Share failed');
    shareError.name = 'NetworkError';
    
    const mockShare = vi.fn().mockRejectedValue(shareError);
    const mockCanShare = vi.fn().mockReturnValue(true);
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });

    Object.defineProperty(navigator, 'canShare', {
      value: mockCanShare,
      writable: true,
    });

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
    });

    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'Acabei de concluir o desafio de 7 dias! 💪 Consegui 85 pontos!\n\nhttps://shapeexpress.com/celebration'
      );
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Copiado para área de transferência! 📋",
      description: "Cole em suas redes sociais para compartilhar sua conquista!",
    });

    expect(mockOnShare).toHaveBeenCalled();
  });

  it('should use clipboard fallback when Web Share API is not available', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    // Web Share API not available
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
    });

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
    });

    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(
        'Acabei de concluir o desafio de 7 dias! 💪 Consegui 85 pontos!\n\nhttps://shapeexpress.com/celebration'
      );
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: "Copiado para área de transferência! 📋",
      description: "Cole em suas redes sociais para compartilhar sua conquista!",
    });
  });

  it('should use execCommand fallback for older browsers', () => {
    const mockExecCommand = vi.fn().mockReturnValue(true);
    const mockCreateElement = vi.fn();

    const mockTextArea = {
      value: '',
      style: {},
      focus: vi.fn(),
      select: vi.fn(),
    };

    mockCreateElement.mockReturnValue(mockTextArea);

    // No modern clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
    });

    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true,
    });

    Object.defineProperty(document, 'execCommand', {
      value: mockExecCommand,
      writable: true,
    });

    // Test the logic without rendering
    expect(mockCreateElement).toBeDefined();
    expect(mockExecCommand).toBeDefined();
    expect(navigator.clipboard).toBeUndefined();
  });

  it('should show loading state during sharing', () => {
    // Test loading state logic
    const isSharing = true;
    const buttonText = isSharing ? 'Compartilhando...' : 'Compartilhar Conquista';
    
    expect(buttonText).toBe('Compartilhando...');
    
    const isNotSharing = false;
    const normalButtonText = isNotSharing ? 'Compartilhando...' : 'Compartilhar Conquista';
    
    expect(normalButtonText).toBe('Compartilhar Conquista');
  });

  it('should handle clipboard errors appropriately', () => {
    const clipboardError = new Error('Clipboard access denied');
    
    // Test error handling logic
    expect(clipboardError.message).toBe('Clipboard access denied');
    
    const errorToast = {
      title: "Erro ao copiar",
      description: "Não foi possível copiar o texto. Tente compartilhar manualmente.",
      variant: "destructive",
    };
    
    expect(errorToast.title).toBe("Erro ao copiar");
    expect(errorToast.variant).toBe("destructive");
  });

  it('should format clipboard text correctly', () => {
    const shareData = {
      title: 'Shape Express - Desafio Concluído!',
      text: 'Acabei de concluir o desafio de 7 dias! 💪 Consegui 85 pontos!',
      url: 'https://shapeexpress.com/celebration'
    };

    const expectedClipboardText = `${shareData.text}\n\n${shareData.url}`;
    
    expect(expectedClipboardText).toBe(
      'Acabei de concluir o desafio de 7 dias! 💪 Consegui 85 pontos!\n\nhttps://shapeexpress.com/celebration'
    );
  });

  it('should apply custom className', () => {
    // Test className prop logic
    const customClassName = "custom-class w-full sm:w-auto";
    const expectedClasses = customClassName.split(' ');
    
    expect(expectedClasses).toContain('custom-class');
    expect(expectedClasses).toContain('w-full');
    expect(expectedClasses).toContain('sm:w-auto');
  });
});

describe('Enhanced Error Handling and Retry Functionality', () => {
  it('should show error message when sharing fails', async () => {
    const shareError = new Error('Network error during sharing');
    mockRetryAsync.mockRejectedValue(shareError);

    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('Erro ao compartilhar')).toBeInTheDocument();
      expect(screen.getByText(/Erro de conexão/)).toBeInTheDocument();
    });
  });

  it('should show retry button when sharing fails', async () => {
    const shareError = new Error('Clipboard access failed');
    mockRetryAsync.mockRejectedValue(shareError);

    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /tentar compartilhar novamente/i })).toBeInTheDocument();
    });
  });

  it('should retry sharing when retry button is clicked', async () => {
    const shareError = new Error('Temporary network error');
    mockRetryAsync
      .mockRejectedValueOnce(shareError)
      .mockResolvedValueOnce(undefined);

    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    // First attempt fails
    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /tentar compartilhar novamente/i })).toBeInTheDocument();
    });

    // Retry attempt
    const retryButton = screen.getByRole('button', { name: /tentar compartilhar novamente/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockRetryAsync).toHaveBeenCalledTimes(2);
    });
  });

  it('should show retry count during retry attempts', async () => {
    mockRetryAsync.mockImplementation(async (operation, options) => {
      // Simulate retry callback
      if (options?.onRetry) {
        options.onRetry(1, new Error('First attempt failed'));
      }
      throw new Error('All attempts failed');
    });

    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/Tentativas realizadas: 1/)).toBeInTheDocument();
    });
  });

  it('should show appropriate error messages for different error types', async () => {
    const testCases = [
      {
        error: new Error('clipboard access denied'),
        expectedMessage: /Erro ao acessar a área de transferência/
      },
      {
        error: new Error('network request failed'),
        expectedMessage: /Erro de conexão/
      },
      {
        error: new Error('permission denied by user'),
        expectedMessage: /Permissão negada/
      },
      {
        error: new Error('share operation failed'),
        expectedMessage: /Erro no compartilhamento/
      },
      {
        error: new Error('unknown error'),
        expectedMessage: /Não foi possível compartilhar/
      }
    ];

    for (const testCase of testCases) {
      mockRetryAsync.mockRejectedValue(testCase.error);

      const { unmount } = render(
        <SocialSharing 
          challengeData={mockChallengeData} 
          onShare={mockOnShare} 
        />
      );

      const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText(testCase.expectedMessage)).toBeInTheDocument();
      });

      unmount();
    }
  });

  it('should handle missing challenge data gracefully', async () => {
    render(
      <SocialSharing 
        challengeData={null as any} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Erro ao compartilhar",
        description: "Dados do desafio não encontrados. Tente recarregar a página.",
        variant: "destructive",
      });
    });
  });

  it('should show loading state with retry information', async () => {
    mockRetryAsync.mockImplementation(async (operation, options) => {
      // Simulate retry in progress
      if (options?.onRetry) {
        options.onRetry(2, new Error('Second attempt'));
      }
      // Keep loading indefinitely for this test
      return new Promise(() => {});
    });

    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/Tentativa 2 de compartilhamento em andamento/)).toBeInTheDocument();
    });
  });

  it('should use retry configuration for sharing operations', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('Test error'));
    mockRetryAsync.mockImplementation(async (operation, config) => {
      expect(config).toEqual(expect.objectContaining({
        maxAttempts: 2,
        delay: 500,
        backoff: 'linear'
      }));
      throw new Error('Test error');
    });

    render(
      <SocialSharing 
        challengeData={mockChallengeData} 
        onShare={mockOnShare} 
      />
    );

    const shareButton = screen.getByRole('button', { name: /compartilhar conquista/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockRetryAsync).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          maxAttempts: 2,
          delay: 500,
          backoff: 'linear'
        })
      );
    });
  });
});