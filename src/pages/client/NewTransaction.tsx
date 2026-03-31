import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Coins, Users } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { TextAreaField } from '@/components/shared/Field';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/state/auth';
import { createTransactionIntent, getKnownClients } from '@/api/services';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { toast } from 'sonner';

export default function NewTransaction() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const clientId = user?.userId || '';
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState<{ clientId: string; label: string; hederaAccountId?: string }[]>([]);
  const [form, setForm] = useState({ recipientClientId: '', amount: '', memo: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const clients = getKnownClients(clientId);
      setRecipients(clients);
    }, 1000);
    return () => clearInterval(interval);
  }, [clientId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.recipientClientId) newErrors.recipientClientId = 'Select a recipient';
    if (!form.amount) newErrors.amount = 'Amount is required';
    else if (parseFloat(form.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const recipient = recipients.find(r => r.clientId === form.recipientClientId);
      const recipientLabel = recipient?.hederaAccountId || recipient?.label || form.recipientClientId;
      const res = await createTransactionIntent(
        { recipientAccountId: recipientLabel, amount: parseFloat(form.amount), memo: form.memo.trim() || undefined },
        clientId
      );
      
      if (res.success && res.data) {
        toast.success('Transaction created', { description: 'Waiting for Manager approval. Signing handled by DFNS.' });
        navigate(`/client/transaction/review/${res.data.id}`);
      } else {
        toast.error('Transaction failed', { description: res.error || 'Unknown error' });
      }
    } catch (err: any) {
      toast.error('Transaction failed', { description: err?.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">New Transaction</h1>
          <p className="text-muted-foreground">Create a new transfer request for approval</p>
        </div>
        <Card>
          <CardHeader title="Transaction Details" description="Select a recipient client and amount to transfer" />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" /> Recipient
              </label>
              {recipients.length === 0 ? (
                <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
                  <p className="text-sm text-muted-foreground">No other clients available. Open another browser tab as a Client to create a recipient.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recipients.map((r) => (
                    <button key={r.clientId} type="button" onClick={() => setForm({ ...form, recipientClientId: r.clientId })}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${form.recipientClientId === r.clientId ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center"><User className="w-4 h-4 text-accent" /></div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.label}</p>
                          {r.hederaAccountId && <p className="text-xs text-muted-foreground">{r.hederaAccountId}</p>}
                        </div>
                      </div>
                      {form.recipientClientId === r.clientId && <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-accent-foreground" /></div>}
                    </button>
                  ))}
                </div>
              )}
              {errors.recipientClientId && <p className="text-xs text-destructive">{errors.recipientClientId}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2"><Coins className="w-4 h-4 text-muted-foreground" /> Amount (HBAR)</label>
              <input type="number" step="0.01" min="0" placeholder="100.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>
            <TextAreaField label="Memo (Optional)" placeholder="Payment description" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} hint="Add a note" />
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">No wallet signing required.</span> Transaction secured via DFNS MPC after Manager approval.</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Requires Manager approval</p>
              <Button type="submit" disabled={loading} className="gap-2">{loading ? 'Creating...' : 'Submit Transaction'}<ArrowRight className="w-4 h-4" /></Button>
            </div>
          </form>
        </Card>
      </div>
    </ClientLayout>
  );
}
