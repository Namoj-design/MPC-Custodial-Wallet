import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useActiveAccount, useDisconnect, useActiveWalletConnectionStatus } from 'thirdweb/react';
import { WalletState, UserRole } from '@/types';

interface WalletContextType extends WalletState {
  setRole: (role: UserRole) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Fetch account balance from Hedera mirror node
async function fetchAccountBalance(accountId: string): Promise<number> {
  try {
    const response = await fetch(
      `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
    );
    const data = await response.json();
    return (data.balance?.balance || 0) / 100_000_000;
  } catch {
    return 0;
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const activeAccount = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();
  const { disconnect: twDisconnect } = useDisconnect();
  const [role, setRole] = useState<UserRole | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const isConnected = connectionStatus === 'connected' && !!activeAccount;
  const accountId = activeAccount?.address || null;

  // Fetch balance when account changes
  useEffect(() => {
    if (accountId) {
      fetchAccountBalance(accountId).then(setBalance);
    } else {
      setBalance(null);
    }
  }, [accountId]);

  const disconnect = useCallback(() => {
    twDisconnect(undefined as any);
    setRole(null);
    setBalance(null);
  }, [twDisconnect]);

  const state: WalletContextType = {
    isConnected,
    accountId,
    balance,
    role,
    setRole,
    disconnect,
  };

  return (
    <WalletContext.Provider value={state}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
