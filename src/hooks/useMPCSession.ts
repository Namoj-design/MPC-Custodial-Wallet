// This hook is deprecated — DFNS handles MPC internally.
// Kept as a stub to avoid breaking imports during transition.

import { useState, useCallback } from 'react';
import { Transaction } from '@/types';

interface MPCSessionStub {
  sessionId: string;
  transactionId: string;
  startedAt: string;
  participants: { role: string; label: string; status: string }[];
  steps: { id: string; label: string; status: string }[];
  currentRound: string;
}

export function useMPCSession(_transaction: Transaction | null) {
  const [session] = useState<MPCSessionStub | null>(null);
  const [signing] = useState(false);
  const [signed] = useState(false);
  const [wsConnected] = useState(false);

  const generatePartialSignature = useCallback(async (_role: string) => {
    console.warn('MPC signing is now handled by DFNS backend');
  }, []);

  const joinSession = useCallback(async (_role: string) => {
    console.warn('MPC sessions are now handled by DFNS backend');
  }, []);

  return { session, signing, signed, wsConnected, generatePartialSignature, joinSession };
}
