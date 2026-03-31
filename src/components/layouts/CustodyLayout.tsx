import { ReactNode } from 'react';
import { Shield } from 'lucide-react';
import hederaLogo from '@/assets/hedera-logo.png';

interface CustodyLayoutProps {
  children: ReactNode;
}

export default function CustodyLayout({ children }: CustodyLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container flex items-center h-16 px-4">
          <div className="flex items-center gap-3">
            <img src={hederaLogo} alt="Hedera" className="w-8 h-8 rounded-lg" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="font-semibold text-foreground">Custody Terminal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {children}
      </main>
    </div>
  );
}
