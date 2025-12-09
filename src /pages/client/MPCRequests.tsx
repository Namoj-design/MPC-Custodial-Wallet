import { useState } from 'react';
import { Shield, Clock, CheckCircle2, XCircle, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';
import { api } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const mockRequests = [
  {
    id: '1',
    type: 'transfer',
    amount: 2500,
    currency: 'HBAR',
    recipient: '0.0.345678',
    status: 'pending' as const,
    createdAt: '2024-01-16T09:00:00Z',
    description: 'Transfer to external wallet',
  },
  {
    id: '2',
    type: 'transfer',
    amount: 5000,
    currency: 'HBAR',
    recipient: '0.0.789012',
    status: 'approved' as const,
    createdAt: '2024-01-15T14:30:00Z',
    description: 'Monthly investment transfer',
  },
  {
    id: '3',
    type: 'key_rotation',
    status: 'completed' as const,
    createdAt: '2024-01-14T10:00:00Z',
    description: 'Scheduled key shard rotation',
  },
];

export default function MPCRequests() {
  const [requests] = useState(mockRequests);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: 'transfer',
    amount: '',
    recipient: '',
    description: '',
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.mpc.createRequest({
        type: newRequest.type,
        amount: parseFloat(newRequest.amount),
        recipient: newRequest.recipient,
        description: newRequest.description,
      });
      toast.success('MPC request submitted for approval');
      setIsDialogOpen(false);
      setNewRequest({ type: 'transfer', amount: '', recipient: '', description: '' });
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <Shield className="w-5 h-5" />;
      case 'key_rotation':
        return <Clock className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">MPC Signing Requests</h1>
          <p className="text-muted-foreground">Manage your multi-party signing requests</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Create MPC Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Request Type</Label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                >
                  <option value="transfer">Transfer</option>
                  <option value="key_rotation">Key Rotation</option>
                  <option value="recovery">Recovery</option>
                </select>
              </div>
              {newRequest.type === 'transfer' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient</Label>
                    <Input
                      id="recipient"
                      placeholder="0.0.123456"
                      value={newRequest.recipient}
                      onChange={(e) => setNewRequest({ ...newRequest, recipient: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (HBAR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={newRequest.amount}
                      onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this request..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Request List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Request History</h2>
        </div>
        <div className="divide-y divide-border">
          {requests.map((request) => (
            <div
              key={request.id}
              className="p-4 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl gradient-primary">
                    {getTypeIcon(request.type)}
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      {request.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                    {request.amount && (
                      <p className="text-sm font-mono mt-1">
                        {request.amount} {request.currency} → {request.recipient}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={request.status} />
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
