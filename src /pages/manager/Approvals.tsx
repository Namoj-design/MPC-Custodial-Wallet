import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { api, MPCRequest } from '@/services/api';
import { toast } from 'sonner';

export default function Approvals() {
  const [requests, setRequests] = useState<MPCRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await api.mpc.getPendingRequests();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await api.mpc.approveRequest(id);
      toast.success('Request approved and MPC signing completed');
      setRequests(requests.filter((r) => r.id !== id));
    } catch (error) {
      toast.error('Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await api.mpc.rejectRequest(id);
      toast.success('Request rejected');
      setRequests(requests.filter((r) => r.id !== id));
    } catch (error) {
      toast.error('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return '💸';
      case 'key_rotation':
        return '🔑';
      case 'recovery':
        return '🔄';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pending Approvals</h1>
        <p className="text-muted-foreground">Review and approve MPC signing requests</p>
      </div>

      {/* Alert Banner */}
      {requests.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <p className="text-sm">
            <span className="font-medium">{requests.length} request(s)</span> awaiting your approval.
            Review carefully before signing.
          </p>
        </div>
      )}

      {/* Requests List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-success" />
          <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground">No pending approval requests at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="glass-card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl">
                    {getTypeIcon(request.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg capitalize">
                        {request.type.replace('_', ' ')} Request
                      </h3>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-muted-foreground mb-2">{request.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Client: <span className="text-foreground font-medium">{request.clientName}</span>
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(request.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {request.amount && (
                      <div className="mt-3 p-3 rounded-lg bg-accent/50">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Amount:</span>{' '}
                          <span className="font-mono font-semibold">
                            {request.amount.toLocaleString()} {request.currency}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Recipient:</span>{' '}
                          <span className="font-mono">{request.recipient}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="success"
                    onClick={() => handleApprove(request.id)}
                    disabled={processingId === request.id}
                  >
                    {processingId === request.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve & Sign
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>

              {/* MPC Info */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>
                    Approving this request will trigger MPC pre-signing with your key shard
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
