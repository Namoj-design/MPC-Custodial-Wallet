// Deprecated — DFNS handles MPC signing internally.
// This component is kept as a no-op stub.
import { Transaction } from '@/types';

interface ManagerMPCSigningPanelProps {
  transaction: Transaction;
  className?: string;
}

export function ManagerMPCSigningPanel(_props: ManagerMPCSigningPanelProps) {
  return null;
}
