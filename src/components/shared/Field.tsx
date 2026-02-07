import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReactNode, forwardRef } from 'react';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className={cn('space-y-2', className)}>
        <Label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <Input
            ref={ref}
            id={fieldId}
            className={cn(
              'h-11',
              icon && 'pl-10',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);

Field.displayName = 'Field';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className={cn('space-y-2', className)}>
        <Label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <Textarea
          ref={ref}
          id={fieldId}
          className={cn(
            'min-h-[100px] resize-none',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);

TextAreaField.displayName = 'TextAreaField';
