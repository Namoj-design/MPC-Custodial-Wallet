import { useEffect, useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { PageLoader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { getAuditLogs, getTransactions, subscribeToUpdates } from '@/api/services';
import { AuditLog, Transaction } from '@/types';
import { WealthManagerLayout } from '@/components/layouts/WealthManagerLayout';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const actionLabels: Record<AuditLog['action'], { label: string; className: string }> = {
  CREATED: { label: 'Created', className: 'text-muted-foreground' },
  CLIENT_APPROVED: { label: 'Client Signed', className: 'text-accent' },
  WM_APPROVED: { label: 'WM Signed', className: 'text-accent' },
  CUSTODY_APPROVED: { label: 'Custody Signed', className: 'text-accent' },
  EXECUTED: { label: 'Executed', className: 'text-success' },
  REJECTED: { label: 'Rejected', className: 'text-destructive' },
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [transactions, setTransactions] = useState<Map<string, Transaction>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [logsRes, txRes] = await Promise.all([
      getAuditLogs(),
      getTransactions(),
    ]);
    
    if (logsRes.success && logsRes.data) {
      setLogs(logsRes.data);
    }
    if (txRes.success && txRes.data) {
      const txMap = new Map(txRes.data.map(tx => [tx.id, tx]));
      setTransactions(txMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToUpdates(fetchData);
    return unsubscribe;
  }, []);

  return (
    <WealthManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Audit Log</h1>
          <p className="text-muted-foreground">Complete transaction and approval history</p>
        </div>

        <Card>
          {loading ? (
            <PageLoader />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No audit logs"
              description="Transaction activity will be logged here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Timestamp
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Intent ID
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Action
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Actor
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                      Hedera TX
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => {
                    const tx = transactions.get(log.transactionId);
                    const actionConfig = actionLabels[log.action];
                    
                    return (
                      <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <p className="text-sm text-foreground">
                            {format(new Date(log.timestamp), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.timestamp), 'h:mm:ss a')}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {log.transactionId}
                          </code>
                        </td>
                        <td className="py-4 px-4">
                          <span className={cn('text-sm font-medium', actionConfig.className)}>
                            {actionConfig.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground">{log.actor}</p>
                        </td>
                        <td className="py-4 px-4">
                          {tx?.hederaTxId ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 h-auto py-1 px-2"
                              asChild
                            >
                              <a
                                href={`https://hashscan.io/testnet/transaction/${tx.hederaTxId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span className="text-xs font-mono truncate max-w-[120px]">
                                  {tx.hederaTxId.split('@')[0]}...
                                </span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </WealthManagerLayout>
  );
}
