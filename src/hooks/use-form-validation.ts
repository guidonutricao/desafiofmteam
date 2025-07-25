import { useState, useCallback, useEffect } from 'react';
import { 
  validateFieldRealTime, 
  validateProfileForm, 
  ProfileFormData, 
  ProfileFormErrors,
  ValidationResult 
} from '@/lib/validation';
import { handleError, getErrorMessage } from '@/lib/errorUtils';
import { announceValidationError, announceValidationSuccess } from '@/lib/accessibility';

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  onValidationChange?: (isValid: boolean, errors: ProfileFormErrors) => void;
}

export interface FormValidationState {
  errors: ProfileFormErrors;
  validFields: Set<string>;
  isValid: boolean;
  isDirty: boolean;
  isValidating: boolean;
}

export interface UseFormValidationReturn {
  state: FormValidationState;
  validateField: (field: keyof ProfileFormData, value: string, otherValues?: Partial<ProfileFormData>) => ValidationResult;
  validateForm: (data: ProfileFormData) => boolean;
  clearErrors: () => void;
  clearFieldError: (field: keyof ProfileFormData) => void;
  setFieldError: (field: keyof ProfileFormData, error: string) => void;
  markFieldAsValid: (field: keyof ProfileFormData) => void;
  markFieldAsInvalid: (field: keyof ProfileFormData) => void;
  setFormDirty: (dirty: boolean) => void;
  resetValidation: () => void;
}

/**
 * Comprehensive form validation hook with real-time feedback
 * Requirements: Add real-time validation feedback for name and password fields
 */
export function useFormValidation(options: UseFormValidationOptions = {}): UseFormValidationReturn {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    onValidationChange
  } = options;

  const [state, setState] = useState<FormValidationState>({
    errors: {},
    validFields: new Set(),
    isValid: true,
    isDirty: false,
    isValidating: false
  });

  // Debounced validation timer
  const [validationTimer, setValidationTimer] = useState<NodeJS.Timeout | null>(null);

  // Clear validation timer on unmount
  useEffect(() => {
    return () => {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
    };
  }, [validationTimer]);

  // Notify parent component of validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(state.isValid, state.errors);
    }
  }, [state.isValid, state.errors, onValidationChange]);

  const validateField = useCallback((
    field: keyof ProfileFormData, 
    value: string, 
    otherValues?: Partial<ProfileFormData>
  ): ValidationResult => {
    try {
      const result = validateFieldRealTime(field, value, otherValues);
      
      setState(prev => {
        const newErrors = { ...prev.errors };
        const newValidFields = new Set(prev.validFields);
        
        if (result.isValid) {
          delete newErrors[field];
          newValidFields.add(field);
          // Announce success for accessibility
          if (prev.errors[field]) {
            announceValidationSuccess(field);
          }
        } else {
          newErrors[field] = result.error;
          newValidFields.delete(field);
          // Announce error for accessibility
          announceValidationError(field, result.error);
        }
        
        const isValid = Object.keys(newErrors).length === 0;
        
        return {
          ...prev,
          errors: newErrors,
          validFields: newValidFields,
          isValid
        };
      });
      
      return result;
    } catch (error) {
      const appError = handleError(error);
      const errorMessage = getErrorMessage(appError);
      
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: errorMessage
        },
        isValid: false
      }));
      
      return {
        isValid: false,
        error: errorMessage
      };
    }
  }, []);

  const validateFieldDebounced = useCallback((
    field: keyof ProfileFormData, 
    value: string, 
    otherValues?: Partial<ProfileFormData>
  ) => {
    if (validationTimer) {
      clearTimeout(validationTimer);
    }
    
    setState(prev => ({ ...prev, isValidating: true }));
    
    const timer = setTimeout(() => {
      validateField(field, value, otherValues);
      setState(prev => ({ ...prev, isValidating: false }));
    }, debounceMs);
    
    setValidationTimer(timer);
  }, [validateField, debounceMs, validationTimer]);

  const validateForm = useCallback((data: ProfileFormData): boolean => {
    try {
      const result = validateProfileForm(data);
      
      setState(prev => ({
        ...prev,
        errors: result.errors,
        isValid: result.isValid,
        validFields: result.isValid ? new Set(Object.keys(data)) : new Set()
      }));
      
      return result.isValid;
    } catch (error) {
      const appError = handleError(error);
      const errorMessage = getErrorMessage(appError);
      
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          general: errorMessage
        },
        isValid: false
      }));
      
      return false;
    }
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true
    }));
  }, []);

  const clearFieldError = useCallback((field: keyof ProfileFormData) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  const setFieldError = useCallback((field: keyof ProfileFormData, error: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error
      },
      isValid: false
    }));
  }, []);

  const markFieldAsValid = useCallback((field: keyof ProfileFormData) => {
    setState(prev => {
      const newValidFields = new Set(prev.validFields);
      newValidFields.add(field);
      
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      
      return {
        ...prev,
        validFields: newValidFields,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  const markFieldAsInvalid = useCallback((field: keyof ProfileFormData) => {
    setState(prev => {
      const newValidFields = new Set(prev.validFields);
      newValidFields.delete(field);
      
      return {
        ...prev,
        validFields: newValidFields,
        isValid: false
      };
    });
  }, []);

  const setFormDirty = useCallback((dirty: boolean) => {
    setState(prev => ({
      ...prev,
      isDirty: dirty
    }));
  }, []);

  const resetValidation = useCallback(() => {
    setState({
      errors: {},
      validFields: new Set(),
      isValid: true,
      isDirty: false,
      isValidating: false
    });
  }, []);

  return {
    state,
    validateField: validateOnChange ? validateFieldDebounced : validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    setFieldError,
    markFieldAsValid,
    markFieldAsInvalid,
    setFormDirty,
    resetValidation
  };
}

/**
 * Specialized hook for profile form validation
 */
export function useProfileFormValidation() {
  return useFormValidation({
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300
  });
}

/**
 * Specialized hook for password form validation
 */
export interface PasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordFormErrors {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export interface PasswordValidationState {
  errors: PasswordFormErrors;
  validFields: Set<string>;
  isValid: boolean;
  isDirty: boolean;
  isValidating: boolean;
}

export interface UsePasswordValidationReturn {
  state: PasswordValidationState;
  validateField: (field: keyof PasswordFormData, value: string, otherValues?: Partial<PasswordFormData>) => ValidationResult;
  validateForm: (data: PasswordFormData) => boolean;
  clearErrors: () => void;
  setFormDirty: (dirty: boolean) => void;
  resetValidation: () => void;
}

export function usePasswordFormValidation(options: UseFormValidationOptions = {}): UsePasswordValidationReturn {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    onValidationChange
  } = options;

  const [state, setState] = useState<PasswordValidationState>({
    errors: {},
    validFields: new Set(),
    isValid: true,
    isDirty: false,
    isValidating: false
  });

  const [validationTimer, setValidationTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
    };
  }, [validationTimer]);

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(state.isValid, state.errors);
    }
  }, [state.isValid, state.errors, onValidationChange]);

  const validateField = useCallback((
    field: keyof PasswordFormData, 
    value: string, 
    otherValues?: Partial<PasswordFormData>
  ): ValidationResult => {
    try {
      const result = validateFieldRealTime(field as keyof ProfileFormData, value, otherValues);
      
      setState(prev => {
        const newErrors = { ...prev.errors };
        const newValidFields = new Set(prev.validFields);
        
        if (result.isValid) {
          delete newErrors[field];
          newValidFields.add(field);
        } else {
          newErrors[field] = result.error;
          newValidFields.delete(field);
        }
        
        const isValid = Object.keys(newErrors).length === 0;
        
        return {
          ...prev,
          errors: newErrors,
          validFields: newValidFields,
          isValid
        };
      });
      
      return result;
    } catch (error) {
      const appError = handleError(error);
      const errorMessage = getErrorMessage(appError);
      
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: errorMessage
        },
        isValid: false
      }));
      
      return {
        isValid: false,
        error: errorMessage
      };
    }
  }, []);

  const validateFieldDebounced = useCallback((
    field: keyof PasswordFormData, 
    value: string, 
    otherValues?: Partial<PasswordFormData>
  ) => {
    if (validationTimer) {
      clearTimeout(validationTimer);
    }
    
    setState(prev => ({ ...prev, isValidating: true }));
    
    const timer = setTimeout(() => {
      validateField(field, value, otherValues);
      setState(prev => ({ ...prev, isValidating: false }));
    }, debounceMs);
    
    setValidationTimer(timer);
  }, [validateField, debounceMs, validationTimer]);

  const validateForm = useCallback((data: PasswordFormData): boolean => {
    try {
      const profileData: ProfileFormData = {
        nome: '', // Not used for password validation
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      };
      
      const result = validateProfileForm(profileData);
      
      const passwordErrors: PasswordFormErrors = {
        newPassword: result.errors.newPassword,
        confirmPassword: result.errors.confirmPassword
      };
      
      const isValid = !passwordErrors.newPassword && !passwordErrors.confirmPassword;
      
      setState(prev => ({
        ...prev,
        errors: passwordErrors,
        isValid,
        validFields: isValid ? new Set(Object.keys(data)) : new Set()
      }));
      
      return isValid;
    } catch (error) {
      const appError = handleError(error);
      const errorMessage = getErrorMessage(appError);
      
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          general: errorMessage
        },
        isValid: false
      }));
      
      return false;
    }
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true
    }));
  }, []);

  const setFormDirty = useCallback((dirty: boolean) => {
    setState(prev => ({
      ...prev,
      isDirty: dirty
    }));
  }, []);

  const resetValidation = useCallback(() => {
    setState({
      errors: {},
      validFields: new Set(),
      isValid: true,
      isDirty: false,
      isValidating: false
    });
  }, []);

  return {
    state,
    validateField: validateOnChange ? validateFieldDebounced : validateField,
    validateForm,
    clearErrors,
    setFormDirty,
    resetValidation
  };
}