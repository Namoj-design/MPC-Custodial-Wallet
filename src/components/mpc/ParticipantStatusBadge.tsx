import { cn } from '@/lib/utils';
import { ParticipantStatus } from '@/types/mpc';
import { Check, Loader2, Clock } from 'lucide-react';

interface ParticipantStatusBadgeProps {
  status: ParticipantStatus;
  className?: string;
}

const config: Record<ParticipantStatus, { label: string; icon: typeof Check; className: string }> = {
  waiting: {
    label: 'Waiting',
    icon: Clock,
    className: 'bg-muted text-muted-foreground border-border',
  },
  connected: {
    label: 'Connected',
    icon: Loader2,
    className: 'bg-accent/10 text-accent border-accent/20',
  },
  signed: {
    label: 'Signed',
    icon: Check,
    className: 'bg-success/10 text-success border-success/20',
  },
};

export function ParticipantStatusBadge({ status, className }: ParticipantStatusBadgeProps) {
  const c = config[status];
  const Icon = c.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        c.className,
        className
      )}
    >
      <Icon className={cn('w-3 h-3', status === 'connected' && 'animate-spin')} />
      {c.label}
    </span>
  );
}
