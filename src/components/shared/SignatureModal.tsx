import { useState } from 'react';
import { Copy, Check, Eye, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SignatureModalProps {
  signatureHex?: string;
  txHash?: string;
  dfnsSignatureId?: string;
  hederaTxId?: string;
}

export function SignatureDisplay({ signatureHex, txHash, dfnsSignatureId, hederaTxId }: SignatureModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (!signatureHex && !txHash) return null;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  const truncate = (hex: string, len = 16) =>
    hex.length > len * 2 ? `${hex.slice(0, len)}...${hex.slice(-len)}` : hex;

  return (
    <>
      {/* Inline preview */}
      <div className="space-y-3">
        {signatureHex && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">Signature</p>
              <code className="text-xs font-mono text-foreground break-all">
                {truncate(signatureHex)}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 ml-2 shrink-0"
              onClick={() => setShowModal(true)}
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </Button>
          </div>
        )}

        {txHash && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">TX Hash</p>
              <code className="text-xs font-mono text-foreground break-all">
                {truncate(txHash)}
              </code>
            </div>
            <div className="flex gap-1 ml-2 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copy(txHash, 'TX Hash')}>
                {copied === 'TX Hash' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              {hederaTxId && (
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a
                    href={`https://hashscan.io/testnet/transaction/${hederaTxId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full signature modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-card rounded-xl border border-border shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">DFNS Signature Details</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {signatureHex && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Signature Hex</p>
                  <Button variant="ghost" size="sm" className="gap-1 h-7" onClick={() => copy(signatureHex, 'Signature')}>
                    {copied === 'Signature' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </Button>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border max-h-32 overflow-y-auto">
                  <code className="text-xs font-mono text-foreground break-all leading-relaxed">
                    {signatureHex}
                  </code>
                </div>
              </div>
            )}

            {dfnsSignatureId && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">DFNS Signature ID</p>
                  <code className="text-xs font-mono text-foreground">{dfnsSignatureId}</code>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copy(dfnsSignatureId, 'Signature ID')}>
                  {copied === 'Signature ID' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            )}

            {txHash && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Transaction Hash</p>
                  <code className="text-xs font-mono text-foreground">{txHash}</code>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copy(txHash, 'TX Hash')}>
                    {copied === 'TX Hash' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  {hederaTxId && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={`https://hashscan.io/testnet/transaction/${hederaTxId}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center pt-2">
              Signed by Client + Wealth Manager + Custody (via DFNS MPC)
            </p>
          </div>
        </div>
      )}
    </>
  );
}
