/**
 * Error handling utilities for consistent error messages
 * Requirements: 5.3 - Error feedback with descriptive messages
 */

export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  STORAGE = 'storage',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  code?: string;
}

/**
 * Creates a standardized error object
 */
export function createError(
  type: ErrorType,
  message: string,
  originalError?: Error,
  code?: string
): AppError {
  return {
    type,
    message,
    originalError,
    code
  };
}

/**
 * Handles Supabase authentication errors
 */
export function handleAuthError(error: any): AppError {
  const message = error?.message || 'Erro de autenticação';
  
  switch (error?.message) {
    case 'Invalid login credentials':
      return createError(
        ErrorType.AUTHENTICATION,
        'Credenciais inválidas. Verifique seu email e senha.',
        error
      );
    case 'Email not confirmed':
      return createError(
        ErrorType.AUTHENTICATION,
        'Email não confirmado. Verifique sua caixa de entrada.',
        error
      );
    case 'Password should be at least 6 characters':
      return createError(
        ErrorType.VALIDATION,
        'A senha deve ter pelo menos 6 caracteres.',
        error
      );
    case 'User already registered':
      return createError(
        ErrorType.VALIDATION,
        'Este email já está cadastrado.',
        error
      );
    default:
      return createError(
        ErrorType.AUTHENTICATION,
        `Erro de autenticação: ${message}`,
        error
      );
  }
}

/**
 * Handles Supabase storage errors
 */
export function handleStorageError(error: any): AppError {
  const message = error?.message || 'Erro no armazenamento';
  
  if (message.includes('File size too large')) {
    return createError(
      ErrorType.STORAGE,
      'Arquivo muito grande. O tamanho máximo é 5MB.',
      error
    );
  }
  
  if (message.includes('Invalid file type')) {
    return createError(
      ErrorType.STORAGE,
      'Tipo de arquivo não suportado. Use apenas imagens.',
      error
    );
  }
  
  if (message.includes('Permission denied')) {
    return createError(
      ErrorType.PERMISSION,
      'Você não tem permissão para realizar esta ação.',
      error
    );
  }
  
  return createError(
    ErrorType.STORAGE,
    `Erro no upload: ${message}`,
    error
  );
}

/**
 * Handles network/connection errors
 */
export function handleNetworkError(error: any): AppError {
  if (!navigator.onLine) {
    return createError(
      ErrorType.NETWORK,
      'Sem conexão com a internet. Verifique sua conexão.',
      error
    );
  }
  
  if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
    return createError(
      ErrorType.NETWORK,
      'Erro de conexão. Tente novamente em alguns instantes.',
      error
    );
  }
  
  return createError(
    ErrorType.NETWORK,
    'Erro de rede. Verifique sua conexão.',
    error
  );
}

/**
 * Handles database/query errors
 */
export function handleDatabaseError(error: any): AppError {
  const message = error?.message || 'Erro no banco de dados';
  
  if (message.includes('duplicate key')) {
    return createError(
      ErrorType.VALIDATION,
      'Este registro já existe.',
      error
    );
  }
  
  if (message.includes('foreign key')) {
    return createError(
      ErrorType.VALIDATION,
      'Erro de referência de dados.',
      error
    );
  }
  
  if (message.includes('not null')) {
    return createError(
      ErrorType.VALIDATION,
      'Campos obrigatórios não preenchidos.',
      error
    );
  }
  
  return createError(
    ErrorType.UNKNOWN,
    `Erro no banco de dados: ${message}`,
    error
  );
}

/**
 * Generic error handler that categorizes different types of errors
 */
export function handleError(error: any): AppError {
  // Handle null/undefined errors
  if (!error) {
    return createError(ErrorType.UNKNOWN, 'Erro desconhecido');
  }
  
  // Handle already processed AppError
  if (error.type && error.message) {
    return error as AppError;
  }
  
  // Handle different error types
  const errorMessage = error?.message || error?.toString() || 'Erro desconhecido';
  
  // Authentication errors
  if (errorMessage.includes('auth') || errorMessage.includes('login') || errorMessage.includes('password')) {
    return handleAuthError(error);
  }
  
  // Storage errors
  if (errorMessage.includes('storage') || errorMessage.includes('upload') || errorMessage.includes('file')) {
    return handleStorageError(error);
  }
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return handleNetworkError(error);
  }
  
  // Database errors
  if (errorMessage.includes('database') || errorMessage.includes('query') || errorMessage.includes('table')) {
    return handleDatabaseError(error);
  }
  
  // Default to unknown error
  return createError(
    ErrorType.UNKNOWN,
    errorMessage,
    error
  );
}

/**
 * Gets user-friendly error message for display
 */
export function getErrorMessage(error: AppError | Error | string): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return error.message || 'Erro desconhecido';
}

/**
 * Checks if error is retryable (network/temporary errors)
 */
export function isRetryableError(error: AppError): boolean {
  return error.type === ErrorType.NETWORK || 
         (error.type === ErrorType.UNKNOWN && error.message.includes('timeout'));
}

/**
 * Creates error messages for form validation
 */
export const FORM_ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Email inválido',
  PASSWORD_TOO_SHORT: 'Senha deve ter pelo menos 6 caracteres',
  PASSWORDS_DONT_MATCH: 'Senhas não coincidem',
  NAME_TOO_SHORT: 'Nome deve ter pelo menos 2 caracteres',
  NAME_TOO_LONG: 'Nome deve ter no máximo 100 caracteres',
  FILE_TOO_LARGE: 'Arquivo muito grande (máximo 5MB)',
  INVALID_FILE_TYPE: 'Tipo de arquivo não suportado',
  UPLOAD_FAILED: 'Falha no upload do arquivo',
  SAVE_FAILED: 'Falha ao salvar os dados',
  LOAD_FAILED: 'Falha ao carregar os dados'
} as const;