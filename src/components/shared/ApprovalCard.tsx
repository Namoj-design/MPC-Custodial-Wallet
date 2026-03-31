import { CheckCircle, XCircle, Loader2, User, Briefcase } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ApprovalCardProps {
  transaction: Transaction;
  onApprove?: () => void;
  onReject?: () => void;
  approving?: boolean;
  rejecting?: boolean;
  canAct?: boolean;
  className?: string;
}

export function ApprovalCard({
  transaction,
  onApprove,
  onReject,
  approving,
  rejecting,
  canAct,
  className,
}: ApprovalCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <User className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {transaction.clientId}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <StatusBadge status={transaction.status} />
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Recipient</span>
          <span className="text-sm font-mono text-foreground">{transaction.recipientAccountId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="text-sm font-semibold text-foreground">ℏ {transaction.amount.toLocaleString()}</span>
        </div>
        {transaction.memo && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Memo</span>
            <span className="text-sm text-foreground">{transaction.memo}</span>
          </div>
        )}
      </div>

      {canAct && (
        <div className="flex gap-3 p-4 border-t border-border">
          <Button
            onClick={onApprove}
            disabled={approving || rejecting}
            className="flex-1 gap-2 bg-success hover:bg-success/90"
          >
            {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={onReject}
            disabled={approving || rejecting}
            className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive/10"
          >
            {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
}
