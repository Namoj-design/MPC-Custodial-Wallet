import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Shield, Activity, TrendingUp, Wallet } from 'lucide-react';
import { WalletSummaryCard } from '@/components/WalletSummaryCard';
import { TransactionTable } from '@/components/TransactionTable';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api, WalletBalance, Transaction } from '@/services/api';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceData, txData] = await Promise.all([
          api.wallet.getBalance(),
          api.wallet.getTransactions(),
        ]);
        setBalance(balanceData);
        setTransactions(txData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">Here's your wallet overview</p>
        </div>
        <div className="flex gap-3">
          <Link to="/transactions">
            <Button variant="outline">
              <ArrowDownLeft className="w-4 h-4 mr-2" />
              Receive
            </Button>
          </Link>
          <Link to="/transactions">
            <Button>
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Send
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <WalletSummaryCard
          title="Total Balance"
          value={`$${balance?.total.toLocaleString()}`}
          change={5.2}
          icon={<Wallet className="w-5 h-5 text-primary-foreground" />}
        />
        <WalletSummaryCard
          title="Available"
          value={`$${balance?.available.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-primary-foreground" />}
        />
        <WalletSummaryCard
          title="Pending"
          value={`$${balance?.pending.toLocaleString()}`}
          icon={<Activity className="w-5 h-5 text-primary-foreground" />}
        />
        <WalletSummaryCard
          title="MPC Protected"
          value="Active"
          icon={<Shield className="w-5 h-5 text-primary-foreground" />}
        />
      </div>

      {/* Assets */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Your Assets</h2>
        <div className="space-y-3">
          {balance?.assets.map((asset) => (
            <div
              key={asset.symbol}
              className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    {asset.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {asset.balance.toLocaleString()} {asset.symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">${asset.value.toLocaleString()}</p>
                <p
                  className={`text-sm ${
                    asset.change24h >= 0 ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {asset.change24h >= 0 ? '+' : ''}
                  {asset.change24h}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Link to="/transactions">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <TransactionTable transactions={transactions.slice(0, 5)} />
      </div>
    </div>
  );
}
