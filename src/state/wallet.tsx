import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { WalletState, UserRole } from '@/types';
import { useAuth } from '@/state/auth';

interface WalletContextType extends WalletState {
  setRole: (role: UserRole) => void;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);

  const isConnected = isAuthenticated;
  const accountId = user?.hederaAccountId || user?.userId || null;
  const role = user?.role || null;

  const refreshBalance = useCallback(async () => {
    // Balance is handled by useBalanceRefresh hook per-page
  }, []);

  const disconnect = useCallback(() => {
    logout();
    setBalance(null);
  }, [logout]);

  const setRole = useCallback((_role: UserRole) => {
    // Role is set at login time now
  }, []);

  const state: WalletContextType = {
    isConnected,
    accountId,
    balance,
    role,
    setRole,
    disconnect,
    refreshBalance,
  };

  return (
    <WalletContext.Provider value={state}>
      {children}
    </WalletContext.Provider>
  );
}

const defaultWalletState: WalletContextType = {
  isConnected: false,
  accountId: null,
  balance: null,
  role: null,
  setRole: () => {},
  disconnect: () => {},
  refreshBalance: async () => {},
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    return defaultWalletState;
  }
  return context;
}
