import { useState } from 'react';
import { Key, Shield, Users, Lock, Check, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface DKGWallet {
  id: string;
  publicKey: string;
  status: 'active' | 'pending_approval' | 'locked';
  createdAt: string;
  keyShares: {
    client: boolean;
    manager: boolean;
    custody: boolean;
  };
  transactionCount: number;
}

interface DKGWalletCardProps {
  wallet: DKGWallet;
  onSelect?: (wallet: DKGWallet) => void;
  selected?: boolean;
  className?: string;
}

export function DKGWalletCard({ wallet, onSelect, selected, className }: DKGWalletCardProps) {
  const getStatusBadge = () => {
    switch (wallet.status) {
      case 'active':
        return <Badge className="bg-success gap-1"><Check className="w-3 h-3" />Active</Badge>;
      case 'pending_approval':
        return <Badge variant="outline" className="gap-1"><Loader2 className="w-3 h-3 animate-spin" />Pending</Badge>;
      case 'locked':
        return <Badge variant="secondary" className="gap-1"><Lock className="w-3 h-3" />Locked</Badge>;
    }
  };

  const truncatedKey = `${wallet.publicKey.slice(0, 10)}...${wallet.publicKey.slice(-8)}`;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-accent/50',
        selected && 'border-accent ring-2 ring-accent/20',
        className
      )}
      onClick={() => onSelect?.(wallet)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">MPC Wallet</CardTitle>
              <CardDescription className="font-mono text-xs">
                {truncatedKey}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Key Shares */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs',
              wallet.keyShares.client ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
            )}>
              <Shield className="w-3 h-3" />
              Client
            </div>
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs',
              wallet.keyShares.manager ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
            )}>
              <Users className="w-3 h-3" />
              Manager
            </div>
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs',
              wallet.keyShares.custody ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
            )}>
              <Lock className="w-3 h-3" />
              Custody
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Transactions</span>
            <span className="font-medium text-foreground">{wallet.transactionCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground">
              {new Date(wallet.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DKGWalletListProps {
  wallets: DKGWallet[];
  selectedId?: string;
  onSelect?: (wallet: DKGWallet) => void;
  onCreateNew?: () => void;
  className?: string;
}

export function DKGWalletList({ wallets, selectedId, onSelect, onCreateNew, className }: DKGWalletListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Your DKG Wallets</h3>
        {onCreateNew && (
          <Button variant="outline" size="sm" onClick={onCreateNew} className="gap-2">
            <Key className="w-4 h-4" />
            Create New Wallet
          </Button>
        )}
      </div>

      {wallets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Key className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">No DKG wallets found</p>
            {onCreateNew && (
              <Button onClick={onCreateNew} className="gap-2">
                <Key className="w-4 h-4" />
                Create Your First Wallet
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {wallets.map((wallet) => (
            <DKGWalletCard
              key={wallet.id}
              wallet={wallet}
              selected={wallet.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
