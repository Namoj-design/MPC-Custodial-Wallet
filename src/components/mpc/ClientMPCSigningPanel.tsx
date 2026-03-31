// Deprecated — DFNS handles MPC signing internally.
// This component is kept as a no-op stub.
import { Transaction } from '@/types';

interface ClientMPCSigningPanelProps {
  transaction: Transaction;
  className?: string;
}

export function ClientMPCSigningPanel(_props: ClientMPCSigningPanelProps) {
  return null;
}
