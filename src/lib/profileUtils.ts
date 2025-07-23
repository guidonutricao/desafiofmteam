/**
 * Profile utilities - centralized exports for profile-related utilities
 */

// Validation utilities
export {
  validateImageFile,
  hasValidImageExtension,
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  MAX_FILE_SIZE,
  type FileValidationResult,
  type ValidationResult
} from './validation';

// Image processing utilities
export {
  compressImage,
  createImagePreview,
  revokeImagePreview,
  fileToBase64,
  getImageDimensions,
  type CompressionOptions
} from './imageUtils';

// Error handling utilities
export {
  handleError,
  handleAuthError,
  handleStorageError,
  handleNetworkError,
  handleDatabaseError,
  getErrorMessage,
  isRetryableError,
  createError,
  ErrorType,
  FORM_ERROR_MESSAGES,
  type AppError
} from './errorUtils';