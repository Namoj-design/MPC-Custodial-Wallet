import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletSummaryCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function WalletSummaryCard({ title, value, change, icon, className }: WalletSummaryCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn('glass-card p-6 transition-all duration-300 hover:shadow-glass-lg', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          {change !== undefined && (
            <div className={cn('flex items-center mt-2 text-sm', isPositive ? 'text-success' : 'text-destructive')}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="font-medium">{Math.abs(change)}%</span>
              <span className="text-muted-foreground ml-1">vs last week</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl gradient-primary">
          {icon || <Wallet className="w-5 h-5 text-primary-foreground" />}
        </div>
      </div>
    </div>
  );
}
