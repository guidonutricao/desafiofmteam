import { AlertCircle, CheckCircle2, Asterisk } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldIndicatorProps {
  required?: boolean;
  error?: string;
  success?: boolean;
  className?: string;
}

export function FieldIndicator({ 
  required = false, 
  error, 
  success = false, 
  className 
}: FieldIndicatorProps) {
  if (error) {
    return (
      <div className={cn("flex items-center gap-1 text-red-400", className)}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className={cn("flex items-center gap-1 text-green-400", className)}>
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-sm">Campo válido</span>
      </div>
    );
  }

  if (required) {
    return (
      <div className={cn("flex items-center gap-1 text-amber-400", className)}>
        <Asterisk className="w-3 h-3" />
        <span className="text-xs">Campo obrigatório</span>
      </div>
    );
  }

  return null;
}

interface RequiredAsteriskProps {
  className?: string;
}

export function RequiredAsterisk({ className }: RequiredAsteriskProps) {
  return (
    <span className={cn("text-red-400 ml-1", className)} aria-label="Campo obrigatório">
      *
    </span>
  );
}