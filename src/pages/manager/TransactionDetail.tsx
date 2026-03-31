import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2, Shield, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TransactionStatusTimeline, TimelineStep } from '@/components/shared/TransactionStatusTimeline';
import { SignatureDisplay } from '@/components/shared/SignatureModal';
import { PageLoader } from '@/components/shared/Loader';
import { Button } from '@/components/ui/button';
import { getTransaction, approveTransaction, rejectTransaction, subscribeToUpdates } from '@/api/services';
import { Transaction } from '@/types';
import { WealthManagerLayout } from '@/components/layouts/WealthManagerLayout';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useWebSocket } from '@/hooks/useWebSocketSession';

function buildTimelineSteps(tx: Transaction): TimelineStep[] {
  const status = tx.status;
  const steps: TimelineStep[] = [
    {
      id: 'created',
      label: 'Created',
      description: 'Transaction submitted by client',
      status: 'completed',
    },
    {
      id: 'approved',
      label: 'Approved',
      description: 'Manager approved transaction',
      status:
        status === 'PENDING_APPROVAL' || status === 'PARTIALLY_APPROVED'
          ? tx.approvals.wealthManager ? 'completed' : 'active'
          : 'completed',
    },
    {
      id: 'signing',
      label: 'Signing (DFNS MPC)',
      description: 'DFNS multi-party computation signing',
      status:
        status === 'SIGNING' ? 'active'
        : ['BROADCASTED', 'CONFIRMED', 'EXECUTED', 'EXECUTING'].includes(status) ? 'completed'
        : status === 'FAILED' ? 'failed'
        : 'pending',
    },
    {
      id: 'signed',
      label: 'Signed (Multi-party)',
      description: 'Signed by Client + Wealth Manager + Custody (via DFNS)',
      status:
        ['BROADCASTED', 'CONFIRMED', 'EXECUTED', 'EXECUTING'].includes(status) ? 'completed'
        : 'pending',
    },
    {
      id: 'broadcasted',
      label: 'Broadcasted',
      description: 'Transaction sent to Hedera',
      status:
        status === 'BROADCASTED' ? 'active'
        : ['CONFIRMED', 'EXECUTED', 'EXECUTING'].includes(status) ? 'completed'
        : 'pending',
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      description: 'Confirmed on Hedera',
      status:
        ['CONFIRMED', 'EXECUTED'].includes(status) ? 'completed'
        : status === 'FAILED' ? 'failed'
        : 'pending',
    },
  ];

  if (status === 'REJECTED') {
    return [
      steps[0],
      { ...steps[1], status: 'failed', description: 'Transaction rejected' },
    ];
  }

  return steps;
}

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useWebSocket({
    onEvent: (event, payload) => {
      if (!payload) return;
      const txId = (payload.id || payload.transactionId) as string;
      if (txId === id) fetchData();
    },
  });

  const fetchData = async () => {
    if (!id) return;
    const res = await getTransaction(id);
    if (res.success && res.data) {
      setTransaction(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToUpdates(fetchData);
    return unsubscribe;
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setApproving(true);
    
    try {
      const res = await approveTransaction(id, 'wealthManager');
      if (res.success) {
        toast.success('Transaction approved', {
          description: 'DFNS will now sign and broadcast the transaction automatically',
        });
      } else {
        toast.error('Approval failed', { description: res.error });
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    setRejecting(true);
    
    try {
      const res = await rejectTransaction(id);
      if (res.success) {
        toast.success('Transaction rejected');
        navigate('/manager/approvals');
      } else {
        toast.error('Rejection failed');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <WealthManagerLayout>
        <PageLoader text="Loading transaction..." />
      </WealthManagerLayout>
    );
  }

  if (!transaction) {
    return (
      <WealthManagerLayout>
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-foreground">Transaction not found</h2>
          <Button asChild className="mt-4">
            <Link to="/manager/approvals">Back to Approvals</Link>
          </Button>
        </div>
      </WealthManagerLayout>
    );
  }

  const canApprove = !transaction.approvals.wealthManager && 
    transaction.status !== 'REJECTED' && 
    transaction.status !== 'EXECUTED' &&
    transaction.status !== 'CONFIRMED';

  const timelineSteps = buildTimelineSteps(transaction);

  return (
    <WealthManagerLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/manager/approvals">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">Transaction Review</h1>
              <StatusBadge status={transaction.status} />
            </div>
            <p className="text-sm text-muted-foreground">ID: {transaction.id}</p>
          </div>
        </div>

        {/* Transaction Details */}
        <Card>
          <CardHeader title="Transfer Details" />
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Client</span>
              <span className="font-medium text-foreground">{transaction.clientId}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Recipient</span>
              <span className="font-medium text-foreground">{transaction.recipientAccountId}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-foreground text-lg">ℏ {transaction.amount.toLocaleString()}</span>
            </div>
            {transaction.memo && (
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Memo</span>
                <span className="font-medium text-foreground">{transaction.memo}</span>
              </div>
            )}
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-muted-foreground">Created</span>
              <span className="text-foreground">{format(new Date(transaction.createdAt), 'PPp')}</span>
            </div>
            {transaction.hederaTxId && (
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground">Hedera TX</span>
                <Button variant="link" size="sm" className="gap-1 h-auto p-0" asChild>
                  <a
                    href={`https://hashscan.io/testnet/transaction/${transaction.hederaTxId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-xs font-mono">{transaction.hederaTxId}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Signature Details */}
        {(transaction.signatureHex || transaction.txHash) && (
          <Card>
            <CardHeader
              title="DFNS Signature"
              description="Multi-party signature generated by DFNS MPC"
            />
            <SignatureDisplay
              signatureHex={transaction.signatureHex}
              txHash={transaction.txHash}
              dfnsSignatureId={transaction.dfnsSignatureId}
              hederaTxId={transaction.hederaTxId}
            />
          </Card>
        )}

        {/* Transaction Lifecycle Timeline */}
        <Card>
          <CardHeader
            title="Transaction Lifecycle"
            description="DFNS-powered signing and Hedera broadcast"
          />
          <TransactionStatusTimeline steps={timelineSteps} />
        </Card>

        {/* Actions */}
        {canApprove && (
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader
              title="Your Approval Required"
              description="Once approved, DFNS will automatically sign and broadcast to Hedera"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={approving || rejecting}
                className="flex-1 gap-2 bg-success hover:bg-success/90"
              >
                {approving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={approving || rejecting}
                className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive/10"
              >
                {rejecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject
              </Button>
            </div>
          </Card>
        )}

        {transaction.status === 'SIGNING' && (
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-accent" />
              <p className="text-sm font-medium text-accent">
                Transaction is being signed securely via DFNS MPC
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Signed by Client + Wealth Manager + Custody (via DFNS)
            </p>
          </div>
        )}

        {transaction.approvals.wealthManager && !['EXECUTED', 'CONFIRMED', 'REJECTED', 'SIGNING'].includes(transaction.status) && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
            <p className="text-sm font-medium text-success">
              You have approved this transaction
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              DFNS will sign and broadcast to Hedera automatically
            </p>
          </div>
        )}

        {(transaction.status === 'EXECUTED' || transaction.status === 'CONFIRMED') && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
            <p className="text-sm font-medium text-success">
              Transaction confirmed on Hedera
            </p>
            {transaction.hederaTxId && (
              <Button variant="link" size="sm" className="mt-1 gap-1 text-success" asChild>
                <a href={`https://hashscan.io/testnet/transaction/${transaction.hederaTxId}`} target="_blank" rel="noopener noreferrer">
                  View on Hedera Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
          </div>
        )}

        {transaction.status === 'REJECTED' && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-sm font-medium text-destructive">
              This transaction was rejected
            </p>
          </div>
        )}
      </div>
    </WealthManagerLayout>
  );
}
