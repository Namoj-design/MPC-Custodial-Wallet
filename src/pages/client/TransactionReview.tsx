import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ApprovalTimeline } from '@/components/shared/ApprovalTimeline';
import { PageLoader } from '@/components/shared/Loader';
import { Button } from '@/components/ui/button';
import { getTransaction, subscribeToUpdates } from '@/api/services';
import { Transaction } from '@/types';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TransactionReview() {
  const { id } = useParams<{ id: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <ClientLayout>
        <PageLoader text="Loading transaction..." />
      </ClientLayout>
    );
  }

  if (!transaction) {
    return (
      <ClientLayout>
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-foreground">Transaction not found</h2>
          <Button asChild className="mt-4">
            <Link to="/client/transactions">Back to Transactions</Link>
          </Button>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/client/transactions">
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
            {transaction.executedAt && (
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">Executed</span>
                <span className="text-foreground">{format(new Date(transaction.executedAt), 'PPp')}</span>
              </div>
            )}
            {transaction.hederaTxId && (
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground">Hedera TX ID</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {transaction.hederaTxId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(transaction.hederaTxId!)}
                  >
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a
                      href={`https://hashscan.io/testnet/transaction/${transaction.hederaTxId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
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

        {/* Status Message */}
        {transaction.status === 'PENDING_APPROVAL' && (
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-center">
            <p className="text-sm font-medium text-warning">
              Awaiting Wealth Manager approval
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You will be notified when the transaction is approved
            </p>
          </div>
        )}

        {transaction.status === 'PARTIALLY_APPROVED' && (
          <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 text-center">
            <p className="text-sm font-medium text-accent">
              Threshold reached — executing transaction
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              The custody service is finalizing the MPC signature
            </p>
          </div>
        )}

        {transaction.status === 'EXECUTED' && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
            <p className="text-sm font-medium text-success">
              Transaction successfully executed on Hedera
            </p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
