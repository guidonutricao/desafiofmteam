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

/**
 * Comprehensive form validation for all profile fields
 * Requirements: Add proper error messages for different failure scenarios
 */
export interface ProfileFormData {
  nome: string;
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ProfileFormErrors {
  nome?: string;
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export function validateProfileForm(data: ProfileFormData): {
  isValid: boolean;
  errors: ProfileFormErrors;
} {
  const errors: ProfileFormErrors = {};
  
  // Validate name
  const nameValidation = validateName(data.nome);
  if (!nameValidation.isValid) {
    errors.nome = nameValidation.error;
  }
  
  // Validate email if provided
  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }
  }
  
  // Validate password if provided
  if (data.newPassword) {
    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.error;
    }
    
    // Validate password confirmation if password is provided
    if (data.confirmPassword !== undefined) {
      const confirmValidation = validatePasswordConfirmation(data.newPassword, data.confirmPassword);
      if (!confirmValidation.isValid) {
        errors.confirmPassword = confirmValidation.error;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Real-time field validation with debouncing support
 * Requirements: Add real-time validation feedback for name and password fields
 */
export function validateFieldRealTime(
  fieldName: keyof ProfileFormData,
  value: string,
  otherValues?: Partial<ProfileFormData>
): ValidationResult {
  switch (fieldName) {
    case 'nome':
      return validateName(value);
      
    case 'email':
      return validateEmail(value);
      
    case 'newPassword':
      return validatePassword(value);
      
    case 'confirmPassword':
      if (otherValues?.newPassword !== undefined) {
        return validatePasswordConfirmation(otherValues.newPassword, value);
      }
      return { isValid: true };
      
    default:
      return { isValid: true };
  }
}

/**
 * Enhanced validation messages with context
 */
export const VALIDATION_MESSAGES = {
  NOME: {
    REQUIRED: 'Nome é obrigatório para identificação',
    TOO_SHORT: 'Nome deve ter pelo menos 2 caracteres',
    TOO_LONG: 'Nome deve ter no máximo 100 caracteres',
    INVALID_CHARS: 'Nome contém caracteres inválidos'
  },
  EMAIL: {
    REQUIRED: 'Email é obrigatório',
    INVALID_FORMAT: 'Formato de email inválido (exemplo: usuario@dominio.com)',
    ALREADY_EXISTS: 'Este email já está cadastrado'
  },
  PASSWORD: {
    REQUIRED: 'Senha é obrigatória',
    TOO_SHORT: 'Senha deve ter pelo menos 6 caracteres para segurança',
    TOO_LONG: 'Senha deve ter no máximo 128 caracteres',
    WEAK: 'Senha muito fraca - considere usar letras, números e símbolos',
    CONFIRMATION_REQUIRED: 'Confirmação de senha é obrigatória',
    CONFIRMATION_MISMATCH: 'Senhas não coincidem - digite a mesma senha nos dois campos'
  },
  FILE: {
    INVALID_TYPE: 'Tipo de arquivo não suportado. Use apenas .jpg, .jpeg, .png ou .webp',
    TOO_LARGE: 'Arquivo muito grande. O tamanho máximo é 5MB',
    UPLOAD_FAILED: 'Falha no upload do arquivo. Tente novamente.',
    INVALID_EXTENSION: 'Extensão de arquivo não suportada'
  }
} as const;