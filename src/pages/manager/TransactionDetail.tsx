import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ApprovalTimeline } from '@/components/shared/ApprovalTimeline';
import { PageLoader } from '@/components/shared/Loader';
import { Button } from '@/components/ui/button';
import { getTransaction, approveTransaction, rejectTransaction, subscribeToUpdates } from '@/api/services';
import { Transaction } from '@/types';
import { WealthManagerLayout } from '@/components/layouts/WealthManagerLayout';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

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
          description: 'Your signature has been added',
        });
      } else {
        toast.error('Approval failed');
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
    transaction.status !== 'EXECUTED';

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
            <div className="flex justify-between py-3">
              <span className="text-muted-foreground">Created</span>
              <span className="text-foreground">{format(new Date(transaction.createdAt), 'PPp')}</span>
            </div>
          </div>
        </Card>

        {/* Approval Timeline */}
        <Card>
          <CardHeader
            title="Approval Progress"
            description="2-of-3 threshold signature required"
          />
          <ApprovalTimeline approvals={transaction.approvals} />
        </Card>

        {/* Actions */}
        {canApprove && (
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader
              title="Your Approval Required"
              description="Review the transaction details and approve or reject"
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
                Approve & Sign
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

        {transaction.approvals.wealthManager && transaction.status !== 'EXECUTED' && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
            <p className="text-sm font-medium text-success">
              You have approved this transaction
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Waiting for custody service to finalize
            </p>
          </div>
        )}

        {transaction.status === 'EXECUTED' && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
            <p className="text-sm font-medium text-success">
              Transaction successfully executed
            </p>
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
