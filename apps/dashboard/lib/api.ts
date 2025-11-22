// apps/dashboard/lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json() as Promise<T>;
}

export async function login(body: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle<{ success: boolean; data: { token: string; user: any } }>(res).then(
    (r) => r.data
  );
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return handle<{ status: string }>(res);
}

// These are sample endpoints – you can wire them to your real backend
export async function getSampleWalletOverview() {
  // In real setup, call `/api/wallet/overview`
  return {
    balance: "1234.5678",
    accountId: "0.0.123456",
    network: "testnet",
    mpcRounds: 42,
    topics: 3,
  };
}

export async function getRecentTransactions() {
  // In real setup, call `/api/transactions/recent`
  return [
    {
      id: "0.0.abc-123",
      from: "0.0.123456",
      to: "0.0.654321",
      amount: "10.5",
      status: "SUCCESS",
      createdAt: "just now",
    },
  ];
}