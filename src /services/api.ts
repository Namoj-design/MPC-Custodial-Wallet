// Mock API service for MPC Wallet
// In production, these would connect to the actual backend

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  currency: string;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'completed' | 'failed' | 'awaiting_approval';
  timestamp: string;
  hash?: string;
}

export interface MPCRequest {
  id: string;
  clientId: string;
  clientName: string;
  type: 'transfer' | 'key_rotation' | 'recovery';
  amount?: number;
  currency?: string;
  recipient?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  description: string;
}

export interface WalletBalance {
  total: number;
  available: number;
  pending: number;
  currency: string;
  assets: {
    symbol: string;
    name: string;
    balance: number;
    value: number;
    change24h: number;
  }[];
}

// Mock data
const mockTransactions: Transaction[] = [
  { id: '1', type: 'receive', amount: 5000, currency: 'HBAR', sender: '0.0.123456', status: 'completed', timestamp: '2024-01-15T10:30:00Z', hash: '0x1234...abcd' },
  { id: '2', type: 'send', amount: 1500, currency: 'HBAR', recipient: '0.0.789012', status: 'completed', timestamp: '2024-01-14T15:45:00Z', hash: '0x5678...efgh' },
  { id: '3', type: 'send', amount: 2500, currency: 'HBAR', recipient: '0.0.345678', status: 'awaiting_approval', timestamp: '2024-01-16T09:00:00Z' },
  { id: '4', type: 'receive', amount: 10000, currency: 'HBAR', sender: '0.0.111222', status: 'completed', timestamp: '2024-01-13T12:00:00Z', hash: '0x9abc...ijkl' },
  { id: '5', type: 'send', amount: 750, currency: 'HBAR', recipient: '0.0.333444', status: 'pending', timestamp: '2024-01-16T11:30:00Z' },
];

const mockMPCRequests: MPCRequest[] = [
  { id: '1', clientId: '1', clientName: 'Alex Johnson', type: 'transfer', amount: 2500, currency: 'HBAR', recipient: '0.0.345678', status: 'pending', createdAt: '2024-01-16T09:00:00Z', description: 'Transfer to external wallet' },
  { id: '2', clientId: '3', clientName: 'Michael Brown', type: 'transfer', amount: 15000, currency: 'HBAR', recipient: '0.0.999888', status: 'pending', createdAt: '2024-01-16T08:30:00Z', description: 'Investment fund transfer' },
  { id: '3', clientId: '4', clientName: 'Emily Davis', type: 'key_rotation', status: 'pending', createdAt: '2024-01-16T07:45:00Z', description: 'Monthly key shard rotation' },
  { id: '4', clientId: '5', clientName: 'James Wilson', type: 'recovery', status: 'pending', createdAt: '2024-01-15T16:20:00Z', description: 'VSS recovery initiated' },
];

const mockBalance: WalletBalance = {
  total: 125750.50,
  available: 120250.50,
  pending: 5500,
  currency: 'USD',
  assets: [
    { symbol: 'HBAR', name: 'Hedera', balance: 50000, value: 50000, change24h: 2.5 },
    { symbol: 'ETH', name: 'Ethereum', balance: 25, value: 62500, change24h: -1.2 },
    { symbol: 'BTC', name: 'Bitcoin', balance: 0.3, value: 13250.50, change24h: 0.8 },
  ],
};

// API functions
export const api = {
  auth: {
    login: async (email: string, password: string) => {
      await delay(1000);
      // Mock login - in production, this would call POST /api/auth/login
      return { token: 'mock-jwt-token', user: { email, role: email.includes('manager') ? 'manager' : 'client' } };
    },
  },

  wallet: {
    getBalance: async (): Promise<WalletBalance> => {
      await delay(800);
      return mockBalance;
    },

    getTransactions: async (): Promise<Transaction[]> => {
      await delay(600);
      return mockTransactions;
    },

    initiateTransfer: async (data: { recipient: string; amount: number; currency: string }) => {
      await delay(1500);
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'send',
        amount: data.amount,
        currency: data.currency,
        recipient: data.recipient,
        status: 'awaiting_approval',
        timestamp: new Date().toISOString(),
      };
      mockTransactions.unshift(newTransaction);
      return newTransaction;
    },
  },

  mpc: {
    createRequest: async (data: { type: string; amount?: number; recipient?: string; description: string }) => {
      await delay(1000);
      return { id: Date.now().toString(), status: 'pending' };
    },

    getPendingRequests: async (): Promise<MPCRequest[]> => {
      await delay(700);
      return mockMPCRequests.filter(r => r.status === 'pending');
    },

    approveRequest: async (requestId: string) => {
      await delay(1200);
      const request = mockMPCRequests.find(r => r.id === requestId);
      if (request) {
        request.status = 'approved';
      }
      return { success: true };
    },

    rejectRequest: async (requestId: string) => {
      await delay(800);
      const request = mockMPCRequests.find(r => r.id === requestId);
      if (request) {
        request.status = 'rejected';
      }
      return { success: true };
    },
  },

  manager: {
    getStats: async () => {
      await delay(500);
      return {
        totalUsers: 156,
        activeShards: 312,
        pendingRequests: 4,
        totalVolume: 2450000,
        volumeChange: 12.5,
      };
    },

    getLogs: async () => {
      await delay(600);
      return [
        { id: '1', action: 'MPC_SIGN', user: 'Namoj Periakumar', timestamp: '2024-01-16T10:30:00Z', status: 'success' },
        { id: '2', action: 'KEY_ROTATION', user: 'John Mathew', timestamp: '2024-01-16T09:15:00Z', status: 'success' },
        { id: '3', action: 'TRANSFER_APPROVE', user: 'Emmily', timestamp: '2024-01-16T08:45:00Z', status: 'success' },
        { id: '4', action: 'VSS_RECOVERY', user: 'James Wilson', timestamp: '2024-01-15T16:20:00Z', status: 'pending' },
      ];
    },
  },
};
