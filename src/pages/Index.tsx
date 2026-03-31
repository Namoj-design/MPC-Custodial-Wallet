import { Link } from 'react-router-dom';
import { Shield, Briefcase, ArrowRight, Lock, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hederaLogo from '@/assets/hedera-logo.png';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <img src={hederaLogo} alt="Hedera" className="w-12 h-12 rounded-xl" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              DFNS Institutional Custody
            </h1>
            <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Enterprise-grade MPC custody powered by DFNS. 
              Secure, compliant, and built for regulated environments on Hedera.
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-xl mx-auto">
              Real DFNS integration • Real Hedera Testnet transactions • Passkey & OTP authentication
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="gap-2 px-8">
                <Link to="/auth/login">
                  <Shield className="w-5 h-5" />
                  Client Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 px-8">
                <Link to="/auth/login">
                  <Briefcase className="w-5 h-5" />
                  Wealth Manager Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">DFNS MPC Security</h3>
            <p className="text-muted-foreground">
              Private keys managed by DFNS across secure enclaves. All signing is server-side via real MPC.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Passkey & OTP Auth</h3>
            <p className="text-muted-foreground">
              Clients authenticate with WebAuthn passkeys. Wealth Managers use secure email OTP verification.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Real-time Updates</h3>
            <p className="text-muted-foreground">
              WebSocket-driven live updates from DFNS webhooks. Real Hedera Testnet transactions.
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-border">
        <div className="container px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={hederaLogo} alt="Hedera" className="w-8 h-8 rounded-lg" />
              <span className="text-sm font-medium text-muted-foreground">
                DFNS Custody • Hedera Testnet
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Production-grade DFNS MPC infrastructure
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
