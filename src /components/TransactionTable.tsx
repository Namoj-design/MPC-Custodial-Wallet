import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/services/api';

interface TransactionTableProps {
  transactions: Transaction[];
  className?: string;
}

export function TransactionTable({ transactions, className }: TransactionTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn('glass-card overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Address</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Hash</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-border/50 hover:bg-accent/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        tx.type === 'receive' ? 'bg-success/10' : 'bg-primary/10'
                      )}
                    >
                      {tx.type === 'receive' ? (
                        <ArrowDownLeft className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <span className="font-medium capitalize">{tx.type}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={cn('font-mono font-semibold', tx.type === 'receive' ? 'text-success' : 'text-foreground')}>
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.currency}
                  </span>
                </td>
                <td className="p-4">
                  <span className="font-mono text-sm text-muted-foreground">
                    {tx.type === 'receive' ? tx.sender : tx.recipient}
                  </span>
                </td>
                <td className="p-4">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {formatDate(tx.timestamp)}
                </td>
                <td className="p-4">
                  {tx.hash ? (
                    <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                      <span className="font-mono">{tx.hash}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
