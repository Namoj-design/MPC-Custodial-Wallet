import { useState, useCallback, useEffect } from 'react';

export interface HederaAccount {
  accountId: string;
  balance: number;
  isConnected: boolean;
}

export interface HederaTransaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  hash: string;
  memo?: string;
}

const HEDERA_MIRROR_NODE = 'https://mainnet.mirrornode.hedera.com';

// Convert tinybar to HBAR
const tinybarToHbar = (tinybar: number): number => tinybar / 100_000_000;

export function useHederaWallet() {
  const [account, setAccount] = useState<HederaAccount | null>(null);
  const [transactions, setTransactions] = useState<HederaTransaction[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if HashPack is available
  const isHashPackAvailable = useCallback(() => {
    return typeof window !== 'undefined' && (window as any).hashpack !== undefined;
  }, []);

  // Connect to HashPack wallet
  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if HashPack extension is installed
      if (isHashPackAvailable()) {
        const hashpack = (window as any).hashpack;
        const result = await hashpack.connect();
        
        if (result && result.accountId) {
          const accountId = result.accountId;
          
          // Fetch account balance from mirror node
          const balanceResponse = await fetch(
            `${HEDERA_MIRROR_NODE}/api/v1/accounts/${accountId}`
          );
          
          if (balanceResponse.ok) {
            const accountData = await balanceResponse.json();
            setAccount({
              accountId,
              balance: tinybarToHbar(accountData.balance?.balance || 0),
              isConnected: true,
            });
            
            // Store connection in localStorage
            localStorage.setItem('hedera_connected_account', accountId);
            return true;
          }
        }
      }
      
      // Fallback: Prompt user to enter account ID manually for demo
      const accountId = prompt(
        'HashPack not detected. Enter your Hedera Account ID (e.g., 0.0.12345) to view transactions:'
      );
      
      if (accountId && /^0\.0\.\d+$/.test(accountId)) {
        // Verify account exists on mainnet
        const balanceResponse = await fetch(
          `${HEDERA_MIRROR_NODE}/api/v1/accounts/${accountId}`
        );
        
        if (balanceResponse.ok) {
          const accountData = await balanceResponse.json();
          setAccount({
            accountId,
            balance: tinybarToHbar(accountData.balance?.balance || 0),
            isConnected: true,
          });
          
          localStorage.setItem('hedera_connected_account', accountId);
          return true;
        } else {
          setError('Account not found on Hedera mainnet');
          return false;
        }
      } else if (accountId) {
        setError('Invalid account ID format');
        return false;
      }
      
      return false;
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isHashPackAvailable]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setTransactions([]);
    localStorage.removeItem('hedera_connected_account');
  }, []);

  // Fetch transactions from Hedera mirror node
  const fetchTransactions = useCallback(async (accountId: string) => {
    setIsLoadingTransactions(true);
    setError(null);

    try {
      const response = await fetch(
        `${HEDERA_MIRROR_NODE}/api/v1/transactions?account.id=${accountId}&limit=50&order=desc`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      
      const formattedTransactions: HederaTransaction[] = data.transactions.map((tx: any) => {
        // Determine if this is a send or receive based on transfers
        const transfers = tx.transfers || [];
        const accountTransfer = transfers.find((t: any) => t.account === accountId);
        const isSend = accountTransfer?.amount < 0;
        const amount = Math.abs(accountTransfer?.amount || 0);
        
        // Find the other party
        const otherParty = transfers.find((t: any) => 
          t.account !== accountId && 
          (isSend ? t.amount > 0 : t.amount < 0)
        );

        return {
          id: tx.transaction_id,
          type: isSend ? 'send' : 'receive',
          amount: tinybarToHbar(amount),
          currency: 'HBAR',
          recipient: isSend ? otherParty?.account : undefined,
          sender: !isSend ? otherParty?.account : undefined,
          status: tx.result === 'SUCCESS' ? 'completed' : 'failed',
          timestamp: tx.consensus_timestamp,
          hash: tx.transaction_hash,
          memo: tx.memo_base64 ? atob(tx.memo_base64) : undefined,
        };
      });

      setTransactions(formattedTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  // Refresh account balance
  const refreshBalance = useCallback(async () => {
    if (!account?.accountId) return;

    try {
      const response = await fetch(
        `${HEDERA_MIRROR_NODE}/api/v1/accounts/${account.accountId}`
      );

      if (response.ok) {
        const accountData = await response.json();
        setAccount(prev => prev ? {
          ...prev,
          balance: tinybarToHbar(accountData.balance?.balance || 0),
        } : null);
      }
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  }, [account?.accountId]);

  // Auto-reconnect on mount
  useEffect(() => {
    const savedAccountId = localStorage.getItem('hedera_connected_account');
    if (savedAccountId) {
      fetch(`${HEDERA_MIRROR_NODE}/api/v1/accounts/${savedAccountId}`)
        .then(response => {
          if (response.ok) return response.json();
          throw new Error('Account not found');
        })
        .then(accountData => {
          setAccount({
            accountId: savedAccountId,
            balance: tinybarToHbar(accountData.balance?.balance || 0),
            isConnected: true,
          });
        })
        .catch(() => {
          localStorage.removeItem('hedera_connected_account');
        });
    }
  }, []);

  // Fetch transactions when account changes
  useEffect(() => {
    if (account?.accountId) {
      fetchTransactions(account.accountId);
    }
  }, [account?.accountId, fetchTransactions]);

  return {
    account,
    transactions,
    isConnecting,
    isLoadingTransactions,
    error,
    isHashPackAvailable,
    connectWallet,
    disconnectWallet,
    fetchTransactions,
    refreshBalance,
  };
}
