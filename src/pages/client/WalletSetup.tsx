import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Wallet, CheckCircle2, Loader2, ArrowRight, Copy, Check, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { Button } from '@/components/ui/button';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { getMyWallet, createWallet, registerClient } from '@/api/services';
import { DFNSWalletInfo } from '@/types';
import { useAuth } from '@/state/auth';
import { toast } from 'sonner';

import { useNavigate } from 'react-router-dom';

export default function WalletSetup() {
  const { user, updateUser } = useAuth();
  const clientId = user?.userId || '';
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<DFNSWalletInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    async function checkWallet() {
      const res = await getMyWallet(clientId);
      if (res.success && res.data) {
        setWallet(res.data);
        registerClient(clientId, user?.email || clientId, res.data);
        updateUser({ dfnsWalletId: res.data.walletId, hederaAccountId: res.data.hederaAccountId });
      }
      setLoading(false);
    }
    if (clientId) checkWallet();
  }, [clientId]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await createWallet(clientId);
      if (res.success && res.data) {
        setWallet(res.data);
        registerClient(clientId, user?.email || clientId, res.data);
        updateUser({ dfnsWalletId: res.data.walletId, hederaAccountId: res.data.hederaAccountId });
        toast.success('DFNS MPC Wallet created successfully');
        navigate('/client');
      } else {
        toast.error('Failed to create wallet');
      }
    } catch {
      toast.error('Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Manage DFNS Wallet</h1>
          <p className="text-muted-foreground">DFNS-powered MPC wallet for {user?.email}</p>
        </div>

        {!wallet ? (
          <Card>
            <CardHeader title="DFNS MPC Wallet" description="Your wallet's private keys are split across DFNS infrastructure — never exposed." />
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <Shield className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Institutional MPC Security</p>
                    <p className="text-xs text-muted-foreground mt-1">Private keys managed by DFNS across secure enclaves.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                  <Wallet className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Hedera Native Account</p>
                    <p className="text-xs text-muted-foreground mt-1">A Hedera account will be provisioned with your wallet.</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full gap-2" size="lg">
                {creating ? <><Loader2 className="w-5 h-5 animate-spin" />Creating Wallet...</> : <><Shield className="w-5 h-5" />Create Wallet</>}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
              <div>
                <p className="text-sm font-medium text-success">Wallet Active ✅</p>
                <p className="text-xs text-muted-foreground">Your DFNS MPC wallet is ready</p>
              </div>
            </div>

            <Card>
              <CardHeader title="Wallet Details" />
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Wallet ID</p>
                    <p className="text-sm font-mono text-foreground">{wallet.walletId}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copy(wallet.walletId, 'Wallet ID')}>
                    {copied === 'Wallet ID' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Hedera Account ID</p>
                    <p className="text-sm font-mono text-foreground">{wallet.hederaAccountId}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copy(wallet.hederaAccountId, 'Account ID')}>
                      {copied === 'Account ID' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={`https://hashscan.io/testnet/account/${wallet.hederaAccountId}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Public Key</p>
                  <p className="text-xs font-mono text-foreground break-all">{wallet.publicKey}</p>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <Shield className="w-4 h-4 text-accent shrink-0" />
                  <p className="text-xs text-muted-foreground">Private keys are managed by DFNS and never exposed.</p>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button asChild className="flex-1 gap-2">
                <Link to="/client">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 gap-2">
                <Link to="/client/transaction/new">New Transaction <ArrowRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
