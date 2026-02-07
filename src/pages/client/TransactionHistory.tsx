import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, History } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/state/wallet';
import { getTransactions, subscribeToUpdates } from '@/api/services';
import { Transaction } from '@/types';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { format } from 'date-fns';

export default function TransactionHistory() {
  const { accountId } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await getTransactions(accountId || undefined);
    if (res.success && res.data) {
      setTransactions(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToUpdates(fetchData);
    return unsubscribe;
  }, [accountId]);

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Transaction History</h1>
            <p className="text-muted-foreground">All your transactions and their status</p>
          </div>
          <Button asChild>
            <Link to="/client/transaction/new">New Transaction</Link>
          </Button>
        </div>

        <Card>
          {loading ? (
            <PageLoader />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={History}
              title="No transactions"
              description="Your transaction history will appear here."
              action={
                <Button asChild>
                  <Link to="/client/transaction/new">Create Transaction</Link>
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Recipient
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Amount
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Date
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-foreground">{tx.recipientAccountId}</p>
                        {tx.memo && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{tx.memo}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-semibold text-foreground">ℏ {tx.amount.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), 'h:mm a')}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/client/transaction/review/${tx.id}`} className="gap-1">
                            View
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </ClientLayout>
  );
}
