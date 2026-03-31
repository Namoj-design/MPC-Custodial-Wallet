import { cn } from '@/lib/utils';
import { MPCStep } from '@/types/mpc';
import { Check, Loader2, Circle } from 'lucide-react';

interface MPCSigningProgressProps {
  steps: MPCStep[];
  className?: string;
}

export function MPCSigningProgress({ steps, className }: MPCSigningProgressProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} className="flex gap-3">
            {/* Vertical line + icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0',
                  step.status === 'completed' && 'bg-success border-success text-success-foreground',
                  step.status === 'active' && 'bg-accent/10 border-accent text-accent',
                  step.status === 'pending' && 'bg-muted border-border text-muted-foreground'
                )}
              >
                {step.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                {step.status === 'active' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {step.status === 'pending' && <Circle className="w-3 h-3" />}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 h-8',
                    step.status === 'completed' ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  step.status === 'completed' && 'text-foreground',
                  step.status === 'active' && 'text-accent',
                  step.status === 'pending' && 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
