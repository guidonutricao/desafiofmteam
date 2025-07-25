import React, { useEffect, useRef } from 'react';
import { generateId, getAriaDescribedBy, announceValidationError, announceValidationSuccess } from '@/lib/accessibility';
import { cn } from '@/lib/utils';

interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function AccessibleForm({ 
  children, 
  onSubmit, 
  ariaLabel, 
  ariaDescribedBy,
  className,
  ...props 
}: AccessibleFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useRef(generateId('form'));

  return (
    <form
      ref={formRef}
      id={formId.current}
      onSubmit={onSubmit}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={cn('space-y-4', className)}
      noValidate // We handle validation ourselves
      {...props}
    >
      {children}
    </form>
  );
}

interface AccessibleFieldProps {
  children: React.ReactNode;
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  fieldId?: string;
  className?: string;
}

export function AccessibleField({
  children,
  label,
  required = false,
  error,
  helpText,
  fieldId,
  className
}: AccessibleFieldProps) {
  const id = fieldId || generateId('field');
  const labelId = `${id}-label`;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  
  // Announce validation changes to screen readers
  const previousError = useRef<string | undefined>();
  
  useEffect(() => {
    if (error && error !== previousError.current) {
      announceValidationError(label, error);
    } else if (!error && previousError.current) {
      announceValidationSuccess(label);
    }
    previousError.current = error;
  }, [error, label]);

  return (
    <div className={cn('space-y-2', className)}>
      <label
        id={labelId}
        htmlFor={id}
        className="text-zinc-200 font-medium flex items-center"
      >
        {label}
        {required && (
          <span 
            className="text-red-400 ml-1" 
            aria-label="Campo obrigatório"
            role="img"
          >
            *
          </span>
        )}
      </label>
      
      {React.cloneElement(children as React.ReactElement, {
        id,
        'aria-labelledby': labelId,
        'aria-describedby': getAriaDescribedBy(id, !!error, !!helpText),
        'aria-invalid': error ? 'true' : 'false',
        'aria-required': required ? 'true' : 'false'
      })}
      
      {helpText && (
        <p 
          id={helpId} 
          className="text-xs text-zinc-400"
          role="note"
        >
          {helpText}
        </p>
      )}
      
      {error && (
        <div 
          id={errorId}
          className="flex items-center gap-1 text-red-400"
          role="alert"
          aria-live="polite"
        >
          <svg 
            className="w-4 h-4" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export function AccessibleButton({
  children,
  loading = false,
  loadingText = 'Carregando...',
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  ...props
}: AccessibleButtonProps) {
  const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-zinc-900 focus:ring-amber-500',
    secondary: 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100 border border-zinc-600 focus:ring-zinc-500',
    destructive: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      aria-disabled={disabled || loading ? 'true' : 'false'}
      {...props}
    >
      {loading ? (
        <>
          <svg 
            className="w-4 h-4 mr-2 animate-spin" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export function AccessibleInput({
  error = false,
  success = false,
  className,
  ...props
}: AccessibleInputProps) {
  const baseClasses = 'bg-zinc-800 border text-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors px-3 py-2 rounded-md';
  
  const stateClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : success 
      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
      : 'border-zinc-600 focus:border-amber-500 focus:ring-amber-500';

  return (
    <input
      className={cn(baseClasses, stateClasses, className)}
      {...props}
    />
  );
}

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-500 text-zinc-900 px-4 py-2 rounded-md font-medium z-50 focus:outline-none focus:ring-2 focus:ring-amber-600"
    >
      {children}
    </a>
  );
}