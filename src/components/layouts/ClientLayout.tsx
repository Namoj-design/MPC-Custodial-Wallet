import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, History, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WalletConnectButton } from '@/components/shared/WalletConnectButton';
import { useWallet } from '@/state/wallet';
import hederaLogo from '@/assets/hedera-logo.png';

interface ClientLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/client', label: 'Dashboard', icon: Home },
  { path: '/client/transaction/new', label: 'New Transaction', icon: PlusCircle },
  { path: '/client/transactions', label: 'History', icon: History },
];

export function ClientLayout({ children }: ClientLayoutProps) {
  const location = useLocation();
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-8">
            <Link to="/client" className="flex items-center gap-3">
              <img src={hederaLogo} alt="Hedera" className="w-9 h-9 rounded-lg" />
              <div>
                <h1 className="text-base font-semibold text-foreground">Hedera MPC</h1>
                <p className="text-xs text-muted-foreground">Client Portal</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <WalletConnectButton role="CLIENT" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <img src={hederaLogo} alt="Hedera" className="w-20 h-20 rounded-2xl mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Connect your HashPack wallet to access your MPC custodial account and manage transactions.
            </p>
            <WalletConnectButton role="CLIENT" />
          </div>
        ) : (
          <div className="animate-fade-in">{children}</div>
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                  isActive ? 'text-accent' : 'text-muted-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
