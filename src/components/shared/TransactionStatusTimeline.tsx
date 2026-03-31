import { Check, Circle, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimelineStepStatus = 'completed' | 'active' | 'pending' | 'failed';

export interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  status: TimelineStepStatus;
  timestamp?: string;
}

interface TransactionStatusTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

const statusIcon = (status: TimelineStepStatus) => {
  switch (status) {
    case 'completed':
      return <Check className="w-4 h-4" />;
    case 'active':
      return <Loader2 className="w-4 h-4 animate-spin" />;
    case 'failed':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Circle className="w-4 h-4" />;
  }
};

export function TransactionStatusTimeline({ steps, className }: TransactionStatusTimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex gap-3">
            {/* Vertical line + icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                  step.status === 'completed' && 'bg-success border-success text-success-foreground',
                  step.status === 'active' && 'bg-accent/10 border-accent text-accent',
                  step.status === 'failed' && 'bg-destructive/10 border-destructive text-destructive',
                  step.status === 'pending' && 'bg-muted border-border text-muted-foreground'
                )}
              >
                {statusIcon(step.status)}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-[24px] transition-all duration-300',
                    step.status === 'completed' ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium leading-8',
                  step.status === 'completed' && 'text-success',
                  step.status === 'active' && 'text-accent',
                  step.status === 'failed' && 'text-destructive',
                  step.status === 'pending' && 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              )}
              {step.timestamp && (
                <p className="text-xs text-muted-foreground mt-0.5">{step.timestamp}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
