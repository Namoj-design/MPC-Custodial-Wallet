import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveUpdateIndicatorProps {
  connected: boolean;
  className?: string;
}

export function LiveUpdateIndicator({ connected, className }: LiveUpdateIndicatorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        connected
          ? 'bg-success/10 border-success/20 text-success'
          : 'bg-muted border-border text-muted-foreground',
        className
      )}
    >
      {connected ? (
        <>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <Wifi className="w-3 h-3" />
          Live
        </>
      ) : (
        <>
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          <WifiOff className="w-3 h-3" />
          Offline
        </>
      )}
    </div>
  );
}
