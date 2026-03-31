import { useState } from 'react';
import { Check, Clock, X, Shield, Users, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ApprovalParticipant {
  role: 'client' | 'manager' | 'custody';
  label: string;
  status: 'pending' | 'approved' | 'rejected' | 'signing';
  signedAt?: string;
}

export interface ThresholdTransaction {
  id: string;
  walletPublicKey: string;
  recipient: string;
  amount: string;
  memo?: string;
  requiredApprovals: number;
  participants: ApprovalParticipant[];
  status: 'pending_approvals' | 'approved' | 'signing' | 'completed' | 'rejected';
  createdAt: string;
}

interface ThresholdApprovalPanelProps {
  transaction: ThresholdTransaction;
  currentRole: 'client' | 'manager' | 'custody';
  onApprove?: () => void;
  onReject?: () => void;
  loading?: boolean;
  className?: string;
}

export function ThresholdApprovalPanel({
  transaction,
  currentRole,
  onApprove,
  onReject,
  loading,
  className,
}: ThresholdApprovalPanelProps) {
  const approvedCount = transaction.participants.filter((p) => p.status === 'approved').length;
  const currentParticipant = transaction.participants.find((p) => p.role === currentRole);
  const canAct = currentParticipant?.status === 'pending' && transaction.status === 'pending_approvals';

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return <Shield className="w-4 h-4" />;
      case 'manager':
        return <Users className="w-4 h-4" />;
      case 'custody':
        return <Lock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: ApprovalParticipant['status']) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4 text-success" />;
      case 'rejected':
        return <X className="w-4 h-4 text-destructive" />;
      case 'signing':
        return <Loader2 className="w-4 h-4 text-accent animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ApprovalParticipant['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-xs">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      case 'signing':
        return <Badge className="bg-accent text-xs">Signing</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Pending</Badge>;
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-r from-card to-muted/30 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base">Threshold Approval</CardTitle>
              <CardDescription>
                {approvedCount} of {transaction.requiredApprovals} approvals required
              </CardDescription>
            </div>
          </div>
          <Badge
            className={cn(
              transaction.status === 'approved' && 'bg-success',
              transaction.status === 'completed' && 'bg-success',
              transaction.status === 'rejected' && 'bg-destructive',
              transaction.status === 'signing' && 'bg-accent'
            )}
          >
            {transaction.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Transaction Details */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Transaction Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Recipient</p>
              <p className="font-mono text-sm text-foreground truncate">{transaction.recipient}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="font-semibold text-foreground">{transaction.amount}</p>
            </div>
            {transaction.memo && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Memo</p>
                <p className="text-sm text-foreground">{transaction.memo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Approval Progress */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Approval Progress
          </h4>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-success transition-all"
              style={{ width: `${(approvedCount / transaction.requiredApprovals) * 100}%` }}
            />
          </div>

          {/* Participants */}
          <div className="space-y-2">
            {transaction.participants.map((participant) => (
              <div
                key={participant.role}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-all',
                  participant.status === 'approved' && 'bg-success/5 border-success/20',
                  participant.status === 'rejected' && 'bg-destructive/5 border-destructive/20',
                  participant.status === 'signing' && 'bg-accent/5 border-accent/20',
                  participant.status === 'pending' && 'bg-muted/30 border-border',
                  participant.role === currentRole && 'ring-2 ring-accent/20'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      participant.status === 'approved' && 'bg-success/10 text-success',
                      participant.status === 'rejected' && 'bg-destructive/10 text-destructive',
                      participant.status === 'signing' && 'bg-accent/10 text-accent',
                      participant.status === 'pending' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {getRoleIcon(participant.role)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {participant.label}
                      {participant.role === currentRole && (
                        <span className="text-xs text-muted-foreground ml-2">(You)</span>
                      )}
                    </p>
                    {participant.signedAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(participant.signedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(participant.status)}
                  {getStatusBadge(participant.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {canAct && (
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={onReject}
              disabled={loading}
            >
              <X className="w-4 h-4" />
              Reject
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={onApprove}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Approve Transaction
                </>
              )}
            </Button>
          </div>
        )}

        {/* Status Messages */}
        {currentParticipant?.status === 'approved' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
            <Check className="w-4 h-4 shrink-0" />
            You have approved this transaction
          </div>
        )}

        {transaction.status === 'approved' && approvedCount >= transaction.requiredApprovals && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Threshold reached! Transaction ready for MPC signing.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
