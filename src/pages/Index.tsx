import { Link } from 'react-router-dom';
import { Shield, Briefcase, ArrowRight, Lock, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hederaLogo from '@/assets/hedera-logo.png';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <img src={hederaLogo} alt="Hedera" className="w-12 h-12 rounded-xl" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Hedera MPC Custody
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Institutional-grade 2-of-3 threshold custody infrastructure. 
              Secure, compliant, and built for regulated environments.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="gap-2 px-8">
                <Link to="/client">
                  <Shield className="w-5 h-5" />
                  Client Portal
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 px-8">
                <Link to="/manager">
                  <Briefcase className="w-5 h-5" />
                  Wealth Manager
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Threshold Security
            </h3>
            <p className="text-muted-foreground">
              2-of-3 MPC signature scheme ensures no single party can access funds. 
              Private keys are never exposed or reconstructed.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Role Separation
            </h3>
            <p className="text-muted-foreground">
              Clear separation between clients, wealth managers, and custody providers. 
              Every action requires explicit approval.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Real-time Sync
            </h3>
            <p className="text-muted-foreground">
              Transactions sync instantly between all parties. 
              Watch approval progress in real-time with clear status indicators.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={hederaLogo} alt="Hedera" className="w-8 h-8 rounded-lg" />
              <span className="text-sm font-medium text-muted-foreground">
                Hedera MPC Custody • Testnet
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Built with institutional-grade security standards
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
