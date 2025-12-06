import { ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { HederaTransaction } from '@/hooks/useHederaWallet';

interface HederaTransactionTableProps {
  transactions: HederaTransaction[];
  accountId: string;
  isLoading: boolean;
  onRefresh: () => void;
  className?: string;
}

export function HederaTransactionTable({
  transactions,
  accountId,
  isLoading,
  onRefresh,
  className = '',
}: HederaTransactionTableProps) {
  const formatTimestamp = (timestamp: string) => {
    // Hedera timestamp format: "1234567890.000000000"
    const [seconds] = timestamp.split('.');
    const date = new Date(parseInt(seconds) * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateHash = (hash: string) => {
    if (!hash) return '-';
    const decoded = hash.length > 20 ? hash : hash;
    return `${decoded.slice(0, 8)}...${decoded.slice(-6)}`;
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Real Hedera Transactions</h2>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No transactions found for this account.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">From/To</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hash</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-border/30 hover:bg-accent/20 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {tx.type === 'send' ? (
                        <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                          <ArrowUpRight className="w-4 h-4 text-destructive" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                          <ArrowDownLeft className="w-4 h-4 text-success" />
                        </div>
                      )}
                      <span className="font-medium capitalize">{tx.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`font-semibold ${tx.type === 'send' ? 'text-destructive' : 'text-success'}`}>
                      {tx.type === 'send' ? '-' : '+'}
                      {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} {tx.currency}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm text-muted-foreground">
                      {tx.type === 'send' ? tx.recipient : tx.sender || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(tx.timestamp)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => window.open(`https://hashscan.io/mainnet/transaction/${tx.id}`, '_blank')}
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-mono text-sm"
                    >
                      {truncateHash(tx.hash)}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
