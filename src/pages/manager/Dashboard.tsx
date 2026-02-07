import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, Briefcase } from 'lucide-react';
import { Card, CardHeader, StatCard } from '@/components/shared/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/state/wallet';
import { getPendingApprovals, getTransactions, subscribeToUpdates } from '@/api/services';
import { Transaction } from '@/types';
import { WealthManagerLayout } from '@/components/layouts/WealthManagerLayout';
import { formatDistanceToNow } from 'date-fns';

export default function ManagerDashboard() {
  const { accountId } = useWallet();
  const [pending, setPending] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [pendingRes, allRes] = await Promise.all([
      getPendingApprovals(),
      getTransactions(),
    ]);
    
    if (pendingRes.success && pendingRes.data) {
      setPending(pendingRes.data);
    }
    if (allRes.success && allRes.data) {
      setAllTransactions(allRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToUpdates(fetchData);
    return unsubscribe;
  }, [accountId]);

  const needsMyApproval = pending.filter(tx => !tx.approvals.wealthManager);
  const approvedByMe = allTransactions.filter(tx => tx.approvals.wealthManager);
  const rejectedCount = allTransactions.filter(tx => tx.status === 'REJECTED').length;

  return (
    <WealthManagerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Approval Dashboard</h1>
          <p className="text-muted-foreground">
            MPC Role: <span className="font-medium text-foreground">Wealth Manager</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Pending Approvals"
            value={needsMyApproval.length}
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            label="Approved by Me"
            value={approvedByMe.length}
            icon={<CheckCircle2 className="w-5 h-5" />}
          />
          <StatCard
            label="Rejected"
            value={rejectedCount}
            icon={<AlertCircle className="w-5 h-5" />}
          />
        </div>

        {/* Pending Approvals */}
        <Card>
          <CardHeader
            title="Needs Your Approval"
            description="Review and approve pending client transactions"
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link to="/manager/approvals">View all</Link>
              </Button>
            }
          />

          {loading ? (
            <PageLoader />
          ) : needsMyApproval.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No pending approvals"
              description="All client transactions have been reviewed."
            />
          ) : (
            <div className="space-y-3">
              {needsMyApproval.slice(0, 5).map((tx) => (
                <Link
                  key={tx.id}
                  to={`/manager/transactions/${tx.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-warning/30 bg-warning/5 hover:bg-warning/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-foreground">
                        Client: {tx.clientId}
                      </p>
                      <StatusBadge status={tx.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      To: {tx.recipientAccountId} • {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-foreground">ℏ {tx.amount.toLocaleString()}</p>
                    <Button size="sm" className="mt-2">Review</Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader
            title="Recent Approvals"
            description="Your recent approval activity"
          />

          {approvedByMe.length === 0 ? (
            <EmptyState
              title="No approvals yet"
              description="Approved transactions will appear here."
            />
          ) : (
            <div className="space-y-3">
              {approvedByMe.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      To: {tx.recipientAccountId}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(tx.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-foreground">ℏ {tx.amount.toLocaleString()}</p>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </WealthManagerLayout>
  );
}
