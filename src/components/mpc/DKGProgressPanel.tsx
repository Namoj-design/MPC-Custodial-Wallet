import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Circle, Key, Shield } from 'lucide-react';
import { createWallet, DKGSession, DKGStep } from '@/api/mpcApi';

interface DKGProgressPanelProps {
  clientId: string;
  onComplete?: (walletPublicKey: string) => void;
  className?: string;
}

export function DKGProgressPanel({ clientId, onComplete, className }: DKGProgressPanelProps) {
  const [session, setSession] = useState<DKGSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);

  const startDKG = async () => {
    setIsGenerating(true);
    const response = await createWallet(clientId);
    
    if (response.success && response.data) {
      setSession(response.data);
      // Simulate DKG progress
      simulateDKGProgress(response.data);
    }
  };

  const simulateDKGProgress = async (initialSession: DKGSession) => {
    const steps = [...initialSession.steps];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      
      steps[i] = { ...steps[i], status: 'active' };
      setSession((prev) => prev ? { ...prev, steps: [...steps], status: 'generating' } : prev);
      
      await new Promise((r) => setTimeout(r, 1000));
      
      steps[i] = { ...steps[i], status: 'completed' };
      setSession((prev) => prev ? { ...prev, steps: [...steps] } : prev);
    }

    // Generate mock public key
    const publicKey = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;
    
    setWalletPublicKey(publicKey);
    setSession((prev) => prev ? { ...prev, status: 'completed', walletPublicKey: publicKey } : prev);
    setIsGenerating(false);
    onComplete?.(publicKey);
  };

  const getStepIcon = (status: DKGStep['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-success" />;
      case 'active':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-card to-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Distributed Key Generation</h3>
            <p className="text-xs text-muted-foreground">2-of-3 Threshold Key Setup</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {!session ? (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-6">
              Generate a new MPC wallet with distributed key shares across Client, Manager, and Custody.
            </p>
            <Button onClick={startDKG} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Create MPC Wallet
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Session Info */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                DKG Session
              </p>
              <p className="font-mono text-sm text-foreground">{session.sessionId}</p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Key Generation Progress
              </p>
              <div className="space-y-3">
                {session.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center border-2',
                        step.status === 'completed' && 'bg-success/10 border-success',
                        step.status === 'active' && 'bg-primary/10 border-primary',
                        step.status === 'pending' && 'bg-muted border-border'
                      )}
                    >
                      {getStepIcon(step.status)}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        step.status === 'completed' && 'text-success font-medium',
                        step.status === 'active' && 'text-primary font-medium',
                        step.status === 'pending' && 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet Public Key */}
            {walletPublicKey && (
              <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                <p className="text-[11px] uppercase tracking-wider text-success font-medium mb-2">
                  Wallet Public Key
                </p>
                <p className="font-mono text-xs text-foreground break-all">{walletPublicKey}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
