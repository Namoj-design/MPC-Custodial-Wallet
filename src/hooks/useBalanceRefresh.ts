import { useEffect, useRef, useState, useCallback } from 'react';
import { getWalletBalance } from '@/api/dfnsApi';
import { dfnsWebSocket } from '@/lib/websocketClient';

const REFRESH_INTERVAL = 10000; // 10 seconds

export function useBalanceRefresh(walletId: string | null | undefined) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!walletId) {
      setBalance(null);
      return;
    }
    setLoading(true);
    try {
      const res = await getWalletBalance(walletId);
      if (res.success && res.data) {
        setBalance(res.data.balance);
      }
    } catch {
      // Silently fail on balance refresh
    } finally {
      setLoading(false);
    }
  }, [walletId]);

  useEffect(() => {
    if (!walletId) return;

    // Listen to real-time events to auto-refresh balance gracefully 2 seconds post-confirmation
    const unsubscribeWs = dfnsWebSocket.subscribe((msg) => {
      if (
        msg.event === 'TRANSACTION_CONFIRMED' || 
        msg.event === 'SIGNATURE_COMPLETED' || 
        msg.event === 'EXECUTED'
      ) {
        setTimeout(fetchBalance, 2000);
      }
    });

    fetchBalance();

    intervalRef.current = setInterval(fetchBalance, REFRESH_INTERVAL);

    return () => {
      unsubscribeWs();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [walletId, fetchBalance]);

  return { balance, loading, refresh: fetchBalance };
}
