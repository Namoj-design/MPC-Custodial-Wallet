import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConnectButton } from 'thirdweb/react';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '@/lib/thirdweb-client';
import { useWallet } from '@/state/wallet';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
];

interface WalletConnectButtonProps {
  role: UserRole;
  className?: string;
}

export function WalletConnectButton({ role, className }: WalletConnectButtonProps) {
  const { isConnected, accountId, disconnect, setRole } = useWallet();

  if (isConnected) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-success">
            {accountId ? `${accountId.slice(0, 6)}...${accountId.slice(-4)}` : ''}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={disconnect}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(className)} onClick={() => setRole(role)}>
      <ConnectButton
        client={thirdwebClient}
        wallets={wallets}
      />
    </div>
  );
}
