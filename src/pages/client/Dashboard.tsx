import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Wallet, Clock, CheckCircle2, Shield, RefreshCw } from 'lucide-react';
import { Card, CardHeader, StatCard } from '@/components/shared/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/state/auth';
import { getTransactions, subscribeToUpdates, getMyWallet, registerClient } from '@/api/services';
import { Transaction, DFNSWalletInfo } from '@/types';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { LiveUpdateIndicator } from '@/components/shared/LiveUpdateIndicator';
import { useWebSocket } from '@/hooks/useWebSocketSession';
import { useBalanceRefresh } from '@/hooks/useBalanceRefresh';
import { formatDistanceToNow } from 'date-fns';

export default function ClientDashboard() {
  const { user } = useAuth();
  const clientId = user?.userId || '';
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<DFNSWalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useWebSocket({
    onEvent: () => fetchData(),
    autoConnect: !!wallet
  });

  const { balance: dfnsBalance, loading: balanceLoading, refresh: refreshBalance } = useBalanceRefresh(wallet?.walletId);
  const displayBalance = dfnsBalance ?? 0;

  const fetchData = async () => {
    const res = await getTransactions(clientId);
    if (res.success && res.data) {
      setTransactions(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!clientId) return;
    async function init() {
      const walletRes = await getMyWallet(clientId);
      if (walletRes.success && walletRes.data) {
        setWallet(walletRes.data);
        registerClient(clientId, user?.email || clientId, walletRes.data);
      } else {
        registerClient(clientId, user?.email || clientId);
      }
    }
    init();
    fetchData();
    const unsubscribe = subscribeToUpdates(fetchData);
    return unsubscribe;
  }, [clientId]);

  const pendingCount = transactions.filter(
    tx => tx.status === 'PENDING_APPROVAL' || tx.status === 'PARTIALLY_APPROVED'
  ).length;
  
  const confirmedCount = transactions.filter(
    tx => tx.status === 'EXECUTED' || tx.status === 'CONFIRMED'
  ).length;

  return (
    <ClientLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <LiveUpdateIndicator connected={isConnected} />
            <Button asChild>
              <Link to="/client/transaction/new" className="gap-2">
                <ArrowUpRight className="w-4 h-4" />
                New Transaction
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="HBAR Balance"
            value={
              <div className="flex items-center gap-2">
                <span>ℏ {displayBalance.toLocaleString()}</span>
                {wallet && (
                  <button
                    onClick={refreshBalance}
                    className={`p-1 rounded hover:bg-muted transition-colors ${balanceLoading ? 'animate-spin' : ''}`}
                    title="Refresh balance"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            }
            icon={<Wallet className="w-5 h-5" />}
          />
          <StatCard label="Pending Approvals" value={pendingCount} icon={<Clock className="w-5 h-5" />} />
          <StatCard label="Confirmed" value={confirmedCount} icon={<CheckCircle2 className="w-5 h-5" />} />
        </div>

        {!wallet ? (
          <Card className="border-warning/20 bg-warning/5">
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Create Your DFNS Wallet</p>
                <p className="text-xs text-muted-foreground">You need a DFNS MPC wallet to send transactions</p>
              </div>
              <Button asChild size="sm">
                <Link to="/client/wallet/setup">Create Wallet</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="border-accent/20 bg-accent/5">
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">DFNS MPC Wallet</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {wallet.hederaAccountId} • {wallet.walletId}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/client/wallet/setup">View Details</Link>
              </Button>
            </div>
          </Card>
        )}

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
              action={<Button asChild><Link to="/client/transaction/new">Create Transaction</Link></Button>}
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
                      <p className="text-sm font-medium text-foreground truncate">To: {tx.recipientAccountId}</p>
                      <StatusBadge status={tx.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                      {tx.memo && ` • ${tx.memo}`}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground ml-4">ℏ {tx.amount.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ClientLayout>
  );
}
