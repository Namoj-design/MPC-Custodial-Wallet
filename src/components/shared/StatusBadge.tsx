import { cn } from '@/lib/utils';
import { TransactionStatus } from '@/types';

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

const statusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  PENDING_APPROVAL: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  PARTIALLY_APPROVED: {
    label: 'Partially Approved',
    className: 'bg-accent/10 text-accent border-accent/20',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-success/10 text-success border-success/20',
  },
  EXECUTING: {
    label: 'Executing',
    className: 'bg-accent/10 text-accent border-accent/20 animate-pulse',
  },
  EXECUTED: {
    label: 'Executed',
    className: 'bg-success/10 text-success border-success/20',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
