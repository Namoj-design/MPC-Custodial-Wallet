// Multi-client session management using sessionStorage
// Each browser tab gets a unique client identity

const SESSION_KEY = 'dfns_session';

export interface ClientSession {
  sessionId: string;
  clientInstance: string;
  walletAddress: string | null;
  role: 'CLIENT' | 'WEALTH_MANAGER';
}

function generateClientLabel(): string {
  // Assign a human-readable label like "Client A", "Client B"
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed.clientInstance) return parsed.clientInstance;
    } catch {}
  }
  // Use letters A-Z based on random to avoid collisions across tabs
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `Client ${letter}`;
}

export function getSession(): ClientSession {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }

  const session: ClientSession = {
    sessionId: crypto.randomUUID(),
    clientInstance: generateClientLabel(),
    walletAddress: null,
    role: 'CLIENT',
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function updateSession(updates: Partial<ClientSession>): ClientSession {
  const current = getSession();
  const updated = { ...current, ...updates };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

export function getClientIdentity(): string {
  const session = getSession();
  if (session.walletAddress) {
    return `${session.walletAddress}_${session.clientInstance}`;
  }
  return session.clientInstance;
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
