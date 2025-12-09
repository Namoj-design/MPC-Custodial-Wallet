import { Shield, Key, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Recovery() {
  const handleInitiateRecovery = () => {
    toast.info('Recovery workflow initiated. Contact your wealth manager.');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">VSS Recovery</h1>
        <p className="text-muted-foreground">Verifiable Secret Sharing recovery tools</p>
      </div>

      {/* Status */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl gradient-primary">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Key Shard Status</h2>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-success font-medium">All shards healthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">Key Rotation</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Rotate your key shards for enhanced security. This process will generate new shards
            while maintaining wallet access.
          </p>
          <Button variant="outline" className="w-full">
            Request Rotation
          </Button>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <RefreshCw className="w-5 h-5 text-warning" />
            </div>
            <h3 className="font-semibold">Shard Recovery</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Recover access to your wallet using VSS threshold recovery. Requires coordination with
            your wealth manager.
          </p>
          <Button variant="outline" className="w-full" onClick={handleInitiateRecovery}>
            Initiate Recovery
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="glass-card p-6 border-l-4 border-l-primary">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">About VSS Recovery</h3>
            <p className="text-sm text-muted-foreground">
              Verifiable Secret Sharing (VSS) ensures that your private key is split into multiple
              shards, distributed across secure locations. Recovery is possible when a threshold of
              shards is available, providing both security and recoverability.
            </p>
          </div>
        </div>
      </div>

      {/* Shard Distribution */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Shard Distribution</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm">Client Shard</span>
            </div>
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm">Manager Shard</span>
            </div>
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm">Backup Shard (Encrypted)</span>
            </div>
            <span className="text-sm text-muted-foreground">Secure Storage</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Threshold: 2 of 3 shards required for transaction signing
        </p>
      </div>
    </div>
  );
}
