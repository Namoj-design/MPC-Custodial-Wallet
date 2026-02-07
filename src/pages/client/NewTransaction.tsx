import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Coins, MessageSquare } from 'lucide-react';
import { Card, CardHeader } from '@/components/shared/Card';
import { Field, TextAreaField } from '@/components/shared/Field';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/state/wallet';
import { createTransactionIntent } from '@/api/services';
import { ClientLayout } from '@/components/layouts/ClientLayout';
import { toast } from 'sonner';

export default function NewTransaction() {
  const navigate = useNavigate();
  const { accountId } = useWallet();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    recipientAccountId: '',
    amount: '',
    memo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.recipientAccountId.trim()) {
      newErrors.recipientAccountId = 'Recipient account is required';
    } else if (!/^\d+\.\d+\.\d+$/.test(form.recipientAccountId.trim())) {
      newErrors.recipientAccountId = 'Invalid Hedera account format (e.g., 0.0.12345)';
    }
    
    if (!form.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(form.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !accountId) return;
    
    setLoading(true);
    
    try {
      const res = await createTransactionIntent(
        {
          recipientAccountId: form.recipientAccountId.trim(),
          amount: parseFloat(form.amount),
          memo: form.memo.trim() || undefined,
        },
        accountId
      );
      
      if (res.success && res.data) {
        toast.success('Transaction created', {
          description: 'Awaiting wealth manager approval',
        });
        navigate(`/client/transaction/review/${res.data.id}`);
      } else {
        toast.error('Failed to create transaction');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">New Transaction</h1>
          <p className="text-muted-foreground">
            Create a new transfer request for approval
          </p>
        </div>

        <Card>
          <CardHeader
            title="Transaction Details"
            description="Enter the recipient and amount to transfer"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field
              label="Recipient Account ID"
              placeholder="0.0.12345"
              value={form.recipientAccountId}
              onChange={(e) => setForm({ ...form, recipientAccountId: e.target.value })}
              error={errors.recipientAccountId}
              hint="Hedera account format: 0.0.xxxxx"
              icon={<User className="w-4 h-4" />}
            />

            <Field
              label="Amount (HBAR)"
              type="number"
              step="0.01"
              min="0"
              placeholder="100.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              error={errors.amount}
              icon={<Coins className="w-4 h-4" />}
            />

            <TextAreaField
              label="Memo (Optional)"
              placeholder="Payment description or reference"
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              hint="Add a note for your records"
            />

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Requires 2-of-3 MPC approval
              </p>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? 'Creating...' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </ClientLayout>
  );
}
