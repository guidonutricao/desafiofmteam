// File upload validation utilities
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates if a file is a valid image for profile photo upload
 * Requirements: 2.1 - Validate file extensions (.jpg, .jpeg, .png, .webp)
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de arquivo não suportado. Use apenas .jpg, .jpeg, .png ou .webp'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'Arquivo muito grande. O tamanho máximo é 5MB'
    };
  }

  // Check file extension as additional validation
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: 'Extensão de arquivo não suportada. Use apenas .jpg, .jpeg, .png ou .webp'
    };
  }

  return { isValid: true };
}

/**
 * Validates file extension
 */
export function hasValidImageExtension(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ALLOWED_IMAGE_EXTENSIONS.includes(extension);
}

// Form validation utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates name field
 * Requirements: 3.2 - Validate that name field is not empty
 */
export function validateName(name: string): ValidationResult {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return {
      isValid: false,
      error: 'Nome é obrigatório'
    };
  }

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: 'Nome deve ter pelo menos 2 caracteres'
    };
  }

  if (trimmedName.length > 100) {
    return {
      isValid: false,
      error: 'Nome deve ter no máximo 100 caracteres'
    };
  }

  return { isValid: true };
}

/**
 * Validates email format
 * Requirements: 3.3 - Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return {
      isValid: false,
      error: 'Email é obrigatório'
    };
  }

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Formato de email inválido'
    };
  }

  return { isValid: true };
}

/**
 * Validates password
 * Requirements: 4.3 - Validate minimum 6 characters
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return {
      isValid: false,
      error: 'Senha é obrigatória'
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Senha deve ter pelo menos 6 caracteres'
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: 'Senha deve ter no máximo 128 caracteres'
    };
  }

  return { isValid: true };
}

/**
 * Validates password confirmation
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return {
      isValid: false,
      error: 'Confirmação de senha é obrigatória'
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Senhas não coincidem'
    };
  }

  return { isValid: true };
}