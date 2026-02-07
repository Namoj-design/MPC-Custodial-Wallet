 import { Transaction, TransactionIntent, AuditLog, ApiResponse, ApprovalState } from '@/types';
 import { broadcastSync } from '@/lib/broadcast-sync';

// Simulated backend delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory store for demo (simulates backend state)
let transactions: Transaction[] = [
  {
    id: 'tx_001',
    recipientAccountId: '0.0.54321',
    amount: 150.5,
    memo: 'Q4 Advisory Fee',
    status: 'PENDING_APPROVAL',
    approvals: { client: true, wealthManager: false, custody: false },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    clientId: '0.0.12345',
  },
  {
    id: 'tx_002',
    recipientAccountId: '0.0.98765',
    amount: 500,
    status: 'EXECUTED',
    approvals: { client: true, wealthManager: true, custody: true },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 82800000).toISOString(),
    executedAt: new Date(Date.now() - 82800000).toISOString(),
    hederaTxId: '0.0.12345@1706123456.789',
    clientId: '0.0.12345',
  },
  {
    id: 'tx_003',
    recipientAccountId: '0.0.11111',
    amount: 75.25,
    memo: 'Monthly retainer',
    status: 'PARTIALLY_APPROVED',
    approvals: { client: true, wealthManager: true, custody: false },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    clientId: '0.0.12345',
  },
];

let auditLogs: AuditLog[] = [
  {
    id: 'log_001',
    transactionId: 'tx_001',
    action: 'CREATED',
    actor: '0.0.12345',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log_002',
    transactionId: 'tx_001',
    action: 'CLIENT_APPROVED',
    actor: '0.0.12345',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: 'log_003',
    transactionId: 'tx_002',
    action: 'EXECUTED',
    actor: 'SYSTEM',
    timestamp: new Date(Date.now() - 82800000).toISOString(),
    details: 'Hedera TX: 0.0.12345@1706123456.789',
  },
];

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
// NOTE: This is still demo-only (single-browser). A real backend is required for multi-device sync.
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

// ========== Transaction Service ==========

export async function createTransactionIntent(
  intent: TransactionIntent,
  clientId: string
): Promise<ApiResponse<Transaction>> {
  await delay(800);
  
  const newTx: Transaction = {
    id: `tx_${Date.now()}`,
    ...intent,
    status: 'PENDING_APPROVAL',
    approvals: { client: true, wealthManager: false, custody: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientId,
  };
  
  transactions = [newTx, ...transactions];
  
  const createdLogs: AuditLog[] = [
    {
      id: `log_${Date.now()}`,
      transactionId: newTx.id,
      action: 'CREATED',
      actor: clientId,
      timestamp: new Date().toISOString(),
    },
    {
      id: `log_${Date.now() + 1}`,
      transactionId: newTx.id,
      action: 'CLIENT_APPROVED',
      actor: clientId,
      timestamp: new Date().toISOString(),
    },
  ];

  auditLogs = [...createdLogs, ...auditLogs];

  notifySubscribers();

  // Broadcast to other tabs/windows
  broadcastSync.emitTransactionCreated(newTx.id, { tx: newTx, logs: createdLogs });

  return { success: true, data: newTx };
}

export async function getTransactions(clientId?: string): Promise<ApiResponse<Transaction[]>> {
  await delay(300);
  
  const filtered = clientId 
    ? transactions.filter(tx => tx.clientId === clientId)
    : transactions;
  
  return { success: true, data: filtered };
}

export async function getTransaction(id: string): Promise<ApiResponse<Transaction>> {
  await delay(300);
  
  const tx = transactions.find(t => t.id === id);
  if (!tx) {
    return { success: false, error: 'Transaction not found' };
  }
  
  return { success: true, data: tx };
}

export async function getTransactionStatus(id: string): Promise<ApiResponse<{ status: Transaction['status']; approvals: ApprovalState }>> {
  await delay(200);
  
  const tx = transactions.find(t => t.id === id);
  if (!tx) {
    return { success: false, error: 'Transaction not found' };
  }
  
  return { 
    success: true, 
    data: { status: tx.status, approvals: tx.approvals } 
  };
}

// ========== Approval Service ==========

export async function getPendingApprovals(): Promise<ApiResponse<Transaction[]>> {
  await delay(300);
  
  const pending = transactions.filter(
    tx => tx.status === 'PENDING_APPROVAL' || tx.status === 'PARTIALLY_APPROVED'
  );
  
  return { success: true, data: pending };
}

export async function approveTransaction(
  txId: string, 
  approverRole: 'wealthManager' | 'custody'
): Promise<ApiResponse<Transaction>> {
  await delay(1000);
  
  const txIndex = transactions.findIndex(t => t.id === txId);
  if (txIndex === -1) {
    return { success: false, error: 'Transaction not found' };
  }
  
  const tx = { ...transactions[txIndex] };
  tx.approvals = { ...tx.approvals, [approverRole]: true };
  tx.updatedAt = new Date().toISOString();
  
  // Check if threshold reached (2 of 3)
  const approvalCount = Object.values(tx.approvals).filter(Boolean).length;
  if (approvalCount >= 2) {
    tx.status = 'APPROVED';
    // Simulate automatic execution
    setTimeout(async () => {
      await executeTransaction(txId);
    }, 2000);
  } else {
    tx.status = 'PARTIALLY_APPROVED';
  }
  
  transactions[txIndex] = tx;
  
  const approvalLog: AuditLog = {
    id: `log_${Date.now()}`,
    transactionId: txId,
    action: approverRole === 'wealthManager' ? 'WM_APPROVED' : 'CUSTODY_APPROVED',
    actor: approverRole,
    timestamp: new Date().toISOString(),
  };

  auditLogs = [approvalLog, ...auditLogs];

  notifySubscribers();

  // Broadcast approval to other tabs/windows
  broadcastSync.emitTransactionApproved(txId, { tx, logs: [approvalLog] });

  return { success: true, data: tx };
}

export async function rejectTransaction(txId: string, rejectReason?: string): Promise<ApiResponse<Transaction>> {
  await delay(800);
  
  const txIndex = transactions.findIndex(t => t.id === txId);
  if (txIndex === -1) {
    return { success: false, error: 'Transaction not found' };
  }
  
  const tx = { ...transactions[txIndex] };
  tx.status = 'REJECTED';
  tx.updatedAt = new Date().toISOString();
  
  transactions[txIndex] = tx;
  
  const rejectLog: AuditLog = {
    id: `log_${Date.now()}`,
    transactionId: txId,
    action: 'REJECTED',
    actor: 'WEALTH_MANAGER',
    timestamp: new Date().toISOString(),
    details: rejectReason,
  };

  auditLogs = [rejectLog, ...auditLogs];

  notifySubscribers();

  // Broadcast rejection to other tabs/windows
  broadcastSync.emitTransactionRejected(txId, { tx, logs: [rejectLog] });

  return { success: true, data: tx };
}

// ========== MPC Signing Service ==========

export async function signMpcRound(txId: string, _round: number): Promise<ApiResponse<{ complete: boolean }>> {
  await delay(1500);
  // Simulated MPC signing round
  return { success: true, data: { complete: true } };
}

async function executeTransaction(txId: string): Promise<void> {
  const txIndex = transactions.findIndex(t => t.id === txId);
  if (txIndex === -1) return;
  
  const tx = { ...transactions[txIndex] };
  tx.status = 'EXECUTING';
  tx.updatedAt = new Date().toISOString();
  transactions[txIndex] = tx;

  notifySubscribers();

  // Broadcast intermediate status
  broadcastSync.emitTransactionUpdated(txId, { tx });
  
  await delay(2000);
  
  tx.status = 'EXECUTED';
  tx.executedAt = new Date().toISOString();
  tx.hederaTxId = `0.0.${Math.floor(Math.random() * 99999)}@${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 999999999)}`;
  tx.approvals.custody = true;
  transactions[txIndex] = tx;
  
  auditLogs = [
    {
      id: `log_${Date.now()}`,
      transactionId: txId,
      action: 'EXECUTED',
      actor: 'SYSTEM',
      timestamp: new Date().toISOString(),
      details: `Hedera TX: ${tx.hederaTxId}`,
    },
    ...auditLogs,
  ];

  notifySubscribers();

  // Broadcast final executed status (with audit log)
  broadcastSync.emitTransactionExecuted(txId, {
    tx,
    logs: [
      {
        id: auditLogs[0].id,
        transactionId: txId,
        action: 'EXECUTED',
        actor: 'SYSTEM',
        timestamp: auditLogs[0].timestamp,
        details: auditLogs[0].details,
      },
    ],
  });
}

// ========== Audit Service ==========

export async function getAuditLogs(txId?: string): Promise<ApiResponse<AuditLog[]>> {
  await delay(300);
  
  const filtered = txId 
    ? auditLogs.filter(log => log.transactionId === txId)
    : auditLogs;
  
  return { success: true, data: filtered };
}
