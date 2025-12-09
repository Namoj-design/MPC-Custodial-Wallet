import { useEffect, useState } from 'react';
import { Copy, QrCode, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, WalletBalance } from '@/services/api';
import { toast } from 'sonner';
import { useHederaWallet } from '@/hooks/useHederaWallet';
import { WalletConnect } from '@/components/WalletConnect';
import { HederaTransactionTable } from '@/components/HederaTransactionTable';

export default function Wallet() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    account,
    transactions,
    isConnecting,
    isLoadingTransactions,
    error,
    connectWallet,
    disconnectWallet,
    fetchTransactions,
    refreshBalance,
  } = useHederaWallet();

  useEffect(() => {
    fetchMockBalance();
  }, []);

  const fetchMockBalance = async () => {
    setIsLoading(true);
    try {
      const data = await api.wallet.getBalance();
      setBalance(data);
    } catch (error) {
      toast.error('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success) {
      toast.success('Wallet connected successfully!');
    } else if (error) {
      toast.error(error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.info('Wallet disconnected');
  };

  const handleRefreshTransactions = () => {
    if (account?.accountId) {
      fetchTransactions(account.accountId);
      refreshBalance();
      toast.success('Refreshed!');
    }
  };

  const copyAddress = () => {
    if (account?.accountId) {
      navigator.clipboard.writeText(account.accountId);
      toast.success('Address copied to clipboard');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Wallet</h1>
          <p className="text-muted-foreground">Manage your MPC-secured assets</p>
        </div>
        {account?.isConnected && (
          <Button variant="outline" onClick={handleRefreshTransactions} disabled={isLoadingTransactions}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {/* Wallet Connection */}
      <WalletConnect
        account={account}
        isConnecting={isConnecting}
        error={error}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {/* Connected Wallet Details */}
      {account?.isConnected && (
        <>
          {/* Wallet Address Card */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Wallet Address</h2>
              <div className="flex items-center gap-2 text-xs text-success">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                MPC Secured
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hedera Account</p>
                  <p className="font-mono text-lg font-medium">{account.accountId}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={copyAddress}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`https://hashscan.io/mainnet/account/${account.accountId}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Balance Overview */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Balance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-accent/30">
                <p className="text-sm text-muted-foreground">HBAR Balance</p>
                <p className="text-3xl font-bold text-gradient">
                  {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </p>
                <p className="text-sm text-muted-foreground">HBAR</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/30">
                <p className="text-sm text-muted-foreground">Account ID</p>
                <p className="text-xl font-bold text-foreground font-mono">{account.accountId}</p>
              </div>
              <div className="p-4 rounded-lg bg-accent/30">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-3xl font-bold text-foreground">{transactions.length}</p>
                <p className="text-sm text-muted-foreground">Recent</p>
              </div>
            </div>
          </div>

          {/* Real Hedera Transactions */}
          <HederaTransactionTable
            transactions={transactions}
            accountId={account.accountId}
            isLoading={isLoadingTransactions}
            onRefresh={handleRefreshTransactions}
          />
        </>
      )}

      {/* MPC Security Info */}
      <div className="glass-card p-6 border-l-4 border-l-primary">
        <h3 className="font-semibold mb-2">MPC Security</h3>
        <p className="text-sm text-muted-foreground">
          Your wallet is protected by Multi-Party Computation (MPC). Key shards are distributed
          across secure servers, ensuring no single point of failure. All transactions require
          multi-party approval before signing.
        </p>
      </div>
    </div>
  );
}
