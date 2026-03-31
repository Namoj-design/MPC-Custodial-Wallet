// MPC API Service for backend coordination

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// DKG (Distributed Key Generation) Types
export interface DKGSession {
  sessionId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  steps: DKGStep[];
  walletPublicKey?: string;
}

export interface DKGStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

// MPC Signing Types
export interface MPCSession {
  sessionId: string;
  transactionId: string;
  status: 'pending' | 'signing' | 'aggregating' | 'completed' | 'failed';
  participants: {
    client: { status: 'waiting' | 'connected' | 'signed' };
    manager: { status: 'waiting' | 'connected' | 'signed' };
    custody: { status: 'waiting' | 'connected' | 'signed' };
  };
}

export interface SignatureResponse {
  success: boolean;
  partialSignature?: string;
  error?: string;
}

// ============ DKG API ============

export async function createWallet(clientId: string): Promise<ApiResponse<DKGSession>> {
  try {
    const response = await fetch(`${API_BASE}/wallet/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    });
    return await response.json();
  } catch (error) {
    // Simulate DKG for demo
    return simulateDKG();
  }
}

export async function getDKGStatus(sessionId: string): Promise<ApiResponse<DKGSession>> {
  try {
    const response = await fetch(`${API_BASE}/wallet/dkg/${sessionId}`);
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Failed to fetch DKG status' };
  }
}

// ============ MPC Signing API ============

export async function createMPCSession(transactionId: string): Promise<ApiResponse<MPCSession>> {
  try {
    const response = await fetch(`${API_BASE}/mpc/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Failed to create MPC session' };
  }
}

export async function getMPCSession(sessionId: string): Promise<ApiResponse<MPCSession>> {
  try {
    const response = await fetch(`${API_BASE}/mpc/session/${sessionId}`);
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Failed to fetch MPC session' };
  }
}

export async function signAsClient(
  sessionId: string,
  transactionId: string,
  clientId: string
): Promise<ApiResponse<SignatureResponse>> {
  try {
    const response = await fetch(`${API_BASE}/mpc/sign/client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, transactionId, clientId }),
    });
    return await response.json();
  } catch (error) {
    // Simulate successful signing for demo
    await new Promise((r) => setTimeout(r, 2000));
    return {
      success: true,
      data: {
        success: true,
        partialSignature: `sig_client_${Math.random().toString(16).slice(2, 10)}`,
      },
    };
  }
}

export async function signAsManager(
  sessionId: string,
  transactionId: string,
  managerId: string
): Promise<ApiResponse<SignatureResponse>> {
  try {
    const response = await fetch(`${API_BASE}/mpc/sign/manager`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, transactionId, managerId }),
    });
    return await response.json();
  } catch (error) {
    // Simulate successful signing for demo
    await new Promise((r) => setTimeout(r, 2000));
    return {
      success: true,
      data: {
        success: true,
        partialSignature: `sig_manager_${Math.random().toString(16).slice(2, 10)}`,
      },
    };
  }
}

export async function joinMPCSession(
  sessionId: string,
  participantRole: 'client' | 'manager',
  participantId: string
): Promise<ApiResponse<{ joined: boolean }>> {
  try {
    const response = await fetch(`${API_BASE}/mpc/session/${sessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: participantRole, participantId }),
    });
    return await response.json();
  } catch (error) {
    // Simulate join for demo
    return { success: true, data: { joined: true } };
  }
}

// ============ Simulation Helpers ============

function simulateDKG(): ApiResponse<DKGSession> {
  return {
    success: true,
    data: {
      sessionId: `dkg_${Math.random().toString(16).slice(2, 8)}`,
      status: 'pending',
      steps: [
        { id: 'client_share', label: 'Generating Client Share', status: 'pending' },
        { id: 'manager_share', label: 'Generating Manager Share', status: 'pending' },
        { id: 'custody_share', label: 'Generating Custody Share', status: 'pending' },
        { id: 'aggregate', label: 'Aggregating Public Key', status: 'pending' },
        { id: 'complete', label: 'Wallet Created', status: 'pending' },
      ],
    },
  };
}
