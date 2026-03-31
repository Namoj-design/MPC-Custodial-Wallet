// DFNS API Service — All calls go through the backend. No DFNS keys in frontend.

import { API_CONFIG, getApiUrl } from '@/lib/config';
import { fetchWithAuth } from './fetchWithAuth';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}



// ============ DFNS Wallet Types ============

export interface DFNSWallet {
  walletId: string;
  hederaAccountId: string;
  publicKey: string;
  network: string;
  createdAt: string;
}

// ============ DFNS Transaction Types ============

export type DFNSTransactionStatus =
  | 'CREATED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SIGNING'
  | 'BROADCASTED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REJECTED';

export interface DFNSTransaction {
  id: string;
  walletId: string;
  recipientAccountId: string;
  amount: number;
  memo?: string;
  status: DFNSTransactionStatus;
  hederaTxId?: string;
  clientId: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  signatureHex?: string;
  dfnsSignatureId?: string;
  txHash?: string;
}

// ============ Auth Types ============

export interface AuthStartResponse {
  challengeId: string;
  challenge: string;
}

export interface AuthCompleteResponse {
  userId: string;
  token: string;
  walletId?: string;
}

// ============ Auth API ============

export async function authRegisterStart(email: string, role: 'CLIENT' | 'WEALTH_MANAGER'): Promise<ApiResponse<AuthStartResponse>> {
  try {
    const response = await fetch(getApiUrl('authRegisterStart'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Registration failed' };
  }
}

export async function authRegisterVerify(challengeId: string, otp: string): Promise<ApiResponse<{ verified: boolean }>> {
  try {
    const response = await fetch(getApiUrl('authRegisterVerify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, otp }),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Verification failed' };
  }
}

export async function authRegisterComplete(challengeId: string, credential: unknown): Promise<ApiResponse<AuthCompleteResponse>> {
  try {
    const response = await fetch(getApiUrl('authRegisterComplete'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, credential }),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Registration completion failed' };
  }
}

export async function authLoginStart(email: string): Promise<ApiResponse<AuthStartResponse>> {
  try {
    const response = await fetch(getApiUrl('authLoginStart'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Login failed' };
  }
}

export async function authLoginComplete(challengeId: string, credential: unknown): Promise<ApiResponse<AuthCompleteResponse>> {
  try {
    const response = await fetch(getApiUrl('authLoginComplete'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, credential }),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Login completion failed' };
  }
}

export async function authManagerLogin(email: string, otp: string): Promise<ApiResponse<AuthCompleteResponse>> {
  try {
    const response = await fetch(getApiUrl('authManagerLogin'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return await response.json();
  } catch {
    return { success: false, error: 'Manager login failed' };
  }
}

// ============ Wallet API ============

export async function createDFNSWallet(clientId: string): Promise<ApiResponse<DFNSWallet>> {
  try {
    const response = await fetchWithAuth(getApiUrl('walletCreate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    });
    const json = await response.json();
    if (json.success && json.data) {
      return {
        success: true,
        data: {
          walletId: json.data.dfns_wallet_id,
          hederaAccountId: json.data.hedera_address,
          network: 'HederaTestnet',
          createdAt: json.data.created_at || new Date().toISOString(),
          publicKey: json.data.public_key || ''
        }
      };
    }
    return json;
  } catch {
    return { success: false, error: 'Failed to create DFNS wallet' };
  }
}

export async function getMyWallet(clientId: string): Promise<ApiResponse<DFNSWallet | null>> {
  try {
    const response = await fetchWithAuth(`${getApiUrl('walletMy')}?clientId=${clientId}`);
    const json = await response.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      const dbWallet = json.data[0];
      return {
        success: true,
        data: {
          walletId: dbWallet.dfns_wallet_id,
          hederaAccountId: dbWallet.hedera_address,
          network: 'HederaTestnet',
          createdAt: dbWallet.created_at || new Date().toISOString(),
          publicKey: dbWallet.public_key || ''
        }
      };
    }
    return { success: true, data: null };
  } catch {
    return { success: true, data: null };
  }
}

export async function getWalletBalance(walletId: string): Promise<ApiResponse<{ balance: number }>> {
  try {
    const response = await fetchWithAuth(`${getApiUrl('walletBalance')}?walletId=${walletId}`);
    return await response.json();
  } catch {
    return { success: true, data: { balance: 0 } };
  }
}

export async function getWallets(clientId: string): Promise<ApiResponse<DFNSWallet[]>> {
  try {
    const response = await fetchWithAuth(`${getApiUrl('walletList')}?clientId=${clientId}`);
    return await response.json();
  } catch {
    return { success: true, data: [] };
  }
}

// ============ Transaction API ============

export async function createTransaction(body: {
  walletId: string;
  recipientAccountId: string;
  amount: number;
  memo?: string;
  clientId: string;
}): Promise<ApiResponse<DFNSTransaction>> {
  try {
    const response = await fetchWithAuth(getApiUrl('transactions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch {
    // Demo fallback
    await new Promise((r) => setTimeout(r, 800));
    return {
      success: true,
      data: {
        id: `tx_${Date.now()}`,
        walletId: body.walletId,
        recipientAccountId: body.recipientAccountId,
        amount: body.amount,
        memo: body.memo,
        status: 'PENDING_APPROVAL',
        clientId: body.clientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }
}

export async function approveTransaction(txId: string, managerId: string): Promise<ApiResponse<DFNSTransaction>> {
  try {
    const response = await fetchWithAuth(getApiUrl('transactionApprove', { id: txId }), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId }),
    });
    return await response.json();
  } catch {
    await new Promise((r) => setTimeout(r, 1000));
    return { success: true };
  }
}

export async function rejectTransaction(txId: string, managerId: string, reason?: string): Promise<ApiResponse<DFNSTransaction>> {
  try {
    const response = await fetchWithAuth(getApiUrl('transactionReject', { id: txId }), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId, reason }),
    });
    return await response.json();
  } catch {
    await new Promise((r) => setTimeout(r, 800));
    return { success: true };
  }
}

export async function getTransaction(txId: string): Promise<ApiResponse<DFNSTransaction>> {
  try {
    const response = await fetchWithAuth(getApiUrl('transactionById', { id: txId }));
    return await response.json();
  } catch {
    return { success: false, error: 'Transaction not found' };
  }
}

export async function getTransactions(clientId?: string): Promise<ApiResponse<DFNSTransaction[]>> {
  try {
    const url = clientId 
      ? `${getApiUrl('transactions')}?clientId=${clientId}` 
      : getApiUrl('transactions');
    const response = await fetchWithAuth(url);
    return await response.json();
  } catch {
    return { success: true, data: [] };
  }
}

export async function getPendingApprovals(): Promise<ApiResponse<DFNSTransaction[]>> {
  try {
    const response = await fetchWithAuth(getApiUrl('transactionsPending'));
    return await response.json();
  } catch {
    return { success: true, data: [] };
  }
}
