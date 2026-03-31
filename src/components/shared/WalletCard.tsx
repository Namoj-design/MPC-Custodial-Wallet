import { Shield, Copy, Check, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WalletCardProps {
  walletId: string;
  accountId: string;
  publicKey?: string;
  className?: string;
}

export function WalletCard({ walletId, accountId, publicKey, className }: WalletCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className={cn(className)}>
      <CardHeader
        title="DFNS MPC Wallet"
        description="Secured by institutional-grade MPC infrastructure"
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div>
            <p className="text-xs text-muted-foreground">Wallet ID</p>
            <p className="text-sm font-mono text-foreground">{walletId}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copy(walletId, 'Wallet ID')}>
            {copied === 'Wallet ID' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
          <div>
            <p className="text-xs text-muted-foreground">Hedera Account</p>
            <p className="text-sm font-mono text-foreground">{accountId}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copy(accountId, 'Account ID')}>
              {copied === 'Account ID' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={`https://hashscan.io/testnet/account/${accountId}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>

        {publicKey && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Public Key</p>
            <p className="text-xs font-mono text-foreground break-all">{publicKey}</p>
          </div>
        )}

        <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
          <Shield className="w-4 h-4 text-accent shrink-0" />
          <p className="text-xs text-muted-foreground">
            Private keys are managed by DFNS and never exposed. All signing is handled server-side.
          </p>
        </div>
      </div>
    </Card>
  );
}
