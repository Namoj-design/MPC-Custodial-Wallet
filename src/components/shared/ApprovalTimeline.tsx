import { Check, Clock, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApprovalState } from '@/types';

interface ApprovalTimelineProps {
  approvals: ApprovalState;
  className?: string;
}

interface TimelineStep {
  key: keyof ApprovalState;
  label: string;
}

const steps: TimelineStep[] = [
  { key: 'client', label: 'Client' },
  { key: 'wealthManager', label: 'Wealth Manager' },
  { key: 'custody', label: 'Custody' },
];

export function ApprovalTimeline({ approvals, className }: ApprovalTimelineProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {steps.map((step, index) => {
        const isApproved = approvals[step.key];
        const isPending = !isApproved && steps.slice(0, index).every(s => approvals[s.key]);
        const isWaiting = !isApproved && !isPending;

        return (
          <div
            key={step.key}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-all duration-300',
              isApproved && 'bg-success/5 border-success/20',
              isPending && 'bg-warning/5 border-warning/20',
              isWaiting && 'bg-muted/50 border-border'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300',
                isApproved && 'bg-success text-success-foreground',
                isPending && 'bg-warning text-warning-foreground animate-pulse',
                isWaiting && 'bg-muted text-muted-foreground'
              )}
            >
              {isApproved && <Check className="w-4 h-4" />}
              {isPending && <Clock className="w-4 h-4" />}
              {isWaiting && <Pause className="w-4 h-4" />}
            </div>
            
            <div className="flex-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  isApproved && 'text-success',
                  isPending && 'text-warning',
                  isWaiting && 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {isApproved && 'Signed'}
                {isPending && 'Awaiting signature'}
                {isWaiting && 'Pending previous approval'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
