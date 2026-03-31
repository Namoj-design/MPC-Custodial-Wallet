// Transaction & Approval Types
export type TransactionStatus = 
  | 'PENDING_APPROVAL' 
  | 'PARTIALLY_APPROVED' 
  | 'APPROVED' 
  | 'SIGNING'
  | 'BROADCASTED'
  | 'EXECUTING' 
  | 'EXECUTED' 
  | 'CONFIRMED'
  | 'FAILED' 
  | 'REJECTED';

export type UserRole = 'CLIENT' | 'WEALTH_MANAGER' | 'NONE';

export interface ApprovalState {
  client: boolean;
  wealthManager: boolean;
  custody: boolean;
}

export interface Transaction {
  id: string;
  recipientAccountId: string;
  amount: number;
  memo?: string;
  status: TransactionStatus;
  approvals: ApprovalState;
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  confirmedAt?: string;
  hederaTxId?: string;
  clientId: string;
  walletId?: string;
  // DFNS signature fields
  signatureHex?: string;
  dfnsSignatureId?: string;
  txHash?: string;
}

export interface TransactionIntent {
  recipientAccountId: string;
  amount: number;
  memo?: string;
}

export interface AuditLog {
  id: string;
  transactionId: string;
  action: 'CREATED' | 'CLIENT_APPROVED' | 'WM_APPROVED' | 'CUSTODY_APPROVED' | 'DFNS_SIGNED' | 'BROADCASTED' | 'CONFIRMED' | 'EXECUTED' | 'REJECTED';
  actor: string;
  timestamp: string;
  details?: string;
}

// Wallet Types
export interface WalletState {
  isConnected: boolean;
  accountId: string | null;
  balance: number | null;
  role: UserRole | null;
}

// DFNS Wallet
export interface DFNSWalletInfo {
  walletId: string;
  hederaAccountId: string;
  publicKey: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
