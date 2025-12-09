import { useEffect, useState } from 'react';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TransactionTable } from '@/components/TransactionTable';
import { api, Transaction } from '@/services/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: '',
    currency: 'HBAR',
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await api.wallet.getTransactions();
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferData.recipient || !transferData.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSending(true);
    try {
      await api.wallet.initiateTransfer({
        recipient: transferData.recipient,
        amount: parseFloat(transferData.amount),
        currency: transferData.currency,
      });
      toast.success('Transfer initiated! Awaiting MPC approval.');
      setIsDialogOpen(false);
      setTransferData({ recipient: '', amount: '', currency: 'HBAR' });
      fetchTransactions();
    } catch (error) {
      toast.error('Transfer failed');
    } finally {
      setIsSending(false);
    }
  };

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.hash?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">View and manage your transactions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Initiate Transfer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0.0.123456"
                  value={transferData.recipient}
                  onChange={(e) =>
                    setTransferData({ ...transferData, recipient: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={transferData.amount}
                    onChange={(e) =>
                      setTransferData({ ...transferData, amount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                    value={transferData.currency}
                    onChange={(e) =>
                      setTransferData({ ...transferData, currency: e.target.value })
                    }
                  >
                    <option value="HBAR">HBAR</option>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                  </select>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-accent/50 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  This transfer will require MPC approval from your wealth manager before
                  completion.
                </p>
              </div>
              <Button className="w-full" onClick={handleTransfer} disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Initiating...
                  </>
                ) : (
                  'Initiate Transfer'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by address or hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <TransactionTable transactions={filteredTransactions} />
      )}
    </div>
  );
}
