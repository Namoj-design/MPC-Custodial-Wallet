import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { getPendingApprovals, subscribeToUpdates } from '@/api/services';
import { Transaction } from '@/types';
import { WealthManagerLayout } from '@/components/layouts/WealthManagerLayout';
import { format } from 'date-fns';

export default function Approvals() {
  const [pending, setPending] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await getPendingApprovals();
    if (res.success && res.data) {
      setPending(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToUpdates(fetchData);
    return unsubscribe;
  }, []);

  return (
    <WealthManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and approve client transactions</p>
        </div>

        <Card>
          {loading ? (
            <PageLoader />
          ) : pending.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="All caught up"
              description="No pending transactions require your approval."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Client
                    </th>
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
                      Created
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pending.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-foreground">{tx.clientId}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-foreground">{tx.recipientAccountId}</p>
                        {tx.memo && (
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{tx.memo}</p>
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
                        <Button size="sm" asChild>
                          <Link to={`/manager/transactions/${tx.id}`} className="gap-1">
                            Review
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
    </WealthManagerLayout>
  );
}
