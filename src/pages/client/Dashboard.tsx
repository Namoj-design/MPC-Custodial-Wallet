import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Wallet, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, StatCard } from '@/components/shared/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/state/wallet';
import { getTransactions, subscribeToUpdates } from '@/api/services';
import { Transaction } from '@/types';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { formatDistanceToNow } from 'date-fns';

export default function ClientDashboard() {
  const { accountId, balance } = useWallet();
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

  const pendingCount = transactions.filter(
    tx => tx.status === 'PENDING_APPROVAL' || tx.status === 'PARTIALLY_APPROVED'
  ).length;
  
  const executedCount = transactions.filter(tx => tx.status === 'EXECUTED').length;

  return (
    <ClientLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              MPC Role: <span className="font-medium text-foreground">Client</span>
            </p>
          </div>
          <Button asChild>
            <Link to="/client/transaction/new" className="gap-2">
              <ArrowUpRight className="w-4 h-4" />
              New Transaction
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="HBAR Balance"
            value={`ℏ ${balance?.toLocaleString() || '0'}`}
            icon={<Wallet className="w-5 h-5" />}
          />
          <StatCard
            label="Pending Approvals"
            value={pendingCount}
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            label="Executed"
            value={executedCount}
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader
            title="Recent Transactions"
            description="Your latest transaction activity"
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link to="/client/transactions">View all</Link>
              </Button>
            }
          />

          {loading ? (
            <PageLoader />
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Create your first transaction to get started."
              action={
                <Button asChild>
                  <Link to="/client/transaction/new">Create Transaction</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <Link
                  key={tx.id}
                  to={`/client/transaction/review/${tx.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-foreground truncate">
                        To: {tx.recipientAccountId}
                      </p>
                      <StatusBadge status={tx.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                      {tx.memo && ` • ${tx.memo}`}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground ml-4">
                    ℏ {tx.amount.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ClientLayout>
  );
}
