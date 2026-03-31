import { cn } from '@/lib/utils';
import { MPCSession } from '@/types/mpc';
import { ParticipantStatusBadge } from './ParticipantStatusBadge';
import { Shield, Hash, Clock, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MPCSessionStatusProps {
  session: MPCSession;
  className?: string;
}

export function MPCSessionStatus({ session, className }: MPCSessionStatusProps) {
  return (
    <div className={cn('space-y-5', className)}>
      {/* Session metadata */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Hash className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Session ID</p>
            <p className="text-sm font-mono text-foreground">{session.sessionId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Started</p>
            <p className="text-sm text-foreground">
              {formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Current round */}
      <div className="flex items-center gap-2.5 p-3 rounded-lg bg-accent/5 border border-accent/10">
        <Radio className="w-4 h-4 text-accent" />
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Current Round</p>
          <p className="text-sm font-medium text-foreground">{session.currentRound}</p>
        </div>
      </div>

      {/* Participants */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Participants</p>
        </div>
        <div className="space-y-2.5">
          {session.participants.map(p => (
            <div
              key={p.role}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <span className="text-sm font-medium text-foreground">{p.label}</span>
              <ParticipantStatusBadge status={p.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
