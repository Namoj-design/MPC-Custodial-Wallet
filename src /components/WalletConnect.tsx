import { Wallet, Link2, Link2Off, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HederaAccount } from '@/hooks/useHederaWallet';

interface WalletConnectProps {
  account: HederaAccount | null;
  isConnecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletConnect({
  account,
  isConnecting,
  error,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  if (account?.isConnected) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Connected Wallet
          </h2>
          <div className="flex items-center gap-2 text-xs text-success">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Connected
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
          <div>
            <p className="text-sm text-muted-foreground">Hedera Account</p>
            <p className="font-mono text-lg font-medium">{account.accountId}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Balance: <span className="text-foreground font-semibold">{account.balance.toLocaleString()} HBAR</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://hashscan.io/mainnet/account/${account.accountId}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              HashScan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDisconnect}
            >
              <Link2Off className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Connect Hedera Wallet
        </h2>
      </div>
      
      <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
          <Wallet className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Connect your HashPack wallet to view your real Hedera transactions and manage your MPC-secured assets.
        </p>
        
        {error && (
          <div className="flex items-center justify-center gap-2 text-destructive mb-4">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <Button
          onClick={onConnect}
          disabled={isConnecting}
          className="gradient-primary text-primary-foreground"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-2" />
              Connect HashPack Wallet
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          Don't have HashPack? You can enter any Hedera account ID to view transactions.
        </p>
      </div>
    </div>
  );
}
