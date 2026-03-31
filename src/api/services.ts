import { Transaction, TransactionIntent, AuditLog, ApiResponse, ApprovalState, DFNSWalletInfo, TransactionStatus } from '@/types';
import { broadcastSync } from '@/lib/broadcast-sync';
import { getApiUrl } from '@/lib/config';
import { getMyWallet as apiGetMyWallet, createDFNSWallet } from './dfnsApi';
import { fetchWithAuth } from './fetchWithAuth';

// Simulated backend delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for demo (simulates backend state)
let transactions: Transaction[] = [];

let auditLogs: AuditLog[] = [];

// DFNS Wallet store (persistent per client identity)
const walletStore = new Map<string, DFNSWalletInfo>();

// Known clients registry for recipient selection
const knownClients = new Map<string, { clientId: string; label: string; walletId?: string; hederaAccountId?: string }>();

// Event subscribers for real-time updates
type Subscriber = () => void;
const subscribers: Set<Subscriber> = new Set();

export const subscribeToUpdates = (callback: Subscriber): (() => void) => {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};

const notifySubscribers = () => {
  subscribers.forEach(cb => cb());
};

// Apply updates received from other tabs/windows.
type BroadcastTxPayload = { tx: Transaction; logs?: AuditLog[] };

const upsertTransaction = (incoming: Transaction) => {
  const idx = transactions.findIndex(t => t.id === incoming.id);
  if (idx === -1) {
    transactions = [incoming, ...transactions];
    return;
  }
  transactions[idx] = incoming;
};

const prependAuditLogs = (logs: AuditLog[]) => {
  if (!logs.length) return;
  const existingIds = new Set(auditLogs.map(l => l.id));
  const toAdd = logs.filter(l => !existingIds.has(l.id));
  if (toAdd.length) auditLogs = [...toAdd, ...auditLogs];
};

broadcastSync.subscribe((event: any) => {
  const payload = event?.payload?.data as BroadcastTxPayload | undefined;
  if (!payload?.tx) return;
  upsertTransaction(payload.tx);
  if (payload.logs) prependAuditLogs(payload.logs);
  notifySubscribers();
});

// Listen for client registration broadcasts
broadcastSync.subscribe((event: any) => {
  if (event?.type === 'CLIENT_REGISTERED') {
    const data = event?.payload?.data;
    if (data?.clientId && data?.label) {
      knownClients.set(data.clientId, {
        clientId: data.clientId,
        label: data.label,
        walletId: data.walletId,
        hederaAccountId: data.hederaAccountId,
      });
    }
  }
});

// ========== Client Registry ==========

export function registerClient(clientId: string, label: string, walletInfo?: DFNSWalletInfo): void {
  knownClients.set(clientId, {
    clientId,
    label,
    walletId: walletInfo?.walletId,
    hederaAccountId: walletInfo?.hederaAccountId,
  });
  // Broadcast to other tabs
  broadcastSync.broadcast({
    type: 'CLIENT_REGISTERED',
    payload: {
      transactionId: clientId,
      timestamp: Date.now(),
      data: { clientId, label, walletId: walletInfo?.walletId, hederaAccountId: walletInfo?.hederaAccountId },
    },
  });
}

export function getKnownClients(excludeClientId?: string): { clientId: string; label: string; hederaAccountId?: string }[] {
  return Array.from(knownClients.values()).filter(c => c.clientId !== excludeClientId);
}

// ========== DFNS Wallet Service ==========

export async function getMyWallet(clientId: string): Promise<ApiResponse<DFNSWalletInfo | null>> {
  const res = await apiGetMyWallet(clientId);
  if (res.success && res.data) {
    return { success: true, data: res.data as DFNSWalletInfo };
  }
  return { success: true, data: null };
}

export async function createWallet(clientId: string): Promise<ApiResponse<DFNSWalletInfo>> {
  const res = await createDFNSWallet(clientId);
  if (res.success && res.data) {
    const wallet = res.data as DFNSWalletInfo;
    walletStore.set(clientId, wallet);
    return { success: true, data: wallet };
  }
  return { success: false, error: 'Failed to create wallet' };
}

// ========== Transaction Service Mapping Helpers ============
function mapTx(dbTx: any): Transaction {
  const statusMap: Record<string, TransactionStatus> = {
    'PENDING': 'PENDING_APPROVAL',
  };

  return {
    id: dbTx.id,
    recipientAccountId: dbTx.receiver_address,
    amount: dbTx.amount,
    status: statusMap[dbTx.status] || dbTx.status,
    approvals: {
      client: true,
      wealthManager: !!dbTx.approved_by,
      custody: !!dbTx.final_signature,
    },
    createdAt: dbTx.created_at,
    updatedAt: dbTx.created_at,
    clientId: dbTx.created_by,
    walletId: dbTx.sender_wallet_id,
    signatureHex: dbTx.final_signature,
    dfnsSignatureId: dbTx.dfns_signature_id,
    txHash: dbTx.hedera_tx_id,
    hederaTxId: dbTx.hedera_tx_id,
  };
}

function mapLog(dbLog: any): AuditLog {
  const isRejected = dbLog.signature === '0xREJECTED' || String(dbLog.signature).startsWith('0xFAILED');
  return {
    id: dbLog.id,
    transactionId: dbLog.transaction_id,
    action: isRejected ? 'REJECTED' : 'DFNS_SIGNED',
    actor: dbLog.manager_id || 'SYSTEM',
    timestamp: dbLog.timestamp,
    details: `Signature: ${dbLog.signature}`,
  };
}

// ========== Transaction Service ==========

export async function createTransactionIntent(
  intent: TransactionIntent,
  clientId: string
): Promise<ApiResponse<Transaction>> {
  try {
    const response = await fetchWithAuth(getApiUrl('transactions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        recipientAccountId: intent.recipientAccountId, 
        amount: intent.amount 
      })
    });
    const json = await response.json();
    return json.success ? { success: true, data: mapTx(json.data) } : json;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTransactions(clientId?: string): Promise<ApiResponse<Transaction[]>> {
  try {
    const response = await fetchWithAuth(getApiUrl('transactions'));
    const json = await response.json();
    if (json.success && json.data) {
      let mapping = json.data.map(mapTx);
      if (clientId) mapping = mapping.filter((t: any) => t.clientId === clientId);
      return { success: true, data: mapping };
    }
    return json;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTransaction(id: string): Promise<ApiResponse<Transaction>> {
  try {
    const response = await fetchWithAuth(`${getApiUrl('transactions')}/${id}`);
    const json = await response.json();
    return json.success ? { success: true, data: mapTx(json.data) } : json;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTransactionStatus(id: string): Promise<ApiResponse<{ status: Transaction['status']; approvals: ApprovalState }>> {
  const res = await getTransaction(id);
  if (res.success && res.data) {
    return { success: true, data: { status: res.data.status, approvals: res.data.approvals } };
  }
  return { success: false, error: 'Not found' };
}

// ========== Approval Service ==========

export async function getPendingApprovals(): Promise<ApiResponse<Transaction[]>> {
  try {
    const response = await fetchWithAuth(`${getApiUrl('transactions')}/pending`);
    const json = await response.json();
    if (json.success && json.data) {
      return { success: true, data: json.data.map(mapTx) };
    }
    return json;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveTransaction(
  txId: string,
  approverRole: 'wealthManager' | 'custody'
): Promise<ApiResponse<Transaction>> {
  try {
    const response = await fetchWithAuth(`${getApiUrl('transactions')}/${txId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const json = await response.json();
    return json.success ? { success: true, data: mapTx(json.data) } : json;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectTransaction(txId: string, rejectReason?: string): Promise<ApiResponse<Transaction>> {
  try {
    const response = await fetchWithAuth(`${getApiUrl('transactions')}/${txId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: rejectReason })
    });
    const json = await response.json();
    return json.success ? { success: true, data: mapTx(json.data) } : json;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ========== Audit Service ==========

export async function getAuditLogs(txId?: string): Promise<ApiResponse<AuditLog[]>> {
  try {
    const response = await fetchWithAuth(`${getApiUrl('transactions')}/logs`);
    const json = await response.json();
    if (json.success && json.data) {
      let logs = json.data.map(mapLog);
      if (txId) logs = logs.filter((l: any) => l.transactionId === txId);
      return { success: true, data: logs };
    }
    return json;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
